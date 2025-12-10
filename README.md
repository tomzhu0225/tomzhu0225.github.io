# FUSION! (static site)

Brand-new lightweight theme, no Gridea/Bootstrap. Everything is plain HTML/CSS and edited directly in VS Code.

## Quick preview
- Open this folder in VS Code.
- Serve locally (pick one):
  - `python -m http.server 4000` → http://localhost:4000
  - VS Code "Live Server" → Go Live.

## Folder layout (new)
- `assets/css/theme.css` — the only global stylesheet.
- `index.html` — homepage listing featured posts.
- `posts/<文章名>/index.html` — each article in its own folder, Chinese posts use中文路径；images stay beside the post:
  - Example: `posts/巴黎天际线/index.html` with images in `posts/巴黎天际线/images/`.
- Legacy content still lives under `post/` and `post-images/` until migrated.

## Editing / creating posts
- Duplicate an existing `posts/<name>/` folder, rename it, and edit the HTML. Keep images in the nested `images/` folder and reference them relatively (e.g., `./images/pic.png`).
- Add a card on `index.html` for the new post (copy an `<article class="post-card">` block).
- For legacy posts still under `post/`, migrate by: (1) creating `posts/<中文名>/`, (2) copying referenced images from `post-images/` into `posts/<中文名>/images/`, (3) updating image `src` to `./images/<file>`.

## Styling
- Tweak colors/spacing in `:root` inside `assets/css/theme.css`.
- Headings use Space Grotesk, body text uses Inter.

## Deploying
1) `git status` — check changes.
2) `git commit -am "Update site"`
3) `git push` — GitHub Pages serves the latest.

## What changed
- New homepage and cards, no Gridea theme.
- Sample migrated post at `posts/巴黎天际线/` with its image colocated.
- Ready for further migration of remaining posts to the `posts/` structure.
