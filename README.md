# APYVION — Idea Center (Module 01)

**Creator:** Md. Abdul Muyeed Sarker

Master Structure-এর Section 01 অনুযায়ী তৈরি প্রথম Module।

## এই Module কী করে
- একটা মাত্র বড় ইনপুট বক্স: **"What do you want to build?"**
- ব্যবহারকারী এক লাইনে Idea লিখলে Factory বুঝে ফেলে:
  - App Type
  - Target Audience
  - Core Problem
  - Core Features
  - Platform সুপারিশ (Web/PWA/Mobile)
  - সম্ভাব্য User Roles
  - প্রয়োজনীয় Technology / Tech Stack
  - Database প্রয়োজন কিনা
  - Authentication প্রয়োজন কিনা
  - Payment প্রয়োজন কিনা
  - Security Requirement
  - দর্শকের জন্য আকর্ষণীয় (Standout) Feature

## কীভাবে কাজ করে
1. `assets/knowledge-base.js` — পরিচিত App Category-র (Matrimony, Restaurant, E-commerce,
   Booking, Education, Generic fallback) জন্য একটা ডিফল্ট বিশ্লেষণ টেমপ্লেট।
2. `assets/idea-center.js` — Idea-র keyword মিলিয়ে সবচেয়ে কাছের Category বের করে,
   সেটা থেকে একটা পূর্ণ Product Specification তৈরি করে এবং স্ক্রিনে দেখায়।
3. যদি সত্যিকারের AI Backend থাকে (কোনো LLM API নিজের সার্ভারে), সেটা
   `window.JORON_FACTORY_CONFIG.analyzeEndpoint` সেট করে হুক করা যাবে —
   বিস্তারিত নির্দেশনা `idea-center.js`-এর উপরের কমেন্টে আছে।

## কেন এই ডিজাইন
- এখনো কোনো Backend AI সংযুক্ত নেই, তাই এই Module সততার সাথে বলে দেয় এটা
  Knowledge-Base থেকে বিশ্লেষণ করছে (ফলাফলের উপরে "উৎস" লেখা থাকে)।
- Backend যুক্ত হলে কোড পরিবর্তন না করেই সত্যিকারের AI বিশ্লেষণে সুইচ হয়ে যাবে —
  শুধু `analyzeEndpoint` কনফিগার করলেই চলবে।
- কোনো অপ্রয়োজনীয় Button/Page/Popup রাখা হয়নি (Master Structure-এর ডিজাইন নিয়ম অনুযায়ী)।

---

# Module 02 — AI Product Planner

Master Structure-এর Section 02 অনুযায়ী তৈরি দ্বিতীয় Module।

## এই Module কী করে
Idea Center (Module 01)-এ যে Idea Specification সংরক্ষিত হয়, সেটা নিয়ে
`product-planner.html` একটা পূর্ণ Product Plan তৈরি করে:
- **Product Definition** — এক অনুচ্ছেদে App-টা কী এবং কেন
- **User Personas** — প্রতিটা মূল User Type-এর Goal ও Pain Point
- **User Roles**
- **Core Problem → Audience**
- **Feature Map** — MVP/Core, Nice-to-Have, Future — তিন ভাগে ভাগ করা
- **User Journey** — ধাপে ধাপে ব্যবহারকারীর অভিজ্ঞতা
- **Business Model**
- **Technical Requirements** — Platform, Tech Stack, DB/Auth/Payment, Security
- **MVP Scope** ও **Future Scope**

## কীভাবে যুক্ত (Idea Center → Product Planner)
Idea Center-এ "➡️ AI Product Planner-এ পাঠান" বাটনে ক্লিক করলে সেই Idea Spec
`localStorage`-এ (`jf_idea_spec`) সংরক্ষিত হয়ে `product-planner.html`-এ নিয়ে যায়।
Idea Spec না থাকলে Planner পেজ স্পষ্টভাবে জানিয়ে দেয় ও Idea Center-এ ফিরে যাওয়ার
বাটন দেখায় — কোনো ভুল/অসম্পূর্ণ তথ্য দেখায় না।

