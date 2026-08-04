/**
 * Shared helpers: post cards, research rendering, fetch JSON, night/day theme.
 */
(function (global) {
  /** Theme: default night. Stored as localStorage.theme = "night" | "day" */
  const Theme = (function () {
    const KEY = "theme";
    const DEFAULT = "night";

    function normalize(v) {
      return v === "day" ? "day" : "night";
    }

    function get() {
      try {
        const q = new URLSearchParams(location.search).get("theme");
        if (q === "day" || q === "night") return q;
        return normalize(localStorage.getItem(KEY) || DEFAULT);
      } catch (_) {
        return DEFAULT;
      }
    }

    function apply(theme) {
      const t = normalize(theme);
      document.documentElement.setAttribute("data-theme", t);
      try {
        localStorage.setItem(KEY, t);
      } catch (_) {}
      syncToggle(t);
      syncGiscus(t);
      document.dispatchEvent(new CustomEvent("site:theme", { detail: { theme: t } }));
    }

    function toggle() {
      apply(get() === "night" ? "day" : "night");
    }

    function syncToggle(theme) {
      const btn = document.getElementById("theme-toggle");
      if (!btn) return;
      const t = theme || get();
      // Button shows the mode you can switch TO
      const next = t === "night" ? "day" : "night";
      const icon = next === "day" ? "☀" : "☾";
      const labelKey = next === "day" ? "theme_to_day" : "theme_to_night";
      const ariaKey = next === "day" ? "theme_aria_to_day" : "theme_aria_to_night";
      const label =
        global.SiteI18n && SiteI18n.t
          ? SiteI18n.t(labelKey)
          : next === "day"
            ? "Day"
            : "Night";
      const aria =
        global.SiteI18n && SiteI18n.t
          ? SiteI18n.t(ariaKey)
          : label;
      btn.textContent = icon;
      btn.setAttribute("title", label);
      btn.setAttribute("aria-label", aria);
      btn.setAttribute("data-theme-next", next);
    }

    function syncGiscus(theme) {
      // Best-effort: giscus reloads theme if iframe present
      const giscusTheme = theme === "day" ? "light" : "dark";
      const iframe = document.querySelector("iframe.giscus-frame");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: giscusTheme } } },
          "https://giscus.app"
        );
      }
      document.querySelectorAll("script[src*='giscus.app']").forEach((s) => {
        s.setAttribute("data-theme", giscusTheme);
      });
    }

    function init() {
      apply(get());
      const btn = document.getElementById("theme-toggle");
      if (btn && !btn._themeBound) {
        btn.addEventListener("click", toggle);
        btn._themeBound = true;
      }
      document.addEventListener("site:lang", () => syncToggle(get()));
    }

    // Apply ASAP if script runs after DOM root exists (avoid day flash only when stored)
    try {
      const early = normalize(localStorage.getItem(KEY) || DEFAULT);
      if (document.documentElement) {
        document.documentElement.setAttribute("data-theme", early);
      }
    } catch (_) {
      if (document.documentElement) {
        document.documentElement.setAttribute("data-theme", DEFAULT);
      }
    }

    return { get, apply, toggle, init, syncToggle };
  })();

  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pickTitle(post, lang) {
    if (lang === "en" && post.title_en) return post.title_en;
    if (lang === "zh" && post.title_zh) return post.title_zh;
    return post.title || post.id || "";
  }

  function pickSummary(post, lang) {
    if (lang === "en" && post.summary_en) return post.summary_en;
    if (lang === "zh" && post.summary_zh) return post.summary_zh;
    return post.summary || "";
  }

  function formatDate(iso, lang) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) return iso;
    try {
      return d.toLocaleDateString(lang === "en" ? "en-GB" : "zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return iso;
    }
  }

  function laneBadge(lane, lang) {
    const label =
      lane === "research"
        ? SiteI18n.t("badge_research", lang)
        : SiteI18n.t("badge_notes", lang);
    const cls = lane === "research" ? "badge badge-research" : "badge badge-notes";
    return `<span class="${cls}">${escapeHtml(label)}</span>`;
  }

  function postCard(post, lang, opts) {
    opts = opts || {};
    const title = pickTitle(post, lang);
    const summary = pickSummary(post, lang);
    const date = formatDate(post.date, lang);
    const tags = (post.tags || [])
      .map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`)
      .join("");
    const showLane = opts.showLane !== false;
    return `
      <a class="post-card" href="${escapeHtml(post.href)}" role="listitem">
        <div class="post-meta">
          ${date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(date)}</time>` : ""}
          ${showLane ? laneBadge(post.lane, lang) : ""}
          ${(post.lang || "").toUpperCase() ? `<span class="pill-mini">${escapeHtml((post.lang || "").toUpperCase())}</span>` : ""}
        </div>
        <h3 class="post-title">${escapeHtml(title)}</h3>
        ${summary ? `<p class="post-excerpt">${escapeHtml(summary)}</p>` : ""}
        ${tags ? `<div class="tag-row">${tags}</div>` : ""}
      </a>`;
  }

  function renderPostList(el, posts, lang, opts) {
    if (!el) return;
    const list = (posts || []).filter((p) => !p.hidden);
    if (!list.length) {
      el.innerHTML = `<p class="muted">${escapeHtml(SiteI18n.t("empty_list", lang))}</p>`;
      return;
    }
    el.innerHTML = list.map((p) => postCard(p, lang, opts)).join("");
  }

  function pubItem(p, lang) {
    const note = lang === "zh" ? p.note_zh || p.note_en : p.note_en || p.note_zh;
    const links = [];
    if (p.doi) links.push(`<a href="${escapeHtml(p.doi)}" target="_blank" rel="noopener">${SiteI18n.t("open_doi", lang)}</a>`);
    if (p.arxiv) links.push(`<a href="${escapeHtml(p.arxiv)}" target="_blank" rel="noopener">${SiteI18n.t("open_arxiv", lang)}</a>`);
    const tags = (p.tags || []).map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`).join("");
    return `
      <article class="pub-card">
        <div class="post-meta">
          <span>${escapeHtml(String(p.year || ""))}</span>
          ${tags}
        </div>
        <h3 class="pub-title">${escapeHtml(p.title)}</h3>
        <p class="pub-authors">${escapeHtml(p.authors || "")}</p>
        <p class="pub-venue">${escapeHtml(p.venue || "")}</p>
        ${note ? `<p class="pub-note">${escapeHtml(note)}</p>` : ""}
        ${links.length ? `<div class="link-row">${links.join(" · ")}</div>` : ""}
      </article>`;
  }

  /** Bilibili: click-to-play, never autoload, only one active player site-wide. */
  let activeVideoId = null;

  function bilibiliPlayerSrc(bvid) {
    return (
      "https://player.bilibili.com/player.html?isOutside=true&bvid=" +
      encodeURIComponent(bvid) +
      "&page=1&high_quality=1&danmaku=0&autoplay=0"
    );
  }

  function stopAllVideos(exceptId) {
    document.querySelectorAll("[data-video-shell]").forEach((shell) => {
      const id = shell.getAttribute("data-video-id");
      if (exceptId && id === exceptId) return;
      const frame = shell.querySelector(".video-frame");
      if (!frame) return;
      frame.innerHTML = "";
      frame.classList.remove("is-playing");
      const btn = shell.querySelector(".video-play-btn");
      if (btn) btn.hidden = false;
    });
    if (!exceptId) activeVideoId = null;
  }

  function playVideo(shell) {
    if (!shell) return;
    const bvid = shell.getAttribute("data-bvid");
    const id = shell.getAttribute("data-video-id");
    const title = shell.getAttribute("data-title") || bvid;
    if (!bvid) return;
    stopAllVideos(id);
    activeVideoId = id;
    const frame = shell.querySelector(".video-frame");
    const btn = shell.querySelector(".video-play-btn");
    if (!frame) return;
    frame.classList.add("is-playing");
    if (btn) btn.hidden = true;
    // Only inject iframe on user click — no autostart on page load
    frame.innerHTML =
      '<iframe src="' +
      escapeHtml(bilibiliPlayerSrc(bvid)) +
      '" allowfullscreen="true" allow="fullscreen" title="' +
      escapeHtml(title) +
      '"></iframe>';
  }

  function bindVideoPlayers(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-video-shell]").forEach((shell) => {
      if (shell._videoBound) return;
      shell._videoBound = true;
      const start = (e) => {
        // Don't steal clicks on external links
        if (e.target.closest && e.target.closest("a")) return;
        e.preventDefault();
        playVideo(shell);
      };
      const btn = shell.querySelector(".video-play-btn");
      if (btn) btn.addEventListener("click", start);
      const frame = shell.querySelector(".video-frame");
      if (frame) frame.addEventListener("click", start);
    });
  }

  function kindBadge(kind, lang) {
    const isSim = kind !== "science";
    const label = isSim
      ? SiteI18n.t("badge_sim", lang)
      : SiteI18n.t("badge_science", lang);
    const cls = isSim ? "badge badge-sim" : "badge badge-science";
    return `<span class="${cls}">${escapeHtml(label)}</span>`;
  }

  /** Bilibili card: poster + play; iframe only after click. */
  function videoCard(video, lang, opts) {
    opts = opts || {};
    const bvid = video.bvid || "";
    if (!bvid) return "";
    const title =
      lang === "zh"
        ? video.title_zh || video.title_en || bvid
        : video.title_en || video.title_zh || bvid;
    const watch = "https://www.bilibili.com/video/" + encodeURIComponent(bvid);
    const kind = video.kind === "science" ? "science" : "sim";
    const id = "v-" + bvid;
    const playLabel = SiteI18n.t("video_play", lang);

    if (opts.embed === false) {
      return `
      <article class="video-card video-card-linkonly">
        <div class="video-meta">${kindBadge(kind, lang)}</div>
        <h3><a href="${escapeHtml(watch)}" target="_blank" rel="noopener">${escapeHtml(title)}</a></h3>
      </article>`;
    }

    return `
      <article class="video-card" data-video-shell data-video-id="${escapeHtml(id)}" data-bvid="${escapeHtml(bvid)}" data-title="${escapeHtml(title)}">
        <div class="video-meta">${kindBadge(kind, lang)}</div>
        <h3>${escapeHtml(title)}</h3>
        <div class="video-frame" role="button" tabindex="0" aria-label="${escapeHtml(playLabel)}">
          <button type="button" class="video-play-btn" aria-label="${escapeHtml(playLabel)}">
            <span class="video-play-icon">▶</span>
            <span class="video-play-text">${escapeHtml(playLabel)}</span>
          </button>
        </div>
        <div class="video-links">
          <a href="${escapeHtml(watch)}" target="_blank" rel="noopener">Bilibili ↗</a>
        </div>
      </article>`;
  }

  function renderVideoList(el, videos, lang, opts) {
    if (!el) return;
    const list = videos || [];
    if (!list.length) {
      el.innerHTML = `<p class="muted">${escapeHtml(SiteI18n.t("empty_list", lang))}</p>`;
      return;
    }
    el.innerHTML = list.map((v) => videoCard(v, lang, opts)).join("");
    bindVideoPlayers(el);
  }

  function setActiveNav() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const key = a.getAttribute("data-nav");
      let active = false;
      if (key === "home") active = path === "" || path === "/" || path.endsWith("/index.html") && path.split("/").filter(Boolean).length <= 1;
      if (key === "research") active = path.includes("/research");
      if (key === "notes") active = path.includes("/notes");
      if (key === "videos") active = path.includes("/videos");
      if (key === "about") active = path.includes("/about");
      if (key === "archives") active = path.includes("/archives");
      a.classList.toggle("is-active", active);
    });
  }

  function markHomeActiveSpecial() {
    // Home is only exact root
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const home = document.querySelector('[data-nav="home"]');
    if (home) {
      const isHome = path === "/" || path === "" || path === "/index.html";
      home.classList.toggle("is-active", isHome);
    }
  }

  global.Site = {
    loadJSON,
    escapeHtml,
    pickTitle,
    pickSummary,
    formatDate,
    postCard,
    renderPostList,
    pubItem,
    videoCard,
    renderVideoList,
    bindVideoPlayers,
    stopAllVideos,
    setActiveNav,
    markHomeActiveSpecial,
    Theme,
  };
  global.SiteTheme = Theme;

  document.addEventListener("DOMContentLoaded", () => {
    SiteI18n.init();
    Theme.init();
    Site.setActiveNav();
    Site.markHomeActiveSpecial();
  });
})(window);
