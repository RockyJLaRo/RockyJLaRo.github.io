// The Asset Helper page (tools/asset-helper.html): prepare a new creature, mount and
// outfit, see the checks, preview it inside the Outfitter and get the files to upload.
// The sprites are copies of existing ones under made-up names; nothing is saved.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, expect } = require('@playwright/test');
const rules = require('../../js/outfitter-asset-rules.js');
const { loadAssets } = require('../../tools/validate-assets.js');
const { makePng } = require('../fixtures');

const ROOT = path.resolve(__dirname, '../..');

/** PNG bytes of an existing sprite sheet (to use as the "new" sheet). */
function pngOf(folder, name) {
    const sprite = rules.parseSpriteFile(fs.readFileSync(path.join(ROOT, 'base64', folder, name + '.txt'), 'utf8'), name);
    return Buffer.from(sprite.base64, 'base64');
}

function nextId(type) {
    const loaded = loadAssets(ROOT);
    rules.mergeNewAssets(loaded.A, loaded.newEntries);
    return rules.nextFreeId(loaded.A, type);
}

const png = (name, buffer) => ({ name, mimeType: 'image/png', buffer });

async function openHelper(page) {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/tools/asset-helper.html');
    await expect(page.locator('#check-results')).toBeVisible();
    return errors;
}

const results = (page) => page.locator('#check-results li');

/** The block in step 6, read back the way the browser reads js/outfitter-new-assets.js */
async function blockEntry(page) {
    const text = await page.locator('#entry-text').inputValue();
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext('window.list = [\n' + text + '\n];', sandbox);
    return JSON.parse(JSON.stringify(sandbox.window.list[0]));
}

/** Wait for the preview frame to show a finished picture; returns the frame. */
async function previewFrame(page) {
    await page.locator('#preview-button').click();
    const frame = page.frameLocator('#preview-frame');
    await expect(frame.locator('.body_main')).toHaveAttribute('src', /^data:/, { timeout: 20000 });
    await expect(frame.locator('.outfiter')).not.toHaveClass(/outfiter_loading/);
    return frame;
}

/** Click a download button and return { name, text } of the downloaded file. */
async function download(page, buttonText) {
    const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: buttonText }).click()]);
    return { name: file.suggestedFilename(), text: fs.readFileSync(await file.path(), 'utf8') };
}

test('creature: checks, preview, sprite file and block', async ({ page }) => {
    const errors = await openHelper(page);
    const id = nextId('creature');
    await page.locator('#name').fill('Test Creature');
    await expect(page.locator('#name-result')).toContainText('base64/Creature/Test_Creature.txt');
    await page.locator('#file-main').setInputFiles(png('rat.png', pngOf('Creature', 'Rat')));
    await expect(page.locator('#guess-result')).toContainText('Filled in from the sheet');
    await expect(results(page).filter({ hasText: `creature number ${id}` })).toHaveCount(1);
    await expect(results(page).filter({ hasText: 'fits the settings' })).toHaveCount(1);
    await expect(page.locator('#check-results .error')).toHaveCount(0);

    const frame = await previewFrame(page);
    await expect(frame.locator('.creature_name')).toHaveText('Test Creature');
    await expect(frame.locator('.outfiter_notice')).toHaveCount(0);

    const file = await download(page, 'Download Test_Creature.txt');
    expect(file.name).toBe('Test_Creature.txt');
    const sprite = rules.parseSpriteFile(file.text, 'Test_Creature');
    expect(sprite.error).toBeUndefined();
    expect(sprite.base64).toBe(pngOf('Creature', 'Rat').toString('base64'));
    expect(await blockEntry(page)).toEqual({ type: 'creature', id, name: 'Test_Creature' });
    await expect(page.locator('#steps-web a').first()).toHaveAttribute('href', /\/tree\/main\/base64\/Creature$/);
    await expect(page.locator('#steps-local')).toContainText('node tools/add-asset.js --type creature --name Test_Creature');
    expect(errors).toEqual([]);
});

test('mount: colour masks are detected and the preview can recolour it', async ({ page }) => {
    await openHelper(page);
    const id = nextId('mount');
    await page.locator('input[name="type"][value="mount"]').check();
    await page.locator('#name').fill('Test_Mount');
    await page.locator('#file-main').setInputFiles(png('mount.png', pngOf('Mount', 'Krakoloss')));
    await expect(page.locator('#colourisable')).toBeChecked();
    await expect(page.locator('#check-results .error')).toHaveCount(0);
    const frame = await previewFrame(page);
    await expect(frame.locator('.mount_name')).toHaveText('Test Mount');
    await expect(frame.locator('[name="radio_colourise"][value="mount"]')).toBeEnabled();
    expect(await blockEntry(page)).toEqual({ type: 'mount', id, name: 'Test_Mount', colourisable: true });
});

