# Maintaining the Outfitter

This guide is for people who are comfortable with a computer but are not
programmers. It explains how to add creatures, mounts and outfits **without
editing any program code**, how to check them, and how to publish them.

Contents:

1. [The short version](#1-the-short-version)
2. [Where is my change? (preview, saved, published)](#2-where-is-my-change-preview-saved-published)
3. [Prepare the sprite sheet](#3-prepare-the-sprite-sheet)
4. [Add an item on the GitHub website (nothing to install)](#4-add-an-item-on-the-github-website-nothing-to-install)
5. [Add an item on your own computer](#5-add-an-item-on-your-own-computer)
6. [The block in js/outfitter-new-assets.js](#6-the-block-in-jsoutfitter-new-assetsjs)
7. [Check your work](#7-check-your-work)
8. [Undo a mistake](#8-undo-a-mistake)
9. [Troubleshooting](#9-troubleshooting)
10. [Which files to edit](#10-which-files-to-edit)
11. [Advanced: js/outfitter-assets.js and developer notes](#11-advanced-jsoutfitter-assetsjs-and-developer-notes)

---

## 1. The short version

Every new creature, mount or outfit needs exactly two things:

1. its **sprite file** (the picture) in the right `base64/<Folder>/` folder, and
2. a small **block** of settings at the end of `js/outfitter-new-assets.js`.

The **Asset Helper** page makes both for you and checks them:
**https://rockyjlaro.github.io/tools/asset-helper.html**
(or `http://localhost:8080/tools/asset-helper.html` on your computer, see section 5).

1. Prepare a PNG sprite sheet (section 3).
2. Open the Asset Helper. Choose what you are adding, type the name, choose the PNG.
3. Read the checks in step 5 of the page. Fix every line marked "Problem".
4. Press **Show preview** and look at your item in the Outfitter (try walking,
   addons, colours, female).
5. Download the sprite file(s) and copy the block (step 6 of the page).
6. Upload the file(s) and paste the block on GitHub (section 4).
7. After 1-2 minutes open the live Outfitter, find your item and press
   **Check new items** at the bottom of the Asset Helper.

You never edit `js/outfitter.js` or `js/outfitter-assets.js` for this.

## 2. Where is my change? (preview, saved, published)

A change goes through these stages. Only the last one is visible to everybody.

| Stage | Where it is | Who sees it | Lost when ... |
| --- | --- | --- | --- |
| **Preview** | Only inside the Asset Helper page | Only you | you reload or close the page |
| **Downloaded** | The `.txt` file in your Downloads folder, the block in your clipboard | Only you | you delete them |
| **In your copy of the project** | Files in your local project folder (section 5) | Only you | you delete them; not online yet |
| **Committed to a branch / pull request** | In the GitHub repository, but not on `main` | People who look at the repository | - (but **not live** until merged into `main`) |
| **Published** | Committed to the `main` branch on GitHub | Everyone, on https://rockyjlaro.github.io about 1-2 minutes later | - |

The Asset Helper never saves or publishes anything by itself. A web page is not
allowed to write into a GitHub repository; you upload the files yourself.

## 3. Prepare the sprite sheet

A sprite sheet is **one PNG image** made of **64 x 64 pixel frames**.

- **Columns** are the four directions, always in this order:
  **North, East, South, West**.
- **Rows** are the animation frames: first the standing frame(s), then the walking
  frames. A normal sheet has **1 standing + 8 walking = 9 rows**.
- Pure magenta (`#FF00FF`) counts as transparent.
- Only **PNG** is accepted (not JPG, GIF or WebP).

| What | Width | Rows for each animation frame |
| --- | --- | --- |
| Creature / mount | 256 px (4 directions) | 1 |
| Creature / mount that can be recoloured | 512 px (each direction followed by its colour mask) | 1 |
| Creature with addons | 256 or 512 px | base row, then addon 1 row, then addon 2 row (if it has one) |
| Player outfit | 512 px (each direction followed by its colour mask) | 6: base, addon 1, addon 2, then the same three while riding |
| Outfit without addons / without riding | 512 px | 3 without addons; 3 without riding rows; 1 without both |

Colour masks use pure colours to mark the parts that can be recoloured:
yellow = Head, red = Primary, green = Secondary, blue = Detail.

So a normal creature sheet is **256 x 576 px** (9 rows x 64 px) and a normal
player outfit sheet is **512 x 3456 px** (9 frames x 6 rows x 64 px).

Player outfits need **two** sheets: male and female (unless the outfit has no
female version).

The Asset Helper reads the size of your sheet and fills in the frame counts,
colour masks, addons and riding rows it can work out. **Always check them in the
preview** - a wrong guess shows as blank or jumping frames.

## 4. Add an item on the GitHub website (nothing to install)

You need a GitHub account with write access to the repository.

### 4.1 Prepare it in the Asset Helper

1. Open https://rockyjlaro.github.io/tools/asset-helper.html.
2. **Step 1:** choose *Creature*, *Mount*, *Player outfit* or *Other outfit*
   (NPC / monster outfits; IDs 100-199, there are only a few free places).
3. **Step 2:** type the name as on TibiaWiki, e.g. `Example Creature`. Spaces become
   underscores (`Example_Creature`); capital letters matter. The page shows the file
   name it will use.
4. **Step 3:** choose the PNG sheet (for a player outfit: male sheet, and the female
   sheet if it has a female version). An existing `.txt` sprite file works too.
5. **Step 4:** check the settings the page filled in (see the table in section 6).
6. **Step 5:** read the checks:
   - **OK** - fine.
   - **Note** - works, but have a look (for example: a creature with the same name
     exists as a mount, or the sheet has more rows than are used).
   - **Problem** - must be fixed; the save step stays hidden until then.
7. Press **Show preview**. The real Outfitter opens inside the page with your item
   selected and animated. Try the addons, the female version, colours and a mount.
   Nobody else sees this preview.

### 4.2 Upload it

8. **Step 6a:** press the download button(s). You get `<Name>.txt` (a player outfit:
   one male and one female file, both called `<Name>.txt` - the buttons say which is
   which). If your browser renamed a file to `<Name> (1).txt`, rename it back.
9. Click the folder link shown in step 6c (for example `base64/Creature`), then
   **Add file -> Upload files**, drop the file, and click **Commit changes**.
   For a player outfit, upload the male file into `base64/Male` and the female
   file into `base64/Female`.
   - **Upload the sprite file(s) first.** If the block is published before its file,
     the item shows an error picture until the file arrives.
   - The Asset Helper warns you if a file with that name already exists on the site.
     **GitHub replaces an existing file without asking**, so stop and choose another
     name if you see that warning and the file is not yours.
10. **Step 6b:** press **Copy block**.
11. Open `js/outfitter-new-assets.js` with the link in step 6c (pencil icon = edit).
    Scroll to the end. Paste the block on a new line **just above the last line
    `];`**. It should look like this (the `id` is the one the Asset Helper gave you):

    ```js
    window.OutfiterNewAssets = [
        // ---- add new blocks below this line ----

        {
            type: 'creature',
            id: 788,
            name: 'Example_Creature',
        },
    ];
    ```

12. Click **Commit changes**. Write a short message, e.g. "Add Example Creature".

### 4.3 Check that it arrived

13. Wait 1-2 minutes (the repository's **Actions** tab shows "pages build and
    deployment" while the site updates).
14. Open the link from step 6c, reload with **Ctrl+F5**, and search for the item in
    its list.
15. Open the Asset Helper on the live site and press **Check new items**. It must say
    "No problems found."

If something is wrong, the rest of the Outfitter keeps working: a broken block is
skipped and a short notice above the Outfitter names the problem. See section 8.

**Two people adding items at the same time?** Both may get the same ID. The second
one is then skipped with a notice ("uses ID 788, which already belongs to ...").
Change the `id` of the item that is not working yet to the next free number shown in
the notice (it was never shown on the site, so changing it is safe).

## 5. Add an item on your own computer

### 5.1 One-time setup

1. Install **Node.js** (the "LTS" version) from https://nodejs.org.
2. Get a copy of the project, for example with **GitHub Desktop**
   (https://desktop.github.com): *File -> Clone repository*.
3. Open a terminal in the project folder (Windows: right-click the folder in
   Explorer -> "Open in Terminal") and run `npm install` once.

### 5.2 Preview the site locally

```
npm start
```

Then open http://localhost:8080 (the Outfitter) or
http://localhost:8080/tools/asset-helper.html (the Asset Helper). Stop with Ctrl+C.
No Node.js? `python3 -m http.server 8080` works too. Opening `index.html` by
double-clicking does **not** work (browsers block loading the sprite files).

### 5.3 Add the item

**Either** use the Asset Helper (section 4.1) on `localhost`, save the downloaded
file(s) into `base64/<Folder>/` and paste the block into `js/outfitter-new-assets.js`
with a text editor.

**Or** use one command, which writes the sprite file(s), adds the block and runs the
full checker - and undoes everything again if anything is wrong:

```
node tools/add-asset.js --type creature --name "Example Creature" --image path/to/sheet.png
node tools/add-asset.js --type mount --name Example_Mount --image path/to/mount.png
node tools/add-asset.js --type outfit --name Example_Outfit --image male.png --female-image female.png --female yes
```

Settings you leave out are worked out from the sheet size and printed. Useful
options: `--standing N --walking N` (frame counts), `--colourisable`,
`--addons none|addon_1|both|one_at_a_time`, `--female yes|no`, `--can-ride yes|no`,
`--female-name NAME`, `--note "where the sprite comes from"`, and `--dry-run`
(only check, write nothing). `node tools/add-asset.js --help` lists them all.
It never overwrites an existing sprite file.

### 5.4 Check and publish

1. `npm run validate` - must end with `0 error(s)` and `All good.`
2. Look at the item at http://localhost:8080 (the command prints the link).
3. Publish: in GitHub Desktop write a summary ("Add Example Creature"), click
   **Commit to main**, then **Push origin**. Command line:
   `git add -A`, `git commit -m "Add Example Creature"`, `git push`.

Safer for bigger changes: push to a separate branch and open a pull request. The
automatic checks run on it and the site only changes when you merge it.

## 6. The block in js/outfitter-new-assets.js

Each new item is one block. Text goes in `'single quotes'`; `true`, `false` and
numbers have no quotes; every block ends with `},`. The top of
`js/outfitter-new-assets.js` repeats this table.

### Templates (replace the example values)

Creature:

```js
    {
        type: 'creature',
        id: 788,                    // the next free creature ID
        name: 'Example_Creature',   // file: base64/Creature/Example_Creature.txt
    },
```

Mount:

```js
    {
        type: 'mount',
        id: 263,                    // the next free mount ID
        name: 'Example_Mount',      // file: base64/Mount/Example_Mount.txt
        colourisable: true,         // only if the sheet is 512 px wide with colour masks
    },
```

Player outfit:

```js
    {
        type: 'outfit',
        id: 236,                    // the next free outfit ID (200 or more)
        name: 'Example_Outfit',     // files: base64/Male/Example_Outfit.txt + base64/Female/Example_Outfit.txt
        female: true,
        addons: 'both',
        can_ride_mount: true,
    },
```

The `// ...` comments are optional. The IDs above are examples only - the Asset
Helper, `tools/add-asset.js` and the checker all tell you the next free ID.

### Fields

| Field | Needed for | Values | Default |
| --- | --- | --- | --- |
| `type` | all, **required** | `'creature'`, `'mount'`, `'outfit'` (player outfit, IDs 200+), `'other_outfit'` (NPC / monster outfit, IDs 100-199) | - |
| `id` | all, **required** | the next free number of that type | - |
| `name` | all, **required** | file name without `.txt`; letters, digits and `_ ( ) ' -`, no spaces | - |
| `standing_frames` | optional | rows of standing animation, `0` or more | `1` |
| `walking_frames` | optional | rows of walking animation | `8` |
| `colourisable` | creature, mount | `true` if the sheet is 512 px wide with colour masks | `false` |
| `addons` | creature: optional | `'none'`, `'addon_1'`, `'both'`, `'one_at_a_time'` | `'none'` |
| `addons` | outfits: **required** | `'both'`, `'none'`, `'one_at_a_time'` | - |
| `female` | outfits: **required** | `true` (has a female sprite) or `false` | - |
| `can_ride_mount` | outfits: **required** | `true` (sheet has riding rows) or `false` | - |
| `female_name` | outfits, optional | female display name, e.g. `'Example_Outfitwoman'` | same name |
| `separate_female_file` | other_outfit, optional | `true` if the female sheet is `<Name>_Female.txt` | `false` |
| `standing_delays_ms` | optional | one delay per standing frame, e.g. `[500, 100, 100]` | normal speed |
| `standing_delay_ms`, `walking_delay_ms` | creature, optional | milliseconds per frame, e.g. `100` | normal speed |
| `walking_delays_ms` | creature, optional | one delay per walking frame | normal speed |
| `note` | optional | any text, e.g. where the sprite comes from (not shown in the Outfitter) | - |

### Rules

- **IDs follow each other.** The first new creature gets the next number after the
  last creature in `js/outfitter-assets.js`, the next one the number after that, and
  so on. No gaps, no repeats.
- **IDs are permanent.** They are used in shared links (`?cr=788`) and by the
  TibiaWiki `{{Outfitter}}` template. Never change or reuse the ID of an item that
  has been published.
- **Names are unique within a type** (capital letters do not count: `rat` = `Rat`).
  A mount may have the same name as a creature; TibiaWiki usually adds `_(Mount)`
  to the mount, e.g. `Gryphon_(Mount)`.
- **The name must match the sprite file exactly**, including capital letters
  (GitHub Pages is case-sensitive).
- **Add new blocks at the end**, after the last `},`.

## 7. Check your work

Three ways, all using the same rules as the Outfitter itself
(`js/outfitter-asset-rules.js`):

| Where | How | Checks |
| --- | --- | --- |
| Asset Helper, step 5 | automatic while you fill in the page | the new item: name, ID, sheet size, settings |
| Asset Helper, "Check the collection" | **Check new items** (fast) or **Check every sprite file** (downloads about 120 MB) | what is on the site you opened: all new items, or every file |
| Your computer | `npm run validate` | every list, rule, block and sprite file (changes nothing) |

**Problems** (errors) are things users would see broken: a missing or unreadable
file, a sheet that is too small for its settings, a duplicate name or ID. **Notes**
(warnings) still work but deserve a look, e.g. a sheet with more rows than the
settings use.

Typical messages and what to do:

| Message | What to do |
| --- | --- |
| `uses ID 788, which already belongs to creature '...'` | Use the next free ID the message names. |
| `uses ID 790 but the next free ID is 789` | IDs must follow each other. If a block before it was skipped, fix that one first. |
| `has the same name as existing creature '...'` | Pick another name (TibiaWiki often adds `_(Mount)` etc.). |
| `name contains a space` | Use underscores: `Example_Creature`. |
| `is missing the required field 'female'` | Outfits need `female`, `addons` and `can_ride_mount`. |
| `has the field 'colorisable', which is not used ...` | Spelling mistake in a field name; the message lists the allowed ones. |
| `colourisable must be true or false (without quotes)` | Write `true`, not `'true'`. |
| `base64/Creature/X.txt is missing` | Upload the sprite file, or fix the spelling of the name. |
| `the sheet has 2 rows of 64px but the rules need 9` | Frame counts or addon settings do not fit the sheet; missing rows show as blank frames. |
| `the sheet is 256px wide but should be 512px` | Colour masks / outfit sheets are 512 px wide; plain creature and mount sheets 256 px. |
| `This file is not a PNG image` | Save the sheet as PNG. |
| `js/outfitter-new-assets.js did not load` | A typo (missing comma or quote) in that file. `npm run validate` names the line. |

Before bigger changes also run the full test suite: `npm test` (section 11).

## 8. Undo a mistake

**Nothing is lost by a broken block.** The Outfitter skips it, shows a short notice
above the page and keeps working for all other items. Fix the block (or remove it)
and commit again.

- **Wrong settings in a new block** (blank frames, wrong addons): edit the block in
  `js/outfitter-new-assets.js` and commit. Changing settings is safe; the ID stays.
- **Wrong picture:** upload the corrected `.txt` file with the same name into the same
  folder (GitHub replaces it) and commit.
- **The item should not have been added at all, and it is the last one of its type:**
  remove its block and its sprite file. Only do this soon after publishing - once
  people use the link (`?cr=788`), that ID will show the next item added instead.
- **Undo a whole commit:**
  - pull request: open the merged pull request on GitHub and click **Revert**, then
    merge the pull request it creates;
  - GitHub Desktop: History tab -> right-click the commit -> **Revert changes in
    commit** -> Push origin;
  - command line: `git log --oneline`, then `git revert <commit-id>` and `git push`.

  Reverting adds a new commit that undoes the old one; nothing is deleted from the
  history, so you can always go back.

Never delete or reorder items in the middle of a list - that changes the IDs of all
items after it and breaks existing links.

## 9. Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| A notice above the Outfitter says "newly added item could not be added" | A block in `js/outfitter-new-assets.js` has a problem; the notice (or the browser console, F12, or the Asset Helper's **Check new items**) says which. Everything else still works. |
| Page shows "The Outfitter could not start because js/outfitter-assets.js did not load" | Syntax mistake in `js/outfitter-assets.js`. Run `npm run validate` to get the line number, or revert the last commit. |
| The item shows the error picture and "could not be loaded" | Its sprite file is missing, misspelled (capital letters!) or damaged. |
| Some animation frames are blank or jump | Frame counts or addon settings do not fit the sheet. Check the preview and the Asset Helper's step 5. |
| The Asset Helper says "opened directly from disk" | Open it from the website or from `npm start`, not by double-clicking the file. |
| The item is not on the live site | Wait 1-2 minutes, check the **Actions** tab, reload with Ctrl+F5. Was it committed to `main` (not only to a branch)? |
| `npm start` says the port is already used | Use another port: `npm start -- 8081`. |
| `npm` is not recognised | Node.js is not installed, or the terminal was opened before installing it - open a new one. |
| `tools/add-asset.js` says "Not added: ..." | Nothing was changed. The message says why (name taken, sheet size, existing file ...). |
| Red cross next to a commit on GitHub | Open it to see which check failed; run the same command locally (`npm run validate` or `npm test`). |

## 10. Which files to edit

| File / folder | What it is | Edit? |
| --- | --- | --- |
| `js/outfitter-new-assets.js` | **New** creatures, mounts and outfits (one block each) | **Yes** - add new items here |
| `base64/<Folder>/<Name>.txt` | One sprite sheet per file (a PNG image stored as text) | **Add** new files; replace only to fix a picture |
| `tools/asset-helper.html` | The Asset Helper page | Use it; do not edit |
| `js/outfitter-settings.js` | Zoom steps, image paths, download retries, file comment | Yes, safe |
| `js/outfitter-assets.js` | All published items and their sprite rules | Only to fix an existing item (section 11) |
| `css/page.css`, `css/outfitter.css` | Appearance | Only if you know CSS |
| `js/outfitter.js`, `js/outfitter-asset-rules.js` | Program logic and the shared checking rules | Developers only |
| `js/vendor/jquery-3.7.0.min.js` | Third-party library | **Never** |
| `images/ui/` | Interface images (arrows, checkboxes, floor, name font ...) | Replace only with an image of the same size |
| `tools/`, `tests/`, `.github/` | Checker, helper tools, tests, automatic checks on GitHub | Developers only |

Sprite folders: `Creature`, `Mount`, `Male` (player outfits), `Female` (female
versions of player outfits), `Other` (other outfits, IDs 100-199).

Created automatically, never commit them (they are listed in `.gitignore`):
`node_modules/`, `test-results/`, `playwright-report/`.

The extra `.txt` files in `base64/Mount` and `base64/Other` that no list uses (for
example `Outfit_1.txt`, `Rock_3.txt`, old `#REDIRECT` pages) are kept on purpose.
They do no harm. `Template.txt` is an empty example file. `Vocab.txt` in the main
folder is unrelated to the Outfitter.

## 11. Advanced: js/outfitter-assets.js and developer notes

### Fixing an existing item

`js/outfitter-assets.js` holds every published item. Each list is an array: an
item's position is its ID (count from 0; the `//0`, `//5` ... comments help). The
rule tables below the lists change how a sheet is read:

| Table | Use when an outfit / mount / creature ... |
| --- | --- |
| `outfiter_sprites_standing` / `_walking` | outfit has other frame counts than 1 + 8 |
| `outfiter_sprites_mount_standing` / `_walking` | mount has other frame counts |
| `outfiter_sprites_creature_standing` / `_walking`, `outfiter_creature_props` | creature has other frame counts, colour masks, addons or speeds |
| `outfiter_mount_colourisable` | mount sheet has colour masks |
| `outfiter_u_names` | outfit has no female version |
| `outfiter_a_names` | outfit has no addons |
| `outfiter_o_names` | outfit can wear only one addon at a time |
| `outfiter_m_names`, `outfiter_no_ride_names` | outfit cannot ride / sheet has no riding rows |
| `outfiter_f_suffix_inames`, `outfiter_f_names` | female file is `<Name>_Female.txt` / female version has another name |

Copy the quotes and commas of the neighbouring lines exactly, then run
`npm run validate`. A syntax mistake in this file stops the whole Outfitter (it shows
a message instead), so always check before publishing.

Items can stay in `js/outfitter-new-assets.js` for good - there is no need to move
them into `js/outfitter-assets.js`. If you do move one, add its name to the end of
the right list and its settings to the tables above, delete its block, and run
`npm run validate` - the ID and links must stay the same.

### Tests

Install once: `npm install` and `npx playwright install chromium`. Then:

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks every name, rule, block and sprite file. Changes nothing. |
| `npm run test:unit` | Tests the checker, the shared rules and `tools/add-asset.js`. |
| `npm run test:e2e` | Opens the Outfitter and the Asset Helper in a headless browser (desktop and phone sizes) and tries every feature, including adding a creature, a mount and an outfit. |
| `npm test` | All of the above. |

The same checks run on GitHub for every push and pull request
(`.github/workflows/checks.yml`).

### For developers

- `js/outfitter-asset-rules.js` is shared by the Outfitter, the Asset Helper,
  `tools/validate-assets.js` and `tools/add-asset.js`: how a block becomes list
  entries (`mergeNewAssets`), the field checks, the expected sheet size
  (`expectedSheetSize`) and the sprite-file format. Change the rules there only, and
  keep `js/outfitter.js`'s sheet reading in step with `expectedSheetSize`.
- Load order in `index.html`: settings, `outfitter-assets.js`,
  `outfitter-new-assets.js`, `outfitter-asset-rules.js`, then `outfitter.js`.
- The Asset Helper's preview loads `index.html?preview` in a frame; the Outfitter
  then takes the unsaved item and its sprite data from `window.parent.OutfiterPreview`.
  Nothing is stored.
- The variable names in `js/outfitter-assets.js` (`outfiter_mount_names`, ...) are
  kept identical to TibiaWiki's `MediaWiki:Outfiter.js`, so data can be copied
  between the two.
- The narrow-screen layout starts below 1181 px. The breakpoint appears in
  `css/outfitter.css`, `css/page.css` and `js/outfitter.js` (`outfiter_compact_query`).
- Wide screens ("WIDE SCREENS" in `css/outfitter.css`): the Outfitter fills the window
  height using the fixed header / footer heights set in `css/page.css`
  (`--page-header-h`, `--page-footer-h`); change those together with the header or
  footer. Very large screens scale the Outfitter up (`--outfiter-zoom`). The preview
  opens bigger when there is room, up to `auto_zoom_max` in `js/outfitter-settings.js`.
- Link and template parameters are part of the public interface: changing defaults or
  option names breaks existing links and wiki pages.
- `.nojekyll` makes GitHub Pages publish the files as they are, without Jekyll, so
  text like `{%` in a Markdown file can never stop the site from updating.