একই প্যাটার্নে সত্যিকারের AI Backend হুক করা যাবে
(`window.JORON_FACTORY_CONFIG.planEndpoint`) — নির্দেশনা `product-planner.js`-এর
উপরে আছে।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01 ও 02 বাস্তবায়ন।
এই ZIP-এ আগে যে `SINDHUK-Android` (personal file vault) কোড ছিল, সেটা
Scope Drift হিসেবে চিহ্নিত হয়েছে এবং এই Module-গুলোর সাথে যুক্ত করা হয়নি।

## এরপর কী (Master Structure পাইপলাইন অনুযায়ী)
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer *(এই Module)*
- ⬜ 04 — App Builder
- ... (বাকি Module পরবর্তী ধাপে)

## চালানোর উপায়
`index.html` ফাইলটা কোনো ব্রাউজারে সরাসরি খুলুন (Idea Center থেকে শুরু হয়),
বা একটা static file server-এ হোস্ট করুন। কোনো Build Step/npm install প্রয়োজন নেই —
এটা plain HTML/CSS/JS। শুধু `product-planner.html` বা `ui-ux-designer.html` সরাসরি
খুললে (আগের ধাপ সম্পন্ন না করে) খালি অবস্থা দেখাবে, ভাঙবে না।

---

# Module 03 — AI UI/UX Designer

Master Structure-এর Section 03 অনুযায়ী তৈরি তৃতীয় Module।

## এই Module কী করে
AI Product Planner (Module 02)-এর সংরক্ষিত Plan নিয়ে `ui-ux-designer.html`:
- **Premium Design Generator** — Professional / Premium / Minimal / Modern / Corporate / Luxury / Friendly — এই ৭টা Direction থেকে একটা বেছে নেওয়া যায় (App Category অনুযায়ী একটা বুদ্ধিমান Default আগে থেকেই নির্বাচিত থাকে — যেমন Matrimony → Premium, Restaurant → Friendly)
- প্রতিটা Direction-এর জন্য: **Color System** (Primary/Accent/Background/Surface swatch), **Typography** (Heading/Body font preview), **Layout ও Navigation** সুপারিশ
- একটা **লাইভ প্রিভিউ** — Homepage, Dashboard Cards, Form, User Roles, Table, এবং Empty/Loading/Error State — যা নির্বাচিত Direction ও Product Plan-এর ডেটা (Feature list, Roles) দিয়ে সাথে সাথে রেন্ডার হয়
- **Accessibility চেকলিস্ট** (Contrast, Touch target, Label, Keyboard navigation)

## গুরুত্বপূর্ণ নিয়ম মানা হয়েছে
Constitution-এ স্পষ্ট লেখা ছিল — "অপ্রয়োজনীয় Button, Toggle, Popup বা Page তৈরি করা যাবে না।"
তাই এই Module-এ ব্যবহারকারীর জন্য মাত্র **একটাই control**: Design Direction চিপ।
বাকি সবকিছু (Color/Typography/Layout/Preview) স্বয়ংক্রিয়ভাবে তৈরি হয়।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01, 02 ও 03 বাস্তবায়ন।

## এরপর কী
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer
- ✅ 04 — App Builder *(এই Module)*
- ⬜ 05 — Test & Repair *(পরবর্তী ধাপ)*

---

# Module 04 — App Builder

Master Structure-এর Section 04 অনুযায়ী তৈরি চতুর্থ Module।

## এই Module কী করে
AI UI/UX Designer (Module 03)-এর সংরক্ষিত Plan ও Design System নিয়ে `app-builder.html`:
- **আসল Frontend কোড** তৈরি করে — `index.html`, `pages/dashboard.html`,
  প্রয়োজনে `pages/login.html`, এবং Design System-এর Color/Font/Radius টোকেন
  ব্যবহার করে একটা `assets/style.css` ও একটা ছোট `assets/app.js`।
