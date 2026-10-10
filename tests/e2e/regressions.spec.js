// Regression tests: each test reproduces a bug that existed before and must stay fixed.
'use strict';

const { test, expect } = require('@playwright/test');
const { openOutfitter, readState, pickFromList, waitForRender, waitForAddressBar, animationFramePixelCounts } = require('./helpers');

test.describe('broken or outdated links still open a working outfitter', () => {
    for (const query of ['?o=999', '?o=abc', '?cr=9999', '?m=999', '?c1=999', '?mc4=-1', '?f=7', '?n=%25', '?utm_source=newsletter']) {
        test(`ignores invalid value in ${query}`, async ({ page }) => {
            const errors = await openOutfitter(page, query);
            expect(errors).toEqual([]);
            const state = await readState(page);
            expect(state.outfit).toBe('Citizen');
            expect(state.mount).toBe('None');
            expect(state.creature).toBe('None');
        });
    }

    test('boolean values in the link match the checkboxes', async ({ page }) => {
        await openOutfitter(page, '?o=4&fm=1&a1=true&a2=!');
        const state = await readState(page);
        expect(state.outfit).toBe('Noblewoman');
        expect(state.female).toBe(true);
        expect(state.addon1).toBe(true);
        expect(state.addon2).toBe(false);
        expect(state.link).toBe('/?o=4&a1&fm');
    });

    test('long option names (outfit=, female) work like the short ones', async ({ page }) => {
        await openOutfitter(page, '?outfit=3&female&addon2');
        const state = await readState(page);
        expect(state.outfit).toBe('Knight');
        expect(state.female).toBe(true);
        expect(state.addon2).toBe(true);
    });

    test('a creature link clears outfit and mount (they cannot be combined)', async ({ page }) => {
        await openOutfitter(page, '?cr=5&m=3');
        const state = await readState(page);
        expect(state.creature).toBe('Orc Shaman');
        expect(state.mount).toBe('None');
        expect(state.outfit).toBe('None');
        expect(state.link).toBe('/?o=105&cr=5');
    });
});

test('a slow download cannot replace a newer selection (race condition)', async ({ page }) => {
    await openOutfitter(page);
    // make Knight's sprite file arrive late, then pick Mage before it arrives
    await page.route('**/base64/Male/Knight.txt', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.continue();
    });
    await pickFromList(page, 'outfits', 'Knight');
    await page.locator('.radio_outfits .list_el', { has: page.locator('.t', { hasText: /^Mage$/ }) }).click({ force: true });
    await waitForRender(page);
    await page.waitForTimeout(2000); // let the delayed Knight response arrive
    const mageFile = await (await page.request.get('/base64/Male/Mage.txt')).text();
    const shown = await page.locator('.main_image').getAttribute('src');
    expect(mageFile.replace(/\s+/g, '')).toContain(shown.slice(0, 500));
    expect((await readState(page)).outfit).toBe('Mage');
});

test.describe('unreadable sprite files show an error instead of loading forever', () => {
    const cases = {
        'missing file (404)': (route) => route.fulfill({ status: 404, body: 'not found' }),
        'wrong <pre id>': (route) => route.fulfill({ status: 200, body: '<pre id="Something_Else">data:image/png;base64,AAAA</pre>' }),
        'corrupt base64': (route) => route.fulfill({ status: 200, body: '<pre id="Hunter">data:image/png;base64,iVBORw0KGgoAAAA!!corrupt</pre>' })
    };
    for (const [name, handler] of Object.entries(cases)) {
        test(name, async ({ page }) => {
            await openOutfitter(page);
            await page.route('**/base64/Male/Hunter.txt', handler);
            await pickFromList(page, 'outfits', 'Hunter');
            await expect(page.locator('.outfiter_status')).toContainText('could not be loaded');
            await expect(page.locator('.body_main')).toHaveAttribute('src', /outfitter-error\.png$/);
            // the user can recover by picking something else
            await pickFromList(page, 'outfits', 'Mage');
            await waitForRender(page);
            await expect(page.locator('.outfiter_status')).toHaveText('');
            expect((await readState(page)).outfit).toBe('Mage');
        });
    }
});

test.describe('animations have no blank frames', () => {
    const creatures = {
        'Massive Fire Elemental (walking-only sheet)': '?o=105&cr=153&a',
        'Uninvited (2-row sheet)': '?o=105&cr=578&a',
        'Moonstone Excavator (addon 1 only)': '?o=105&cr=771&a',
        'Moonstone Excavator with addon 1': '?o=105&cr=771&a&a1',
        'Radiant Templar (both addons)': '?o=105&cr=779&a&a1&a2',
        'Knight outfit on a mount': '?o=3&m=5&a&a1&a2'
    };
    for (const [name, query] of Object.entries(creatures)) {
        test(name, async ({ page }) => {
            await openOutfitter(page, query);
            const counts = await animationFramePixelCounts(page);
            expect(counts.length).toBeGreaterThan(1);
            expect(counts.filter((n) => n === 0)).toEqual([]);
        });
    }
});

