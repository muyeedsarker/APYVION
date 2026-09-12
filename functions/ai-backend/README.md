# APYVION — AI Backend

এই ফোল্ডার Idea Center → Product Planner → UI/UX Designer → App Builder — এই পুরো
পাইপলাইনকে সত্যিকারের AI (Anthropic Claude API) দিয়ে চালানোর জন্য ৪টা Firebase
Cloud Function দেয়: `analyzeIdea`, `planProduct`, `designUi`, `buildApp`।

কোনো API key কখনো browser-এ (frontend কোডে) থাকে না — এখানে, server-side-এ,
Firebase Secret হিসেবে থাকে।

## Deploy করার ধাপ

```bash
cd functions/ai-backend
npm install

# নিজের Anthropic API key যোগ করুন (console.anthropic.com থেকে নেওয়া)
firebase functions:secrets:set ANTHROPIC_API_KEY

# একটা নিজের পছন্দমতো random string বসান (abuse-protection হিসেবে কাজ করবে)
firebase functions:secrets:set APYVION_CLIENT_KEY

# Deploy
firebase deploy --only functions:analyzeIdea,functions:planProduct,functions:designUi,functions:buildApp
```

Deploy শেষে টার্মিনালে ৪টা Function URL দেখাবে। সেগুলো কপি করে repo-র root-এ থাকা
`aifactory/ai-config.js` ফাইলে বসান (কমেন্ট আকারে উদাহরণ দেওয়া আছে), এবং
`clientKey`-তে উপরে যে `APYVION_CLIENT_KEY` বসিয়েছিলেন সেটাই বসান।

## এরপর কী হবে

- `ai-config.js`-এ endpoint URL বসানো থাকলে, সংশ্লিষ্ট module (Idea Center ইত্যাদি)
  স্বয়ংক্রিয়ভাবে local Knowledge-Base-এর বদলে এই real AI backend ব্যবহার করবে।
- কোনো endpoint blank/অকার্যকর থাকলে, সেই একটা module শুধু local Knowledge-Base-এ
  ফিরে যাবে — বাকি সবকিছু স্বাভাবিক থাকবে (silent fallback, কিছু ভাঙবে না)।
- **App Builder**-এর `buildApp` সবচেয়ে ভারী কল (পুরো কোডবেস generate করে), তাই
  timeout ৩০০ সেকেন্ড রাখা হয়েছে এবং টোকেন limit বেশি (৮০০০)।

## খরচ ও নিরাপত্তা সম্পর্কে সতর্কতা

- প্রতিটা কল আপনার নিজের Anthropic account থেকে billed হবে। `APYVION_CLIENT_KEY`
  ছাড়া endpoint public internet-এ খোলা থাকলে যে কেউ কল করে আপনার বিল বাড়াতে
  পারে — তাই client key সেট করা জরুরি।
- আরও কড়া নিরাপত্তা চাইলে Firebase App Check বা পূর্ণ Firebase Auth
  (`functions/cloudshelf/index.js`-এ যেমন `admin.auth().verifyIdToken()` ব্যবহার
  হয়েছে, একই প্যাটার্নে) যোগ করা যায়।
- `buildApp`-এর আউটপুট (generated কোড) production-এ ব্যবহারের আগে review/test করে
  নেওয়া উচিত — কোনো AI output ১০০% নির্ভুল/নিরাপদ, এই গ্যারান্টি কেউ দিতে পারে না;
  তাই `test-repair.html` (Audit & Upgrade) দিয়ে generate করা কোড আবার scan করে
  নেওয়ার পরামর্শ থাকলো।