- **Backend/Database Scaffold** তৈরি করে — কিন্তু *শুধু* Product Plan-এ
  Database/Auth/Payment প্রয়োজন বলে চিহ্নিত থাকলে। এতে থাকে একটা Express
  `server.js`, প্রতিটা Entity-র জন্য একটা Route Stub (`backend/routes/`),
  একটা `database/schema.sql`, `.env.example`, ও একটা ব্যাখ্যামূলক README —
  যেটা স্পষ্ট করে বলে এটা একটা শুরুর Scaffold, Production-ready কোড না।
- App Category (Matrimony/Restaurant/E-commerce/Booking/Education/Generic)
  অনুযায়ী `assets/app-builder-kb.js`-এ রাখা একটা যুক্তিসঙ্গত Database Entity সেট
  ব্যবহার করে (যেমন Matrimony → profiles/matches/messages)।
- সবকিছু একটা **File Tree**-তে দেখায় এবং একটা বাটনে ক্লিক করলে পুরো কোড
  একটা ZIP ফাইল হিসেবে ডাউনলোড করা যায় (ব্রাউজারে JSZip ব্যবহার করে, কোনো
  Build Step ছাড়াই)।

## গুরুত্বপূর্ণ নিয়ম মানা হয়েছে
এখানেও শুধু দুইটা Control আছে: **"App Code তৈরি করুন"** (মূল Action) এবং
ফলাফল তৈরি হওয়ার পরে **"ZIP ডাউনলোড করুন"** — কোনো অতিরিক্ত Toggle/Popup নেই।

## কীভাবে যুক্ত (UI/UX Designer → App Builder)
UI/UX Designer-এ "➡️ App Builder-এ পাঠান" বাটনে ক্লিক করলে Design System
`localStorage`-এ (`jf_design_system`) সংরক্ষিত হয়ে `app-builder.html`-এ নিয়ে যায়।
Product Plan না থাকলে App Builder পেজ স্পষ্টভাবে জানিয়ে দেয় ও শুরু থেকে যাওয়ার
বাটন দেখায়।

একই প্যাটার্নে সত্যিকারের AI Backend হুক করা যাবে
(`window.JORON_FACTORY_CONFIG.buildEndpoint`) — নির্দেশনা `app-builder.js`-এর
উপরে আছে।

## সততার সীমা (Honesty Boundary)
Backend Scaffold-এ প্রকৃত Database সংযোগ, Authentication Middleware, বা
Security Hardening নেই — শুধু কাঠামো (Route/Schema) আছে, যাতে ব্যবহারকারী
বিভ্রান্ত না হন যে এটা এখনই Deploy-যোগ্য। এই কাজগুলো পরবর্তী Module
(🧪 Test & Repair, 🔒 Secure)-এ হবে।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01, 02, 03 ও 04 বাস্তবায়ন।

## এরপর কী
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer
- ✅ 04 — App Builder
- ✅ 05 — Test & Repair *(এই Module)*
- ⬜ 06 — Secure *(পরবর্তী ধাপ)*

---

# Module 05 — Test & Repair

Master Structure-এর Section 05 অনুযায়ী তৈরি পঞ্চম Module।

## এই Module কী করে
App Builder (Module 04)-এর তৈরি করা ফাইলগুলো নিয়ে `test-repair.html`
কিছু **Static Check** চালায় (প্রকৃত Browser/Server-এ App চালিয়ে না, শুধু
ফাইলের গঠন বিশ্লেষণ করে):

1. **HTML Meta Tag চেক** — প্রতিটা `.html` ফাইলে `<!doctype html>`,
   viewport meta, ও `<html lang="...">` আছে কিনা। অনুপস্থিত থাকলে
   **স্বয়ংক্রিয়ভাবে মেরামত** করে।
2. **Local Link/Script/Style চেক** — প্রতিটা `href`/`src` রেফারেন্স
   সংশ্লিষ্ট ফাইল-ম্যাপে বাস্তবেই আছে কিনা (Relative Path Resolve করে)।
   ভাঙা রেফারেন্স পাওয়া গেলে ⚠️ হিসেবে চিহ্নিত করে — এটা নিজে থেকে অনুমান
   করে মেরামত করে না, কারণ ভুল অনুমান আরও বিভ্রান্তি তৈরি করতে পারে।
