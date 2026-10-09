// Regression tests: each test reproduces a bug that existed before and must stay fixed.
'use strict';

const { test, expect } = require('@playwright/test');
const { openOutfitter, readState, pickFromList, waitForRender, animationFramePixelCounts } = require('./helpers');

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
            await expect(page.locator('.body_main')).toHaveAttribute('src', /Outfiter_Error/);
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
