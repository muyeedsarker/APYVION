// APYVION — AI Product Planner (Master Structure Section 02)
// দায়িত্ব: Idea Center (Module 01)-এর সংরক্ষিত Spec নিয়ে একটা পূর্ণ Product Plan তৈরি করা —
// Product Definition, User Personas, User Roles, Core Problems→Solutions, Feature Map,
// User Journey, Business Model, Technical Requirements, MVP Scope, Future Scope।
//
// ============ REAL BACKEND হুক করার নির্দেশনা ============
// window.JORON_FACTORY_CONFIG.planEndpoint = "https://your-backend.example.com/api/plan-product";
// সেই endpoint POST body { spec: {...IdeaSpec} } নিয়ে নিচের buildPlanLocal()-এর
// রিটার্ন শেপের মতো JSON রিটার্ন করলেই যথেষ্ট। API key কখনো client-side রাখা হবে না।
// ==========================================================

(function () {
  const KB = window.JORON_FACTORY_KB || [];

  function getSavedSpec() {
    try {
      const raw = localStorage.getItem("jf_idea_spec");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read saved spec", e);
      return null;
    }
  }

  function findCategory(id) {
    return KB.find((c) => c.id === id) || KB.find((c) => c.id === "generic");
  }

  async function buildPlanRemote(spec) {
    const endpoint = window.JORON_FACTORY_CONFIG && window.JORON_FACTORY_CONFIG.planEndpoint;
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      if (!res.ok) throw new Error("PLAN_BACKEND_ERROR");
      const data = await res.json();
      if (!data || !data.productDefinition) throw new Error("PLAN_BACKEND_SHAPE_INVALID");
      return data;
    } catch (err) {
      console.warn("APYVION: remote plan failed, falling back to local KB.", err);
      return null;
    }
  }

  function buildPlanLocal(spec) {
    const category = findCategory(spec.matchedCategory);
    const productDefinition = `${spec.appType} — ${spec.problem} এমন একটা সমস্যা সমাধান করবে, যার মূল ব্যবহারকারী: ${spec.audience}।`;

    return {
      source: category.id === spec.matchedCategory && category.id !== "generic" ? "kb" : "kb-generic",
      category: category.id,
      productDefinition,
      audience: spec.audience,
      personas: category.personas || [],
      userRoles: spec.userRoles || category.userRoles,
      problem: spec.problem,
      coreFeatures: spec.coreFeatures || category.coreFeatures,
      featureMap: category.featureMap,
      userJourney: category.userJourney,
      businessModel: category.businessModel,
      technicalRequirements: {
        platform: spec.platform || category.platform,
        techStack: spec.techStack || category.techStack,
        needsDatabase: spec.needsDatabase,
        needsAuth: spec.needsAuth,
        needsPayment: spec.needsPayment,
        security: spec.security || category.security,
      },
      mvpScope: category.mvpScope,
      futureScope: category.futureScope,
    };
  }

  async function buildPlan(spec) {
    const remote = await buildPlanRemote(spec);
    if (remote) return remote;
    return buildPlanLocal(spec);
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function listBlock(title, icon, items) {
    if (!items || !items.length) return "";
    return `
      <div class="jf-block">
        <h3>${icon} ${escapeHtml(title)}</h3>
        <ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
      </div>`;
  }

  function personaCards(personas) {
    if (!personas || !personas.length) return "";
    return `
      <div class="jf-block jf-block-wide">
        <h3>🧑‍🤝‍🧑 User Personas</h3>
        <div class="jf-personas">
          ${personas
            .map(
              (p) => `
            <div class="jf-persona">
              <div class="jf-persona-role">${escapeHtml(p.role)}</div>
              <div class="jf-persona-line"><strong>Goal:</strong> ${escapeHtml(p.goal)}</div>
              <div class="jf-persona-line"><strong>Pain Point:</strong> ${escapeHtml(p.painPoint)}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function journeySteps(steps) {
    if (!steps || !steps.length) return "";
    return `
      <div class="jf-block jf-block-wide">
        <h3>🧭 User Journey</h3>
        <ol class="jf-journey">
          ${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
        </ol>
      </div>`;
  }

  function featureMapBlock(map) {
    if (!map) return "";
    return `
      <div class="jf-block jf-block-wide">
        <h3>🗺️ Feature Map</h3>
        <div class="jf-feature-map">
          <div><h4>✅ MVP / Core</h4><ul>${(map.core || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>
          <div><h4>➕ Nice to Have</h4><ul>${(map.niceToHave || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>
          <div><h4>🔮 Future</h4><ul>${(map.future || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>
        </div>
      </div>`;
  }

  function badge(label, value) {
    return `<span class="jf-badge">${escapeHtml(label)}: <strong>${escapeHtml(value ? "প্রয়োজন" : "প্রয়োজন নেই")}</strong></span>`;
  }

  function renderPlan(plan) {
    const el = document.getElementById("jfPlanResult");
    if (!el) return;

    el.innerHTML = `
      <div class="jf-card jf-summary">
        <div class="jf-summary-top">
          <span class="jf-pill">🟢 IN SCOPE — AI Product Planner</span>
          <span class="jf-source">উৎস: ${plan.source === "kb" ? "Knowledge Base" : plan.source === "remote" ? "AI Backend" : "Knowledge Base (Generic)"}</span>
        </div>
        <h2>📄 Product Definition</h2>
        <p>${escapeHtml(plan.productDefinition)}</p>
      </div>

      <div class="jf-grid">
        ${listBlock("Core Problem → Audience", "❓", [plan.problem, "Audience: " + plan.audience])}
        ${listBlock("User Roles", "👤", plan.userRoles)}
      </div>

      ${personaCards(plan.personas)}
      ${featureMapBlock(plan.featureMap)}
      ${journeySteps(plan.userJourney)}

      <div class="jf-card">
        <h3>💰 Business Model</h3>
        <p>${escapeHtml(plan.businessModel)}</p>
      </div>

      <div class="jf-card jf-requirements">
        <h3>🧰 Technical Requirements</h3>
        <p><strong>Platform:</strong> ${escapeHtml(plan.technicalRequirements.platform)}</p>
        <p><strong>Tech Stack:</strong> ${escapeHtml(plan.technicalRequirements.techStack)}</p>
        <div class="jf-badges">
          ${badge("Database", plan.technicalRequirements.needsDatabase)}
          ${badge("Authentication", plan.technicalRequirements.needsAuth)}
          ${badge("Payment", plan.technicalRequirements.needsPayment)}
        </div>
        <div style="margin-top:14px">
          <h4 style="margin:0 0 8px">🔐 Security Requirements</h4>
          <ul>${(plan.technicalRequirements.security || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="jf-grid">
        ${listBlock("🎯 MVP Scope", "🎯", plan.mvpScope)}
        ${listBlock("🚀 Future Scope", "🚀", plan.futureScope)}
      </div>

      <div class="jf-actions">
        <a class="jf-btn" href="index.html">⬅️ Idea Center-এ ফিরুন</a>
        <button class="jf-btn jf-btn-primary" id="jfProceedDesign">➡️ AI UI/UX Designer-এ পাঠান</button>
      </div>
    `;

    const proceedBtn = document.getElementById("jfProceedDesign");
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        try {
          localStorage.setItem("jf_product_plan", JSON.stringify(plan));
          if (window.APYVION_PROJECTS) window.APYVION_PROJECTS.snapshotCurrent();
          window.location.href = "ui-ux-designer.html";
        } catch (e) {
          console.warn("APYVION: could not persist plan locally", e);
          const notice = document.getElementById("jfPlanNotice");
          if (notice) {
            notice.textContent = "Plan সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";
            notice.hidden = false;
          }
        }
      };
    }
  }

  function showEmptyState() {
    const empty = document.getElementById("jfPlanEmpty");
    const loading = document.getElementById("jfPlanLoading");
    if (loading) loading.hidden = true;
    if (empty) empty.hidden = false;
  }

  async function init() {
    const spec = getSavedSpec();
    const loading = document.getElementById("jfPlanLoading");

    if (!spec) {
      showEmptyState();
      return;
    }

    try {
      const plan = await buildPlan(spec);
      if (loading) loading.hidden = true;
      renderPlan(plan);
    } catch (err) {
      console.error("APYVION: could not build plan", err);
      showEmptyState();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