3. **Backend Route Wiring চেক** — `backend/routes/`-এর প্রতিটা ফাইল
   `backend/server.js`-এ মাউন্ট করা আছে কিনা; না থাকলে যুক্ত করে দেয়।
4. **Environment Variable ব্যবহার চেক** — `.env.example` থাকলে
   `server.js`-এ `dotenv` লোড করা হচ্ছে কিনা।

ফলাফল ✅ Passed / 🔧 Repaired / ⚠️ Manual attention — তিন ভাগে দেখানো হয়,
এবং মেরামত করা কোড আলাদাভাবে ZIP ডাউনলোড করা যায়।

## কীভাবে যুক্ত (App Builder → Test & Repair)
App Builder-এ "➡️ Test & Repair-এ পাঠান" বাটনে ক্লিক করলে তৈরি করা সব ফাইল
`localStorage`-এ (`jf_built_files`) সংরক্ষিত হয়ে `test-repair.html`-এ নিয়ে যায়।

## সততার সীমা (Honesty Boundary)
এই Module কোনো Real Browser Rendering, JavaScript Execution, বা Backend
API কল টেস্ট করে না — শুধু Static ফাইল বিশ্লেষণ। তাই এটা "App নিখুঁতভাবে
কাজ করবে" এই নিশ্চয়তা দেয় না, বরং সহজে ধরা পড়ে এমন কাঠামোগত সমস্যা আগেই
চিহ্নিত ও মেরামত করে।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01–05 বাস্তবায়ন।

## এরপর কী
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer
- ✅ 04 — App Builder
- ✅ 05 — Test & Repair
- ✅ 06 — Secure *(এই Module)*
- ⬜ 07 — Deploy *(পরবর্তী ধাপ)*

---

# Module 06 — Secure

Master Structure-এর Section 06 অনুযায়ী তৈরি ষষ্ঠ Module।

## এই Module কী করে
Test & Repair (Module 05)-এর ফলাফল নিয়ে `secure.html` কিছু **Static Security
Check** চালায়:

1. **Hardcoded Secret/Key স্ক্যান** — AWS Key, Stripe Live Key, বা সরাসরি
   লেখা Password Value-এর মতো প্যাটার্ন খোঁজে।
2. **CORS কনফিগারেশন চেক** — `cors()` কোনো origin সীমাবদ্ধতা ছাড়া খোলা
   আছে কিনা (নিজে থেকে origin অনুমান করে ঠিক করে না, শুধু সতর্ক করে)।
3. **Security Header (Helmet) চেক** — না থাকলে **স্বয়ংক্রিয়ভাবে** `helmet`
   যুক্ত করে (`server.js` ও `package.json` দুই জায়গাতেই)।
4. **Password Storage চেক** — Database Schema-তে `password_hash`
   ব্যবহার হচ্ছে কিনা, নাকি ভুলবশত Plain-text `password` কলাম আছে।

শেষে একটা **`SECURITY.md`** Checklist তৈরি হয় (Plan-এর Auth/Payment/Database
প্রয়োজনীয়তা অনুযায়ী কাস্টমাইজড), যা ZIP-এর মধ্যে যুক্ত থাকে।

## কীভাবে যুক্ত (Test & Repair → Secure)
Test & Repair-এ "➡️ Secure-এ পাঠান" বাটনে ক্লিক করলে মেরামত করা ফাইল
`localStorage`-এ (`jf_repaired_files`) সংরক্ষিত হয়ে `secure.html`-এ নিয়ে যায়।

## সততার সীমা (Honesty Boundary)
এটা কোনো Penetration Test বা প্রকৃত Vulnerability Scanner না — শুধু কিছু
সাধারণ, সহজে-ধরা-পড়া প্যাটার্ন চেক করে। Production-এ যাওয়ার আগে একজন মানুষ
Security Reviewer-এর যাচাই এখনো প্রয়োজন — এই কথাটা `SECURITY.md`-তেও স্পষ্ট
লেখা থাকে।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01–06 বাস্তবায়ন।

