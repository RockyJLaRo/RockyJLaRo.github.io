#!/usr/bin/env node
/*
 * Asset checker for the Outfitter.  Run it after every change to the asset list
 * or the sprite files:
 *
 *     npm run validate              (or: node tools/validate-assets.js)
 *     npm run validate -- --verbose (also lists files that no entry uses)
 *
 * It never changes any file. It reports:
 *   ERRORS   - things that are broken for users (missing file, unreadable image,
 *              sheet too small for its frame counts, typo in a rule name, ...).
 *              The command exits with code 1 so CI shows a red cross.
 *   WARNINGS - things that probably need a look but still work (e.g. a sheet with
 *              more rows than the rules use).
 *
 * It checks js/outfitter-assets.js (existing items), js/outfitter-new-assets.js
 * (new items) and every sprite file they use. The list / size rules come from
 * js/outfitter-asset-rules.js, which the Outfitter itself uses too.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
// the same rules the Outfitter and the Asset Helper use
const rules = require('../js/outfitter-asset-rules.js');

/* ------------------------------------------------------------------------- */
/* Loading                                                                    */
/* ------------------------------------------------------------------------- */

/** Where in the file a syntax error is, e.g. "js/outfitter-assets.js:12" */
function errorLocation(e, fileName) {
    const line = (e.stack || '').split('\n').find((l) => l.includes(fileName));
    return line ? '\n      at ' + line.trim() : '';
}

/**
 * Load js/outfitter-assets.js and js/outfitter-new-assets.js like the browser does.
 * Returns { A, newEntries, errors }: A is null when the main asset file is broken;
 * a broken new-assets file only means "no new items" (like in the app).
 */
function loadAssets(root) {
    const errors = [];
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    const run = (rel) => vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox, { filename: path.join(root, rel) });
    try {
        run('js/outfitter-assets.js');
        if (!sandbox.window.OutfiterAssets) { throw new Error('the file does not define window.OutfiterAssets'); }
    } catch (e) {
        errors.push(`js/outfitter-assets.js could not be read: ${e.message}${errorLocation(e, 'outfitter-assets.js')}`);
        return { A: null, newEntries: [], errors };
    }
    let newEntries = [];
    if (!fs.existsSync(path.join(root, 'js/outfitter-new-assets.js'))) {
        errors.push('js/outfitter-new-assets.js is missing (index.html needs it; it may hold an empty list)');
    } else {
        try {
            run('js/outfitter-new-assets.js');
            newEntries = sandbox.window.OutfiterNewAssets;
            if (newEntries === undefined) { throw new Error('the file does not define window.OutfiterNewAssets'); }
        } catch (e) {
            errors.push(`js/outfitter-new-assets.js could not be read: ${e.message}${errorLocation(e, 'outfitter-new-assets.js')}` +
                '\n      (on the website the new items are hidden until this is fixed; everything else keeps working)');
            newEntries = [];
        }
    }
    return { A: sandbox.window.OutfiterAssets, newEntries, errors };
}

/* ------------------------------------------------------------------------- */
/* PNG checks (no dependencies: reads chunks, checks CRCs, inflates pixels)   */
/* ------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) { crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8); }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Returns { width, height } or throws an Error describing what is wrong. */
function inspectPng(buf) {
    const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) { throw new Error('not a PNG image'); }
    let offset = 8, ihdr = null, sawEnd = false;
    const idat = [];
    while (offset + 12 <= buf.length) {
        const length = buf.readUInt32BE(offset);
        const type = buf.toString('latin1', offset + 4, offset + 8);
        if (offset + 12 + length > buf.length) { throw new Error('PNG is cut off inside the ' + type + ' chunk'); }
        const data = buf.subarray(offset + 8, offset + 8 + length);
        const storedCrc = buf.readUInt32BE(offset + 8 + length);
        if (crc32(buf.subarray(offset + 4, offset + 8 + length)) !== storedCrc) {
            throw new Error('PNG data is corrupted (checksum error in ' + type + ' chunk)');
        }
        if (type === 'IHDR') { ihdr = data; }
        if (type === 'IDAT') { idat.push(data); }
        offset += 12 + length;
        if (type === 'IEND') { sawEnd = true; break; }
    }
    if (!ihdr) { throw new Error('PNG has no IHDR header'); }
    if (!sawEnd) { throw new Error('PNG is incomplete (no IEND chunk)'); }
    const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
    const bitDepth = ihdr[8], colorType = ihdr[9], interlace = ihdr[12];
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
    if (!channels) { throw new Error('unsupported PNG colour type ' + colorType); }
    let pixels;
    try {
        pixels = zlib.inflateSync(Buffer.concat(idat));
    } catch (e) {
        throw new Error('PNG pixel data cannot be decompressed (' + e.message + ')');
    }
    const bitsPerPixel = channels * bitDepth;
    const rowBytes = (w) => Math.ceil((w * bitsPerPixel) / 8);
    let expected = 0;
    if (interlace) {
        // Adam7: seven passes over sub-images
        const passes = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]];
        for (const [x0, y0, dx, dy] of passes) {
            const w = Math.ceil((width - x0) / dx), h = Math.ceil((height - y0) / dy);
            if (w > 0 && h > 0) { expected += h * (rowBytes(w) + 1); }
        }
    } else {
        expected = height * (rowBytes(width) + 1);
    }
    if (pixels.length < expected) { throw new Error('PNG pixel data is incomplete'); }
    return { width, height };
}

/* ------------------------------------------------------------------------- */
/* Checking one sprite file                                                   */
/* ------------------------------------------------------------------------- */

