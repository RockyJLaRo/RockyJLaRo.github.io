// New items added through js/outfitter-new-assets.js: a creature, a mount and an
// outfit go through the whole life cycle (listed, searchable, rendered, shareable,
// survive a refresh), and a broken block only hides itself.
//
// The test items are copies of existing sprites under made-up names (Test_...).
// They are served by the test itself, so the real project files are not changed.
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openOutfitter, readState, pickFromList, waitForRender, waitForAddressBar } = require('./helpers');
const rules = require('../../js/outfitter-asset-rules.js');
const { loadAssets } = require('../../tools/validate-assets.js');

const ROOT = path.resolve(__dirname, '../..');

/** Next free ids, so the test keeps working after real items are added. */
function nextIds() {
    const loaded = loadAssets(ROOT);
    rules.mergeNewAssets(loaded.A, loaded.newEntries);
    return {
        creature: rules.nextFreeId(loaded.A, 'creature'),
        mount: rules.nextFreeId(loaded.A, 'mount'),
        outfit: rules.nextFreeId(loaded.A, 'outfit')
    };
}

/** An existing sprite file renamed to a new item (the <pre id> must match the name). */
function copySprite(folder, from, to) {
    const text = fs.readFileSync(path.join(ROOT, 'base64', folder, from + '.txt'), 'utf8');
    const sprite = rules.parseSpriteFile(text, from);
    if (sprite.error) { throw new Error(sprite.error); }
    return rules.makeSpriteFile(to, sprite.base64);
}

/** Serve js/outfitter-new-assets.js with the given blocks (and the real items in it). */
async function serveNewAssets(page, entries, extraSource = '') {
    const real = loadAssets(ROOT).newEntries || [];
    const all = real.concat(entries);
    const body = 'window.OutfiterNewAssets = [\n' + all.map((e) => rules.formatEntry(e)).join('\n') + '\n' + extraSource + '];\n';
    await page.route('**/js/outfitter-new-assets.js', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body }));
}

async function serveFiles(page, files) {
    for (const [file, body] of Object.entries(files)) {
        await page.route('**/base64/' + file, (route) => route.fulfill({ status: 200, contentType: 'text/plain', body }));
    }
}

/** Number of non-transparent pixels in the preview. */
function visiblePixels(page) {
    return page.evaluate(async () => {
        const img = document.querySelector('.body_main');
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let n = 0;
        for (let i = 3; i < data.length; i += 4) { if (data[i] !== 0) { n++; } }
        return n;
    });
}

async function search(page, list, text) {
    await page.locator(`.radio_${list} .omsearch`).fill(text);
}

