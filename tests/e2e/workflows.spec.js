// Functional tests for the everyday workflows of the outfitter.
'use strict';

const { test, expect } = require('@playwright/test');
const { openOutfitter, readState, pickFromList, waitForRender } = require('./helpers');

const clickLabel = (page, checkboxClass) => page.locator('label', { has: page.locator('.' + checkboxClass) }).first().click();

test('loads with the default outfit, filled lists and no errors', async ({ page }) => {
    const failed = [];
    page.on('requestfailed', (r) => failed.push(r.url()));
    page.on('response', (r) => { if (r.status() >= 400) { failed.push(r.status() + ' ' + r.url()); } });
    const errors = await openOutfitter(page);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    const state = await readState(page);
    expect(state.outfit).toBe('Citizen');
    expect(state.link).toBe('/');
    expect(await page.locator('.radio_outfits .list_el').count()).toBeGreaterThan(200);
    expect(await page.locator('.radio_mounts .list_el').count()).toBeGreaterThan(250);
    expect(await page.locator('.radio_creatures .list_el').count()).toBeGreaterThan(780);
});

test('pick outfit, mount and creature from the lists', async ({ page }) => {
    await openOutfitter(page);
    await pickFromList(page, 'outfits', 'Knight');
    await waitForRender(page);
    await pickFromList(page, 'mounts', 'War Bear');
    await waitForRender(page);
    let state = await readState(page);
    expect(state.outfit).toBe('Knight');
    expect(state.mount).toBe('War Bear');
    expect(state.link).toBe('/?o=3&m=3');

    // a creature replaces outfit + mount
    await pickFromList(page, 'creatures', 'Dragon');
    await waitForRender(page);
    state = await readState(page);
    expect(state.creature).toBe('Dragon');
    expect(state.outfit).toBe('None');
    expect(state.mount).toBe('None');

    // picking an outfit again removes the creature
    await pickFromList(page, 'outfits', 'Mage');
    await waitForRender(page);
    state = await readState(page);
    expect(state.outfit).toBe('Mage');
    expect(state.creature).toBe('None');
});

test('arrow buttons step through outfits and wrap around', async ({ page }) => {
    await openOutfitter(page, '?o=231'); // Aerial Disciple: first outfit alphabetically
    await page.locator('.outfitp').click();
    await waitForRender(page);
    expect((await readState(page)).outfit).toBe('Afflicted');
    await page.locator('.outfitm').click();
    await waitForRender(page);
    await page.locator('.outfitm').click();
    await waitForRender(page);
    const last = await page.locator('.radio_outfits .list_el .t').last().textContent();
    expect((await readState(page)).outfit).toBe(last);
});

test('addons, gender and facing update the preview and the link', async ({ page }) => {
    await openOutfitter(page, '?o=3');
    const before = await page.locator('.body_main').getAttribute('src');
    await clickLabel(page, 'addon1');
    await waitForRender(page);
    await clickLabel(page, 'female');
    await waitForRender(page);
    await page.locator('.facingp').click();
    await waitForRender(page);
    const state = await readState(page);
    expect(state.addon1).toBe(true);
    expect(state.female).toBe(true);
    expect(state.link).toBe('/?o=3&a1&fm&f=3');
    expect(await page.locator('.body_main').getAttribute('src')).not.toBe(before);
});

test('outfits without addons / female version disable those options', async ({ page }) => {
    await openOutfitter(page, '?o=55&a1&a2&fm'); // Retro Warrior: no addons
    let state = await readState(page);
    expect(state.addon1).toBe(false);
    expect(state.addon2).toBe(false);
    expect(state.link).toBe('/?o=55&fm');
    await expect(page.locator('label:has(.addon1)')).toHaveClass(/disabled/);

    await openOutfitter(page, '?o=102&fm'); // Dwarf: no female version
    state = await readState(page);
    expect(state.female).toBe(false);
    await expect(page.locator('label:has(.female)')).toHaveClass(/disabled/);

    await openOutfitter(page, '?o=20&a1&a2'); // Yalaharian: only one addon at a time
    state = await readState(page);
    expect(state.addon1 && state.addon2).toBe(false);
});

