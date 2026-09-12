// APYVION — AI Backend (real LLM hook for Idea Center / Product Planner /
// UI-UX Designer / App Builder).
//
// This is the server-side piece the frontend hooks (analyzeEndpoint,
// planEndpoint, designEndpoint, buildEndpoint — see assets/ai-config.js)
// are meant to call. It never ships an API key to the browser: the key
// lives here, as a Firebase secret, and is used only in this function.
//
// Deploy:
//   1. firebase functions:secrets:set ANTHROPIC_API_KEY
//      (paste your own Anthropic API key when prompted)
//   2. firebase functions:secrets:set APYVION_CLIENT_KEY
//      (any random string you choose — lightweight abuse protection so
//       random internet traffic can't burn your API credits)
//   3. firebase deploy --only functions:analyzeIdea,functions:planProduct,functions:designUi,functions:buildApp
//   4. In aifactory/assets/ai-config.js, set the four endpoint URLs Firebase
//      prints after deploy, and set clientKey to the same value as
//      APYVION_CLIENT_KEY above.
//
// Each handler below asks Claude for STRICT JSON matching the exact shape
// the corresponding frontend module already expects from its local
// (offline, knowledge-base) generator — so remote and local stay
// interchangeable and the frontend needs no changes beyond ai-config.js.

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const APYVION_CLIENT_KEY = defineSecret('APYVION_CLIENT_KEY');

const ANTHROPIC_MODEL = 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// ---------- shared helpers ----------

function checkClientKey(req, res) {
  const expected = APYVION_CLIENT_KEY.value();
  if (!expected) return true; // not configured => open (fine for local testing only)
  const got = req.headers['x-apyvion-client-key'];
  if (got !== expected) {
    res.status(401).json({ error: 'Missing or invalid X-APYVION-Client-Key header' });
    return false;
  }
  return true;
}