test('"None" is the first entry of the mount and creature lists', async ({ page }) => {
    await openOutfitter(page);
    await expect(page.locator('.radio_mounts .list_el .t').first()).toHaveText('None');
    await expect(page.locator('.radio_creatures .list_el .t').first()).toHaveText('None');
});

test.describe('search', () => {
    const visibleRows = (page, list) => page.locator(`.radio_${list} .list_el:visible`);

    test('ignores case, extra spaces, underscores and brackets', async ({ page }) => {
        await openOutfitter(page);
        const search = page.locator('.radio_outfits .omsearch');
        for (const query of ['dragon slayer', '  DRAGON   slayer ', 'dragon_slayer']) {
            await search.fill(query);
            await expect(visibleRows(page, 'outfits')).toHaveCount(1);
        }
        const mountSearch = page.locator('.radio_mounts .omsearch');
        await mountSearch.fill('black sheep (mount');
        await expect(visibleRows(page, 'mounts')).toHaveCount(1);
    });

    test('filters on paste (not only on key presses) and shows an empty state', async ({ page }) => {
        await openOutfitter(page);
        const search = page.locator('.radio_creatures .omsearch');
        await search.fill('zzzz-no-such-creature');
        await expect(visibleRows(page, 'creatures')).toHaveCount(0);
        await expect(page.locator('.radio_creatures .omsearch_empty')).toBeVisible();
        await search.fill('');
        await expect(page.locator('.radio_creatures .omsearch_empty')).toBeHidden();
        expect(await visibleRows(page, 'creatures').count()).toBeGreaterThan(700);
    });

    test('finds female outfit names', async ({ page }) => {
        await openOutfitter(page);
        await page.locator('.radio_outfits .omsearch').fill('noblewoman');
        // Nobleman and Retro Nobleman
        await expect(visibleRows(page, 'outfits')).toHaveCount(2);
    });
});

test('the page only loads files from this site (no third-party CDNs)', async ({ page, baseURL }) => {
    const external = [];
    page.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith(baseURL) && !url.startsWith('data:') && !url.startsWith('blob:')) { external.push(url); }
    });
    await openOutfitter(page, '?o=3&fl&h&n=Test&a');
    expect(external).toEqual([]);
});

test('a typo in js/outfitter-assets.js shows a clear message instead of a blank page', async ({ page }) => {
    await page.route('**/js/outfitter-assets.js', (route) => route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: "window.OutfiterAssets = { outfiter_mount_names: ['None' 'Widow_Queen'] };" // missing comma
    }));
    await page.goto('/');
    await expect(page.locator('.outfiter_fatal')).toContainText('js/outfitter-assets.js did not load');
});

