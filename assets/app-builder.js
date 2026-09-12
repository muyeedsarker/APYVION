// APYVION — App Builder (Master Structure Section 04)
// দায়িত্ব: AI Product Planner (jf_product_plan) ও AI UI/UX Designer (jf_design_system)-এর
// সংরক্ষিত ডেটা নিয়ে আসল Frontend কোড (HTML/CSS/JS) এবং প্রয়োজন অনুযায়ী একটা
// Backend/Database Scaffold তৈরি করা, তারপর সবকিছু একটা ZIP ফাইলে প্যাক করে দেওয়া।
//
// নিয়ম (Constitution অনুযায়ী): শুধু একটাই মূল control — "App Code তৈরি করুন" বাটন।
// ফলাফল তৈরি হওয়ার পরেই Download বাটন দেখা যায় (আগের Module-গুলোর প্যাটার্ন অনুসরণ করে)।
//
// ============ REAL BACKEND হুক করার নির্দেশনা ============
// window.JORON_FACTORY_CONFIG.buildEndpoint = "https://your-backend.example.com/api/build-app";
// সেই endpoint POST body { plan, design } নিয়ে { files: { "path/to/file": "content", ... } }
// শেপে JSON রিটার্ন করলেই যথেষ্ট — নিচের buildFilesLocal()-এর রিটার্ন শেপের মতোই।
// ==========================================================

