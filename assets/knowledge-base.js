// APYVION — Knowledge Base
// এই ফাইলটা প্রতিটি পরিচিত App Category-র জন্য একটা ডিফল্ট বিশ্লেষণ + Product Plan টেমপ্লেট রাখে।
// Idea Center (Module 01) keyword match করে সবচেয়ে কাছের Category বের করে idea বিশ্লেষণ করে,
// এবং AI Product Planner (Module 02) সেই একই Category থেকে পূর্ণ Product Plan
// (Persona, Feature Map, User Journey, Business Model, MVP/Future Scope) তৈরি করে।
//
// একটা সত্যিকারের Production সিস্টেমে এই ফাইলের জায়গায় একটা real LLM call
// (server-side, নিজের API key দিয়ে) বসবে — hook পয়েন্ট idea-center.js ও
// product-planner.js-এর analyze*Remote() ফাংশনে রাখা হয়েছে। এই Knowledge Base
// সেই backend না থাকা অবস্থায় দুটো Module-কেই সত্যিকারের কাজ-করা (offline/demo-able) রাখে।

window.JORON_FACTORY_KB = [
  {
    id: "matrimony",
    keywords: ["matrimony", "marriage", "বিয়ে", "ম্যাট্রিমনি", "পাত্র", "পাত্রী", "জীবনসঙ্গী", "matchmaking", "shaadi"],
    appType: "Matrimony / Matchmaking Platform",
    audience: "বিয়ের জন্য উপযুক্ত জীবনসঙ্গী খুঁজছেন এমন প্রাপ্তবয়স্ক ব্যবহারকারী এবং তাদের পরিবার",
    problem: "নিরাপদ, যাচাইকৃত এবং পছন্দ-ভিত্তিক জীবনসঙ্গী খোঁজার একটা কেন্দ্রীভূত জায়গার অভাব",
    coreFeatures: ["Biodata তৈরি ও সম্পাদনা", "প্রোফাইল সার্চ ও ফিল্টার", "Interest/Match সিস্টেম", "Mutual match হলে Chat", "Membership/Premium প্ল্যান", "Verification/Report/Block"],
    platform: "Web + PWA (পরে Native Mobile)",
    userRoles: ["সাধারণ ব্যবহারকারী (Member)", "Admin/Moderator"],
    techStack: "Firebase (Auth + Firestore + Storage) অথবা Node.js + PostgreSQL backend, React/vanilla JS frontend",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: true,
    security: ["Firestore/DB rules দিয়ে owner-scoped ডেটা", "Sensitive তথ্য (ফোন/ইমেইল) শুধু mutual match-এর পরে দেখানো", "Report/Block সিস্টেম", "Payment client-side trust না করা — server-side verify"],
    standoutFeatures: ["Smart Compatibility Score", "Verified Badge", "Privacy-controlled visibility"],
    personas: [
      { role: "বিয়ের জন্য আগ্রহী তরুণ/তরুণী (২৫-৩৫)", goal: "নিজের পছন্দ অনুযায়ী যাচাইকৃত জীবনসঙ্গী খুঁজে পাওয়া", painPoint: "ভুয়া প্রোফাইল ও অনাগ্রহী match-এ সময় নষ্ট হওয়ার ভয়" },
      { role: "অভিভাবক/পরিবারের সদস্য", goal: "সন্তানের জন্য নিরাপদ ও পরিবার-অনুমোদিত জায়গায় খোঁজা", painPoint: "প্ল্যাটফর্মের নিরাপত্তা ও গোপনীয়তা নিয়ে অনিশ্চয়তা" },
      { role: "Admin/Moderator", goal: "ভুয়া প্রোফাইল ও অপব্যবহার দ্রুত চিহ্নিত করা", painPoint: "Report হওয়া কনটেন্ট review করার জন্য দক্ষ টুলের অভাব" }
    ],
    featureMap: {
      core: ["Signup/Login", "Biodata তৈরি", "প্রোফাইল সার্চ/ফিল্টার", "Interest পাঠানো/গ্রহণ", "Mutual match Chat"],
      niceToHave: ["Membership/Premium প্ল্যান", "Verification Badge", "Report/Block"],
      future: ["Smart Compatibility Score (AI)", "Video Introduction", "Astrology Matching", "Voice/Video Chat"]
    },
    userJourney: [
      "ব্যবহারকারী Signup করে অ্যাকাউন্ট তৈরি করে",
      "Biodata পূরণ করে (ব্যক্তিগত, পারিবারিক, শিক্ষা, পেশা তথ্য)",
      "প্রোফাইল Public হওয়ার পর অন্যদের Search/Match-এ দেখা যায়",
      "ব্যবহারকারী অন্যদের প্রোফাইল ব্রাউজ করে Interest পাঠায়",
      "Interest গ্রহণ হলে (Mutual) দুজনেই Chat করতে পারে",
      "সম্পর্ক এগোলে Membership আপগ্রেড করে বাড়তি সুবিধা নেয়"
    ],
    businessModel: "Freemium — বেসিক Signup/Browse ফ্রি, কিন্তু Contact Info/Advanced Search/Unlimited Interest-এর জন্য মাসিক Membership Fee (Basic/Standard/Premium Tier)।",
    mvpScope: ["Signup/Login", "Biodata তৈরি ও সম্পাদনা", "Public Profile + Basic Search", "Interest/Mutual Match", "Basic Chat"],
    futureScope: ["AI Compatibility Score", "Video Profile", "Payment Gateway দিয়ে Membership", "Admin Verification Panel", "Mobile Native App"]
  },
  {
    id: "restaurant",
    keywords: ["restaurant", "রেস্তোরা", "রেস্টুরেন্ট", "food", "খাবার", "menu", "মেনু", "টেবিল বুকিং", "table booking"],
    appType: "Restaurant Management System",
    audience: "রেস্টুরেন্ট মালিক/স্টাফ (অর্ডার ও টেবিল পরিচালনার জন্য) এবং গ্রাহক (অর্ডার/বুকিং-এর জন্য)",
    problem: "অর্ডার, টেবিল, মেনু ও ইনভেন্টরি ম্যানুয়ালি পরিচালনা করতে গিয়ে ভুল ও সময় নষ্ট হওয়া",
    coreFeatures: ["ডিজিটাল মেনু ও ক্যাটাগরি", "টেবিল বুকিং/রিজার্ভেশন", "অর্ডার ম্যানেজমেন্ট (Kitchen Display)", "বিলিং/ইনভয়েস", "ইনভেন্টরি ট্র্যাকিং", "স্টাফ রোল-ভিত্তিক অ্যাক্সেস"],
    platform: "Web Dashboard (Staff) + Mobile-friendly Web (গ্রাহক)",
    userRoles: ["মালিক/Manager", "Staff/Waiter", "Kitchen Staff", "গ্রাহক"],
    techStack: "React/Next.js frontend, Node.js/Express backend, PostgreSQL/MySQL",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: true,
    security: ["Role-based access control (Staff vs Manager)", "Payment gateway-এর PCI-compliant integration", "Order data-এর audit log"],
    standoutFeatures: ["Real-time Kitchen Display System", "Sales Analytics Dashboard", "QR কোড দিয়ে টেবিল অর্ডার"],
    personas: [
      { role: "রেস্টুরেন্ট মালিক", goal: "বিক্রি ও খরচ এক জায়গায় দেখা, ভুল অর্ডার কমানো", painPoint: "কাগজে-কলমে হিসাব রাখতে গিয়ে ভুল ও সময় নষ্ট" },
      { role: "Waiter/Staff", goal: "দ্রুত অর্ডার নিয়ে Kitchen-এ পাঠানো", painPoint: "ব্যস্ত সময়ে একাধিক টেবিলের অর্ডার গুলিয়ে যাওয়া" },
      { role: "গ্রাহক", goal: "সহজে মেনু দেখে অর্ডার/বুকিং করা", painPoint: "টেবিল খালি আছে কিনা না জেনে গিয়ে অপেক্ষা করা" }
    ],
    featureMap: {
      core: ["ডিজিটাল মেনু", "টেবিল বুকিং", "অর্ডার এন্ট্রি", "বিলিং"],
      niceToHave: ["Kitchen Display System", "ইনভেন্টরি ট্র্যাকিং", "স্টাফ রোল ম্যানেজমেন্ট"],
      future: ["QR কোড Self-order", "Sales Analytics Dashboard", "Loyalty/Reward Program"]
    },
    userJourney: [
      "Manager মেনু ও টেবিল সেটআপ করে সিস্টেমে",
      "গ্রাহক এসে টেবিল বুক করে বা বসে",
      "Waiter অর্ডার এন্ট্রি করে, Kitchen Display-এ সাথে সাথে পাঠায়",
      "Kitchen Staff অর্ডার তৈরি করে Ready মার্ক করে",
      "Waiter খাবার সার্ভ করে, বিল তৈরি হয়",
      "গ্রাহক পেমেন্ট করে, Manager দিনশেষে Sales রিপোর্ট দেখে"
    ],
    businessModel: "One-time Setup Fee + মাসিক SaaS Subscription (রেস্টুরেন্টের সংখ্যা/টেবিল সংখ্যা অনুযায়ী Tier)।",
    mvpScope: ["ডিজিটাল মেনু", "অর্ডার এন্ট্রি ও বিলিং", "টেবিল বুকিং", "বেসিক Staff Login"],
    futureScope: ["Kitchen Display System", "Inventory ও Sales Analytics", "QR Self-order", "Multi-branch সাপোর্ট"]
  },
  {
    id: "ecommerce",
    keywords: ["ecommerce", "e-commerce", "shop", "shopping", "দোকান", "স্টোর", "store", "মার্কেটপ্লেস", "marketplace", "অনলাইন শপ"],
    appType: "E-commerce Store",
    audience: "অনলাইনে পণ্য কিনতে চান এমন গ্রাহক এবং যিনি অনলাইনে পণ্য বিক্রি করতে চান",
    problem: "পণ্য প্রদর্শন, অর্ডার নেওয়া, পেমেন্ট ও ডেলিভারি ট্র্যাক করার জন্য একটা সুসংগঠিত প্ল্যাটফর্মের অভাব",
    coreFeatures: ["Product Catalog ও Category", "Cart ও Checkout", "Order Tracking", "Payment Integration", "Inventory/Stock", "Admin Product Management"],
    platform: "Web (Responsive) + পরে Mobile App",
    userRoles: ["Customer", "Seller/Admin", "Delivery/Fulfillment Staff"],
    techStack: "Next.js/React frontend, Node.js backend, PostgreSQL/MongoDB, Stripe/bKash/SSLCommerz payment",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: true,
    security: ["Payment তথ্য কখনো নিজের সার্ভারে সংরক্ষণ না করা (Payment Gateway-এর উপর নির্ভর)", "Stock/Price ম্যানিপুলেশন রোধে Server-side validation", "Rate-limited checkout API"],
    standoutFeatures: ["AI Product Recommendation", "Order Tracking Timeline", "Wishlist ও Price-drop Alert"],
    personas: [
      { role: "গ্রাহক", goal: "সহজে পণ্য খুঁজে নিরাপদে অর্ডার করা", painPoint: "ডেলিভারি কতদূর তা না জানা, পেমেন্ট নিরাপত্তার অনিশ্চয়তা" },
      { role: "বিক্রেতা/Admin", goal: "পণ্য সহজে যুক্ত করা ও অর্ডার ট্র্যাক করা", painPoint: "Stock/Price ম্যানুয়ালি হিসাব রাখতে গিয়ে ভুল" },
      { role: "Delivery Staff", goal: "কোন অর্ডার কোথায় পাঠাতে হবে দ্রুত জানা", painPoint: "ঠিকানা/Order status আপডেট না থাকা" }
    ],
    featureMap: {
      core: ["Product Catalog", "Cart/Checkout", "Order Placement", "Payment Integration"],
      niceToHave: ["Order Tracking", "Inventory Management", "Wishlist"],
      future: ["AI Recommendation", "Price-drop Alert", "Multi-vendor Marketplace"]
    },
    userJourney: [
      "গ্রাহক প্রোডাক্ট ব্রাউজ/সার্চ করে",
      "পছন্দের পণ্য Cart-এ যুক্ত করে",
      "Checkout-এ ঠিকানা ও Payment তথ্য দেয়",
      "Payment Gateway-এর মাধ্যমে পেমেন্ট সম্পন্ন হয়",
      "Admin/Seller অর্ডার প্রসেস করে Delivery-তে পাঠায়",
      "গ্রাহক Order Tracking-এ ডেলিভারি স্ট্যাটাস দেখে"
    ],
    businessModel: "প্রতি বিক্রিতে Commission, বা মাসিক Seller Subscription Fee, বা সরাসরি নিজের পণ্য বিক্রি (Direct-to-consumer)।",
    mvpScope: ["Product Catalog", "Cart/Checkout", "একটা Payment Gateway Integration", "Basic Admin Panel"],
    futureScope: ["Order Tracking Timeline", "AI Recommendation", "Multi-vendor সাপোর্ট", "Mobile App"]
  },
  {
    id: "booking",
    keywords: ["booking", "বুকিং", "appointment", "অ্যাপয়েন্টমেন্ট", "reservation", "schedule", "সিডিউল"],
    appType: "Booking / Appointment System",
    audience: "সময়-ভিত্তিক সেবা দেন এমন প্রতিষ্ঠান (ক্লিনিক, সেলুন, কনসালট্যান্ট) এবং তাদের গ্রাহক",
    problem: "ফোন কল বা ম্যানুয়াল খাতায় Appointment রাখতে গিয়ে Double-booking ও সময় অপচয়",
    coreFeatures: ["সার্ভিস/স্লট তালিকা", "Calendar-ভিত্তিক Booking", "Reminder/Notification", "Reschedule/Cancel", "Staff Availability", "পেমেন্ট (ঐচ্ছিক)"],
    platform: "Web + PWA",
    userRoles: ["গ্রাহক", "Staff/Provider", "Admin"],
    techStack: "React frontend, Node.js/Firebase backend, PostgreSQL/Firestore",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: false,
    security: ["Double-booking রোধে Server-side slot lock", "গ্রাহকের ব্যক্তিগত তথ্য owner-scoped রাখা"],
    standoutFeatures: ["Automated SMS/Email Reminder", "Smart Slot Suggestion", "No-show Analytics"],
    personas: [
      { role: "গ্রাহক", goal: "পছন্দের সময়ে সহজে Appointment নেওয়া", painPoint: "ফোনে বারবার কল করে সময় জানতে হওয়া" },
      { role: "Service Provider/Staff", goal: "নিজের সময়সূচি স্পষ্টভাবে সাজানো", painPoint: "Double-booking বা মিসড অ্যাপয়েন্টমেন্ট" },
      { role: "Admin", goal: "সব Staff-এর Booking এক জায়গায় দেখা", painPoint: "একাধিক Staff-এর সময়সূচি সমন্বয় করা কঠিন" }
    ],
    featureMap: {
      core: ["সার্ভিস তালিকা", "Calendar Booking", "Reschedule/Cancel"],
      niceToHave: ["Reminder/Notification", "Staff Availability View"],
      future: ["Smart Slot Suggestion (AI)", "No-show Analytics", "পেমেন্ট Integration"]
    },
    userJourney: [
      "গ্রাহক সার্ভিস নির্বাচন করে",
      "উপলব্ধ Slot ক্যালেন্ডারে দেখে বেছে নেয়",
      "Booking Confirm করে, Reminder পায়",
      "প্রয়োজনে Reschedule/Cancel করতে পারে",
      "Provider/Admin Dashboard-এ সব Booking দেখে",
      "Appointment শেষে গ্রাহক Feedback দিতে পারে (ঐচ্ছিক)"
    ],
    businessModel: "মাসিক SaaS Subscription (Provider সংখ্যা/Booking সংখ্যা অনুযায়ী), বা প্রতি Booking-এ ছোট Commission।",
    mvpScope: ["সার্ভিস তালিকা", "Calendar Booking", "Reschedule/Cancel", "Basic Reminder"],
    futureScope: ["Smart Slot Suggestion", "No-show Analytics", "Payment Integration", "Multi-location সাপোর্ট"]
  },
  {
    id: "education",
    keywords: ["education", "শিক্ষা", "course", "কোর্স", "lms", "school", "স্কুল", "e-learning", "elearning", "learning"],
    appType: "Education / Learning Management System (LMS)",
    audience: "শিক্ষার্থী, শিক্ষক এবং শিক্ষা প্রতিষ্ঠান/প্রতিষ্ঠান পরিচালক",
    problem: "কোর্স কনটেন্ট, অ্যাসাইনমেন্ট ও অগ্রগতি ট্র্যাক করার জন্য একটা কেন্দ্রীভূত সিস্টেমের অভাব",
    coreFeatures: ["কোর্স/Lesson তৈরি ও প্রকাশ", "Video/Content Delivery", "Quiz/Assignment", "Progress Tracking", "Certificate Generation", "Discussion/Q&A"],
    platform: "Web + Mobile-friendly",
    userRoles: ["Student", "Instructor", "Admin"],
    techStack: "React/Next.js frontend, Node.js backend, PostgreSQL, ভিডিও-এর জন্য Cloud Storage/CDN",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: true,
    security: ["Course content piracy রোধে Signed/Time-limited video URL", "Role-based content access", "Payment-এর পরেই কোর্স আনলক"],
    standoutFeatures: ["Progress Dashboard ও Certificate", "AI-powered Quiz Generation", "Offline Content Download"],
    personas: [
      { role: "শিক্ষার্থী", goal: "নিজের সময়ে কোর্স শিখে দক্ষতা অর্জন করা", painPoint: "কোর্সে আটকে থাকা অংশ কোথায় তা বুঝতে না পারা" },
      { role: "প্রশিক্ষক/Instructor", goal: "কোর্স তৈরি করে বেশি শিক্ষার্থীর কাছে পৌঁছানো", painPoint: "কনটেন্ট আপলোড ও শিক্ষার্থীর অগ্রগতি ট্র্যাক করা কঠিন" },
      { role: "Admin", goal: "সব কোর্স ও Payment এক জায়গায় পরিচালনা করা", painPoint: "কোর্স Piracy ও Payment fraud নিয়ে দুশ্চিন্তা" }
    ],
    featureMap: {
      core: ["কোর্স তৈরি/প্রকাশ", "Video Content Delivery", "Enrollment"],
      niceToHave: ["Quiz/Assignment", "Progress Tracking", "Certificate"],
      future: ["AI Quiz Generation", "Offline Download", "Discussion Forum"]
    },
    userJourney: [
      "Instructor কোর্স তৈরি করে Video/Content আপলোড করে",
      "Student কোর্স ব্রাউজ করে পছন্দের কোর্সে Enroll করে (ফ্রি/পেইড)",
      "Student Lesson ধরে ধরে সম্পন্ন করে, Quiz দেয়",
      "সিস্টেম Progress ট্র্যাক করে",
      "কোর্স শেষে Certificate তৈরি হয়",
      "Admin সব কোর্স/Payment-এর Overview দেখে"
    ],
    businessModel: "প্রতি কোর্সে One-time Fee, বা মাসিক Subscription (সব কোর্স Unlock), Instructor-এর সাথে Revenue Share।",
    mvpScope: ["কোর্স তৈরি ও Enrollment", "Video Delivery", "বেসিক Progress Tracking", "একটা Payment Option"],
    futureScope: ["Quiz/Assignment Engine", "Certificate Generation", "AI Quiz Generation", "Discussion Forum"]
  },
  {
    id: "generic",
    keywords: [],
    appType: "সাধারণ ওয়েব/মোবাইল অ্যাপ্লিকেশন",
    audience: "আপনার বর্ণনা থেকে নির্দিষ্ট Audience এখনো স্পষ্টভাবে চেনা যায়নি — বিস্তারিত লিখুন",
    problem: "আরও বিস্তারিত বর্ণনা দিলে এই অংশ আরও নির্দিষ্টভাবে তৈরি হবে",
    coreFeatures: ["User Signup/Login", "Core Data Management (CRUD)", "Dashboard/Home", "Search/Filter", "Notification"],
    platform: "Web (Responsive)",
    userRoles: ["সাধারণ ব্যবহারকারী", "Admin"],
    techStack: "React/vanilla JS frontend, Node.js/Firebase backend, PostgreSQL/Firestore",
    needsDatabase: true,
    needsAuth: true,
    needsPayment: false,
    security: ["Standard Auth + Role-based access", "Input Validation", "Owner-scoped ডেটা অ্যাক্সেস"],
    standoutFeatures: ["আরও স্পষ্ট Idea দিলে এখানে Custom Standout Feature সাজেস্ট করা হবে"],
    personas: [
      { role: "সাধারণ ব্যবহারকারী", goal: "অ্যাপের মূল কাজ সহজে সম্পন্ন করা", painPoint: "Idea আরও নির্দিষ্ট না হওয়া পর্যন্ত এই অংশ generic থাকবে" },
      { role: "Admin", goal: "ব্যবহারকারী ও ডেটা পরিচালনা করা", painPoint: "নির্দিষ্ট প্রয়োজন এখনো অস্পষ্ট" }
    ],
    featureMap: {
      core: ["Signup/Login", "মূল Dashboard", "মূল ডেটা তৈরি/সম্পাদনা"],
      niceToHave: ["Search/Filter", "Notification"],
      future: ["আরও নির্দিষ্ট Idea দিলে এই অংশ Custom হবে"]
    },
    userJourney: [
      "ব্যবহারকারী Signup/Login করে",
      "মূল Dashboard-এ প্রবেশ করে",
      "প্রয়োজনীয় ডেটা তৈরি/দেখে/সম্পাদনা করে",
      "Admin প্রয়োজনে সব ব্যবহারকারী/ডেটা পরিচালনা করে"
    ],
    businessModel: "Idea আরও নির্দিষ্ট হলে উপযুক্ত Business Model (Subscription/Commission/One-time) সাজেস্ট করা হবে।",
    mvpScope: ["Signup/Login", "মূল Dashboard", "মূল CRUD Feature"],
    futureScope: ["আরও বিস্তারিত Idea দিলে এখানে Custom Future Scope যুক্ত হবে"]
  }
];
