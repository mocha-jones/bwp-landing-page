# Bloody Water Podcast Landing Page

A lightweight static site for Bloody Water Podcast with a branded homepage, live RedCircle episode archive, same-site episode pages, and Netlify-ready deploys.

## What is included

- Minimal top navigation
- Hero area tailored to Bloody Water Podcast
- `Recent Episode` and `All Episodes` archive controls
- Search bar that filters live archive results
- Same-site episode detail pages
- Exact Apple and Spotify links for the recent episodes that can be matched automatically
- Responsive layout ready for Netlify

## Run locally

Because this project is fully static, you can open `index.html` directly in a browser or serve it with a tiny local server:

```bash
cd /Users/derickg/Desktop/minimal-podcast-site
node scripts/build-platform-links.mjs
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Deploy to Netlify

1. Push this folder to a GitHub repo, or drag the folder directly into Netlify.
2. If Netlify asks for a publish directory, use `.`.
3. The included Netlify config runs `node scripts/build-platform-links.mjs` before publish.

## Next customization ideas

- Keep refining homepage sections and supporting brand copy
- Add sponsor, merch, or social sections
- Connect the project to GitHub for auto-deploys and version history
