// APYVION — Secure (Master Structure Section 06)
// দায়িত্ব: Test & Repair (jf_repaired_files, না থাকলে jf_built_files)-এর ফাইল নিয়ে
// কিছু স্বয়ংক্রিয় Security Static Check চালানো — Hardcoded Secret, খোলা CORS,
// অনুপস্থিত Security Header (Helmet), ও Password Storage প্যাটার্ন — যা নিরাপদে
// করা যায় তা মেরামত করা এবং একটা SECURITY.md Checklist তৈরি করা।
//
// সততার সীমা: এটা একটা প্রকৃত Penetration Test বা Vulnerability Scanner না —
// শুধু কিছু সাধারণ, সহজে-ধরা-পড়া প্যাটার্ন চেক করে। Production-এ যাওয়ার আগে
// একজন মানুষ Security Reviewer-এর যাচাই এখনো প্রয়োজন — এটা SECURITY.md-তেও লেখা থাকে।

(function () {
  function getFiles() {
    try {
      const raw = localStorage.getItem("jf_repaired_files") || localStorage.getItem("jf_built_files");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read files for security review", e);
      return null;
    }
  }

  function getSavedPlan() {
    try {
      const raw = localStorage.getItem("jf_product_plan");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- Checks ----------

  const SECRET_PATTERNS = [
    { re: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key প্যাটার্ন" },
    { re: /sk_live_[0-9a-zA-Z]+/, label: "Stripe Live Secret Key প্যাটার্ন" },
    { re: /["']?password["']?\s*[:=]\s*["'][^"'{}]{4,}["']/i, label: "সরাসরি লেখা Password Value" },
  ];
  const PLACEHOLDER_SAFE = /change-me|your-|example|xxxxx/i;

  function checkHardcodedSecrets(files) {
    const results = [];
    let found = [];
    Object.keys(files).forEach((path) => {
      const content = files[path];
      SECRET_PATTERNS.forEach(({ re, label }) => {
        const match = content.match(re);
        if (match && !PLACEHOLDER_SAFE.test(match[0])) {
          found.push(`${path}: ${label}`);
        }
      });
    });
    results.push({
      status: found.length > 0 ? "warn" : "pass",
      text: `Hardcoded Secret / Key স্ক্যান (${Object.keys(files).length}টা ফাইল)`,
      detail: found.length > 0 ? `সম্ভাব্য Secret পাওয়া গেছে — ম্যানুয়ালি সরিয়ে Environment Variable ব্যবহার করুন: ${found.join("; ")}` : "কোনো Hardcoded Secret/Key প্যাটার্ন পাওয়া যায়নি",
    });
    return results;
  }

  function checkCors(files) {
    const results = [];
    const path = "backend/server.js";
    if (!files[path]) return results;
    const openCors = /app\.use\(\s*cors\(\s*\)\s*\)/.test(files[path]);
    results.push({
      status: openCors ? "warn" : "pass",
      text: "backend/server.js — CORS কনফিগারেশন চেক",
      detail: openCors
        ? "cors() কোনো origin সীমাবদ্ধতা ছাড়া খোলা আছে — Deploy করার আগে নির্দিষ্ট origin (যেমন আপনার Frontend Domain) সেট করুন"
        : "CORS নির্দিষ্ট origin দিয়ে কনফিগার করা আছে",
    });
    return results;
  }

  function checkSecurityHeaders(files) {
    const results = [];
    const path = "backend/server.js";
    if (!files[path]) return results;

    let content = files[path];
    const hasHelmet = /helmet/.test(content);
    let repaired = false;

    if (!hasHelmet) {
      content = content.replace(
        'const cors = require("cors");',
        'const cors = require("cors");\nconst helmet = require("helmet");'
      );
      content = content.replace('app.use(cors());', 'app.use(cors());\napp.use(helmet());');
      files[path] = content;

      if (files["backend/package.json"]) {
        try {
          const pkg = JSON.parse(files["backend/package.json"]);
          pkg.dependencies = pkg.dependencies || {};
          pkg.dependencies.helmet = "^7.1.0";
          files["backend/package.json"] = JSON.stringify(pkg, null, 2);
        } catch (e) {
          console.warn("APYVION: could not update package.json with helmet", e);
        }
      }
      repaired = true;
    }

    results.push({
      status: repaired ? "repaired" : "pass",
      text: "backend/server.js — Security Header (Helmet) চেক",
      detail: repaired ? "helmet যুক্ত করা হয়েছে (server.js ও package.json দুই জায়গাতেই) — এটা কিছু সাধারণ HTTP Security Header সেট করে" : "helmet ইতিমধ্যে যুক্ত আছে",
    });
    return results;
  }

  function checkPasswordStorage(files) {
    const results = [];
    const schemaPath = "database/schema.sql";
    if (!files[schemaPath]) return results;

    const schema = files[schemaPath];
    const hasPlainPassword = /\bpassword\s+VARCHAR/i.test(schema) && !/password_hash/i.test(schema);
    const hasUsersTable = /CREATE TABLE users/i.test(schema);

    if (!hasUsersTable) return results;

    results.push({
      status: hasPlainPassword ? "warn" : "pass",
      text: "database/schema.sql — Password Storage চেক",
      detail: hasPlainPassword
        ? "users টেবিলে সরাসরি 'password' কলাম পাওয়া গেছে — Plain Text Password কখনো সংরক্ষণ করবেন না, bcrypt দিয়ে হ্যাশ করে password_hash কলামে রাখুন"
        : "password_hash কলাম ব্যবহার হচ্ছে — সঠিক প্যাটার্ন। মনে রাখবেন, প্রকৃত hashing কোড (bcrypt) এখনো backend route-এ লেখা বাকি",
    });
    return results;
  }

  function runAllChecks(files) {
    return [
      ...checkHardcodedSecrets(files),
      ...checkCors(files),
      ...checkSecurityHeaders(files),
      ...checkPasswordStorage(files),
    ];
  }

  // ---------- SECURITY.md ----------

  function buildSecurityMd(plan, files) {
    const tr = (plan && plan.technicalRequirements) || {};
    const hasBackend = !!files["backend/server.js"];
    const lines = [
      "# Security Checklist",
      "",
      "এই ফাইলটা APYVION-এর Secure Module (Section 06) স্বয়ংক্রিয়ভাবে তৈরি করেছে।",
      "এটা একটা শুরুর Checklist — একজন মানুষ Security Reviewer-এর চূড়ান্ত যাচাই এখনো প্রয়োজন।",
      "",
      "## স্বয়ংক্রিয়ভাবে যা করা হয়েছে",
      "- HTTP Security Header-এর জন্য `helmet` যুক্ত করা হয়েছে (থাকলে)",
      "- Hardcoded Secret/Key প্যাটার্নের জন্য কোড স্ক্যান করা হয়েছে",
      "",
      "## Deploy করার আগে ম্যানুয়ালি যা করণীয়",
    ];
    if (hasBackend) {
      lines.push("- CORS-এ নির্দিষ্ট origin সেট করুন (এখন খোলা আছে ধরে নেওয়া হয়েছে)");
    }
    if (tr.needsAuth) {
      lines.push("- Password Hashing (bcrypt/argon2) দিয়ে প্রকৃত Authentication কোড লিখুন — এখনো শুধু কাঠামো আছে");
      lines.push("- JWT/Session Secret production-এ একটা শক্তিশালী, গোপন মান দিয়ে বদলে দিন");
    }
    if (tr.needsPayment) {
      lines.push("- Payment Provider-এর Webhook Signature যাচাই যুক্ত করুন");
      lines.push("- Rate Limiting যুক্ত করুন (যেমন express-rate-limit), বিশেষ করে Payment/Login Route-এ");
    }
    if (tr.needsDatabase) {
      lines.push("- Database Query-তে Parameterized Query/ORM ব্যবহার করুন (SQL Injection ঠেকাতে)");
    }
    lines.push("- সব User Input-এ Server-side Validation যুক্ত করুন");
    lines.push("- Production-এ সবসময় HTTPS ব্যবহার করুন");
    return lines.join("\n") + "\n";
  }

  // ---------- Render ----------

  function iconFor(status) {
    if (status === "pass") return "✅";
    if (status === "repaired") return "🔧";
    return "⚠️";
  }

  function renderResults(results) {
    const list = document.getElementById("jfSecCheckList");
    list.innerHTML = results
      .map(
        (r) => `
      <div class="jf-check-item jf-check-${r.status}">
        <span class="jf-check-icon">${iconFor(r.status)}</span>
        <div>
          <div class="jf-check-text">${escapeHtml(r.text)}</div>
          <div class="jf-check-detail">${escapeHtml(r.detail)}</div>
        </div>
      </div>`
      )
      .join("");

    document.getElementById("jfSecBadgePass").textContent = `✅ Passed: ${results.filter((r) => r.status === "pass").length}`;
    document.getElementById("jfSecBadgeRepaired").textContent = `🔧 Repaired: ${results.filter((r) => r.status === "repaired").length}`;
    document.getElementById("jfSecBadgeWarn").textContent = `⚠️ Manual attention: ${results.filter((r) => r.status === "warn").length}`;
  }

  async function downloadZip(files, filename) {
    if (typeof JSZip === "undefined") {
      alert("ZIP লাইব্রেরি লোড হয়নি — ইন্টারনেট সংযোগ পরীক্ষা করুন।");
      return;
    }
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => zip.file(path, content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function init() {
    const files = getFiles();
    const plan = getSavedPlan();
    const empty = document.getElementById("jfSecEmpty");
    const main = document.getElementById("jfSecMain");

    if (!files) {
      empty.hidden = false;
      main.hidden = true;
      return;
    }
    empty.hidden = true;
    main.hidden = false;

    const runBtn = document.getElementById("jfRunSecBtn");
    const notice = document.getElementById("jfSecNotice");
    const result = document.getElementById("jfSecResult");
    const downloadBtn = document.getElementById("jfDownloadSecuredBtn");

    runBtn.addEventListener("click", () => {
      runBtn.disabled = true;
      runBtn.textContent = "⏳ চেক চলছে...";
      try {
        const workingFiles = JSON.parse(JSON.stringify(files));
        const results = runAllChecks(workingFiles);
        workingFiles["SECURITY.md"] = buildSecurityMd(plan, workingFiles);

        renderResults(results);
        result.hidden = false;
        notice.hidden = true;

        window.__jfSecuredFiles = workingFiles;
        try {
          localStorage.setItem("jf_secured_files", JSON.stringify(workingFiles));
        } catch (e) {
          console.warn("APYVION: could not persist secured files", e);
        }
      } catch (err) {
        console.error(err);
        notice.textContent = "Security Review চালাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
        notice.hidden = false;
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = "🔒 Security Review চালান";
      }
    });

    downloadBtn.addEventListener("click", () => {
      if (!window.__jfSecuredFiles) return;
      downloadZip(window.__jfSecuredFiles, "app-code-secured.zip");
    });

    const proceedBtn = document.getElementById("jfProceedDeploy");
    if (proceedBtn) {
      proceedBtn.addEventListener("click", () => {
        if (!window.__jfSecuredFiles) return;
        try {
          localStorage.setItem("jf_secured_files", JSON.stringify(window.__jfSecuredFiles));
        } catch (e) {
          console.warn("APYVION: could not persist secured files", e);
        }
        window.location.href = "deploy.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
