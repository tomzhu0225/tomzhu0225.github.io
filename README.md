# FUSION! — drawingsword.com

Personal site for **Bowen Zhu (朱博文)**: research showcase + notes archive.  
Static HTML/CSS/JS on **GitHub Pages** (`tomzhu0225.github.io` → [drawingsword.com](https://drawingsword.com)).

## Structure

| Path | Role |
|------|------|
| `index.html` | Home — identity + selected papers + featured notes |
| `research/` | Publications, under review, talks, projects (from CV) |
| `notes/` | Personal / engineering essays |
| `about/` | CV-style bio (synced from CV data) |
| `archives/` | Full post list by year + lane filter |
| `posts/<title>/` | Individual articles (original language kept) |
| `data/posts.json` | Post catalog (`lane`, `tags`, `date`, summaries) |
| `data/research.json` | Publications & CV-derived research content |
| `assets/css/theme.css` | Global theme |
| `assets/js/i18n.js` | Shared EN / 中文 chrome |
| `assets/js/site.js` | Cards, JSON load helpers |

## Local preview

```bash
cd /path/to/tomzhu0225.github.io
python -m http.server 4000
# open http://localhost:4000
```

JSON fetch needs a local server (not `file://`).

## Language

- Chrome (nav/footer/buttons): `SiteI18n` + `data-i18n` keys; preference in `localStorage.lang`, optional `?lang=en|zh`.
- Post **bodies** stay in their original language (no bulk translation).

## Editing content

**Research / CV blocks** — edit `data/research.json` (then refresh Research / About).

**Post list metadata** — edit `data/posts.json` (`lane`: `research` | `notes`, `featured`, `hidden`, `tags`).

**New post** — copy `posts/<existing>/`, edit HTML, add an entry to `data/posts.json` (and optionally `archives/data.json` / `api-content` if you keep them in sync).

## Media / video policy

- Prefer **images** next to each post: `posts/<name>/images/`.
- **Do not** commit large sim videos into this repo (GitHub soft limits; slow clones).
- Host on Bilibili / YouTube / GitHub Releases and **embed** on the page; optional short WebM preview.

## Deploy

```bash
git status
git add -A
git commit -m "Update site"
git push
```

GitHub Pages serves `main`.

## Legacy

- `styles/main.css`, `media/gridea-search/`, opaque `/tag/<id>/` paths: leftover from Gridea migration; not used by the new shell.
- `/tags/` redirects to `/archives/`.
- Migration Python scripts are gitignored.

CV source of truth for the 2026 refresh: personal CV PDF (research data last noted 2026-07-21).
