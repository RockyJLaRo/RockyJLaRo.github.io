// Layout tests for different screen sizes, touch screens and keyboard use.
// Tests tagged @mobile also run in the "mobile-chromium" project (Pixel 7 emulation).
'use strict';

const { test, expect } = require('@playwright/test');
const { openOutfitter, readState, waitForRender } = require('./helpers');

/** Elements that stick out of the window horizontally (causing sideways scrolling). */
const horizontalOverflow = (page) => page.evaluate(() => {
    const out = [];
    if (document.documentElement.scrollWidth > innerWidth) { out.push('document ' + document.documentElement.scrollWidth + 'px'); }
    for (const el of document.querySelectorAll('body *')) {
        if (el.closest('.hide_canvas') || el.classList.contains('body_main')) { continue; } // hidden work canvases / pannable sprite
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > innerWidth + 1 || r.left < -1)) { out.push(el.className || el.tagName); }
    }
    return out;
});

test.describe('no sideways scrolling at common sizes', () => {
    const sizes = [[320, 640], [360, 780], [390, 844], [430, 932], [844, 390], [768, 1024], [1024, 768], [1180, 800], [1280, 800], [1440, 900], [1920, 1080]];
    for (const [width, height] of sizes) {
        test(`${width}x${height}`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            await openOutfitter(page, '?o=3&a1&a2&m=5&fl&h&n=Rocky');
            expect(await horizontalOverflow(page)).toEqual([]);
        });
    }
});

test.describe('wide screens', () => {
    test('lists on the left, options and colours beside the preview', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await openOutfitter(page);
        await expect(page.locator('.list_tabs')).toBeHidden();
        for (const list of ['.mselector', '.cselector', '.oselector']) { await expect(page.locator(list)).toBeVisible(); }
        const lists = await page.locator('.mselector').boundingBox();
        const viewer = await page.locator('.viewer').boundingBox();
        const options = await page.locator('.omain_opts').boundingBox();
        const colours = await page.locator('.colors_cont').boundingBox();
        const preview = await page.locator('.body_main_div').boundingBox();
        expect(lists.x + lists.width).toBeLessThanOrEqual(viewer.x); // lists left of the viewer
        expect(colours.y).toBeGreaterThan(options.y); // colours under the options ...
        expect(colours.x + colours.width).toBeLessThanOrEqual(preview.x); // ... left of the preview
    });

    for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080]]) {
        test(`${width}x${height}: the whole Outfitter, link included, is on screen`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            await openOutfitter(page, '?o=3&m=5');
            const link = await page.locator('.url_input').boundingBox();
            expect(link.y + link.height).toBeLessThanOrEqual(height);
            expect(await horizontalOverflow(page)).toEqual([]);
        });
    }

    test('the preview opens bigger when there is room (zoom 3 instead of 2)', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await openOutfitter(page, '?o=3');
        const big = await page.locator('.body_main').evaluate((img) => img.width);
        await page.locator('.zoomout').click();
        const normal = await page.locator('.body_main').evaluate((img) => img.width);
        expect(big / normal).toBeCloseTo(1.5, 2);
    });

    test('dragging the zoomed-in sprite moves it as far as the mouse moves', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await openOutfitter(page, '?o=3&m=239');
        await page.locator('.zoomin').click();
        const img = page.locator('.body_main');
        const before = await img.boundingBox();
        await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
        await page.mouse.down();
        await page.mouse.move(before.x + before.width / 2 + 100, before.y + before.height / 2 + 50, { steps: 5 });
        await page.mouse.up();
        const after = await img.boundingBox();
        expect(after.x - before.x).toBeCloseTo(100, 0);
        expect(after.y - before.y).toBeCloseTo(50, 0);
    });
});