## এরপর কী
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer
- ✅ 04 — App Builder
- ✅ 05 — Test & Repair
- ✅ 06 — Secure
- ✅ 07 — Deploy *(এই Module)*
- 🌐 Live — এটা আর কোনো "Module" না; ব্যবহারকারী নিজে Hosting Platform-এ Deploy করলে অ্যাপ Live হয়

---

# Module 07 — Deploy

Master Structure-এর Section 07 অনুযায়ী তৈরি সপ্তম Module।

## এই Module কী করে
Secure (Module 06)-এর ফলাফল নিয়ে `deploy.html`:
- **`netlify.toml`** যুক্ত করে — যেকোনো Static Host-এ `frontend/` ফোল্ডার Deploy করার জন্য।
- Backend থাকলে **`Dockerfile`**, **`.dockerignore`**, **`docker-compose.yml`**
  (Database প্রয়োজন হলে একটা Postgres Service সহ), ও একটা
  **`backend/.env.production.example`** যুক্ত করে।
- Plan অনুযায়ী কাস্টমাইজড একটা ধাপে-ধাপে **`DEPLOY.md`** গাইড তৈরি করে —
  Frontend Hosting (Netlify/Vercel/GitHub Pages), Backend Hosting
  (Render/Railway/Fly.io), Managed Database (Supabase/Neon/Railway),
  প্রয়োজনীয় Environment Variable, ও Deploy-পরবর্তী চেকলিস্ট।

## কীভাবে যুক্ত (Secure → Deploy)
Secure-এ "➡️ Deploy-এ পাঠান" বাটনে ক্লিক করলে Secured ফাইল
`localStorage`-এ (`jf_secured_files`) সংরক্ষিত হয়ে `deploy.html`-এ নিয়ে যায়।

## সততার সীমা (Honesty Boundary)
এই Module কোনো Hosting/Cloud Provider-এর সাথে সরাসরি সংযুক্ত না এবং কোনো
Credential/API দিয়ে প্রকৃত Deploy করে না — শুধু প্রয়োজনীয় Config ফাইল ও
নির্দেশনা তৈরি করে দেয়। প্রকৃত Deploy ব্যবহারকারীকে নিজের পছন্দের Platform-এ
নিজে সম্পন্ন করতে হবে; সেই কারণেই পাইপলাইনের শেষ ধাপ "🌐 Live" কে একটা পৃথক
Module হিসেবে তৈরি করা হয়নি — ওটা এই Factory-র বাইরে ঘটে।

## Scope Status
🟢 **IN SCOPE** — সরাসরি Section 01–07 বাস্তবায়ন। Master Structure পাইপলাইনের
সবগুলো Buildable Module এখন সম্পন্ন।

## চূড়ান্ত অবস্থা
- ✅ 01 — Idea Center
- ✅ 02 — AI Product Planner
- ✅ 03 — AI UI/UX Designer
- ✅ 04 — App Builder
- ✅ 05 — Test & Repair
- ✅ 06 — Secure
- ✅ 07 — Deploy *(এই Module)*
- 🌐 Live — ব্যবহারকারীর নিজের Hosting Platform-এ (Factory-র বাইরে)

## Firebase Integration-Ready
এই package-এ `firebase-config.js`, `assets/firebase-client.js`, `firebase.json`, `firestore.rules`, `storage.rules`, এবং `FIREBASE-SETUP.md` যোগ করা হয়েছে। Web App config বসানোর পর Firebase Auth/Firestore/Storage integration-এর ভিত্তি প্রস্তুত থাকবে।

## Cloudshelf integration
A Firebase-safe Cloudshelf integration scaffold is included under `integrations/cloudshelf/` and `functions/cloudshelf/`. See `CLOUDSHELF-SETUP.md`.


## Section 09 — Secure Vault

`vault.html` adds an owner-scoped Secure Vault to APYVION. It includes 18 categories, multi-file upload, image/video/audio/PDF preview, download, rename, favorite flag, search, sorting, Recently Deleted, restore and permanent delete. File bytes are stored in Firebase Storage under `users/<uid>/vault/...`; metadata is stored in `vaultItems` with UID-based Firestore rules. Firebase Auth and the real Web App config are required for production use.
