# TibiaWiki Outfitter

A web tool for [Tibia](https://www.tibia.com) players: preview any outfit, mount or
creature, choose addons, gender, colours and facing direction, show it walking on a
floor with a name and HP bar, then download it as PNG, GIF or animated PNG, or copy a
link / TibiaWiki `{{Outfitter}}` template code.

It is a static website (HTML, CSS and JavaScript only) published with GitHub Pages.
It works on desktop, tablet and phone screens.

**Adding a creature, mount or outfit?** No programming needed: open the
[Asset Helper](https://rockyjlaro.github.io/tools/asset-helper.html), choose your sprite
sheet, check the preview, and upload the two things it gives you (the sprite file and a
small block for `js/outfitter-new-assets.js`). Step-by-step guide:
[docs/MAINTAINING.md](docs/MAINTAINING.md).

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
| `npm run validate` | Checks every name, rule, new-item block and sprite file (missing files, typos, broken images, wrong sheet sizes). Changes nothing. | ~5 s |
| `npm run test:unit` | Tests the checker, the shared asset rules and `tools/add-asset.js`. | ~10 s |
| `npm run test:e2e` | Opens the Outfitter and the Asset Helper in a real (headless) browser on desktop and phone sizes and tries every feature. | ~1.5 min |
| `npm test` | All of the above. | ~2 min |

The same checks are set up to run on GitHub for every push (`.github/workflows/checks.yml`).

## Project layout

```
index.html                 the page
css/page.css               page frame (header, footer)
css/outfitter.css          the Outfitter's look, including the phone/tablet layout
js/outfitter-new-assets.js <- NEW creatures / mounts / outfits, one block each (add here)
js/outfitter-assets.js     all published items and their sprite rules (fixes only)
js/outfitter-settings.js   <- small adjustable settings (safe to edit)
js/outfitter-asset-rules.js  rules shared by the Outfitter, Asset Helper and checker
js/outfitter.js            program logic
js/vendor/                 jQuery 3.7.0 (third-party, do not edit)
base64/Creature|Female|Male|Mount|Other/   one sprite sheet per .txt file
images/                    loading / error images and interface images (images/ui/)
tools/asset-helper.html    Asset Helper page: check, preview and prepare a new item
tools/add-asset.js         add a new item in one command (node tools/add-asset.js --help)
tools/validate-assets.js   asset checker (npm run validate)
tools/sprite-file.js       convert PNG <-> sprite .txt file
tools/serve.js             local web server (npm start)
tests/                     automated tests (unit + browser)
docs/MAINTAINING.md        maintenance guide
```

`Vocab.txt` is unrelated to the Outfitter.

## Keyboard

After picking an outfit, mount or creature (in a list or with the arrow buttons under
the preview), the **Left / Right** arrow keys step to the previous / next item of that
list; in the list itself **Up / Down** work too. A search filter is respected. Tab moves
between all controls; in the colour palette the arrow keys pick colours.

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