test.describe('the preview has a maximum size', () => {
    // css/outfitter.css: --outfiter-preview-max-w / --outfiter-preview-max-h
    const MAX_W = 720, MAX_H = 540;

    const measure = (page) => page.evaluate(() => {
        const box = document.querySelector('.body_main_div').getBoundingClientRect();
        const img = document.querySelector('.body_main').getBoundingClientRect();
        const column = document.querySelector('.omain_wrap_right');
        const col = column && getComputedStyle(column).display !== 'contents' ? column.getBoundingClientRect() : null;
        return {
            w: box.width, h: box.height,
            spriteInside: img.left >= box.left - 1 && img.right <= box.right + 1 && img.top >= box.top - 1 && img.bottom <= box.bottom + 1,
            spriteCentred: Math.abs((img.left + img.right) / 2 - (box.left + box.right) / 2) <= 1 && Math.abs((img.top + img.bottom) / 2 - (box.top + box.bottom) / 2) <= 1,
            boxCentredInColumn: !col || Math.abs((box.left + box.right) / 2 - (col.left + col.right) / 2) <= 1,
            scale: img.width / document.querySelector('.body_main').naturalWidth
        };
    });

    for (const [width, height] of [[1920, 1080], [2560, 1440], [3840, 2160]]) {
        test(`${width}x${height}: stops growing at ${MAX_W} x ${MAX_H}px, centred`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            for (const query of ['?o=3&m=239', '?o=105&m=239', '?o=105&cr=37']) { // outfit on mount, mount, creature
                await openOutfitter(page, query);
                const m = await measure(page);
                expect(Math.round(m.w)).toBeGreaterThanOrEqual(MAX_W - 2);
                expect(Math.round(m.w)).toBeLessThanOrEqual(MAX_W);
                expect(Math.round(m.h)).toBe(MAX_H);
                expect(m).toMatchObject({ spriteInside: true, spriteCentred: true, boxCentredInColumn: true, scale: 6 });
            }
            // the Outfitter itself is centred and does not stretch across the screen
            const container = await page.locator('#outfiter_container').boundingBox();
            expect(container.width).toBeLessThanOrEqual(1460);
            expect(Math.abs(container.x + container.width / 2 - width / 2)).toBeLessThanOrEqual(1);
            expect(await horizontalOverflow(page)).toEqual([]);
        });
    }

    for (const [width, height] of [[1280, 720], [1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568], [844, 390]]) {
        test(`${width}x${height}: smaller, sprite inside and sharp`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            for (const query of ['?o=3&m=239', '?o=105&cr=37', '?o=3&fl&h&n=Rocky']) { // + floor scene
                await openOutfitter(page, query);
                const m = await measure(page);
                expect(m.w).toBeLessThanOrEqual(width >= 1181 ? MAX_W : 760);
                expect(m.h).toBeLessThanOrEqual(MAX_H);
                expect(m.spriteInside && m.spriteCentred).toBe(true);
                // whole-number scaling keeps pixel art crisp; the only exception is the
                // floor scene (318px at the smallest zoom) in a box narrower than that
                if (!(query.includes('&fl') && m.w < 318)) { expect(Number.isInteger(m.scale)).toBe(true); }
            }
            expect(await horizontalOverflow(page)).toEqual([]);
        });
    }
});