test.describe('new items from js/outfitter-new-assets.js', () => {
    const ids = nextIds();
    const entries = [
        { type: 'creature', id: ids.creature, name: 'Test_Creature', note: 'copy of Rat for this test' },
        { type: 'mount', id: ids.mount, name: 'Test_Mount', colourisable: true },
        { type: 'outfit', id: ids.outfit, name: 'Test_Outfit', female: true, addons: 'both', can_ride_mount: true }
    ];

    test.beforeEach(async ({ page }) => {
        await serveNewAssets(page, entries);
        await serveFiles(page, {
            'Creature/Test_Creature.txt': copySprite('Creature', 'Rat', 'Test_Creature'),
            'Mount/Test_Mount.txt': copySprite('Mount', 'Krakoloss', 'Test_Mount'),
            'Male/Test_Outfit.txt': copySprite('Male', 'Knight', 'Test_Outfit'),
            'Female/Test_Outfit.txt': copySprite('Female', 'Knight', 'Test_Outfit')
        });
    });

    test('a new creature is listed, found by search, rendered and shareable', async ({ page }) => {
        const errors = await openOutfitter(page);
        await expect(page.locator('.outfiter_notice')).toHaveCount(0);
        await search(page, 'creatures', 'test creature');
        await pickFromList(page, 'creatures', 'Test Creature');
        await waitForRender(page);
        const state = await readState(page);
        expect(state.creature).toBe('Test Creature');
        expect(state.link).toBe(`/?o=105&cr=${ids.creature}`);
        expect(await visiblePixels(page)).toBeGreaterThan(50);
        // the share link opens the same creature after a refresh
        await waitForAddressBar(page);
        await page.reload();
        await waitForRender(page);
        expect((await readState(page)).creature).toBe('Test Creature');
        expect(errors).toEqual([]);
    });

    test('a new outfit (with female version) rides a new colourisable mount', async ({ page }) => {
        const errors = await openOutfitter(page);
        await search(page, 'outfits', 'test outfit');
        await pickFromList(page, 'outfits', 'Test Outfit');
        await waitForRender(page);
        await search(page, 'mounts', 'test mount');
        await pickFromList(page, 'mounts', 'Test Mount');
        await waitForRender(page);
        await page.locator('label', { has: page.locator('.female') }).click();
        await page.locator('label', { has: page.locator('.addon1') }).click();
        await waitForRender(page);
        let state = await readState(page);
        expect(state.outfit).toBe('Test Outfit');
        expect(state.mount).toBe('Test Mount');
        expect(state.female).toBe(true);
        expect(state.addon1).toBe(true);
        expect(state.link).toBe(`/?o=${ids.outfit}&a1&fm&m=${ids.mount}`);
        expect(await visiblePixels(page)).toBeGreaterThan(500);

        // the mount has colour masks: picking a mount colour changes the picture
        const before = await page.locator('.body_main').getAttribute('src');
        await page.locator('label.colourise_item', { has: page.locator('[value="mount"]') }).click();
        await page.locator('.cb_2').click();
        await page.locator('.dcolor_table div').nth(90).click();
        await waitForRender(page);
        expect(await page.locator('.body_main').getAttribute('src')).not.toBe(before);
        expect((await readState(page)).link).toContain('mc2=90');

        // refresh keeps everything
        await waitForAddressBar(page);
        await page.reload();
        await waitForRender(page);
        state = await readState(page);
        expect([state.outfit, state.mount, state.female, state.addon1]).toEqual(['Test Outfit', 'Test Mount', true, true]);
        expect(errors).toEqual([]);
    });

    test('existing items are unchanged', async ({ page }) => {
        await openOutfitter(page, '?o=3&m=262');
        let state = await readState(page);
        expect([state.outfit, state.mount]).toEqual(['Knight', 'Landsailer']);
        await page.goto('/?o=105&cr=787');
        await waitForRender(page);
        state = await readState(page);
        expect(state.creature).toBe('Tremendous Tyrant');
        await page.goto('/?o=235');
        await waitForRender(page);
        expect((await readState(page)).outfit).toBe('Captains');
    });
});

test.describe('mistakes in js/outfitter-new-assets.js only hide the broken item', () => {
    test('a block with problems is skipped with a notice; the good block still works', async ({ page }) => {
        const ids = nextIds();
        await serveNewAssets(page, [
            { type: 'creature', id: 5, name: 'Test_Taken_Id' }, // id already used
            { type: 'mount', id: ids.mount, name: 'Test_Mount' }
        ]);
        await serveFiles(page, { 'Mount/Test_Mount.txt': copySprite('Mount', 'Widow_Queen', 'Test_Mount') });
        const errors = await openOutfitter(page);
        await expect(page.locator('.outfiter_notice')).toContainText('could not be added');
        await expect(page.locator('.outfiter_notice')).toContainText('Test_Taken_Id');
        // the id was not given to the broken block: creature 5 is still the original one
        await page.goto(`/?o=105&cr=5`);
        await waitForRender(page);
        expect((await readState(page)).creature).toBe('Orc Shaman');
        await page.goto(`/?m=${ids.mount}`);
        await waitForRender(page);
        expect((await readState(page)).mount).toBe('Test Mount');
        expect(errors).toEqual([]);
    });

    test('a typo (syntax error) shows a notice and the Outfitter still works', async ({ page }) => {
        await page.route('**/js/outfitter-new-assets.js', (route) => route.fulfill({
            status: 200,
            contentType: 'text/javascript',
            body: "window.OutfiterNewAssets = [\n    {\n        type: 'mount'\n        id: 300,\n    },\n];" // missing comma
        }));
        await page.goto('/?o=3');
        await waitForRender(page);
        await expect(page.locator('.outfiter_notice')).toContainText('did not load');
        expect((await readState(page)).outfit).toBe('Knight');
    });

    test('a missing sprite file shows the normal "could not be loaded" message', async ({ page }) => {
        const ids = nextIds();
        await serveNewAssets(page, [{ type: 'creature', id: ids.creature, name: 'Test_Not_Uploaded' }]);
        await page.goto(`/?o=105&cr=${ids.creature}`);
        await expect(page.locator('.outfiter_status')).toContainText('could not be loaded');
        await pickFromList(page, 'creatures', 'None');
        await waitForRender(page);
    });
});
