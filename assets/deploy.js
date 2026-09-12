// APYVION — Deploy (Master Structure Section 07)
// দায়িত্ব: Secure (jf_secured_files, না থাকলে jf_repaired_files/jf_built_files)-এর
// ফাইল নিয়ে Docker/Hosting Config (Dockerfile, docker-compose.yml, netlify.toml)
// এবং Plan অনুযায়ী কাস্টমাইজড একটা ধাপে-ধাপে DEPLOY.md গাইড তৈরি করা।
//
// সততার সীমা: এই Module কোনো Hosting/Cloud সার্ভিসে সরাসরি Deploy করে না —
// এখানে কোনো Cloud Provider Credential বা API সংযুক্ত নেই। এটা শুধু প্রয়োজনীয়
// Config ফাইল ও নির্দেশনা তৈরি করে দেয়; প্রকৃত Deploy ব্যবহারকারী নিজে করবেন।

(function () {
  function getFiles() {
    try {
      const raw =
        localStorage.getItem("jf_secured_files") ||
        localStorage.getItem("jf_repaired_files") ||
        localStorage.getItem("jf_built_files");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("APYVION: could not read files for deploy", e);
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

  function slugify(text) {
    return (
      String(text || "app")
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
        .replace(/(^-+|-+$)/g, "") || "app"
    );
  }

  function appTitle(plan) {
    const first = ((plan && plan.productDefinition) || "AI App").split("—")[0].trim();
    return first || "AI App";
  }

  function envKeys(envExampleContent) {
    if (!envExampleContent) return [];
    return envExampleContent
      .split("\n")
      .map((l) => l.split("=")[0].trim())
      .filter(Boolean);
  }

  // ---------- Config file builders ----------

  function buildDockerfile() {
    return `# Backend Dockerfile — শুরুর Scaffold
FROM node:20-alpine

WORKDIR /app
COPY backend/package.json ./
RUN npm install --production

COPY backend/ ./

EXPOSE 4000
CMD ["node", "server.js"]
`;
  }

  function buildDockerignore() {
    return `node_modules
.env
npm-debug.log
`;
  }

  function buildDockerCompose(plan) {
    const tr = (plan && plan.technicalRequirements) || {};
    let compose = `version: "3.8"
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    env_file:
      - backend/.env
`;
    if (tr.needsDatabase) {
      compose += `    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppassword
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
`;
    }
    return compose;
  }

  function buildNetlifyToml() {
    return `[build]
  publish = "frontend"
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  }

  function buildEnvProductionExample(envExampleContent) {
    if (!envExampleContent) return null;
    return (
      "# Production Environment Variables — শুধু Placeholder, প্রকৃত মান হোস্টিং Platform-এর\n" +
      "# Environment Variable সেটিংসে দিন, কখনো এই ফাইলে সত্যিকারের Secret লিখবেন না।\n\n" +
      envExampleContent
    );
  }

  function buildDeployMd(plan, files) {
    const tr = (plan && plan.technicalRequirements) || {};
    const hasBackend = !!files["backend/server.js"];
    const keys = envKeys(files["backend/.env.example"]);

    const lines = [
      `# Deploy Guide — ${appTitle(plan)}`,
      "",
      "এই গাইড APYVION-এর Deploy Module (Section 07) স্বয়ংক্রিয়ভাবে তৈরি করেছে।",
      "এটা কোনো নির্দিষ্ট Platform-এ সরাসরি Deploy করে না — নিচের ধাপগুলো আপনাকে",
      "নিজে সম্পন্ন করতে হবে।",
      "",
      "## ধাপ ১ — আগের সব ধাপ সম্পন্ন হয়েছে কিনা নিশ্চিত করুন",
      "- ✅ Test & Repair চালানো হয়েছে",
      "- ✅ Secure Review চালানো হয়েছে ও SECURITY.md পড়া হয়েছে",
      "",
      "## ধাপ ২ — Frontend Hosting",
      "`frontend/` ফোল্ডারটা যেকোনো Static Hosting-এ Deploy করা যাবে:",
      "- **Netlify** — এই Package-এ থাকা `netlify.toml` ব্যবহার করে (Drag & Drop অথবা Git সংযুক্ত করে)",
      "- **Vercel** — নতুন প্রজেক্ট তৈরি করে Root Directory হিসেবে `frontend/` বেছে নিন",
      "- **GitHub Pages** — `frontend/` ফোল্ডারের কন্টেন্ট একটা `gh-pages` Branch-এ পুশ করুন",
    ];

    if (hasBackend) {
      lines.push(
        "",
        "## ধাপ ৩ — Backend Hosting",
        "এই Package-এ থাকা `Dockerfile` ও `docker-compose.yml` দিয়ে স্থানীয়ভাবে টেস্ট করুন:",
        "```",
        "docker compose up --build",
        "```",
        "Production Hosting-এর জন্য জনপ্রিয় বিকল্প:",
        "- **Render** / **Railway** / **Fly.io** — Dockerfile থেকে সরাসরি Deploy সমর্থন করে",
        "- এই সবগুলোতেই Repository সংযুক্ত করে Auto-deploy সেট করা যায়"
      );
    }

    if (tr.needsDatabase) {
      lines.push(
        "",
        "## ধাপ ৪ — Database",
        "একটা Managed PostgreSQL ব্যবহার করার পরামর্শ (নিজে সার্ভারে Database চালানোর চেয়ে সহজ ও নিরাপদ):",
        "- **Supabase**, **Neon**, বা **Railway Postgres**",
        "- Database তৈরি হলে `database/schema.sql` চালিয়ে টেবিলগুলো তৈরি করুন",
        "- সেই Database-এর Connection String `DATABASE_URL` Environment Variable-এ বসান"
      );
    }

    if (keys.length > 0) {
      lines.push(
        "",
        "## ধাপ ৫ — Environment Variables সেট করুন",
        "আপনার Hosting Platform-এর Environment Variable সেটিংসে এই কীগুলো যুক্ত করুন",
        "(মান `backend/.env.production.example`-এ শুধু Placeholder হিসেবে আছে):",
        ...keys.map((k) => `- \`${k}\``)
      );
    }

    lines.push(
      "",
      "## ধাপ ৬ — Deploy-এর পরে",
      "- HTTPS চালু আছে কিনা যাচাই করুন (বেশিরভাগ Platform Default-ভাবে দেয়)",
      "- Backend Log মনিটর করুন প্রথম কিছুদিন",
      "- CORS-এ Frontend-এর প্রকৃত Domain বসান (এখনো বসানো না থাকলে)"
    );

    return lines.join("\n") + "\n";
  }

  // ---------- File tree UI (same rendering approach as App Builder) ----------

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
    const empty = document.getElementById("jfDeployEmpty");
    const main = document.getElementById("jfDeployMain");

    if (!files) {
      empty.hidden = false;
      main.hidden = true;
      return;
    }
    empty.hidden = true;
    main.hidden = false;

    const genBtn = document.getElementById("jfGenDeployBtn");
    const notice = document.getElementById("jfDeployNotice");
    const result = document.getElementById("jfDeployResult");
    const downloadBtn = document.getElementById("jfDownloadDeployBtn");

    genBtn.addEventListener("click", () => {
      genBtn.disabled = true;
      genBtn.textContent = "⏳ তৈরি হচ্ছে...";
      try {
        const workingFiles = JSON.parse(JSON.stringify(files));
        const hasBackend = !!workingFiles["backend/server.js"];

        workingFiles["netlify.toml"] = buildNetlifyToml();

        if (hasBackend) {
          workingFiles["Dockerfile"] = buildDockerfile();
          workingFiles[".dockerignore"] = buildDockerignore();
          workingFiles["docker-compose.yml"] = buildDockerCompose(plan);
          const prodEnv = buildEnvProductionExample(workingFiles["backend/.env.example"]);
          if (prodEnv) workingFiles["backend/.env.production.example"] = prodEnv;
        }

        workingFiles["DEPLOY.md"] = buildDeployMd(plan, workingFiles);

        document.getElementById("jfDeployFileTree").innerHTML = renderFileTree(workingFiles);
        document.getElementById("jfDeployFrontendSummary").textContent =
          "netlify.toml যুক্ত করা হয়েছে — Netlify/Vercel/GitHub Pages, যেকোনো Static Host-এ frontend/ ফোল্ডার Deploy করা যাবে।";
        document.getElementById("jfDeployBackendSummary").textContent = hasBackend
          ? "Dockerfile, docker-compose.yml ও .env.production.example যুক্ত করা হয়েছে — Render/Railway/Fly.io-এর মতো Platform-এ ব্যবহার করা যাবে।"
          : "এই App-এর জন্য কোনো Backend নেই, তাই শুধু Frontend Hosting Config যুক্ত হয়েছে।";

        result.hidden = false;
        notice.hidden = true;

        window.__jfDeployFiles = workingFiles;
        try {
          localStorage.setItem("jf_deploy_files", JSON.stringify(workingFiles));
        } catch (e) {
          console.warn("APYVION: could not persist deploy files", e);
        }
      } catch (err) {
        console.error(err);
        notice.textContent = "Deploy Package তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
        notice.hidden = false;
      } finally {
        genBtn.disabled = false;
        genBtn.textContent = "🚀 Deploy Package তৈরি করুন";
      }
    });

    downloadBtn.addEventListener("click", () => {
      if (!window.__jfDeployFiles) return;
      downloadZip(window.__jfDeployFiles, `${slugify(appTitle(plan))}-deploy-package.zip`);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
