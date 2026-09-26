// APYVION — AI UI/UX Designer — interactive live preview
(function () {
  const DESIGN_KB = window.JORON_DESIGN_KB || {};
  const DEFAULTS = window.JORON_DESIGN_DEFAULTS || {};

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  function getPlan() {
    try {
      const raw = localStorage.getItem("jf_product_plan");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function tokensFor(id) {
    return DESIGN_KB[id] || DESIGN_KB.professional || Object.values(DESIGN_KB)[0];
  }

  function chips(active) {
    return Object.entries(DESIGN_KB).map(([id, t]) => `
      <button type="button" class="jf-dir-chip ${id === active ? "jf-dir-chip-active" : ""}"
        data-dir="${esc(id)}" style="--chip-color:${esc(t.primary)}">
        <span class="jf-dir-dot"></span>${esc(t.label)}
      </button>`).join("");
  }

  function preview(plan) {
    const features = (plan.coreFeatures || []).slice(0, 4);
    const roles = plan.userRoles || [];
    const title = plan.productDefinition
      ? plan.productDefinition.split("—")[0].trim()
      : "Your App";

    return `
      <div class="pv-root">
        <section class="pv-block" id="pvHome">
          <div class="pv-block-label">🏠 Homepage</div>
          <div class="pv-homepage">
            <div class="pv-nav">
              <span class="pv-logo">${esc(title)}</span>
              <span class="pv-nav-links">
                <button type="button" data-pv-nav="home">Home</button>
                <button type="button" data-pv-nav="features">Features</button>
                <button type="button" data-pv-nav="form">Login/Form</button>
              </span>
            </div>
            <div class="pv-hero">
              <h1>${esc(title)}</h1>
              <p>${esc(plan.problem || "")}</p>
              <button class="pv-btn pv-btn-primary" type="button" data-pv-action="start">শুরু করুন</button>
            </div>
          </div>
        </section>

        <section class="pv-block" id="pvFeatures">
          <div class="pv-block-label">📊 Dashboard Cards</div>
          <div class="pv-cards">
            ${features.map((f, i) => `
              <button type="button" class="pv-card" data-feature="${i}">
                <div class="pv-card-icon">✦</div>
                <div class="pv-card-title">${esc(f)}</div>
              </button>`).join("")}
          </div>
          <div id="pvFeatureNotice" class="pv-interaction-note" hidden></div>
        </section>

        <div class="pv-grid-2" id="pvForm">
          <section class="pv-block">
            <div class="pv-block-label">📝 Form</div>
            <form class="pv-form" id="pvDemoForm">
              <label>নাম<input name="name" type="text" placeholder="আপনার নাম" required></label>
              <label>ইমেইল<input name="email" type="email" placeholder="you@example.com" required></label>
              <button class="pv-btn pv-btn-primary" type="submit" style="margin-top:10px">সাবমিট</button>
              <div id="pvFormNotice" class="pv-interaction-note" hidden></div>
            </form>
          </section>
          <section class="pv-block">
            <div class="pv-block-label">🧑‍🤝‍🧑 User Roles</div>
            <div class="pv-roles">
              ${roles.map(r => `<span class="pv-role-pill">${esc(r)}</span>`).join("")}
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
          <section class="pv-block pv-state"><div class="pv-block-label">📭 Empty State</div><div class="pv-empty">এখনো কোনো ডেটা নেই।<br>প্রথমটা যোগ করুন।</div></section>
          <section class="pv-block pv-state"><div class="pv-block-label">⏳ Loading State</div><div class="pv-loading"><span class="pv-spinner"></span> লোড হচ্ছে...</div></section>
          <section class="pv-block pv-state"><div class="pv-block-label">⚠️ Error State</div><div class="pv-error">কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।</div></section>
        </div>
      </div>`;
  }

  function apply(container, t) {
    ["primary","accent","bg","surface","text","textDim","headingFont","bodyFont","radius","shadow"]
      .forEach(k => container.style.setProperty("--pv-" + k.replace("textDim","text-dim"), t[k] || ""));
  }

  function info(t) {
    const el = document.getElementById("jfDesignInfo");
    if (!el) return;
    el.innerHTML = `
      <div class="jf-card"><h3>🎨 Brand Direction — ${esc(t.label)}</h3><p>${esc(t.description)}</p></div>
      <div class="jf-grid">
        <div class="jf-block"><h3>🎨 Color System</h3><div class="jf-swatches">
          <div class="jf-swatch" style="background:${esc(t.primary)}"><span>Primary</span></div>
          <div class="jf-swatch" style="background:${esc(t.accent)}"><span>Accent</span></div>
          <div class="jf-swatch" style="background:${esc(t.bg)}"><span>Background</span></div>
          <div class="jf-swatch" style="background:${esc(t.surface)}"><span>Surface</span></div>
        </div></div>
        <div class="jf-block"><h3>🔤 Typography</h3>
          <p style="font-family:${esc(t.headingFont)};font-size:20px">Heading Font Preview</p>
          <p style="font-family:${esc(t.bodyFont)}">Body font preview — সাধারণ লেখার নমুনা।</p>
        </div>
      </div>
      <div class="jf-grid"><div class="jf-block"><h3>📐 Layout &amp; Navigation</h3>
        <ul><li>Radius স্কেল: ${esc(t.radius)}</li><li>Shadow স্টাইল: প্রিভিউতে সক্রিয়</li><li>Navigation: Sticky Top Nav / Dashboard Sidebar</li><li>Mobile: Bottom Navigation</li></ul>
      </div><div class="jf-block"><h3>♿ Accessibility চেকলিস্ট</h3>
        <ul><li>Contrast কমপক্ষে 4.5:1</li><li>Touch target কমপক্ষে 44x44px</li><li>Form label input-এর সাথে যুক্ত</li><li>Keyboard Tab navigation</li></ul>
      </div></div>`;
  }

  function wirePreview() {
    const root = document.getElementById("jfPreview");
    if (!root) return;

    root.querySelectorAll("[data-pv-nav]").forEach(btn => btn.addEventListener("click", () => {
      const target = btn.dataset.pvNav;
      const id = target === "features" ? "pvFeatures" : target === "form" ? "pvForm" : "pvHome";
      document.getElementById(id)?.scrollIntoView({behavior:"smooth", block:"start"});
    }));

    root.querySelector("[data-pv-action='start']")?.addEventListener("click", () => {
      document.getElementById("pvFeatures")?.scrollIntoView({behavior:"smooth", block:"start"});
    });

    root.querySelectorAll("[data-feature]").forEach(card => card.addEventListener("click", () => {
      const notice = document.getElementById("pvFeatureNotice");
      const feature = card.querySelector(".pv-card-title")?.textContent || "Feature";
      if (notice) { notice.textContent = "✓ ${feature} — এই Feature-এর জন্য live preview action কাজ করছে।"; notice.hidden = false; }
    }));

    root.querySelector("#pvDemoForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const form = e.currentTarget;
      const notice = document.getElementById("pvFormNotice");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (notice) { notice.textContent = "✓ Demo form সফলভাবে submit হয়েছে।"; notice.hidden = false; }
    });
  }

  function render(plan, directionId) {
    const t = tokensFor(directionId);
    const previewEl = document.getElementById("jfPreview");
    if (previewEl) { apply(previewEl, t); previewEl.innerHTML = preview(plan); }
    info(t);
    const chipsEl = document.getElementById("jfDirChips");
    if (chipsEl) chipsEl.innerHTML = chips(directionId);
    document.querySelectorAll(".jf-dir-chip").forEach(chip => chip.addEventListener("click", () => render(plan, chip.dataset.dir)));
    wirePreview();
    window.__jfCurrentDesign = {directionId, tokens:t};
  }

  function init() {
    const plan = getPlan();
    const loading = document.getElementById("jfDesignLoading");
    const empty = document.getElementById("jfDesignEmpty");
    const main = document.getElementById("jfDesignMain");

    if (!plan) {
      if (loading) loading.hidden = true;
      if (main) main.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    const direction = DEFAULTS[plan.category] || "professional";
    if (loading) loading.hidden = true;
    if (main) main.hidden = false;
    render(plan, direction);

    document.getElementById("jfProceedBuild")?.addEventListener("click", () => {
      localStorage.setItem("jf_design_system", JSON.stringify(window.__jfCurrentDesign));
      try { window.APYVION_PROJECTS?.snapshotCurrent(); } catch (_) {}
      window.location.href = "app-builder.html";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();