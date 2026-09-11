# CookieSMP website

A static site for the CookieSMP Minecraft server: a welcome page with both
connect IPs and live status, plus a forums/announcements board. No backend
required — it's built to run straight off GitHub Pages.

## Files

- `index.html` — welcome page: hero, Java/Bedrock connect cards with live status, feature overview.
- `forums.html` — announcements board, rendered from `posts.json`.
- `posts.json` — the forum content. Edit this to post.
- `style.css`, `script.js` — shared styling and behaviour.

## Deploying on GitHub Pages

1. Push these files to a repo (root, or a `/docs` folder).
2. In the repo settings, go to **Pages** and set the source to that branch/folder.
3. The site will be live at `https://<username>.github.io/<repo>/`.

No build step, no npm install — it's plain HTML/CSS/JS.

## Posting to the forums

`forums.html` reads directly from `posts.json`. To publish something, add a
new object to the top-level array and commit/push — the page picks it up on
next load, nothing else to run.

```json
{
  "title": "Short post title",
  "body": "The post text. Keep it a paragraph or two.",
  "category": "announcement",
  "author": "CookieSMP Team",
  "date": "2026-09-09",
  "pinned": false
}
```

- `category` must be one of: `announcement`, `update`, `event`, `downtime` — these map to the filter tabs and the colored left border on each post.
- `pinned: true` keeps a post at the top regardless of date.
- `date` should be `YYYY-MM-DD` so posts sort correctly.

If you'd rather have threaded replies or member sign-ups instead of a
one-way announcements board, the honest static-site answer is to turn on
**GitHub Discussions** for the repo and link to it from the nav — GitHub
Pages alone can't run a real multi-user forum since there's no server to
store posts from visitors.

## Live status

The connect cards on the home page ping the free
[mcsrvstat.us](https://mcsrvstat.us) API in the visitor's browser — no key,
no server-side code. Java and Bedrock are queried separately since they use
different protocols. If you ever change the IP or port, update the two
`SERVERS` entries at the top of `script.js` (and the matching text in
`index.html`).

## Changing colors/fonts

All design tokens (colors, fonts, corner-step size) live at the top of
`style.css` under `:root`.