test('animation, floor, soft image, HP bar and character name render', async ({ page }) => {
    const errors = await openOutfitter(page, '?o=3');
    for (const option of ['animate', 'floor', 'soft', 'hpbar']) {
        await clickLabel(page, option);
        await waitForRender(page);
    }
    await page.locator('.charn').fill('Rocky');
    await page.locator('.charn').press('Enter');
    await waitForRender(page);
    expect((await readState(page)).link).toBe('/?o=3&s&a&h&n=Rocky&fl');
    expect(errors).toEqual([]);
});

test('colour palette changes the colours in the link', async ({ page }) => {
    await openOutfitter(page, '?o=3');
    await page.locator('.cb_2').click();
    await page.locator('.dcolor_table div').nth(40).click();
    await waitForRender(page);
    expect((await readState(page)).link).toBe('/?o=3&c2=40');
    await expect(page.locator('.dcolor_table div').nth(40)).toHaveClass(/color_table_d_sel/);
});

test('zoom buttons change the preview size; Reset View goes back to the opening size', async ({ page }) => {
    await openOutfitter(page, '?o=3');
    const img = page.locator('.body_main');
    const w1 = await img.evaluate((el) => el.width);
    await page.locator('.zoomin').click();
    expect(await img.evaluate((el) => el.width)).toBeGreaterThan(w1);
    await page.locator('.zoomout').click();
    await page.locator('.zoomout').click();
    expect(await img.evaluate((el) => el.width)).toBeLessThan(w1);
    await page.locator('.zoomreset').click();
    expect(await img.evaluate((el) => el.width)).toBe(w1);
    await expect(img).not.toHaveClass(/is-dragging/);
});

test('download a still PNG and an animated GIF', async ({ page }) => {
    await openOutfitter(page, '?o=3&a1');
    let download = page.waitForEvent('download');
    await page.locator('.download_image').click();
    expect((await download).suggestedFilename()).toBe('Outfit_Knight_Male_Addon_1.png');

    await clickLabel(page, 'animate');
    await waitForRender(page);
    download = page.waitForEvent('download');
    await page.locator('.download_image').click();
    const gif = await download;
    expect(gif.suggestedFilename()).toBe('Outfit_Knight_Male_Addon_1.gif');
    const bytes = require('fs').readFileSync(await gif.path());
    expect(bytes.subarray(0, 6).toString('latin1')).toBe('GIF89a');
});

test('advanced: APNG, 4x rotate and template code', async ({ page }) => {
    await openOutfitter(page, '?o=3&a');
    await clickLabel(page, 'show_advanced');
    await clickLabel(page, 'template_code');
    await waitForRender(page);
    await expect(page.locator('.template_code_code')).toHaveValue(/^\{\{Outfitter\|outfit=3\|animate=true\|height=\d+\|width=\d+\}\}$/);

    await page.locator('label:has(.save_format_apng)').click();
    await clickLabel(page, 'rotate4x');
    const download = page.waitForEvent('download');
    await page.locator('.download_image').click();
    const png = await download;
    expect(png.suggestedFilename()).toBe('Outfit_Knight_Male.png');
    const bytes = require('fs').readFileSync(await png.path());
    expect(bytes.includes(Buffer.from('acTL'))).toBe(true); // animated PNG chunk
    // the preview is restored after baking the four directions
    await waitForRender(page);
    expect((await readState(page)).link).toBe('/?o=3&a');
});

test('copy link button copies the share link', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openOutfitter(page, '?o=3&a1');
    await page.locator('.copy_url').click();
    await expect(page.locator('.outfiter_status')).toHaveText('Link copied to clipboard.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/\?o=3&a1$/);
});

test('random outfit and random colours keep a valid state', async ({ page }) => {
    const errors = await openOutfitter(page);
    for (let i = 0; i < 5; i++) {
        await page.locator('.random_outfit').click();
        await waitForRender(page);
        await page.locator('.colourise_random').click();
        await waitForRender(page);
    }
    expect(errors).toEqual([]);
    expect((await readState(page)).outfit).not.toBe('');
});

test('the share link reproduces the same view', async ({ page }) => {
    await openOutfitter(page, '?o=3&a1&a2&m=5&c1=20&f=1');
    const link = (await readState(page)).link;
    const src = await page.locator('.body_main').getAttribute('src');
    await openOutfitter(page, link.slice(1));
    expect((await readState(page)).link).toBe(link);
    expect(await page.locator('.body_main').getAttribute('src')).toBe(src);
});
