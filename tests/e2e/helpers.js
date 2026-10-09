// Shared helpers for the end-to-end tests.
'use strict';

const { expect } = require('@playwright/test');

/** Wait until the preview shows a finished render (not the loading/error image). */
async function waitForRender(page) {
    await page.waitForFunction(() => {
        const root = document.querySelector('.outfiter');
        const img = document.querySelector('.body_main');
        return root && img && !root.classList.contains('outfiter_loading') && img.src.startsWith('data:');
    }, null, { timeout: 20000 });
}

/**
 * Open the outfitter with an optional query string (e.g. "?o=3&a1") and wait for
 * the first render. Collects page errors so tests can assert there were none.
 */
async function openOutfitter(page, query = '') {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/' + query);
    await waitForRender(page);
    return errors;
}

/** Snapshot of what the user sees: selected names, checkboxes and the share link. */
function readState(page) {
    return page.evaluate(() => ({
        outfit: document.querySelector('.outfit_name').textContent,
        mount: document.querySelector('.mount_name').textContent,
        creature: document.querySelector('.creature_name').textContent,
        addon1: document.querySelector('.addon1').checked,
        addon2: document.querySelector('.addon2').checked,
        female: document.querySelector('.female').checked,
        link: document.querySelector('.url_input').value.replace(location.origin, ''),
        status: document.querySelector('.outfiter_status').textContent
    }));
}

/** Wait until the address bar shows the current share link (it is updated a moment after a change). */
async function waitForAddressBar(page) {
    await page.waitForFunction(() => location.href === document.querySelector('.url_input').value);
}

/** Click a row in one of the lists ("outfits", "mounts" or "creatures") by its visible name. */
async function pickFromList(page, list, name) {
    await page.locator(`.radio_${list} .list_el`, { has: page.locator('.t', { hasText: new RegExp('^' + name + '$') }) }).click();
}

/**
 * Turn on "Animation Steps" and return the number of visible (non-transparent)
 * pixels in every animation frame. A 0 means a blank frame (a sprite-sheet bug).
 */
async function animationFramePixelCounts(page) {
    await page.locator('label', { has: page.locator('.show_advanced') }).click();
    await page.locator('label', { has: page.locator('.anistep') }).click();
    await waitForRender(page);
    await expect(page.locator('.anistep_step img').first()).toBeVisible();
    return page.evaluate(async () => {
        const counts = [];
        for (const img of document.querySelectorAll('.anistep_step img')) {
            await img.decode();
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let visible = 0;
            for (let i = 3; i < data.length; i += 4) { if (data[i] !== 0) { visible++; } }
            counts.push(visible);
        }
        return counts;
    });
}

module.exports = { waitForRender, waitForAddressBar, openOutfitter, readState, pickFromList, animationFramePixelCounts };
