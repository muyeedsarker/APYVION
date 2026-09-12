// APYVION — Project History (multi-idea support)
// দায়িত্ব: Idea Center → Product Planner → UI/UX Designer → App Builder পাইপলাইনের
// একেকটা "চলমান" localStorage স্লট (jf_idea_spec/jf_product_plan/jf_design_system/
// jf_built_files)-কে একাধিক Project হিসেবে আলাদা করে সংরক্ষণ করা, যাতে নতুন Idea
// শুরু করলে আগের কাজ হারিয়ে না যায়। কোনো মডিউলের নিজস্ব কোড পাল্টাতে হয় না —
// প্রতিটা ধাপের সফল save-এর পরে শুধু snapshotCurrent() ডাকলেই চলে।
window.APYVION_PROJECTS = (function () {
  const LIST_KEY = "jf_projects_list";
  const CURRENT_KEY = "jf_current_project_id";
  const STAGE_KEYS = ["jf_idea_spec", "jf_product_plan", "jf_design_system", "jf_built_files"];
  const MAX_PROJECTS = 20;

  function uid() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function getList() {
    try {
      return JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveList(list) {
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  }

  function getCurrentId() {
    return localStorage.getItem(CURRENT_KEY) || null;
  }

  function setCurrentId(id) {
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch (e) {}
  }

  function nameFromSpec() {
    try {
      const spec = JSON.parse(localStorage.getItem("jf_idea_spec") || "null");
      if (spec) {
        return spec.appType || spec.title || spec.category || "Untitled Project";
      }
    } catch (e) {}
    return "Untitled Project";
  }

  function currentStage() {
    if (localStorage.getItem("jf_built_files")) return "App Builder";
    if (localStorage.getItem("jf_design_system")) return "UI/UX Designer";
    if (localStorage.getItem("jf_product_plan")) return "Product Planner";
    if (localStorage.getItem("jf_idea_spec")) return "Idea Center";
    return "—";
  }

  const STAGE_PAGE = {
    "App Builder": "app-builder.html",
    "UI/UX Designer": "ui-ux-designer.html",
    "Product Planner": "product-planner.html",
    "Idea Center": "product-planner.html", // idea spec resumed here regenerates the plan automatically
  };

  // Current stage keys থেকে একটা স্ন্যাপশট নিয়ে project list-এ create/update করে।
  function snapshotCurrent() {
    let id = getCurrentId();
    const list = getList();
    let entry = id ? list.find((p) => p.id === id) : null;
    if (!entry) {
      id = uid();
      entry = { id, name: nameFromSpec(), createdAt: new Date().toISOString() };
      list.unshift(entry);
      setCurrentId(id);
    }
    entry.name = nameFromSpec();
    entry.updatedAt = new Date().toISOString();
    entry.stage = currentStage();
    entry.data = {};
    STAGE_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v != null) entry.data[k] = v;
    });

    list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    while (list.length > MAX_PROJECTS) list.pop();

    try {
      saveList(list);
    } catch (e) {
      // localStorage quota শেষ হয়ে গেলে সবচেয়ে ভারী অংশ (built files) বাদ দিয়ে একবার আবার চেষ্টা
      if (entry.data.jf_built_files) {
        delete entry.data.jf_built_files;
        try {
          saveList(list);
        } catch (e2) {
          /* নীরবে বাদ — snapshot ছাড়া হলেও মূল pipeline কাজ চালিয়ে যাবে */
        }
      }
    }
  }

  // বর্তমান কাজ (থাকলে) সংরক্ষণ করে একদম খালি অবস্থা থেকে নতুন Idea শুরু করার সুযোগ দেয়।
  function startNew() {
    if (getCurrentId()) snapshotCurrent();
    setCurrentId(null);
    STAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
  }

  function loadProject(id) {
    const list = getList();
    const entry = list.find((p) => p.id === id);
    if (!entry) return null;
    STAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
    Object.keys(entry.data || {}).forEach((k) => {
      try {
        localStorage.setItem(k, entry.data[k]);
      } catch (e) {}
    });
    setCurrentId(id);
    return STAGE_PAGE[entry.stage] || "index.html";
  }

  function remove(id) {
    const list = getList().filter((p) => p.id !== id);
    saveList(list);
    if (getCurrentId() === id) setCurrentId(null);
  }

  function rename(id, name) {
    const list = getList();
    const entry = list.find((p) => p.id === id);
    if (entry && name) {
      entry.name = name;
      saveList(list);
    }
  }

  return { getList, snapshotCurrent, startNew, loadProject, remove, rename, getCurrentId, currentStage };
})();