async function callClaudeJson(systemPrompt, userPrompt, maxTokens) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY.value(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens || 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text content in Anthropic response');
  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

const JSON_ONLY_RULE =
  'Respond with ONLY a single valid JSON object — no markdown fences, no preamble, no commentary before or after.';

// ---------- 1) Idea Center: analyze-idea ----------
// Frontend: assets/idea-center.js -> analyzeIdeaRemote()
// Must return an object with at least: appType (string).
// Full shape mirrors window.JORON_FACTORY_KB entries in assets/knowledge-base.js.

exports.analyzeIdea = onRequest(
  { secrets: [ANTHROPIC_API_KEY, APYVION_CLIENT_KEY], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    if (!checkClientKey(req, res)) return;
    const idea = (req.body || {}).idea;
    if (!idea || typeof idea !== 'string') return res.status(400).json({ error: 'Body must include { idea: string }' });

    try {
      const system = `তুমি APYVION App Factory-এর Idea Analyzer। ব্যবহারকারীর এক লাইনের App Idea পড়ে
নিচের ঠিক এই key-গুলো সহ একটা JSON object তৈরি করবে (কোনো key বাদ দেওয়া যাবে না):
appType (string), audience (string), problem (string), coreFeatures (string[], ৪-৮টা),
platform (string), userRoles (string[]), techStack (string), needsDatabase (boolean),
needsAuth (boolean), needsPayment (boolean), security (string[], ৩-৬টা), standoutFeatures (string[], ২-৪টা).
সব লেখা বাংলায়, বাস্তবসম্মত ও নির্দিষ্ট করে লিখবে — জেনেরিক কথা এড়িয়ে idea-টার সাথে সরাসরি প্রাসঙ্গিক হতে হবে।
${JSON_ONLY_RULE}`;
      const spec = await callClaudeJson(system, `App Idea: ${idea}`, 2000);
      spec.sourceIdea = idea;
      spec.matchedCategory = 'ai';
      return res.status(200).json(spec);
    } catch (err) {
      console.error('analyzeIdea failed', err);
      return res.status(502).json({ error: 'AI analysis failed', detail: String(err.message || err) });
    }
  }
);

// ---------- 2) Product Planner: plan-product ----------
// Frontend: assets/product-planner.js -> buildPlanRemote()
// Must return an object with at least: productDefinition (string).

exports.planProduct = onRequest(
  { secrets: [ANTHROPIC_API_KEY, APYVION_CLIENT_KEY], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    if (!checkClientKey(req, res)) return;
    const spec = (req.body || {}).spec;
    if (!spec || typeof spec !== 'object') return res.status(400).json({ error: 'Body must include { spec: object }' });

    try {
      const system = `তুমি APYVION App Factory-এর Product Planner। নিচের Idea Specification (JSON) নিয়ে
একটা পূর্ণ Product Plan তৈরি করবে, ঠিক এই key-গুলো সহ একটা JSON object হিসেবে:
productDefinition (string, ২-৩ বাক্য), personas (array of {role, goal, painPoint}, ২-৩টা),
featureMap ({core: string[], niceToHave: string[], future: string[]}),
userJourney (string[], ৪-৭ ধাপ), businessModel (string), mvpScope (string[]), futureScope (string[]),
technicalRequirements ({platform, techStack, needsDatabase, needsAuth, needsPayment, security: string[]}).
সব বাংলায়, এই নির্দিষ্ট Idea-র জন্য বাস্তবসম্মত ও প্রাসঙ্গিক হতে হবে।
${JSON_ONLY_RULE}`;
      const plan = await callClaudeJson(system, `Idea Specification:\n${JSON.stringify(spec, null, 2)}`, 3000);
      return res.status(200).json(plan);
    } catch (err) {
      console.error('planProduct failed', err);
      return res.status(502).json({ error: 'AI planning failed', detail: String(err.message || err) });
    }
  }
);

// ---------- 3) UI/UX Designer: design-ui ----------
// Frontend hook (add to assets/ui-ux-designer.js, mirroring the pattern used
// by idea-center.js / product-planner.js): window.JORON_FACTORY_CONFIG.designEndpoint
// Must return design tokens matching assets/design-kb.js shape.

exports.designUi = onRequest(
  { secrets: [ANTHROPIC_API_KEY, APYVION_CLIENT_KEY], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    if (!checkClientKey(req, res)) return;
    const plan = (req.body || {}).plan;
    if (!plan || typeof plan !== 'object') return res.status(400).json({ error: 'Body must include { plan: object }' });

    try {
      const system = `তুমি APYVION App Factory-এর UI/UX Designer। নিচের Product Plan (JSON) দেখে
একটা Design System JSON object তৈরি করবে, ঠিক এই key-গুলো সহ:
label (string, direction-এর নাম যেমন "Premium"/"Friendly"/"Minimal"),
primary, accent, bg, surface, text, textDim (সব valid hex color code, ভালো contrast সহ),
headingFont, bodyFont (real, web-safe বা Google Font নাম), radius (CSS value যেমন "12px"),
shadow (CSS box-shadow value)।
Product Plan-এর App Type ও Audience অনুযায়ী উপযুক্ত direction বেছে নাও।
${JSON_ONLY_RULE}`;
      const tokens = await callClaudeJson(system, `Product Plan:\n${JSON.stringify(plan, null, 2)}`, 1200);
      return res.status(200).json(tokens);
    } catch (err) {
      console.error('designUi failed', err);
      return res.status(502).json({ error: 'AI design failed', detail: String(err.message || err) });
    }
  }
);

// ---------- 4) App Builder: build-app ----------
// Frontend: assets/app-builder.js -> buildFilesRemote()
// Must return { files: { "path/to/file.ext": "full file contents", ... } }

exports.buildApp = onRequest(
  { secrets: [ANTHROPIC_API_KEY, APYVION_CLIENT_KEY], cors: true, timeoutSeconds: 300 },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    if (!checkClientKey(req, res)) return;
    const { plan, design } = req.body || {};
    if (!plan || typeof plan !== 'object') return res.status(400).json({ error: 'Body must include { plan: object }' });

    try {
      const system = `তুমি APYVION App Factory-এর App Builder। নিচের Product Plan ও Design System (JSON) দেখে
একটা সম্পূর্ণ, চালানোর-উপযোগী প্রাথমিক কোডবেস তৈরি করবে — plain HTML/CSS/JS (React/build-step ছাড়া),
এবং প্রয়োজন হলে (needsDatabase/needsAuth/needsPayment true থাকলে) একটা Node.js/Express backend স্ক্যাফোল্ডও।
রেসপন্স হবে ঠিক এই shape-এর একটা JSON object:
{ "files": { "index.html": "...সম্পূর্ণ ফাইল কন্টেন্ট...", "assets/style.css": "...", ... } }
প্রতিটা value সম্পূর্ণ, বৈধ, সরাসরি ফাইলে লিখে-চালানোর-উপযোগী কোড হতে হবে — কোনো "// ... rest of code" জাতীয় সংক্ষেপণ চলবে না।
Design System-এর color/font token গুলো CSS-এ ব্যবহার করবে। ৫-১৫টা ফাইলের মধ্যে রাখো (প্রয়োজন অনুযায়ী)।
${JSON_ONLY_RULE}`;
      const result = await callClaudeJson(
        system,
        `Product Plan:\n${JSON.stringify(plan, null, 2)}\n\nDesign System:\n${JSON.stringify(design || {}, null, 2)}`,
        8000
      );
      if (!result || typeof result.files !== 'object') throw new Error('Model did not return a files object');
      return res.status(200).json(result);
    } catch (err) {
      console.error('buildApp failed', err);
      return res.status(502).json({ error: 'AI build failed', detail: String(err.message || err) });
    }
  }
);