test('outfit: male and female sheets, two files, female preview', async ({ page }) => {
    await openHelper(page);
    const id = nextId('outfit');
    await page.locator('input[name="type"][value="outfit"]').check();
    await expect(page.locator('#file-main-label')).toHaveText('Male sprite sheet');
    await page.locator('#name').fill('Test Outfit');
    await page.locator('#file-main').setInputFiles(png('male.png', pngOf('Male', 'Knight')));
    // without the female sheet the outfit cannot be saved yet
    await expect(results(page).filter({ hasText: 'Choose the female sprite sheet' })).toHaveCount(1);
    await expect(page.locator('#preview-button')).toBeDisabled();
    await page.locator('#file-female').setInputFiles(png('female.png', pngOf('Female', 'Knight')));
    await expect(page.locator('#check-results .error')).toHaveCount(0);
    expect(await blockEntry(page)).toEqual({ type: 'outfit', id, name: 'Test_Outfit', female: true, addons: 'both', can_ride_mount: true });

    const frame = await previewFrame(page);
    await expect(frame.locator('.outfit_name')).toHaveText('Test Outfit');
    await frame.locator('label', { has: frame.locator('.female') }).click();
    await expect(frame.locator('.female')).toBeChecked();
    await expect(frame.locator('.outfiter')).not.toHaveClass(/outfiter_loading/);
    await expect(frame.locator('.outfiter_status')).toHaveText('');

    const male = await download(page, 'Download Test_Outfit.txt (male)');
    const female = await download(page, 'Download Test_Outfit.txt (female)');
    expect(male.name).toBe('Test_Outfit.txt');
    expect(rules.parseSpriteFile(male.text, 'Test_Outfit').base64).toBe(pngOf('Male', 'Knight').toString('base64'));
    expect(rules.parseSpriteFile(female.text, 'Test_Outfit').base64).toBe(pngOf('Female', 'Knight').toString('base64'));
    await expect(page.locator('#downloads .hint')).toHaveText(['goes into the folder base64/Male/', 'goes into the folder base64/Female/']);
});

test.describe('mistakes are explained and block saving', () => {
    async function expectBlocked(page, message) {
        await expect(results(page).filter({ hasText: message })).toHaveCount(1);
        await expect(page.locator('#preview-button')).toBeDisabled();
        await expect(page.locator('#save-steps')).toBeHidden();
    }

    test('name already used (any capital letters)', async ({ page }) => {
        await openHelper(page);
        await page.locator('#file-main').setInputFiles(png('rat.png', pngOf('Creature', 'Rat')));
        await page.locator('#name').fill('rat');
        await expectBlocked(page, "same name as existing creature 'Rat'");
        await expect(page.locator('#name-result')).toHaveClass(/error/);
    });

    test('characters that cannot be in a file name', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Bad/Name');
        await page.locator('#file-main').setInputFiles(png('rat.png', pngOf('Creature', 'Rat')));
        await expectBlocked(page, 'name may only contain');
    });

    test('a file that is not a PNG image', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Test_Creature');
        await page.locator('#file-main').setInputFiles({ name: 'sheet.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
        await expectBlocked(page, 'not a PNG image');
    });

    test('a .txt file that is not a sprite file', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Test_Creature');
        await page.locator('#file-main').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
        await expectBlocked(page, 'not a sprite file');
    });

    test('a sheet with missing rows or the wrong width', async ({ page }) => {
        await openHelper(page);
        await page.locator('input[name="type"][value="outfit"]').check();
        await page.locator('#name').fill('Test_Outfit');
        await page.locator('#female').uncheck();
        await page.locator('#file-main').setInputFiles(png('small.png', makePng(512, 4 * 64)));
        await expect(page.locator('#guess-result')).toContainText('Could not fill in the settings');
        await expectBlocked(page, 'the sheet has 4 rows of 64px but the rules need');
        await page.locator('#file-main').setInputFiles(png('narrow.png', makePng(256, 9 * 6 * 64)));
        await expectBlocked(page, 'should be 512px');
    });

    test('a sheet that is not made of 64 x 64 frames', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Test_Creature');
        await page.locator('#file-main').setInputFiles(png('odd.png', makePng(250, 9 * 64)));
        await expectBlocked(page, 'not a multiple of 64px');
    });

    test('creature addon rows: changing Addons works the frame counts out again', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Test_Creature');
        await page.locator('#file-main').setInputFiles(png('addon.png', makePng(256, 2 * 9 * 64)));
        await expect(page.locator('#standing')).toHaveValue('10'); // read as 18 plain rows first
        await page.locator('#addons').selectOption('addon_1');
        await expect(page.locator('#standing')).toHaveValue('1');
        await expect(page.locator('#walking')).toHaveValue('8');
        await expect(page.locator('#check-results .error')).toHaveCount(0);
    });
});

test('"Check new items" reports the state of js/outfitter-new-assets.js', async ({ page }) => {
    await openHelper(page);
    await page.locator('#check-new').click();
    await expect(page.locator('#collection-progress')).toContainText('Done');
    await expect(page.locator('#collection-results .error')).toHaveCount(0);
    await expect(page.locator('#collection-results')).toContainText('added without problems');
});

test('a broken js/outfitter-new-assets.js is reported at the top of the page', async ({ page }) => {
    await page.route('**/js/outfitter-new-assets.js', (route) => route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: "window.OutfiterNewAssets = [ { type: 'mount', id: 1, name: 'Test_Mount' }, ];"
    }));
    await page.goto('/tools/asset-helper.html');
    await expect(page.locator('#page-problems')).toContainText('already belongs to mount');
});

test.describe('phone @mobile', () => {
    test('the helper fits the screen and the preview works', async ({ page }) => {
        await openHelper(page);
        await page.locator('#name').fill('Test Creature');
        await page.locator('#file-main').setInputFiles(png('rat.png', pngOf('Creature', 'Rat')));
        const frame = await previewFrame(page);
        await expect(frame.locator('.creature_name')).toHaveText('Test Creature');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
    });
});
