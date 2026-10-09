# Maintaining the Outfitter

This guide is written for people who are comfortable with a computer but are not
programmers. Follow the steps in order and run the checker before you publish.
Nothing here can break the live site until you publish (step "Publish").

Contents:

1. [Which files to edit](#1-which-files-to-edit)
2. [One-time setup](#2-one-time-setup)
3. [Preview your changes](#3-preview-your-changes)
4. [How a sprite sheet is laid out](#4-how-a-sprite-sheet-is-laid-out)
5. [Add a creature](#5-add-a-creature)
6. [Add a mount](#6-add-a-mount)
7. [Add an outfit](#7-add-an-outfit)
8. [Frame counts and other rules](#8-frame-counts-and-other-rules)
9. [Check your work](#9-check-your-work)
10. [Publish](#10-publish)
11. [Undo a bad change](#11-undo-a-bad-change)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Which files to edit

| File / folder | What it is | Edit? |
| --- | --- | --- |
| `js/outfitter-assets.js` | Lists of creatures, mounts and outfits (their names = IDs) and the rules for reading their sprite sheets | **Yes** - this is where you add things |
| `base64/<Folder>/<Name>.txt` | One sprite sheet per file (a PNG image stored as text) | **Add / replace** - use `tools/sprite-file.js` |
| `js/outfitter-settings.js` | Zoom steps, image paths, download retries, file comment | Yes, safe |
| `css/page.css`, `css/outfitter.css` | Appearance | Only if you know CSS |
| `js/outfitter.js` | Program logic | Developers only |
| `js/vendor/jquery-3.7.0.min.js` | Third-party library | **Never** |
| `images/ui/` | Interface images (arrows, checkboxes, floor, name font ...) | Replace only with an image of the same size |
| `tools/`, `tests/`, `.github/` | Checker, tests, automatic checks on GitHub | Developers only |

Created automatically, never commit them (they are listed in `.gitignore`):
`node_modules/`, `test-results/`, `playwright-report/`.

The extra `.txt` files in `base64/Mount` and `base64/Other` that no list uses (for
example `Outfit_1.txt`, `Rock_3.txt`, old `#REDIRECT` pages) are kept on purpose.
They do no harm. `Template.txt` is an empty example file.

## 2. One-time setup

1. Install **Node.js** (the "LTS" version) from https://nodejs.org.
2. Open a terminal in the project folder (on Windows: right-click the folder in
   Explorer, then "Open in Terminal").
3. Run `npm install`. This downloads the test tools into `node_modules/`.
4. Optional, only for the browser tests: `npx playwright install chromium`.

You need Git or **GitHub Desktop** (https://desktop.github.com) to publish.

## 3. Preview your changes

```
npm start
```

Then open http://localhost:8080 in your browser. Reload the page (F5) after every
change. Stop the server with Ctrl+C. No Node.js? `python3 -m http.server 8080` works too.

Useful links while testing (replace the numbers with your new IDs):

- creature with ID 788: http://localhost:8080/?cr=788&a
- mount with ID 263: http://localhost:8080/?m=263&a
- outfit with ID 236, female, both addons: http://localhost:8080/?o=236&fm&a1&a2&a

(`&a` turns on the animation, so you can see every frame.)

## 4. How a sprite sheet is laid out

A sprite sheet is one PNG image made of **64 x 64 pixel frames**.

- **Columns** are the four directions, always in this order:
  **North, East, South, West**.
- **Rows** are the animation frames: first the standing frame(s), then the walking
  frames. A normal sheet has **1 standing + 8 walking = 9 rows**.
- Pure magenta (`#FF00FF`) is treated as transparent.

| Type | Width | Rows per animation frame |
| --- | --- | --- |
| Creature / mount | 256 px (4 directions) | 1 |
| Creature / mount that can be recoloured | 512 px (each direction followed by its colour mask) | 1 |
| Creature with addons | 256 or 512 px | base row, then addon 1 row (if any), then addon 2 row (if any) |
| Outfit | 512 px (each direction followed by its colour mask) | 6: base, addon 1, addon 2, then the same three while riding |

Colour masks use pure colours to mark the paintable parts:
yellow = Head, red = Primary, green = Secondary, blue = Detail.

So a normal creature sheet is **256 x 576 px** (9 rows x 64 px) and a normal outfit
sheet is **512 x 3456 px** (9 frames x 6 rows x 64 px).

## 5. Add a creature

Example: adding "Rotworm King" from the image `Rotworm_King.png`.

1. **Pick the name.** Use the TibiaWiki page name with underscores instead of spaces:
   `Rotworm_King`. Capital letters matter.

2. **Create the sprite file** from your PNG:

   ```
   node tools/sprite-file.js import Creature Rotworm_King path/to/Rotworm_King.png
   ```

   This writes `base64/Creature/Rotworm_King.txt` and tells you how many rows the
   sheet has. (Already have a finished `.txt` file? Just copy it into
   `base64/Creature/` - its first line must be `<pre id="Rotworm_King">data:image/png;base64,...`.)

3. **Add the name to the list.** Open `js/outfitter-assets.js`, find
   `outfiter_creature_names` and add the name at the **end** of the list, before the
   closing `]`. Mind the comma after the previous name:

   ```js
               'Moonspawn_Oozecrown', 'Moonspawn_Juggernaut', 'Tremendous_Tyrant', 'Rotworm_King'
               //790
   ```

   The new creature's ID is its position in the list (count from 0, the `//785`,
   `//790` comments help): here it is **788**. Never insert in the middle or remove
   names - that would change the IDs used in existing links.

4. **Sheet not 9 rows tall?** Add its frame counts, see
   [section 8](#8-frame-counts-and-other-rules). The import command and the checker
   both tell you when this is needed.

5. Run `npm run validate` ([section 9](#9-check-your-work)), preview
   (`?cr=788&a`), then [publish](#10-publish).

## 6. Add a mount

Same as a creature, with these differences:

- folder `Mount`: `node tools/sprite-file.js import Mount Ember_Drake path/to/file.png`
- list `outfiter_mount_names` (append at the end)
- If the name is also a creature or an outfit, TibiaWiki usually adds `_(Mount)`,
  e.g. `Gryphon_(Mount)`.
- Recolourable mount (512 px wide)? Add it to `outfiter_mount_colourisable`:
  `Ember_Drake: true`.

## 7. Add an outfit

Player outfits need **two** sprite files, one per gender:

```
node tools/sprite-file.js import Male Sky_Captain path/to/Sky_Captain_Male.png
node tools/sprite-file.js import Female Sky_Captain path/to/Sky_Captain_Female.png
```

Then add the name at the end of **`outfiter_names200`** (player outfits; IDs 200 and up).
Its ID is 200 + its position in that list.

Other kinds of outfit (NPCs, monsters used as outfits) go into `outfiter_names100`
(IDs 100-199, files in `base64/Other/`). It can hold at most 100 entries.

Outfit options - add the name with `: true` to the matching list when it applies:

| List | Use when the outfit ... |
| --- | --- |
| `outfiter_u_names` | has no female version (then only one file is needed) |
| `outfiter_a_names` | has no addons (sheet has 1 row per frame instead of 3) |
| `outfiter_o_names` | can wear only one addon at a time |
| `outfiter_m_names` | cannot ride a mount |
| `outfiter_no_ride_names` | sheet has no riding rows |
| `outfiter_f_suffix_inames` | female file is called `<Name>_Female.txt` |
| `outfiter_f_names` | female version has another name, e.g. `Nobleman: 'Noblewoman'` |

## 8. Frame counts and other rules

Only list things that differ from the normal 1 standing + 8 walking frames.
Each list is `Name: number,` - copy a neighbouring line.

| What | Outfits | Mounts | Creatures |
| --- | --- | --- | --- |
| standing frames | `outfiter_sprites_standing` | `outfiter_sprites_mount_standing` | `outfiter_sprites_creature_standing` |
| walking frames | `outfiter_sprites_walking` | `outfiter_sprites_mount_walking` | `outfiter_sprites_creature_walking` |

Creatures can also use `outfiter_creature_props`, which allows more settings in one place:

```js
    Rotworm_King: {
        standing: 1, walking: 8,      // frame counts (0 standing = sheet has walking rows only)
        walking_delay: 100,           // milliseconds per frame (optional)
        colourisable: true,           // sheet is 512 px wide with colour masks
        addon1: true, addon2: false   // which addon rows exist
    },
```

**Working out the frame counts:** count the rows (sheet height / 64). For a creature
without addons, rows = standing + walking. Examples:

| Rows | Usually means |
| --- | --- |
| 9 | normal (1 + 8) - nothing to add |
| 16 | 8 standing + 8 walking -> `Name: 8` in the standing list |
| 2, 4, 6 ... | walking only -> `Name: { standing: 0, walking: 2 }` in `outfiter_creature_props` |

The checker compares every sheet with these rules and tells you exactly which number
does not fit.

## 9. Check your work

```
npm run validate
```

It ends with `0 error(s)` and `All good.` when everything is fine. Typical messages:

| Message | What to do |
| --- | --- |
| `base64/Creature/X.txt is missing` | Create the file, or fix the spelling in the list. |
| `... capital letters exactly` | Rename the file so it matches the list exactly. |
| `<pre id="..."> should be <pre id="X">` | Fix the id at the top of the `.txt` file. |
| `sheet has 2 rows ... need 9` | Frame counts are wrong - see section 8. Missing rows show as blank frames. |
| `sheet has 16 rows but the rules only use 9` (warning) | Some frames are never shown; probably a standing/walking count is missing. |
| `'X' does not match any name in the list` | Typo in a rule list - the name must be spelled exactly like in the main list. |
| `could not be read: ... outfitter-assets.js:123` | Syntax mistake (missing comma or quote) on that line. |

Before bigger changes also run the full test suite: `npm test`.

## 10. Publish

The live site is built by GitHub Pages from the **`main`** branch. Anything that reaches
`main` is online about 1-2 minutes later.

**With GitHub Desktop:** review the changed files, write a short summary (e.g.
"Add Rotworm King"), click **Commit to main**, then **Push origin**.

**With the command line:**

```
git add -A
git commit -m "Add Rotworm King"
git push
```

**Safer for bigger changes:** push to a separate branch and open a pull request on
GitHub. The automatic checks run on it, and you merge when they are green.

Afterwards open the repository's **Actions** tab: "pages build and deployment" shows
when the site has been updated. If the new sprite does not appear, reload with
Ctrl+F5 (browsers keep old files for a few minutes).

## 11. Undo a bad change

- **Change came in through a pull request:** open the merged pull request on GitHub
  and click **Revert**, then merge the pull request it creates.
- **GitHub Desktop:** History tab -> right-click the commit -> **Revert changes in
  commit** -> Push origin.
- **Command line:** find the commit with `git log --oneline`, then
  `git revert <commit-id>` and `git push`.

Reverting adds a new commit that undoes the old one, so nothing is lost and you can
try again later.

## 12. Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| Page shows "The Outfitter could not start because js/outfitter-assets.js did not load" | Syntax mistake in `js/outfitter-assets.js`. Run `npm run validate` to get the line number. |
| A sprite shows the "Error creating outfiter image" picture and a red message | Its file is missing, misspelled or broken. Run `npm run validate`. The browser console (F12) also names the file. |
| Animation flickers / some frames are empty | Frame counts do not match the sheet - see section 8, then validate. |
| Opening `index.html` by double-click only shows "loading" | Use a local server (section 3). |
| Your change is not visible online | Wait 1-2 minutes, check the Actions tab, reload with Ctrl+F5. |
| `npm start` says the port is already used | Use another port: `npm start -- 8081`. |
| `npm` is not recognised | Node.js is not installed, or the terminal was opened before installing it - open a new one. |
| Red cross next to a commit on GitHub | Open it to see which check failed; run the same command locally (`npm run validate` or `npm test`). |

### For developers

- The variable names in `js/outfitter-assets.js` (`outfiter_mount_names`, ...) are
  kept identical to TibiaWiki's `MediaWiki:Outfiter.js`, so data can be copied
  between the two.
- `tools/validate-assets.js` mirrors how `js/outfitter.js` reads sprite sheets
  (`expectedSheetSize`). Change both together.
- The narrow-screen layout starts below 1181 px. The breakpoint appears in
  `css/outfitter.css`, `css/page.css` and `js/outfitter.js` (`outfiter_compact_query`).
- Link and template parameters are part of the public interface: changing defaults or
  option names breaks existing links and wiki pages.
