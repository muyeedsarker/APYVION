// APYVION — Idea Center (Master Structure Section 01)
// দায়িত্ব: ব্যবহারকারীর এক লাইনের Idea পড়ে বুঝে ফেলা —
// App Type, Audience, Problem, Core Feature, Platform, User Roles,
// Tech, Database/Auth/Payment প্রয়োজন, Security requirement, আকর্ষণীয় Feature।
//
// এই ফাইলটা Idea Center-এর সম্পূর্ণ Client-side logic। এর কাজ দুই ধাপে:
// 1) analyzeIdeaRemote()  — যদি সত্যিকারের AI backend কনফিগার করা থাকে (নিচে দেখুন),
//    সেটা ব্যবহার করে idea বিশ্লেষণ করবে।
// 2) analyzeIdeaLocal()   — Backend না থাকলে/fail করলে Knowledge Base থেকে
//    সবচেয়ে কাছের App Category মিলিয়ে একটা বাস্তবসম্মত ডিফল্ট বিশ্লেষণ দেখাবে,
//    যাতে Module-টা backend ছাড়াই সত্যিকারের ডেমো করা যায়।
//
// ============ REAL BACKEND হুক করার নির্দেশনা ============
// window.JORON_FACTORY_CONFIG.analyzeEndpoint = "https://your-backend.example.com/api/analyze-idea";
// সেই endpoint POST body { idea: "..." } নিয়ে ঠিক নিচের analyzeIdeaLocal()-এর মতো
// একই shape-এর JSON রিটার্ন করলেই যথেষ্ট। API key কখনো এই client-side ফাইলে রাখা হবে না —
// সেটা backend-এ থাকবে, এখান থেকে শুধু নিজের backend URL-এ কল করা হয়।
// ==========================================================

