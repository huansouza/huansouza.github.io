# My personal website

A simple, single-page academic website. No build tools needed: it's plain HTML and CSS.

## Files

| File | What it is |
|---|---|
| `index.html` | All of the page's content. **This is the file you'll edit most.** |
| `style.css` | Colors, fonts and layout. Change `--accent` at the top to change the theme color. |
| `images/profile.svg` | Placeholder photo. Replace it with your own (see below). |
| `images/favicon.svg` | The little icon in the browser tab. Change `YN` to your initials. |
| `cv.pdf` | *(Add this yourself.)* Your CV. The "CV" links point to it. |

## Editing

1. Open `index.html` in any text editor (VS Code, TextEdit in plain-text mode, etc.).
2. Search for `✏️ EDIT` to find every spot you need to fill in.
3. To add a paper, news item or project, copy an existing block and change the text.
4. Double-click `index.html` to preview it in your browser. Refresh after each save.

**Your photo:** put a square image in `images/` (e.g. `images/profile.jpg`), then change
`src="images/profile.svg"` in `index.html` to `src="images/profile.jpg"`.

**Remove a section:** delete everything from its `<section …>` to its `</section>`, and
remove its link from the `<nav>` at the top.

## Putting it online (free, with GitHub Pages)

1. Create a free account at <https://github.com> if you don't have one.
2. Create a new **public** repository named exactly **`yourusername.github.io`**
   (replace `yourusername` with your GitHub username).
3. On the repository page, click **Add file → Upload files**, drag in everything in this
   folder (`index.html`, `style.css`, the `images` folder, `cv.pdf`), and click **Commit changes**.
4. Wait a minute, then visit **`https://yourusername.github.io`**. Your site is live.

To update it later, upload the changed files again the same way (or edit them directly on
GitHub by clicking a file and then the pencil icon).

**Custom domain (optional):** buy a domain (for example from Cloudflare or Porkbun, about
$10 a year), then in your repository go to **Settings → Pages → Custom domain** and follow
the instructions.
