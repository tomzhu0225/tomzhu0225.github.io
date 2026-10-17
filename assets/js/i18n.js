/**
 * Shared EN / 中文 chrome for FUSION!
 * Usage: mark elements with data-i18n="key" (text) or data-i18n-placeholder / data-i18n-aria
 * Optional page keys via SiteI18n.register({ zh: {...}, en: {...} })
 */
(function (global) {
  const STRINGS = {
    zh: {
      brand_sub: "朱博文",
      nav_home: "首页",
      nav_research: "研究",
      nav_notes: "随笔",
      nav_videos: "视频",
      nav_about: "关于",
      nav_archives: "归档",
      badge_sim: "仿真",
      badge_science: "科普",
      video_play: "点击播放",
      videos_sim: "仿真视频",
      videos_science: "科普视频",
      lang_toggle: "EN",
      theme_to_day: "日间",
      theme_to_night: "夜间",
      theme_aria_to_day: "切换到日间模式",
      theme_aria_to_night: "切换到夜间模式",
      footer_line1: "朱博文 · 等离子体计算 / 物理信息机器学习",
      footer_line2: "drawingsword.com · 静态托管于 GitHub Pages",
      footer_cv: "下载 CV (PDF)",
      badge_research: "研究",
      badge_notes: "随笔",
      badge_phd: "PhD · XJTU",
      load_error: "内容加载失败，请刷新重试。",
      empty_list: "暂无条目。",
      read_more: "阅读",
      view_all: "查看全部",
      filter_all: "全部",
      filter_research: "研究相关",
      filter_notes: "随笔",
      open_doi: "DOI",
      open_arxiv: "arXiv",
      open_code: "代码",
      oral: "口头报告",
      under_review: "在审 / 准备中",
      published: "已发表",
      talks: "会议报告",
      projects: "其他课题",
      related_notes: "相关博文",
      latest_research: "代表性成果",
      latest_notes: "精选随笔",
      section_pubs: "论文",
      section_edu: "教育经历",
      section_exp: "经历与学校",
      section_interests: "研究方向",
      section_scholarships: "奖学金与荣誉",
      section_contact: "联系方式",
      section_lang: "语言",
      contact_email: "邮箱",
      contact_location: "地点",
      meta_updated: "最近更新",
    },
    en: {
      brand_sub: "Bowen Zhu",
      nav_home: "Home",
      nav_research: "Research",
      nav_notes: "Notes",
      nav_videos: "Videos",
      nav_about: "About",
      nav_archives: "Archive",
      badge_sim: "Simulation",
      badge_science: "Outreach",
      video_play: "Click to play",
      videos_sim: "Simulations",
      videos_science: "Popular science",
      lang_toggle: "中文",
      theme_to_day: "Day",
      theme_to_night: "Night",
      theme_aria_to_day: "Switch to day mode",
      theme_aria_to_night: "Switch to night mode",
      footer_line1: "Bowen Zhu · plasma computation / physics-informed ML",
      footer_line2: "drawingsword.com · static on GitHub Pages",
      footer_cv: "Download CV (PDF)",
      badge_research: "Research",
      badge_notes: "Notes",
      badge_phd: "PhD · XJTU",
      load_error: "Failed to load content. Please refresh.",
      empty_list: "Nothing here yet.",
      read_more: "Read",
      view_all: "View all",
      filter_all: "All",
      filter_research: "Research",
      filter_notes: "Notes",
      open_doi: "DOI",
      open_arxiv: "arXiv",
      open_code: "Code",
      oral: "Oral",
      under_review: "Under review / in prep.",
      published: "Published",
      talks: "Talks",
      projects: "Other projects",
      related_notes: "Related notes",
      latest_research: "Selected research",
      latest_notes: "Selected notes",
      section_pubs: "Publications",
      section_edu: "Education",
      section_exp: "Experience & schools",
      section_interests: "Research interests",
      section_scholarships: "Scholarships & awards",
      section_contact: "Contact",
      section_lang: "Languages",
      contact_email: "Email",
      contact_location: "Location",
      meta_updated: "Last updated",
    },
  };

  let pagePack = { zh: {}, en: {} };

  function getLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "zh") return q;
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "zh") return saved;
    const nav = (navigator.language || "zh").toLowerCase();
    return nav.startsWith("zh") ? "zh" : "en";
  }

  function t(key, lang) {
    const L = lang || getLang();
    return (
      (pagePack[L] && pagePack[L][key]) ||
      (STRINGS[L] && STRINGS[L][key]) ||
      (STRINGS.en && STRINGS.en[key]) ||
      key
    );
  }

  function apply(lang) {
    const L = lang === "en" ? "en" : "zh";
    document.documentElement.lang = L === "en" ? "en" : "zh-CN";
    localStorage.setItem("lang", L);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key, L);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key, L);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(key, L));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(key, L));
    });

    const titleKey = document.body && document.body.getAttribute("data-title-key");
    if (titleKey) document.title = t(titleKey, L);

    const toggle = document.getElementById("lang-toggle");
    if (toggle) toggle.textContent = t("lang_toggle", L);

    document.dispatchEvent(new CustomEvent("site:lang", { detail: { lang: L } }));
  }

  function toggle() {
    const next = getLang() === "en" ? "zh" : "en";
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", next);
      history.replaceState(history.state, "", url);
    }
    apply(next);
  }

  function register(pack) {
    if (!pack) return;
    pagePack.zh = Object.assign({}, pagePack.zh, pack.zh || {});
    pagePack.en = Object.assign({}, pagePack.en, pack.en || {});
  }

  function init() {
    const btn = document.getElementById("lang-toggle");
    if (btn && !btn._i18nBound) {
      btn.addEventListener("click", toggle);
      btn._i18nBound = true;
    }
    apply(getLang());
  }

  global.SiteI18n = { getLang, t, apply, toggle, register, init, STRINGS };
})(window);
