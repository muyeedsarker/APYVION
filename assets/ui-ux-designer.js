// APYVION — AI UI/UX Designer (Master Structure Section 03)
// দায়িত্ব: AI Product Planner (Module 02)-এর সংরক্ষিত Plan নিয়ে একটা Design System
// (Brand Direction, Color, Typography, Layout/Navigation) তৈরি করা এবং তার একটা
// লাইভ প্রিভিউ (Homepage/Dashboard/Form/Table + Empty/Loading/Error state) দেখানো।
//
// নিয়ম (Constitution অনুযায়ী): অপ্রয়োজনীয় Button/Toggle/Popup/Page তৈরি করা হবে না —
// তাই এখানে শুধু একটাই control আছে: Design Direction বাছাই।

(function () {
  const DESIGN_KB = window.JORON_DESIGN_KB || {};
  const DEFAULTS = window.JORON_DESIGN_DEFAULTS || {};

  function getSavedPlan() {
    try {
      const raw = localStorage.getItem("jf_product_plan");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read saved plan", e);
      return null;
    }
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function applyTokens(container, tokens) {
    container.style.setProperty("--pv-primary", tokens.primary);
    container.style.setProperty("--pv-accent", tokens.accent);
    container.style.setProperty("--pv-bg", tokens.bg);
    container.style.setProperty("--pv-surface", tokens.surface);
    container.style.setProperty("--pv-text", tokens.text);
    container.style.setProperty("--pv-text-dim", tokens.textDim);
    container.style.setProperty("--pv-heading-font", tokens.headingFont);
    container.style.setProperty("--pv-body-font", tokens.bodyFont);
    container.style.setProperty("--pv-radius", tokens.radius);
    container.style.setProperty("--pv-shadow", tokens.shadow);
  }

  function directionChips(activeId) {
    return Object.entries(DESIGN_KB)
      .map(
        ([id, t]) => `
        <button type="button" class="jf-dir-chip ${id === activeId ? "jf-dir-chip-active" : ""}" data-dir="${id}" style="--chip-color:${t.primary}">
          <span class="jf-dir-dot"></span>${escapeHtml(t.label)}
        </button>`
      )
      .join("");
  }

  function firstFeatures(list, n) {
    return (list || []).slice(0, n);
  }

  function buildPreviewHtml(plan, tokens) {
    const features = firstFeatures(plan.coreFeatures, 4);
    const roles = plan.userRoles || [];

    return `
      <div class="pv-root">
        <section class="pv-block">
          <div class="pv-block-label">🏠 Homepage</div>
          <div class="pv-homepage">
            <div class="pv-nav">
              <span class="pv-logo">${escapeHtml((plan.productDefinition || "App").split(" ")[0])}</span>
              <span class="pv-nav-links">Home · Features · Login</span>
            </div>
            <div class="pv-hero">
              <h1>${escapeHtml(plan.productDefinition ? plan.productDefinition.split("—")[0].trim() : "Your App")}</h1>
              <p>${escapeHtml(plan.problem || "")}</p>
              <button class="pv-btn pv-btn-primary" type="button">শুরু করুন</button>
            </div>
          </div>
        </section>

        <section class="pv-block">
          <div class="pv-block-label">📊 Dashboard Cards</div>
          <div class="pv-cards">
            ${features
              .map(
                (f) => `
              <div class="pv-card">
                <div class="pv-card-icon">✦</div>
                <div class="pv-card-title">${escapeHtml(f)}</div>
              </div>`
              )
              .join("")}
          </div>
        </section>

        <div class="pv-grid-2">
          <section class="pv-block">
            <div class="pv-block-label">📝 Form</div>
            <div class="pv-form">
              <label>নাম<input type="text" placeholder="আপনার নাম" disabled></label>
              <label>ইমেইল<input type="text" placeholder="you@example.com" disabled></label>
              <button class="pv-btn pv-btn-primary" type="button" style="margin-top:10px">সাবমিট</button>
            </div>
          </section>

          <section class="pv-block">
            <div class="pv-block-label">🧑‍🤝‍🧑 User Roles</div>
            <div class="pv-roles">
              ${roles.map((r) => `<span class="pv-role-pill">${escapeHtml(r)}</span>`).join("")}
            </div>
          </section>
        </div>

        <section class="pv-block">
          <div class="pv-block-label">📋 Table</div>
          <table class="pv-table">
            <thead><tr><th>নাম</th><th>স্ট্যাটাস</th><th>তারিখ</th></tr></thead>
            <tbody>
              <tr><td>উদাহরণ ১</td><td><span class="pv-status pv-status-ok">Active</span></td><td>১২ সেপ্টেম্বর</td></tr>
              <tr><td>উদাহরণ ২</td><td><span class="pv-status pv-status-warn">Pending</span></td><td>১০ সেপ্টেম্বর</td></tr>
            </tbody>
          </table>
        </section>

        <div class="pv-grid-3">
          <section class="pv-block pv-state">
            <div class="pv-block-label">📭 Empty State</div>
            <div class="pv-empty">এখনো কোনো ডেটা নেই।<br>প্রথমটা যোগ করুন।</div>
          </section>
          <section class="pv-block pv-state">
            <div class="pv-block-label">⏳ Loading State</div>
            <div class="pv-loading"><span class="pv-spinner"></span> লোড হচ্ছে...</div>
          </section>
          <section class="pv-block pv-state">
            <div class="pv-block-label">⚠️ Error State</div>
            <div class="pv-error">কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।</div>
          </section>
        </div>
      </div>
    `;
  }

  function renderDesignInfo(directionId, tokens) {
    const el = document.getElementById("jfDesignInfo");
    if (!el) return;
    el.innerHTML = `
      <div class="jf-card">
        <h3>🎨 Brand Direction — ${escapeHtml(tokens.label)}</h3>
        <p>${escapeHtml(tokens.description)}</p>
      </div>
      <div class="jf-grid">
        <div class="jf-block">
          <h3>🎨 Color System</h3>
          <div class="jf-swatches">
            <div class="jf-swatch" style="background:${tokens.primary}"><span>Primary</span></div>
            <div class="jf-swatch" style="background:${tokens.accent}"><span>Accent</span></div>
            <div class="jf-swatch" style="background:${tokens.bg};border:1px solid #333"><span>Background</span></div>
            <div class="jf-swatch" style="background:${tokens.surface};border:1px solid #333"><span>Surface</span></div>
          </div>
        </div>
        <div class="jf-block">
          <h3>🔤 Typography</h3>
          <p style="font-family:${tokens.headingFont};font-size:20px;margin:0 0 6px">Heading Font Preview</p>
          <p style="font-family:${tokens.bodyFont};margin:0">Body font preview — সাধারণ লেখার নমুনা।</p>
        </div>
      </div>
      <div class="jf-grid">
        <div class="jf-block">
          <h3>📐 Layout &amp; Navigation</h3>
          <ul>
            <li>Radius স্কেল: ${tokens.radius}</li>
            <li>Shadow স্টাইল: প্রয়োগ করা হয়েছে প্রিভিউতে</li>
            <li>Navigation: উপরে Sticky Top Nav (Homepage), বাম Sidebar (Dashboard)</li>
            <li>Responsive: Mobile-এ Sidebar → Bottom Nav-এ পরিণত হবে</li>
          </ul>
        </div>
        <div class="jf-block">
          <h3>♿ Accessibility চেকলিস্ট</h3>
          <ul>
            <li>Text/Background Contrast কমপক্ষে 4.5:1 রাখা হয়েছে</li>
            <li>Button/Touch target কমপক্ষে 44x44px</li>
            <li>Form label সবসময় input-এর সাথে যুক্ত</li>
            <li>Keyboard দিয়ে Tab করে সব Action-এ পৌঁছানো যাবে</li>
          </ul>
        </div>
      </div>
    `;
  }

  function currentTokens(directionId) {
    return DESIGN_KB[directionId] || DESIGN_KB.professional;
  }

  // ============ REAL BACKEND হুক করার নির্দেশনা ============
  // window.JORON_FACTORY_CONFIG.designEndpoint = "https://your-backend.example.com/api/design-ui";
  // সেই endpoint POST body { plan: {...ProductPlan} } নিয়ে DESIGN_KB-এর একটা entry-র
  // মতো shape-এ JSON রিটার্ন করলেই যথেষ্ট (primary/accent/bg/surface/text/textDim/
  // headingFont/bodyFont/radius/shadow/label)। API key কখনো client-side রাখা হবে না।
  // ==========================================================
  async function fetchRemoteDesign(plan) {
    const endpoint = window.JORON_FACTORY_CONFIG && window.JORON_FACTORY_CONFIG.designEndpoint;
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("DESIGN_BACKEND_ERROR");
      const tokens = await res.json();
      if (!tokens || !tokens.primary) throw new Error("DESIGN_BACKEND_SHAPE_INVALID");
      return tokens;
    } catch (err) {
      console.warn("APYVION: remote design failed, falling back to local presets.", err);
      return null;
    }
  }

  function renderAll(plan, directionId) {
    const tokens = currentTokens(directionId);
    const previewContainer = document.getElementById("jfPreview");
    if (previewContainer) {
      applyTokens(previewContainer, tokens);
      previewContainer.innerHTML = buildPreviewHtml(plan, tokens);
    }
    renderDesignInfo(directionId, tokens);

    const chipsEl = document.getElementById("jfDirChips");
    if (chipsEl) chipsEl.innerHTML = directionChips(directionId);
    wireChips(plan);

    window.__jfCurrentDesign = { directionId, tokens };
  }

  function wireChips(plan) {
    document.querySelectorAll(".jf-dir-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        renderAll(plan, chip.dataset.dir);
      });
    });
  }

  function showEmptyState() {
    const empty = document.getElementById("jfDesignEmpty");
    const loading = document.getElementById("jfDesignLoading");
    const main = document.getElementById("jfDesignMain");
    if (loading) loading.hidden = true;
    if (main) main.hidden = true;
    if (empty) empty.hidden = false;
  }

  function wireProceed(plan) {
    const btn = document.getElementById("jfProceedBuild");
    if (!btn) return;
    btn.onclick = () => {
      try {
        localStorage.setItem("jf_design_system", JSON.stringify(window.__jfCurrentDesign));
        if (window.APYVION_PROJECTS) window.APYVION_PROJECTS.snapshotCurrent();
      } catch (e) {
        console.warn("APYVION: could not persist design system", e);
      }
      window.location.href = "app-builder.html";
    };
  }

  async function init() {
    const plan = getSavedPlan();
    const loading = document.getElementById("jfDesignLoading");
    const main = document.getElementById("jfDesignMain");

    if (!plan) {
      showEmptyState();
      return;
    }

    let defaultDir = DEFAULTS[plan.category] || "professional";

    const remoteTokens = await fetchRemoteDesign(plan);
    if (remoteTokens) {
      DESIGN_KB.ai = Object.assign({ label: remoteTokens.label || "AI Suggested" }, remoteTokens);
      defaultDir = "ai";
    }

    if (loading) loading.hidden = true;
    if (main) main.hidden = false;

    renderAll(plan, defaultDir);
    wireProceed(plan);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
