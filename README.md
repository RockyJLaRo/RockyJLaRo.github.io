# TibiaWiki Outfitter

A web tool for [Tibia](https://www.tibia.com) players: preview any outfit, mount or
creature, choose addons, gender, colours and facing direction, show it walking on a
floor with a name and HP bar, then download it as PNG, GIF or animated PNG, or copy a
link / TibiaWiki `{{Outfitter}}` template code.

It is a static website (HTML, CSS and JavaScript only) published with GitHub Pages.
It works on desktop, tablet and phone screens.

**Maintaining it?** Read [docs/MAINTAINING.md](docs/MAINTAINING.md). It explains, step
by step, how to add creatures, mounts and outfits, check your work and publish it.

---

## Quick start (preview on your own computer)

The Outfitter downloads its sprite files with JavaScript, which browsers block when
`index.html` is opened directly from disk. Start a small local web server instead:

| You have | Run this in the project folder | Then open |
| --- | --- | --- |
| [Node.js](https://nodejs.org) (recommended) | `npm start` | http://localhost:8080 |
| Python 3 | `python3 -m http.server 8080` | http://localhost:8080 |

Stop the server with **Ctrl+C**. If port 8080 is busy, use another number, e.g.
`npm start -- 8081`.

## Checks and tests

Install the test tools once: `npm install` (and `npx playwright install chromium`
for the browser tests). Then:

| Command | What it does | Time |
| --- | --- | --- |
| `npm run validate` | Checks every name, rule and sprite file (missing files, typos, broken images, wrong sheet sizes). Changes nothing. | ~5 s |
| `npm run test:unit` | Tests the checker itself. | ~1 s |
| `npm run test:e2e` | Opens the Outfitter in a real (headless) browser on desktop and phone sizes and tries every feature. | ~1 min |
| `npm test` | All of the above. | ~1 min |

The same checks are set up to run on GitHub for every push (`.github/workflows/checks.yml`).

## Project layout

```
index.html                 the page
css/page.css               page frame (header, footer)
css/outfitter.css          the Outfitter's look, including the phone/tablet layout
js/outfitter-assets.js     <- creature / mount / outfit lists and sprite rules (edit this)
js/outfitter-settings.js   <- small adjustable settings (safe to edit)
js/outfitter.js            program logic
js/vendor/                 jQuery 3.7.0 (third-party, do not edit)
base64/Creature|Female|Male|Mount|Other/   one sprite sheet per .txt file
images/                    loading / error images and interface images (images/ui/)
tools/serve.js             local web server (npm start)
tools/validate-assets.js   asset checker (npm run validate)
tools/sprite-file.js       convert PNG <-> sprite .txt file
tests/                     automated tests (unit + browser)
docs/MAINTAINING.md        maintenance guide
```

`Vocab.txt` is unrelated to the Outfitter.

## Links into the Outfitter

Every view has a shareable link, for example `?o=3&a1&a2&m=5&c1=20`
(Knight with both addons on a mount, custom head colour). Short and long option names
both work (`o` / `outfit`, `m` / `mount`, `cr` / `creature`, `fm` / `female`,
`a1` / `addon1`, `f` / `facing`, `c1`-`c4`, `mc1`-`mc4`, `a` / `animate`,
`fl` / `floor`, `n` / `charn` ...). Invalid or outdated values fall back to the defaults.

## Credits

Based on the TibiaWiki Outfiter (MediaWiki:Outfiter.js), developed collaboratively by
the TibiaWiki team. Maintained by RockyJLaRo. Tibia is a trademark of
[CipSoft GmbH](https://cipsoft.com/).
