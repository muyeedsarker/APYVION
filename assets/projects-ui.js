// APYVION — "আমার প্রজেক্ট" প্যানেল (শুধু Idea Center-এ)
// এই ফাইলটা assets/projects.js-এর উপর নির্ভর করে; শুধুমাত্র লিস্ট রেন্ডার ও
// বাটন-ওয়্যারিং করে, কোনো নতুন localStorage যুক্তি নেই (সব projects.js-এ)।
(function () {
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return iso || "";
    }
  }

  function render() {
    const panel = document.getElementById("jfProjectsPanel");
    if (!panel || !window.APYVION_PROJECTS) return;
    const list = window.APYVION_PROJECTS.getList();
    const currentId = window.APYVION_PROJECTS.getCurrentId();

    if (!list.length) {
      panel.innerHTML = '<p class="jf-subtitle">এখনো কোনো Project সংরক্ষিত হয়নি — একটা Idea লিখে জমা দিলেই এখানে দেখাবে।</p>';
      return;
    }

    panel.innerHTML = list
      .map((p) => {
        const active = p.id === currentId ? " (চলমান)" : "";
        return `
        <div class="jf-check-item" style="align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <div class="jf-check-text">${esc(p.name)}${active}</div>
            <div class="jf-check-detail">ধাপ: ${esc(p.stage || "—")} · সর্বশেষ আপডেট: ${esc(fmtDate(p.updatedAt || p.createdAt))}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="jf-btn jf-btn-small" data-resume="${esc(p.id)}">▶️ Resume</button>
            <button type="button" class="jf-btn jf-btn-small" data-rename="${esc(p.id)}">✏️ নাম বদলান</button>
            <button type="button" class="jf-btn jf-btn-small" data-delete="${esc(p.id)}">🗑️ Delete</button>
          </div>
        </div>`;
      })
      .join("");

    panel.querySelectorAll("[data-resume]").forEach((b) => {
      b.onclick = () => {
        const page = window.APYVION_PROJECTS.loadProject(b.dataset.resume);
        window.location.href = page || "index.html";
      };
    });
    panel.querySelectorAll("[data-rename]").forEach((b) => {
      b.onclick = () => {
        const current = list.find((p) => p.id === b.dataset.rename);
        const name = prompt("নতুন নাম দিন:", current ? current.name : "");
        if (name) {
          window.APYVION_PROJECTS.rename(b.dataset.rename, name);
          render();
        }
      };
    });
    panel.querySelectorAll("[data-delete]").forEach((b) => {
      b.onclick = () => {
        if (confirm("এই Project স্থায়ীভাবে মুছে ফেলতে চান?")) {
          window.APYVION_PROJECTS.remove(b.dataset.delete);
          render();
        }
      };
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("jfProjectsToggle");
    const panel = document.getElementById("jfProjectsPanel");
    const newBtn = document.getElementById("jfNewProjectBtn");

    if (toggleBtn && panel) {
      toggleBtn.onclick = () => {
        panel.hidden = !panel.hidden;
        toggleBtn.textContent = panel.hidden ? "তালিকা দেখুন" : "তালিকা লুকান";
        if (!panel.hidden) render();
      };
    }

    if (newBtn) {
      newBtn.onclick = () => {
        if (!window.APYVION_PROJECTS) return;
        const hasCurrent = !!window.APYVION_PROJECTS.getCurrentId() || !!localStorage.getItem("jf_idea_spec");
        if (hasCurrent && !confirm("বর্তমান কাজ Project History-তে সংরক্ষণ হয়ে নতুন Idea শুরু হবে। এগোবেন?")) return;
        window.APYVION_PROJECTS.startNew();
        const ta = document.getElementById("jfIdeaInput");
        if (ta) ta.value = "";
        const result = document.getElementById("jfResult");
        if (result) {
          result.hidden = true;
          result.innerHTML = "";
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }
  });
})();