test.describe('second audit', () => {
    test('colours go to the creature after the mount was the colour target', async ({ page }) => {
        await openOutfitter(page, '?o=3&m=239'); // Knight on Alpha Demonosaur (both can be coloured)
        await page.locator('label.colourise_item', { has: page.locator('[value="mount"]') }).click();
        await pickFromList(page, 'creatures', 'Cave Chimera'); // a creature with colour masks
        await waitForRender(page);
        await expect(page.locator('[name="radio_colourise"][value="outfit"]')).toBeChecked();
        const before = await page.locator('.body_main').getAttribute('src');
        await page.locator('.cb_2').click(); // Primary (this sheet has no Head colour area)
        await page.locator('.dcolor_table div').nth(60).click();
        await waitForRender(page);
        expect(await page.locator('.body_main').getAttribute('src')).not.toBe(before);
        expect((await readState(page)).link).toBe('/?o=105&c2=60&cr=571');
    });

    test('the colour palette is marked unavailable when nothing can be coloured', async ({ page }) => {
        await openOutfitter(page, '?o=105&cr=5'); // Orc Shaman has no colour masks
        await expect(page.locator('.colors_cont')).toHaveClass(/is-unavailable/);
        await expect(page.locator('.colourise_random')).toBeDisabled();
        await expect(page.locator('.dcolor_table')).toHaveAttribute('aria-disabled', 'true');
        await page.locator('.dcolor_table div').nth(60).click({ force: true }); // ignored
        expect((await readState(page)).link).toBe('/?o=105&cr=5');
    });

    test('"All Addons" download: nothing can change the outfit until all files are saved', async ({ page }) => {
        await openOutfitter(page, '?o=3&a');
        const disabledBefore = await page.locator('.outfiter input:disabled, .outfiter button:disabled').count();
        await page.locator('label', { has: page.locator('.show_advanced') }).click();
        await page.locator('label', { has: page.locator('.all_addons') }).click();
        const names = [];
        page.on('download', (d) => names.push(d.suggestedFilename()));
        await page.locator('.download_image').click();
        await expect(page.locator('.outfiter_status')).toHaveText('Preparing your download...');
        await expect(page.locator('.outfitp')).toBeDisabled();
        await expect(page.locator('.charn')).toBeDisabled();
        await page.locator('.dcolor_table div').nth(60).click(); // ignored while busy
        await expect(page.locator('.outfiter')).not.toHaveClass(/outfiter_busy/, { timeout: 60000 });
        expect(names).toEqual(['Outfit_Knight_Male.gif', 'Outfit_Knight_Male_Addon_1.gif', 'Outfit_Knight_Male_Addon_2.gif', 'Outfit_Knight_Male_Addon_3.gif']);
        expect((await readState(page)).link).toBe('/?o=3&a');
        await expect(page.locator('.outfitp')).toBeEnabled();
        // the advanced options were switched on by the test; everything else is as before
        await page.locator('label', { has: page.locator('.show_advanced') }).click();
        expect(await page.locator('.outfiter input:disabled, .outfiter button:disabled').count()).toBe(disabledBefore);
    });

    test('options that were unavailable stay unavailable after a 4x download', async ({ page }) => {
        await openOutfitter(page, '?o=105&cr=5&a'); // creature: no addons, no mount, no gender
        const state = () => page.evaluate(() => [...document.querySelectorAll('.outfiter input[type="checkbox"], .outfiter button')]
            .map((el) => el.className + ':' + el.disabled).join('|'));
        await page.locator('label', { has: page.locator('.show_advanced') }).click();
        await page.locator('label', { has: page.locator('.rotate4x') }).click();
        const before = await state();
        const download = page.waitForEvent('download');
        await page.locator('.download_image').click();
        expect((await download).suggestedFilename()).toBe('Creature_Orc_Shaman.gif');
        await expect(page.locator('.outfiter')).not.toHaveClass(/outfiter_busy/);
        expect(await state()).toBe(before);
    });

    test('the arrow buttons keep the list selection in step', async ({ page }) => {
        await openOutfitter(page, '?o=3');
        const checked = (list) => page.locator(`.radio_${list} .list_el`, { has: page.locator('input:checked') }).locator('.t');
        await page.locator('.mountp').click();
        await waitForRender(page);
        await page.locator('.mountp').click();
        await waitForRender(page);
        await expect(checked('mounts')).toHaveText((await readState(page)).mount);
        await page.locator('.creaturep').click();
        await waitForRender(page);
        await expect(checked('creatures')).toHaveText((await readState(page)).creature);
    });

    test('the selected row is scrolled into view in its list', async ({ page }) => {
        await openOutfitter(page, '?o=105&cr=700');
        await expect.poll(() => page.evaluate(() => {
            const row = document.querySelector('.radio_creatures input:checked').closest('label');
            const box = row.parentElement.getBoundingClientRect(), r = row.getBoundingClientRect();
            return r.top >= box.top && r.bottom <= box.bottom;
        })).toBe(true);
    });

    test('the address bar follows the selection, so a refresh keeps it', async ({ page }) => {
        await openOutfitter(page);
        await pickFromList(page, 'outfits', 'Knight');
        await waitForRender(page);
        await waitForAddressBar(page);
        expect(await page.evaluate(() => location.search)).toBe('?o=3');
        await page.reload();
        await waitForRender(page);
        expect((await readState(page)).outfit).toBe('Knight');
    });

    test('download file names say what is shown', async ({ page }) => {
        await openOutfitter(page, '?o=105&m=5'); // a mount on its own
        let download = page.waitForEvent('download');
        await page.locator('.download_image').click();
        expect((await download).suggestedFilename()).toBe('Mount_Midnight_Panther_Mount.png');
        await page.goto('/?o=105&cr=5');
        await waitForRender(page);
        download = page.waitForEvent('download');
        await page.locator('.download_image').click();
        expect((await download).suggestedFilename()).toBe('Creature_Orc_Shaman.png');
    });
});

test.describe('final audit', () => {
    test('frames are always padded to the full 64px (Dragon Lord used to come out 63px wide)', async ({ page }) => {
        for (const query of ['?o=105&cr=37', '?o=105&cr=32', '?o=105&cr=657']) { // Dragon Lord, Dragon, Albino Dragon
            await openOutfitter(page, query);
            const size = await page.locator('.body_main').evaluate((img) => [img.naturalWidth, img.naturalHeight]);
            expect(size).toEqual([64, 64]);
        }
        await expect(page.locator('.template_code_code')).toHaveCount(0);
    });

    test('placeholder text ("Search", "Name") is readable: contrast at least 4.5:1', async ({ page }) => {
        await openOutfitter(page);
        const ratios = await page.evaluate(() => {
            const lum = (c) => { const v = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
            const field = [56, 56, 57]; // #383839, the base colour of the dark input texture
            return [...document.querySelectorAll('.outfiter input[placeholder]')].map((input) => {
                const ph = getComputedStyle(input, '::placeholder').color.match(/\d+/g).slice(0, 3).map(Number);
                const a = lum(ph), b = lum(field);
                return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            });
        });
        expect(ratios.length).toBeGreaterThan(0);
        for (const r of ratios) { expect(r).toBeGreaterThanOrEqual(4.5); }
    });
});
