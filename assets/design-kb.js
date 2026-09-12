// APYVION — Design System Knowledge Base (Master Structure Section 03)
// প্রতিটা Design Direction-এর জন্য Color System, Typography, Radius/Shadow স্টাইল
// এবং একটা ছোট বাংলা বর্ণনা রাখা হয়েছে। ব্যবহারকারী Direction বেছে নিলে
// ui-ux-designer.js এই টোকেনগুলো দিয়ে একটা লাইভ প্রিভিউ তৈরি করে।

window.JORON_DESIGN_KB = {
  professional: {
    label: "Professional",
    description: "বিশ্বাসযোগ্য, পরিচ্ছন্ন ও ব্যবসায়িক — যেকোনো Audience-এর জন্য নিরাপদ পছন্দ।",
    primary: "#2563eb",
    accent: "#0ea5e9",
    bg: "#0b1220",
    surface: "#121a2b",
    text: "#e7ecf5",
    textDim: "#93a1b8",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    bodyFont: "system-ui, sans-serif",
    radius: "10px",
    shadow: "0 10px 30px rgba(37,99,235,0.15)"
  },
  premium: {
    label: "Premium",
    description: "বিলাসবহুল অনুভূতি, গাঢ় ব্যাকগ্রাউন্ডে গ্র্যাডিয়েন্ট অ্যাকসেন্ট — Matrimony/Membership App-এর জন্য দারুণ মানানসই।",
    primary: "#7c5cff",
    accent: "#d4af37",
    bg: "#0f1115",
    surface: "#171a21",
    text: "#f0eefc",
    textDim: "#a79fce",
    headingFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "system-ui, sans-serif",
    radius: "16px",
    shadow: "0 20px 60px rgba(124,92,255,0.25)"
  },
  minimal: {
    label: "Minimal",
    description: "কম কিন্তু কার্যকর — সাদা স্পেস, হালকা ছায়া, মনোযোগ শুধু কনটেন্টে।",
    primary: "#111827",
    accent: "#4b5563",
    bg: "#ffffff",
    surface: "#f7f7f8",
    text: "#111827",
    textDim: "#6b7280",
    headingFont: "system-ui, sans-serif",
    bodyFont: "system-ui, sans-serif",
    radius: "6px",
    shadow: "0 4px 12px rgba(0,0,0,0.06)"
  },
  modern: {
    label: "Modern",
    description: "প্রাণবন্ত, গ্র্যাডিয়েন্ট ও bold টাইপোগ্রাফি — Tech/E-commerce/Startup App-এর জন্য উপযুক্ত।",
    primary: "#06b6d4",
    accent: "#a855f7",
    bg: "#0a0f1e",
    surface: "#131a2e",
    text: "#eaf6fb",
    textDim: "#8fa3c0",
    headingFont: "'Trebuchet MS', system-ui, sans-serif",
    bodyFont: "system-ui, sans-serif",
    radius: "18px",
    shadow: "0 15px 45px rgba(6,182,212,0.25)"
  },
  corporate: {
    label: "Corporate",
    description: "স্থিতিশীল ও নির্ভরযোগ্য — Enterprise/B2B/Institutional App-এর জন্য রক্ষণশীল ডিজাইন।",
    primary: "#1e3a8a",
    accent: "#334155",
    bg: "#0d1220",
    surface: "#151b2c",
    text: "#e6e9f2",
    textDim: "#8b93a7",
    headingFont: "'Times New Roman', serif",
    bodyFont: "Arial, sans-serif",
    radius: "8px",
    shadow: "0 6px 18px rgba(0,0,0,0.25)"
  },
  luxury: {
    label: "Luxury",
    description: "অভিজাত ও exclusive — কালো ব্যাকগ্রাউন্ডে সোনালি হেয়ারলাইন, ধারালো কোণ।",
    primary: "#111111",
    accent: "#c9a227",
    bg: "#0a0a0a",
    surface: "#151515",
    text: "#f5f0e6",
    textDim: "#b8ac8c",
    headingFont: "Georgia, 'Palatino Linotype', serif",
    bodyFont: "Georgia, serif",
    radius: "2px",
    shadow: "0 0 0 1px rgba(201,162,39,0.25)"
  },
  friendly: {
    label: "Friendly",
    description: "উষ্ণ ও আন্তরিক — গোলাকার আকৃতি ও উজ্জ্বল রঙ, Community/Education/Consumer App-এর জন্য আদর্শ।",
    primary: "#f97316",
    accent: "#22c55e",
    bg: "#141311",
    surface: "#1e1c19",
    text: "#fdf3ea",
    textDim: "#c9b8a8",
    headingFont: "'Comic Sans MS', 'Trebuchet MS', sans-serif",
    bodyFont: "'Trebuchet MS', sans-serif",
    radius: "22px",
    shadow: "0 12px 30px rgba(249,115,22,0.2)"
  }
};

// App Category অনুযায়ী ডিফল্ট Direction সাজেশন (ব্যবহারকারী চাইলে বদলাতে পারবে)
window.JORON_DESIGN_DEFAULTS = {
  matrimony: "premium",
  restaurant: "friendly",
  ecommerce: "modern",
  booking: "professional",
  education: "friendly",
  generic: "professional"
};