(function () {
  const KB = window.JORON_FACTORY_KB || [];

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function matchCategory(idea) {
    const text = normalize(idea);
    let best = null;
    let bestScore = 0;
    for (const cat of KB) {
      if (!cat.keywords || !cat.keywords.length) continue;
      let score = 0;
      for (const kw of cat.keywords) {
        if (text.includes(normalize(kw))) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = cat;
      }
    }
    if (best) return best;
    return KB.find((c) => c.id === "generic") || null;
  }

  function detectPlatformHint(idea) {
    const text = normalize(idea);
    if (text.includes("mobile") || text.includes("android") || text.includes("ios") || text.includes("অ্যাপ") || text.includes("apk")) {
      return "Native/Cross-platform Mobile App";
    }
    return null;
  }

  async function analyzeIdeaRemote(idea) {
    const endpoint = window.JORON_FACTORY_CONFIG && window.JORON_FACTORY_CONFIG.analyzeEndpoint;
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error("BACKEND_ERROR");
      const data = await res.json();
      if (!data || !data.appType) throw new Error("BACKEND_SHAPE_INVALID");
      return data;
    } catch (err) {
      console.warn("APYVION: remote analyze failed, falling back to local KB.", err);
      return null;
    }
  }

  function analyzeIdeaLocal(idea) {
    const category = matchCategory(idea);
    const platformOverride = detectPlatformHint(idea);
    const spec = Object.assign({}, category);
    if (platformOverride) spec.platform = platformOverride;
    spec.sourceIdea = idea;
    spec.matchedCategory = category.id;
    return spec;
  }

  async function analyzeIdea(idea) {
    const remote = await analyzeIdeaRemote(idea);
    if (remote) {
      remote.sourceIdea = idea;
      remote.matchedCategory = remote.matchedCategory || "remote";
      return remote;
    }
    return analyzeIdeaLocal(idea);
  }

  function badge(label, value) {
    return `<span class="jf-badge">${escapeHtml(label)}: <strong>${escapeHtml(value ? "প্রয়োজন" : "প্রয়োজন নেই")}</strong></span>`;
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

  function renderResult(spec) {
    const resultEl = document.getElementById("jfResult");
    if (!resultEl) return;

    resultEl.innerHTML = `
      <div class="jf-card jf-summary">
        <div class="jf-summary-top">
          <span class="jf-pill">🟢 IN SCOPE</span>
          <span class="jf-source">উৎস: ${spec.matchedCategory === "remote" ? "AI Backend" : "Knowledge Base ম্যাচ (" + escapeHtml(spec.matchedCategory) + ")"}</span>
        </div>
        <h2>${escapeHtml(spec.appType)}</h2>
        <p class="jf-idea-echo">“${escapeHtml(spec.sourceIdea)}”</p>
      </div>

      <div class="jf-grid">
        ${infoBlock("👥 Target Audience", spec.audience)}
        ${infoBlock("❓ Core Problem", spec.problem)}
        ${infoBlock("🖥️ Platform Recommendation", spec.platform)}
        ${infoBlock("🧰 Suggested Tech Stack", spec.techStack)}
      </div>

      <div class="jf-grid">
        ${listBlock("Core Features", "⚙️", spec.coreFeatures)}
        ${listBlock("User Roles", "🧑‍🤝‍🧑", spec.userRoles)}
        ${listBlock("Security Requirements", "🔐", spec.security)}
        ${listBlock("✨ Standout Features (Premium Differentiators)", "⭐", spec.standoutFeatures)}
      </div>

      <div class="jf-card jf-requirements">
        <h3>📋 প্রাথমিক প্রযুক্তিগত প্রয়োজনীয়তা</h3>
        <div class="jf-badges">
          ${badge("Database", spec.needsDatabase)}
          ${badge("Authentication", spec.needsAuth)}
          ${badge("Payment", spec.needsPayment)}
        </div>
      </div>

      <div class="jf-actions">
        <button class="jf-btn jf-btn-primary" id="jfProceed">➡️ AI Product Planner-এ পাঠান</button>
        <button class="jf-btn" id="jfRetry">🔁 আবার লিখুন</button>
      </div>
    `;

    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });

    const retryBtn = document.getElementById("jfRetry");
    if (retryBtn) retryBtn.onclick = () => resetForm();

    const proceedBtn = document.getElementById("jfProceed");
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        try {
          localStorage.setItem("jf_idea_spec", JSON.stringify(spec));
          if (window.APYVION_PROJECTS) window.APYVION_PROJECTS.snapshotCurrent();
          window.location.href = "product-planner.html";
        } catch (e) {
          console.warn("APYVION: could not persist spec locally", e);
          showNotice("Specification সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
        }
      };
    }
  }

  function infoBlock(title, text) {
    return `
      <div class="jf-block">
        <h3>${title}</h3>
        <p>${escapeHtml(text)}</p>
      </div>`;
  }

  function showNotice(text) {
    const notice = document.getElementById("jfNotice");
    if (!notice) return;
    notice.textContent = text;
    notice.hidden = false;
  }

  function resetForm() {
    const resultEl = document.getElementById("jfResult");
    const input = document.getElementById("jfIdeaInput");
    const notice = document.getElementById("jfNotice");
    if (resultEl) resultEl.hidden = true;
    if (notice) notice.hidden = true;
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  function wireExamples() {
    document.querySelectorAll(".jf-example-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const input = document.getElementById("jfIdeaInput");
        if (input) {
          input.value = chip.textContent.trim();
          input.focus();
        }
      });
    });
  }

  function wireForm() {
    const form = document.getElementById("jfIdeaForm");
    const input = document.getElementById("jfIdeaInput");
    const submitBtn = document.getElementById("jfSubmit");
    const notice = document.getElementById("jfNotice");

    if (!form || !input) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idea = input.value.trim();
      if (notice) notice.hidden = true;

      if (idea.length < 8) {
        if (notice) {
          notice.textContent = "আরেকটু বিস্তারিত লিখুন — অন্তত একটা সম্পূর্ণ বাক্য (যেমন: “আমি একটি Matrimony App বানাতে চাই”)।";
          notice.hidden = false;
        }
        input.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ বিশ্লেষণ করা হচ্ছে...";

      try {
        const spec = await analyzeIdea(idea);
        renderResult(spec);
      } catch (err) {
        console.error("APYVION: analyze failed", err);
        if (notice) {
          notice.textContent = "বিশ্লেষণ করা যায়নি। আবার চেষ্টা করুন।";
          notice.hidden = false;
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "✨ Idea বিশ্লেষণ করুন";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireForm();
    wireExamples();
  });
})();
