# APYVION — GitHub + Firebase Go-Live Checklist

এই ফাইলটা একদম শুরু থেকে শেষ পর্যন্ত, ক্রম অনুযায়ী অনুসরণ করুন। প্রতিটা ধাপের
বিস্তারিত ব্যাখ্যা অন্য যে ফাইলে আছে তার নাম পাশে দেওয়া আছে — এটা শুধু সঠিক
ক্রম ও একটা মাস্টার চেকলিস্ট।

---

## ধাপ ১ — GitHub-এ কোড আপলোড করুন

```bash
git init
git add .
git commit -m "APYVION — initial commit"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/apyvion.git
git push -u origin main
```

আগে থেকেই রিপোতে `.github/workflows/firebase-hosting.yml` আছে — GitHub-এ push করলে
এটা `main` ব্রাঞ্চে প্রতিবার automatic deploy চেষ্টা করবে (নিচের ধাপ ৪-এর secret
বসানোর আগ পর্যন্ত এটা fail হবে, সেটা স্বাভাবিক — এখনো চিন্তার কিছু নেই)।

## ধাপ ২ — Firebase প্রজেক্ট তৈরি করুন

1. https://console.firebase.google.com → **Add project** → নাম দিন (যেমন `apyvion`)
2. প্রজেক্টের ভেতরে **Add app → Web (</>) ** সিলেক্ট করে একটা Web App রেজিস্টার করুন
3. যে `firebaseConfig` অবজেক্ট দেখাবে সেটা কপি রাখুন — ধাপ ৩-এ লাগবে
4. `.firebaserc` ফাইলে `"default": "apyvion"` জায়গায় আপনার আসল Project ID বসান

## ধাপ ৩ — Web App Config বসান (Vault/Auth চালু করতে)

- `aifactory/firebase-config.js` খুলে সব `YOUR_...` জায়গায় ধাপ ২-এর config বসান
- Firebase Console → **Authentication → Sign-in method → Email/Password → Enable**

বিস্তারিত: `aifactory/FIREBASE-SETUP.md`

## ধাপ ৪ — CLI দিয়ে প্রথমবার ম্যানুয়ালি Deploy করুন

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # ধাপ ২-এর প্রজেক্ট বেছে নিন
firebase deploy --only hosting,firestore,storage
```

এরপর Firebase-এর দেওয়া `web.app` লিংকে সাইট লাইভ দেখতে পাবেন।

বিস্তারিত: `FIREBASE-HOSTING-DEPLOY.md`

## ধাপ ৫ — GitHub Actions দিয়ে ভবিষ্যতে auto-deploy চালু করুন (ঐচ্ছিক)

GitHub repo → **Settings → Secrets and variables → Actions** → নিচের ২টা secret যোগ করুন:

- `FIREBASE_PROJECT_ID` — ধাপ ২-এর Project ID
- `FIREBASE_TOKEN` — টার্মিনালে `firebase login:ci` চালিয়ে যে টোকেন পাবেন সেটা

এরপর থেকে `main` ব্রাঞ্চে push করলেই স্বয়ংক্রিয়ভাবে deploy হবে
(`.github/workflows/firebase-hosting.yml`)।

## ধাপ ৬ — আসল AI Backend (ঐচ্ছিক)

না করলেও অ্যাপ স্বাভাবিকভাবে local knowledge-base দিয়ে কাজ করবে — এটা শুধু
Idea→Plan→Design→Build ধাপগুলো real LLM (Claude) দিয়ে করাতে চাইলে দরকার।

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set APYVION_CLIENT_KEY
firebase deploy --only functions:analyzeIdea,functions:planProduct,functions:designUi,functions:buildApp
```

Deploy শেষে টার্মিনালে যে ৪টা Function URL দেখাবে, সেগুলো ও `APYVION_CLIENT_KEY`-এর
মান `aifactory/ai-config.js`-এ কমেন্ট খুলে বসান।

বিস্তারিত: `aifactory/functions/ai-backend/README.md`

## ধাপ ৭ — Cloudshelf (ঐচ্ছিক)

```bash
firebase functions:secrets:set CLOUDSHELF_API_KEY
firebase deploy --only functions:cloudshelf
```

`CLOUDSHELF_API_URL` এনভায়রনমেন্ট ভ্যারিয়েবল ও প্রতিটা action-এর GraphQL query
আপনার Cloudshelf অ্যাকাউন্ট অনুযায়ী বসাতে হবে।

বিস্তারিত: `aifactory/CLOUDSHELF-SETUP.md`

---

## চূড়ান্ত চেকলিস্ট

- [ ] GitHub repo-তে push হয়েছে
- [ ] Firebase প্রজেক্ট তৈরি ও `.firebaserc`-এ বসানো হয়েছে
- [ ] `firebase-config.js`-এ আসল Web App config বসানো হয়েছে
- [ ] Email/Password Authentication চালু করা হয়েছে
- [ ] `firebase deploy --only hosting,firestore,storage` সফল হয়েছে
- [ ] (ঐচ্ছিক) GitHub Actions secret বসিয়ে auto-deploy চালু করা হয়েছে
- [ ] (ঐচ্ছিক) AI backend deploy ও `ai-config.js` আপডেট করা হয়েছে
- [ ] (ঐচ্ছিক) Cloudshelf deploy ও config বসানো হয়েছে

উপরের বাধ্যতামূলক (non-optional) ধাপগুলো শেষ হলেই APYVION সম্পূর্ণভাবে লাইভ,
এবং Vault/Auth-সহ ১০০% কার্যকর।
