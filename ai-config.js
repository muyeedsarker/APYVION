// APYVION — AI Backend Config
// ============================
// এই ফাইলে কিছু না বসালে পুরো Factory আগের মতোই local Knowledge-Base দিয়ে
// (কোনো real AI backend ছাড়াই) কাজ করবে — কিছু ভাঙবে না।
//
// real AI (Idea→Plan→Design→Build সম্পূর্ণ স্বয়ংক্রিয়) চালু করতে:
//   1. functions/ai-backend ডিরেক্টরি Firebase-এ deploy করুন (সেখানকার README দেখুন)
//   2. deploy করার পর Firebase যে ৪টা URL দেখাবে, নিচে বসান
//   3. deploy সময় যে APYVION_CLIENT_KEY বসিয়েছিলেন, সেটা নিচে clientKey-তে বসান
//
// প্রতিটা endpoint আলাদা আলাদা ভাবে অন/অফ করা যায় — যেগুলো blank রাখবেন,
// সেগুলোর জন্য module স্বয়ংক্রিয়ভাবে local Knowledge-Base ব্যবহার করবে।

window.JORON_FACTORY_CONFIG = window.JORON_FACTORY_CONFIG || {};

// window.JORON_FACTORY_CONFIG.analyzeEndpoint = "https://REGION-PROJECT.cloudfunctions.net/analyzeIdea";
// window.JORON_FACTORY_CONFIG.planEndpoint    = "https://REGION-PROJECT.cloudfunctions.net/planProduct";
// window.JORON_FACTORY_CONFIG.designEndpoint  = "https://REGION-PROJECT.cloudfunctions.net/designUi";
// window.JORON_FACTORY_CONFIG.buildEndpoint   = "https://REGION-PROJECT.cloudfunctions.net/buildApp";
// window.JORON_FACTORY_CONFIG.clientKey       = "your-apyvion-client-key";

// এই wrapper প্রতিটা fetch-এ clientKey হেডার যোগ করে দেয়, যাতে উপরের ৪টা
// module-এর কোড নিজে থেকে পাল্টাতে না হয়।
(function () {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (url, options) {
    const cfg = window.JORON_FACTORY_CONFIG || {};
    const isOurEndpoint =
      typeof url === "string" &&
      [cfg.analyzeEndpoint, cfg.planEndpoint, cfg.designEndpoint, cfg.buildEndpoint].includes(url);
    if (isOurEndpoint && cfg.clientKey) {
      options = options || {};
      options.headers = Object.assign({}, options.headers, { "X-APYVION-Client-Key": cfg.clientKey });
    }
    return nativeFetch(url, options);
  };
})();