(function () {
  const ENTITY_KB = window.JORON_BUILDER_ENTITIES || {};
  const AUTH_TABLE = window.JORON_BUILDER_AUTH_TABLE || { name: "users", fields: ["id", "name", "email", "password_hash", "role", "created_at"] };

  function getSavedPlan() {
    try {
      const raw = localStorage.getItem("jf_product_plan");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read saved plan", e);
      return null;
    }
  }

  function getSavedDesign() {
    try {
      const raw = localStorage.getItem("jf_design_system");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read saved design", e);
      return null;
    }
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function slugify(text) {
    return String(text || "app")
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "app";
  }

  function appTitle(plan) {
    const first = (plan.productDefinition || "AI App").split("—")[0].trim();
    return first || "AI App";
  }

  function entitiesForPlan(plan) {
    const list = (ENTITY_KB[plan.category] || ENTITY_KB.generic || []).map((t) => ({ ...t }));
    const hasUsers = list.some((t) => t.name === "users");
    if (plan.technicalRequirements && plan.technicalRequirements.needsAuth && !hasUsers) {
      list.unshift({ ...AUTH_TABLE });
    }
    return list;
  }

  // ---------- Frontend file generation ----------

  function buildStyleCss(tokens) {
    return `:root {
  --pv-primary: ${tokens.primary};
  --pv-accent: ${tokens.accent};
  --pv-bg: ${tokens.bg};
  --pv-surface: ${tokens.surface};
  --pv-text: ${tokens.text};
  --pv-text-dim: ${tokens.textDim};
  --pv-radius: ${tokens.radius};
  --pv-shadow: ${tokens.shadow};
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: ${tokens.bodyFont};
  background: var(--pv-bg);
  color: var(--pv-text);
}

h1, h2, h3 { font-family: ${tokens.headingFont}; margin: 0 0 12px; }

.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  background: var(--pv-surface);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.app-nav a { color: var(--pv-text); text-decoration: none; margin-left: 18px; }
.app-nav .brand { font-weight: 700; color: var(--pv-primary); }

.app-hero {
  padding: 64px 32px;
  text-align: center;
}

.app-hero p { color: var(--pv-text-dim); max-width: 560px; margin: 0 auto 24px; }

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: var(--pv-radius);
  border: none;
  background: var(--pv-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  padding: 0 32px 48px;
}

.card {
  background: var(--pv-surface);
  border-radius: var(--pv-radius);
  padding: 20px;
  box-shadow: var(--pv-shadow);
}

.card h3 { font-size: 16px; color: var(--pv-primary); }

form {
  max-width: 420px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

form label { color: var(--pv-text-dim); font-size: 14px; }

form input, form select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: var(--pv-bg);
  color: var(--pv-text);
}

table { width: 100%; border-collapse: collapse; margin: 0 32px 48px; }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
th { color: var(--pv-text-dim); font-weight: 600; }
`;
  }

  function buildAppJs(plan) {
    return `// ${appTitle(plan)} — শুরুর Frontend JS
// এখানে Navigation, ছোট Form Validation ও Demo State রাখা হয়েছে।
// আসল Backend যুক্ত হলে fetch() দিয়ে API কল করুন (backend/routes/ ফোল্ডার দেখুন)।

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-app-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("এটা একটা Demo ফর্ম — Backend যুক্ত হলে এখানে API কল হবে।");
    });
  });
});
`;
  }

  function buildIndexHtml(plan) {
    const features = (plan.coreFeatures || []).slice(0, 6);
    return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(appTitle(plan))}</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <nav class="app-nav">
    <span class="brand">${escapeHtml(appTitle(plan))}</span>
    <div>
      <a href="pages/dashboard.html">Dashboard</a>
      ${plan.technicalRequirements && plan.technicalRequirements.needsAuth ? '<a href="pages/login.html">Login</a>' : ""}
    </div>
  </nav>

  <section class="app-hero">
    <h1>${escapeHtml(appTitle(plan))}</h1>
    <p>${escapeHtml(plan.problem || "")}</p>
    <a class="btn" href="pages/dashboard.html">শুরু করুন</a>
  </section>

  <div class="card-grid">
    ${features.map((f) => `<div class="card"><h3>${escapeHtml(f)}</h3></div>`).join("\n    ")}
  </div>

  <script src="firebase-config.js"></script>
  <script type="module" src="assets/firebase-client.js"></script>
  <script src="assets/app.js"></script>
</body>
</html>
`;
  }

  function buildDashboardHtml(plan) {
    const roles = plan.userRoles || [];
    const features = plan.coreFeatures || [];
    return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — ${escapeHtml(appTitle(plan))}</title>
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <nav class="app-nav">
    <span class="brand">${escapeHtml(appTitle(plan))}</span>
    <div><a href="../index.html">Home</a></div>
  </nav>

  <section style="padding:32px">
    <h2>Dashboard</h2>
    <p style="color:var(--pv-text-dim)">User Roles: ${escapeHtml(roles.join(", "))}</p>
  </section>

  <table>
    <thead><tr><th>Feature</th><th>Status</th></tr></thead>
    <tbody>
      ${features.map((f) => `<tr><td>${escapeHtml(f)}</td><td>Planned</td></tr>`).join("\n      ")}
    </tbody>
  </table>

  <script src="../assets/app.js"></script>
</body>
</html>
`;
  }

  function buildLoginHtml(plan) {
    return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login — ${escapeHtml(appTitle(plan))}</title>
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <nav class="app-nav">
    <span class="brand">${escapeHtml(appTitle(plan))}</span>
    <div><a href="../index.html">Home</a></div>
  </nav>

  <form data-app-form>
    <h2>Login</h2>
    <label>Email<input type="email" required></label>
    <label>Password<input type="password" required></label>
    <button class="btn" type="submit">Login</button>
  </form>

  <script src="../firebase-config.js"></script>
  <script type="module" src="../assets/firebase-client.js"></script>
  <script src="../assets/app.js"></script>
</body>
</html>
`;
  }

  function buildFrontendFiles(plan, design) {
    const tokens = (design && design.tokens) || {
      primary: "#7c5cff", accent: "#22c3a6", bg: "#0f1115", surface: "#171a21",
      text: "#e9ecf1", textDim: "#9aa3b2", headingFont: "system-ui, sans-serif",
      bodyFont: "system-ui, sans-serif", radius: "16px", shadow: "0 20px 60px rgba(124,92,255,0.25)",
    };
    const needsAuth = plan.technicalRequirements && plan.technicalRequirements.needsAuth;
    const files = {
      "frontend/firebase-config.js": `// Firebase Web App config — replace placeholders before use\nwindow.AI_APP_FACTORY_FIREBASE_CONFIG = {\n  apiKey: "YOUR_FIREBASE_API_KEY",\n  authDomain: "YOUR_PROJECT.firebaseapp.com",\n  projectId: "YOUR_PROJECT_ID",\n  storageBucket: "YOUR_PROJECT.firebasestorage.app",\n  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",\n  appId: "YOUR_FIREBASE_APP_ID"\n};\n`,
      "frontend/assets/firebase-client.js": `// Firebase client adapter — generated app scaffold\nimport { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";\nimport { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";\nimport { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";\nimport { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";\nconst config = window.AI_APP_FACTORY_FIREBASE_CONFIG;\nconst configured = config && config.apiKey && !String(config.apiKey).startsWith("YOUR_");\nconst app = configured ? (getApps().length ? getApp() : initializeApp(config)) : null;\nexport const auth = app ? getAuth(app) : null;\nexport const db = app ? getFirestore(app) : null;\nexport const storage = app ? getStorage(app) : null;\nexport { configured };\n`,
      "frontend/index.html": buildIndexHtml(plan),
      "frontend/pages/dashboard.html": buildDashboardHtml(plan),
      "frontend/assets/style.css": buildStyleCss(tokens),
      "frontend/assets/app.js": buildAppJs(plan),
    };
    if (needsAuth) {
      files["frontend/pages/login.html"] = buildLoginHtml(plan);
    }
    return files;
  }

  // ---------- Backend / Database scaffold generation ----------

  function buildSchemaSql(entities) {
    return `-- ${new Date().toISOString().slice(0, 10)} এ Auto-generated Database Schema Scaffold
-- এটা একটা শুরুর বিন্দু — প্রকৃত প্রয়োজন, Constraint ও Index পরে যুক্ত করুন।

${entities
  .map(
    (t) => `CREATE TABLE ${t.name} (
${t.fields.map((f) => `  ${f} ${f === "id" ? "SERIAL PRIMARY KEY" : f.endsWith("_at") ? "TIMESTAMP DEFAULT NOW()" : f.endsWith("_id") ? "INTEGER" : "VARCHAR(255)"}`).join(",\n")}
);`
  )
  .join("\n\n")}
`;
  }

  function buildRouteJs(entity) {
    const varName = entity.name;
    return `// backend/routes/${varName}.js — ${varName} এর জন্য শুরুর CRUD Route Scaffold
// আসল Database Query, Validation ও Authorization যুক্ত করা এখনো বাকি।

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ message: "GET /${varName} — এখনো Database যুক্ত হয়নি" });
});

router.post("/", async (req, res) => {
  res.json({ message: "POST /${varName} — এখনো Database যুক্ত হয়নি", body: req.body });
});

router.get("/:id", async (req, res) => {
  res.json({ message: \`GET /${varName}/\${req.params.id} — এখনো Database যুক্ত হয়নি\` });
});

module.exports = router;
`;
  }

  function buildServerJs(entities) {
    return `// backend/server.js — Express Server Scaffold
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

${entities.map((t) => `app.use("/api/${t.name}", require("./routes/${t.name}"));`).join("\n")}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;
  }

  function buildPackageJson(plan) {
    return JSON.stringify(
      {
        name: slugify(appTitle(plan)),
        version: "0.1.0",
        private: true,
        scripts: { start: "node server.js" },
        dependencies: { express: "^4.19.0", cors: "^2.8.5", dotenv: "^16.4.0" },
      },
      null,
      2
    );
  }

  function buildEnvExample(plan) {
    const tr = plan.technicalRequirements || {};
    const lines = ["PORT=4000"];
    if (tr.needsDatabase) lines.push("DATABASE_URL=postgres://user:password@localhost:5432/appdb");
    if (tr.needsAuth) lines.push("JWT_SECRET=change-me");
    if (tr.needsPayment) lines.push("PAYMENT_PROVIDER_KEY=change-me");
    return lines.join("\n") + "\n";
  }

  function buildBackendReadme(plan, entities) {
    return `# Backend Scaffold — ${appTitle(plan)}

এটা একটা **শুরুর Scaffold**, Production-ready কোড না। Master Structure পাইপলাইনের
পরবর্তী Module-গুলোতে (🧪 Test & Repair, 🔒 Secure, 🚀 Deploy) এটা যাচাই ও শক্তপোক্ত করা হবে।

## Entity / Table
${entities.map((t) => `- **${t.name}**: ${t.fields.join(", ")}`).join("\n")}

## চালানোর উপায়
\`\`\`
cd backend
npm install
cp .env.example .env
npm start
\`\`\`

## এখনো বাকি
- Database সংযোগ (এখন শুধু route-এর কাঠামো আছে, প্রকৃত query নেই)
- Authentication middleware ${plan.technicalRequirements && plan.technicalRequirements.needsAuth ? "(Auth প্রয়োজন — JWT/Session যুক্ত করুন)" : ""}
- Input Validation ও Error Handling
- Security Hardening (Rate limiting, Sanitization) — Section 07 এ হবে
`;
  }

  function buildBackendFiles(plan) {
    const tr = plan.technicalRequirements || {};
    if (!tr.needsDatabase && !tr.needsAuth && !tr.needsPayment) return null;

    const entities = entitiesForPlan(plan);
    const files = {
      "backend/package.json": buildPackageJson(plan),
      "backend/.env.example": buildEnvExample(plan),
      "backend/server.js": buildServerJs(entities),
      "backend/README.md": buildBackendReadme(plan, entities),
      "database/schema.sql": buildSchemaSql(entities),
    };
    entities.forEach((t) => {
      files[`backend/routes/${t.name}.js`] = buildRouteJs(t);
    });
    return files;
  }

  // ---------- Remote hook + orchestration ----------

  async function buildFilesRemote(plan, design) {
    const endpoint = window.JORON_FACTORY_CONFIG && window.JORON_FACTORY_CONFIG.buildEndpoint;
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, design }),
      });
      if (!res.ok) throw new Error("BUILD_BACKEND_ERROR");
      const data = await res.json();
      if (!data || !data.files) throw new Error("BUILD_BACKEND_SHAPE_INVALID");
      return data.files;
    } catch (err) {
      console.warn("APYVION: remote build failed, falling back to local generator.", err);
      return null;
    }
  }

  function buildFilesLocal(plan, design) {
    const frontend = buildFrontendFiles(plan, design);
    const backend = buildBackendFiles(plan);
    return Object.assign({}, frontend, backend || {});
  }

  async function buildFiles(plan, design) {
    const remote = await buildFilesRemote(plan, design);
    if (remote) return remote;
    return buildFilesLocal(plan, design);
  }

  // ---------- File tree UI ----------

  function renderFileTree(files) {
    const paths = Object.keys(files).sort();
    const tree = {};
    paths.forEach((p) => {
      const parts = p.split("/");
      let node = tree;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          node.__files = node.__files || [];
          node.__files.push(part);
        } else {
          node[part] = node[part] || {};
          node = node[part];
        }
      });
    });

    function renderNode(node, depth) {
      let html = "";
      const indent = `<span class="jf-tree-indent"></span>`.repeat(depth);
      Object.keys(node)
        .filter((k) => k !== "__files")
        .sort()
        .forEach((folder) => {
          html += `<div>${indent}<span class="jf-tree-folder">📁 ${escapeHtml(folder)}/</span></div>`;
          html += renderNode(node[folder], depth + 1);
        });
      (node.__files || []).sort().forEach((file) => {
        html += `<div>${indent}<span class="jf-tree-file">📄 ${escapeHtml(file)}</span></div>`;
      });
      return html;
    }

    return renderNode(tree, 0);
  }

  // ---------- Download ----------

  async function downloadZip(files, plan) {
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
    a.download = `${slugify(appTitle(plan))}-app-code.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Init ----------

  function init() {
    const plan = getSavedPlan();
    const design = getSavedDesign();
    const empty = document.getElementById("jfBuildEmpty");
    const main = document.getElementById("jfBuildMain");

    if (!plan) {
      empty.hidden = false;
      main.hidden = true;
      return;
    }
    empty.hidden = true;
    main.hidden = false;

    const genBtn = document.getElementById("jfGenerateBtn");
    const notice = document.getElementById("jfBuildNotice");
    const result = document.getElementById("jfBuildResult");
    const downloadBtn = document.getElementById("jfDownloadBtn");

    genBtn.addEventListener("click", async () => {
      genBtn.disabled = true;
      genBtn.textContent = "⏳ তৈরি হচ্ছে...";
      try {
        const files = await buildFiles(plan, design);
        window.__jfBuiltFiles = files;

        document.getElementById("jfFileTree").innerHTML = renderFileTree(files);

        const frontendCount = Object.keys(files).filter((p) => p.startsWith("frontend/")).length;
        const backendCount = Object.keys(files).filter((p) => p.startsWith("backend/") || p.startsWith("database/")).length;

        document.getElementById("jfFrontendSummary").textContent =
          `${frontendCount}টা ফাইল তৈরি হয়েছে — Homepage, Dashboard${plan.technicalRequirements && plan.technicalRequirements.needsAuth ? ", Login" : ""}, এবং Design System অনুযায়ী স্টাইল।`;

        document.getElementById("jfBackendSummary").textContent =
          backendCount > 0
            ? `${backendCount}টা ফাইল তৈরি হয়েছে — Express Server Scaffold, Route stub, ও Database schema.sql।`
            : "এই App-এর জন্য Database/Auth/Payment প্রয়োজন নেই বলে চিহ্নিত হয়েছে, তাই শুধু Frontend তৈরি হয়েছে।";

        result.hidden = false;
        notice.hidden = true;
      } catch (err) {
        console.error(err);
        notice.textContent = "কোড তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
        notice.hidden = false;
      } finally {
        genBtn.disabled = false;
        genBtn.textContent = "🏗️ App Code তৈরি করুন";
      }
    });

    downloadBtn.addEventListener("click", () => {
      if (!window.__jfBuiltFiles) return;
      downloadZip(window.__jfBuiltFiles, plan);
    });

    const proceedBtn = document.getElementById("jfProceedTest");
    if (proceedBtn) {
      proceedBtn.addEventListener("click", () => {
        if (!window.__jfBuiltFiles) return;
        try {
          localStorage.setItem("jf_built_files", JSON.stringify(window.__jfBuiltFiles));
          if (window.APYVION_PROJECTS) window.APYVION_PROJECTS.snapshotCurrent();
        } catch (e) {
          console.warn("APYVION: could not persist built files", e);
        }
        window.location.href = "test-repair.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