test.describe('phone layout @mobile', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        if (testInfo.project.name === 'desktop-chromium') { await page.setViewportSize({ width: 390, height: 844 }); }
    });

    test('shows the preview first and one list at a time', async ({ page }) => {
        const errors = await openOutfitter(page);
        const preview = await page.locator('.body_main_div').boundingBox();
        const tabs = await page.locator('.list_tabs').boundingBox();
        expect(preview.y).toBeLessThan(tabs.y);
        await expect(page.locator('.oselector')).toBeVisible();
        await expect(page.locator('.mselector')).toBeHidden();
        await page.locator('.list_tab[data-list="mselector"]').click();
        await expect(page.locator('.mselector')).toBeVisible();
        await expect(page.locator('.oselector')).toBeHidden();
        await expect(page.locator('.list_tab[data-list="mselector"]')).toHaveAttribute('aria-pressed', 'true');
        expect(errors).toEqual([]);
    });

    test('pick a mount from the list and see it in the preview', async ({ page }) => {
        await openOutfitter(page);
        await page.locator('.list_tab[data-list="mselector"]').click();
        await page.locator('.radio_mounts .omsearch').fill('war bear');
        await page.locator('.radio_mounts .list_el:visible').first().click();
        await waitForRender(page);
        expect((await readState(page)).mount).toBe('War Bear');
        await expect(page.locator('.body_main')).toHaveAttribute('alt', 'Citizen outfit on War Bear');
    });

    test('main controls are large enough to tap (44px)', async ({ page }) => {
        await openOutfitter(page);
        const small = await page.evaluate(() => {
            const sel = '.outfitm, .outfitp, .mountm, .mountp, .creaturem, .creaturep, .facingm, .facingp, .zoom_btn, .list_tab, .nbutton:not([disabled]), .copy_btn, .omsearch';
            return [...document.querySelectorAll(sel)]
                .filter((el) => el.offsetParent !== null)
                .map((el) => { const r = el.getBoundingClientRect(); return { el: el.className, w: Math.round(r.width), h: Math.round(r.height) }; })
                .filter((b) => b.w < 44 || b.h < 44);
        });
        expect(small).toEqual([]);
        // list rows and option labels: at least 40px high
        const rowHeight = await page.locator('.radio_outfits .list_el').first().evaluate((el) => el.getBoundingClientRect().height);
        expect(rowHeight).toBeGreaterThanOrEqual(40);
        const optionHeight = await page.locator('label:has(.animate)').evaluate((el) => el.getBoundingClientRect().height);
        expect(optionHeight).toBeGreaterThanOrEqual(40);
    });

    test('the preview stays on screen while scrolling through a list or the colours', async ({ page }) => {
        await openOutfitter(page);
        const previewVisible = () => page.evaluate(() => {
            const r = document.querySelector('.body_main_div').getBoundingClientRect();
            return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
        });
        const row = page.locator('.radio_outfits .list_el').nth(6);
        await row.scrollIntoViewIfNeeded();
        await row.click();
        await waitForRender(page);
        expect(await previewVisible()).toBeGreaterThan(200);
        await page.locator('.dcolor_table').scrollIntoViewIfNeeded();
        expect(await previewVisible()).toBeGreaterThan(200);
        // scrolling a row into view does not hide it behind the sticky preview
        await row.evaluate((el) => el.scrollIntoView());
        const previewBottom = await page.locator('.body_main_div').evaluate((el) => el.getBoundingClientRect().bottom);
        expect((await row.boundingBox()).y).toBeGreaterThanOrEqual(previewBottom - 1);
    });

    test('a creature link opens with the creature list', async ({ page }) => {
        await openOutfitter(page, '?o=105&cr=5');
        await expect(page.locator('.cselector')).toBeVisible();
        await expect(page.locator('.oselector')).toBeHidden();
        await expect(page.locator('.list_tab[data-list="cselector"]')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.radio_creatures input:checked')).toHaveCount(1);
    });

    test('the sprite fits the preview and swiping over it can scroll the page', async ({ page }) => {
        await openOutfitter(page, '?o=3&fl');
        const box = await page.locator('.body_main_div').boundingBox();
        const img = await page.locator('.body_main').boundingBox();
        expect(img.width).toBeLessThanOrEqual(box.width + 1);
        // not draggable while it fits -> the browser may scroll the page
        expect(await page.locator('.body_main').evaluate((el) => getComputedStyle(el).touchAction)).toBe('auto');
        // after zooming in it can be dragged
        await page.locator('.zoomin').click();
        await page.locator('.zoomin').click();
        await expect(page.locator('.body_main')).toHaveClass(/is-pannable/);
    });
});

test('keyboard: the colour palette works with arrow keys', async ({ page }) => {
    await openOutfitter(page, '?o=3');
    const selected = page.locator('.dcolor_table div[aria-checked="true"]');
    await expect(selected).toHaveCount(1);
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    await waitForRender(page);
    await page.keyboard.press('ArrowDown');
    await waitForRender(page);
    expect((await readState(page)).link).toBe('/?o=3&c1=20');
    await expect(page.locator('.dcolor_table div').nth(20)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.dcolor_table div').nth(20)).toBeFocused();
});

test('icon-only buttons and fields have accessible names', async ({ page }) => {
    await openOutfitter(page);
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('.outfiter button, .outfiter input[type="text"]')]
        .filter((el) => !(el.getAttribute('aria-label') || el.textContent.trim() || el.getAttribute('title')))
        .map((el) => el.className));
    expect(unnamed).toEqual([]);
});