/**
 * Check the text of one sprite file. Returns { size } or { error }.
 * kind / sheetOf decide which size the sheet must have (rules.compareSheetSize).
 */
function checkSpriteText(A, text, fileName, kind, sheetOf) {
    const sprite = rules.parseSpriteFile(text, fileName);
    if (sprite.error) { return { error: sprite.error }; }
    let size;
    try {
        size = inspectPng(Buffer.from(sprite.base64, 'base64'));
    } catch (e) {
        return { error: e.message };
    }
    if (fileName === 'None') { return { size }; } // empty placeholder, any size is fine
    return { size, sheet: rules.compareSheetSize(A, kind, sheetOf || fileName, size.width, size.height) };
}

/* ------------------------------------------------------------------------- */
/* Validation                                                                 */
/* ------------------------------------------------------------------------- */

/**
 * Check everything. Returns { errors: [], warnings: [], info: [], unused: [], stats: {} }.
 * root: project folder (contains js/ and base64/).
 */
function validate(root) {
    const loaded = loadAssets(root);
    const errors = loaded.errors.slice(), warnings = [], info = [];
    const A = loaded.A;
    if (!A) { return { errors, warnings, info, unused: [], stats: {} }; }

    // --- 1. new items (js/outfitter-new-assets.js) ---------------------------
    const merged = rules.mergeNewAssets(A, loaded.newEntries);
    merged.problems.forEach((p) => errors.push(p.message));
    const newItems = new Set(merged.added.map((a) => `${rules.TYPES[a.type].kind}:${a.name}`));

    // --- 2. lists and rule tables ---------------------------------------------
    const data = rules.checkData(A);
    errors.push(...data.errors);
    warnings.push(...data.warnings);
    if (data.errors.some((e) => / is missing or is not a list/.test(e))) { return { errors, warnings, info, unused: [], stats: {} }; }

    // --- 3. sprite files ------------------------------------------------------
    const folderFiles = {};
    for (const folder of ['Creature', 'Female', 'Male', 'Mount', 'Other']) {
        const dir = path.join(root, 'base64', folder);
        folderFiles[folder] = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.txt')) : [];
        if (!fs.existsSync(dir)) { errors.push(`folder base64/${folder} is missing`); }
    }
    const used = new Set();
    let checked = 0;
    for (const entry of rules.expectedFiles(A)) {
        const rel = `base64/${entry.folder}/${entry.name}.txt`;
        const owner = entry.sheetOf || entry.name;
        const isNew = newItems.has(`${entry.kind}:${owner}`);
        const label = `${entry.kind} #${entry.id} '${owner}'${isNew ? ' (new item in js/outfitter-new-assets.js)' : ''}`;
        if (used.has(rel)) { continue; }
        used.add(rel);
        if (!folderFiles[entry.folder].includes(entry.name + '.txt')) {
            const other = folderFiles[entry.folder].find((f) => f.toLowerCase() === (entry.name + '.txt').toLowerCase());
            errors.push(other
                ? `${rel} not found, but base64/${entry.folder}/${other} exists - file names must match capital letters exactly (needed by ${label})`
                : `${rel} is missing (needed by ${label})${isNew ? ' - upload the sprite file before publishing the new entry' : ''}`);
            continue;
        }
        checked++;
        const result = checkSpriteText(A, fs.readFileSync(path.join(root, rel), 'utf8'), entry.name, entry.kind, entry.sheetOf);
        if (result.error) { errors.push(`${rel}: ${result.error}`); continue; }
        if (result.sheet) { (result.sheet.level === 'error' ? errors : warnings).push(`${rel}: ${result.sheet.message}`); }
    }

    // --- 4. files nothing refers to (fine, but good to know) ----------------
    const unused = [];
    for (const [folder, files] of Object.entries(folderFiles)) {
        for (const f of files) { if (!used.has(`base64/${folder}/${f}`)) { unused.push(`base64/${folder}/${f}`); } }
    }
    if (unused.length) { info.push(`${unused.length} sprite files are not used by any entry (they are kept, not an error).`); }

    return {
        errors, warnings, info, unused,
        stats: {
            mounts: A.outfiter_mount_names.length - 1,
            creatures: A.outfiter_creature_names.length - 1,
            outfits: rules.allOutfits(A).filter(Boolean).length - 1,
            newItems: merged.added.length,
            filesChecked: checked
        }
    };
}

/* ------------------------------------------------------------------------- */
/* Command line                                                               */
/* ------------------------------------------------------------------------- */

if (require.main === module) {
    const verbose = process.argv.includes('--verbose');
    const root = path.resolve(__dirname, '..');
    const result = validate(root);
    const s = result.stats;
    if (s.filesChecked !== undefined) {
        console.log(`Checked ${s.mounts} mounts, ${s.creatures} creatures, ${s.outfits} outfits (${s.filesChecked} sprite files), ` +
            `including ${s.newItems} new item(s) from js/outfitter-new-assets.js.\n`);
    }
    for (const e of result.errors) { console.log('ERROR    ' + e); }
    for (const w of result.warnings) { console.log('WARNING  ' + w); }
    for (const i of result.info) { console.log('NOTE     ' + i + (verbose ? '' : ' Use --verbose to list them.')); }
    if (verbose && result.unused) { for (const f of result.unused) { console.log('         ' + f); } }
    console.log(`\n${result.errors.length} error(s), ${result.warnings.length} warning(s).`);
    if (result.errors.length) {
        console.log('Fix the errors above before publishing. See docs/MAINTAINING.md for help.');
        process.exitCode = 1;
    } else {
        console.log('All good.');
    }
}

module.exports = { validate, loadAssets, checkSpriteText, inspectPng, crc32 };
