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
 * The sprite-sheet size rules here mirror js/outfitter.js. If you change how the
 * app reads sheets, update expectedSheetSize() below as well.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const FRAME = 64; // every sprite frame is 64 x 64 pixels

/* ------------------------------------------------------------------------- */
/* Loading                                                                    */
/* ------------------------------------------------------------------------- */

/** Run js/outfitter-assets.js in a sandbox and return window.OutfiterAssets. */
function loadAssets(assetsFile) {
    const code = fs.readFileSync(assetsFile, 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    // a syntax error throws here with the file name and line number
    vm.runInContext(code, sandbox, { filename: assetsFile });
    if (!sandbox.window.OutfiterAssets) {
        throw new Error(assetsFile + ' does not define window.OutfiterAssets');
    }
    return sandbox.window.OutfiterAssets;
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
/* Rules (mirrors js/outfitter.js)                                            */
/* ------------------------------------------------------------------------- */

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

/** Full outfit list: ids 0-99, 100-199 and 200+ joined like the app does. */
function allOutfits(A) {
    let list = A.outfiter_names0.slice();
    if (A.outfiter_names100.length) { list.length = 100; list = list.concat(A.outfiter_names100); }
    if (A.outfiter_names200.length) { list.length = 200; list = list.concat(A.outfiter_names200); }
    return list;
}

function creatureProps(A, name) {
    const p = { standing: 1, walking: 8, colourisable: false, addon1: false, addon2: false };
    if (has(A.outfiter_sprites_creature_standing, name)) { p.standing = A.outfiter_sprites_creature_standing[name]; }
    if (has(A.outfiter_sprites_creature_walking, name)) { p.walking = A.outfiter_sprites_creature_walking[name]; }
    const custom = A.outfiter_creature_props[name] || {};
    for (const key of Object.keys(custom)) { if (custom[key] !== undefined) { p[key] = custom[key]; } }
    return p;
}

/**
 * Size (in pixels) the app expects for a sheet, plus a plain-English explanation.
 * kind: 'mount' | 'creature' | 'outfit'
 */
function expectedSheetSize(A, kind, name) {
    if (kind === 'mount') {
        const standing = has(A.outfiter_sprites_mount_standing, name) ? A.outfiter_sprites_mount_standing[name] : 1;
        const walking = has(A.outfiter_sprites_mount_walking, name) ? A.outfiter_sprites_mount_walking[name] : 8;
        const colour = A.outfiter_mount_colourisable[name] === true;
        return {
            width: FRAME * 4 * (colour ? 2 : 1),
            rows: standing + walking,
            why: `${standing} standing + ${walking} walking frames, 1 row each` + (colour ? ', colourisable (512px wide)' : '')
        };
    }
    if (kind === 'creature') {
        const p = creatureProps(A, name);
        const perFrame = 1 + (p.addon1 ? 1 : 0) + (p.addon2 ? 1 : 0);
        return {
            width: FRAME * 4 * (p.colourisable ? 2 : 1),
            rows: (p.standing + p.walking) * perFrame,
            why: `${p.standing} standing + ${p.walking} walking frames, ${perFrame} row(s) per frame` + (p.colourisable ? ', colourisable (512px wide)' : '')
        };
    }
    // outfit
    const noAddons = A.outfiter_a_names[name] === true;
    const noRide = A.outfiter_no_ride_names[name] === true;
    const perFrame = (noAddons ? 1 : 3) * (noRide ? 1 : 2);
    const standing = has(A.outfiter_sprites_standing, name) ? A.outfiter_sprites_standing[name] : 1;
    const walking = has(A.outfiter_sprites_walking, name) ? A.outfiter_sprites_walking[name] : 8;
    const rows = (standing + walking) * perFrame;
    const why = `${standing} standing + ${walking} walking frames, ${perFrame} rows per frame` +
        ` (${noAddons ? 'no addons' : 'base + 2 addons'}${noRide ? ', no riding rows' : ', x2 for riding'})`;
    if (A.outfiter_4096h[name] === true) {
        // rows 64+ continue in a second block to the right
        return { width: FRAME * 8 * Math.ceil(rows / 64), rows: Math.min(rows, 64), why: why + ', split into blocks of 64 rows' };
    }
    return { width: FRAME * 8, rows, why };
}

/** Every sprite file the app may request, with the entry that needs it. */
function expectedFiles(A) {
    const files = [];
    // mount #0 and creature #0 are "None": the app never downloads a file for them
    A.outfiter_mount_names.forEach((name, id) => { if (id > 0) { files.push({ folder: 'Mount', name, kind: 'mount', id, list: 'outfiter_mount_names' }); } });
    A.outfiter_creature_names.forEach((name, id) => { if (id > 0) { files.push({ folder: 'Creature', name, kind: 'creature', id, list: 'outfiter_creature_names' }); } });
    allOutfits(A).forEach((name, id) => {
        if (name === undefined) { return; }
        const other = id >= 100 && id < 200;
        const list = id < 100 ? 'outfiter_names0' : (other ? 'outfiter_names100' : 'outfiter_names200');
        files.push({ folder: other ? 'Other' : 'Male', name, kind: 'outfit', id, list });
        if (A.outfiter_u_names[name] !== true) {
            const female = name + (A.outfiter_f_suffix_inames[name] === true ? '_Female' : '');
            if (!(other && female === name)) {
                files.push({ folder: other ? 'Other' : 'Female', name: female, sheetOf: name, kind: 'outfit', id, list });
            }
        }
    });
    return files;
}

/* ------------------------------------------------------------------------- */
/* Validation                                                                 */
/* ------------------------------------------------------------------------- */

/**
 * Check everything. Returns { errors: [], warnings: [], info: [], stats: {} }.
 * root: project folder (contains js/ and base64/).
 */
function validate(root) {
    const errors = [], warnings = [], info = [];
    const assetsFile = path.join(root, 'js', 'outfitter-assets.js');
    const spriteRoot = path.join(root, 'base64');
    let A;
    try {
        A = loadAssets(assetsFile);
    } catch (e) {
        const where = (e.stack || '').split('\n').find((l) => l.includes('outfitter-assets.js')) || '';
        errors.push(`js/outfitter-assets.js could not be read: ${e.message}${where ? '\n      at ' + where.trim() : ''}`);
        return { errors, warnings, info, stats: {} };
    }

    // --- 1. lists ----------------------------------------------------------
    const LISTS = ['outfiter_mount_names', 'outfiter_creature_names', 'outfiter_names0', 'outfiter_names100', 'outfiter_names200'];
    for (const list of LISTS) {
        if (!Array.isArray(A[list])) { errors.push(`${list} is missing or is not a list [ ... ]`); return { errors, warnings, info, stats: {} }; }
        const seen = new Map();
        A[list].forEach((name, id) => {
            if (typeof name !== 'string' || name === '') { errors.push(`${list}: entry #${id} is not a name (check for an extra comma)`); return; }
            if (/\s/.test(name)) { errors.push(`${list}: '${name}' contains a space - use underscores (_) instead`); }
            if (/[\\/:*?"<>|]/.test(name)) { errors.push(`${list}: '${name}' contains a character that is not allowed in file names`); }
            if (seen.has(name)) { errors.push(`${list}: '${name}' is listed twice (IDs ${seen.get(name)} and ${id}) - remove the newer one`); }
            seen.set(name, id);
        });
    }
    if (A.outfiter_mount_names[0] !== 'None') { errors.push("outfiter_mount_names must start with 'None' (ID 0)"); }
    if (A.outfiter_creature_names[0] !== 'None') { errors.push("outfiter_creature_names must start with 'None' (ID 0)"); }
    if (A.outfiter_names100[5] !== 'None') { errors.push("outfiter_names100 must keep 'None' at ID 105"); }
    if (A.outfiter_names0.length > 100) { errors.push(`outfiter_names0 has ${A.outfiter_names0.length} entries; the limit is 100 - add new outfits to outfiter_names200`); }
    if (A.outfiter_names100.length > 100) { errors.push(`outfiter_names100 has ${A.outfiter_names100.length} entries; the limit is 100`); }

    // --- 2. rule lists refer to existing names and hold sensible values ----
    const outfitNames = new Set(allOutfits(A).filter(Boolean));
    const mountNames = new Set(A.outfiter_mount_names);
    const creatureNames = new Set(A.outfiter_creature_names);
    const RULES = {
        outfiter_sprites_standing: [outfitNames, 'count'], outfiter_sprites_walking: [outfitNames, 'count'],
        outfiter_special_delays_standing: [outfitNames, 'delays'], outfiter_special_delays_moving: [outfitNames, 'delays'],
        outfiter_pingpong_animation: [outfitNames, 'flag'], outfiter_4096h: [outfitNames, 'flag'],
        outfiter_f_suffix_inames: [outfitNames, 'flag'], outfiter_u_names: [outfitNames, 'flag'], outfiter_m_names: [outfitNames, 'flag'],
        outfiter_a_names: [outfitNames, 'flag'], outfiter_no_ride_names: [outfitNames, 'flag'], outfiter_no_floor_move_names: [outfitNames, 'flag'],
        outfiter_o_names: [outfitNames, 'flag'], outfiter_separator: [outfitNames, 'flag'], outfiter_f_names: [outfitNames, 'text'],
        outfiter_sprites_creature_standing: [creatureNames, 'count'], outfiter_sprites_creature_walking: [creatureNames, 'count'],
        outfiter_creature_props: [creatureNames, 'props'], outfiter_creature_separator: [creatureNames, 'flag'],
        outfiter_sprites_mount_standing: [mountNames, 'count'], outfiter_sprites_mount_walking: [mountNames, 'count'],
        outfiter_mount_colourisable: [mountNames, 'flag'], outfiter_special_delays_mount_standing: [mountNames, 'delays'],
        outfiter_mount_separator: [mountNames, 'flag']
    };
    const PROP_KEYS = new Set(['standing', 'walking', 'standing_delay', 'walking_delay', 'standing_delays', 'walking_delays', 'colourisable', 'addon1', 'addon2', 'exclusive_addons']);
    const isCount = (v) => Number.isInteger(v) && v >= 0;
    const isDelays = (v) => Array.isArray(v) && v.length > 0 && v.every((d) => typeof d === 'number' && d > 0);
    for (const [rule, [names, type]] of Object.entries(RULES)) {
        if (A[rule] === null || typeof A[rule] !== 'object') { errors.push(`${rule} is missing - it must be { } even when empty`); continue; }
        for (const [name, value] of Object.entries(A[rule])) {
            if (!names.has(name)) { errors.push(`${rule}: '${name}' does not match any name in the list (check spelling and capital letters)`); continue; }
            if (type === 'count' && !isCount(value)) { errors.push(`${rule}: '${name}' must be a whole number, found ${JSON.stringify(value)}`); }
            if (type === 'flag' && value !== true) { errors.push(`${rule}: '${name}' must be true`); }
            if (type === 'text' && typeof value !== 'string') { errors.push(`${rule}: '${name}' must be a name in quotes`); }
            if (type === 'delays' && !isDelays(value)) { errors.push(`${rule}: '${name}' must be a list of milliseconds, e.g. [100, 100, 200]`); }
            if (type === 'props') {
                for (const [key, v] of Object.entries(value || {})) {
                    if (!PROP_KEYS.has(key)) { errors.push(`outfiter_creature_props: '${name}' has unknown setting '${key}' (allowed: ${[...PROP_KEYS].join(', ')})`); }
                    else if ((key === 'standing' || key === 'walking') && !isCount(v)) { errors.push(`outfiter_creature_props: '${name}'.${key} must be a whole number`); }
                    else if (/_delays$/.test(key) && !isDelays(v)) { errors.push(`outfiter_creature_props: '${name}'.${key} must be a list of milliseconds`); }
                    else if (/_delay$/.test(key) && !(typeof v === 'number' && v > 0)) { errors.push(`outfiter_creature_props: '${name}'.${key} must be a number of milliseconds`); }
                    else if (['colourisable', 'addon1', 'addon2', 'exclusive_addons'].includes(key) && typeof v !== 'boolean') { errors.push(`outfiter_creature_props: '${name}'.${key} must be true or false`); }
                }
                const p = creatureProps(A, name);
                if (p.standing + p.walking === 0) { errors.push(`outfiter_creature_props: '${name}' has 0 standing and 0 walking frames`); }
            }
        }
    }
    for (const [name, delays] of Object.entries(A.outfiter_special_delays_mount_standing || {})) {
        const frames = has(A.outfiter_sprites_mount_standing, name) ? A.outfiter_sprites_mount_standing[name] : 1;
        if (Array.isArray(delays) && delays.length !== frames) {
            warnings.push(`outfiter_special_delays_mount_standing: '${name}' lists ${delays.length} delays but has ${frames} standing frames`);
        }
    }

    // --- 3. sprite files ----------------------------------------------------
    const folderFiles = {};
    for (const folder of ['Creature', 'Female', 'Male', 'Mount', 'Other']) {
        const dir = path.join(spriteRoot, folder);
        folderFiles[folder] = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.txt')) : [];
        if (!fs.existsSync(dir)) { errors.push(`folder base64/${folder} is missing`); }
    }
    const used = new Set();
    const wanted = expectedFiles(A);
    let checked = 0;
    for (const entry of wanted) {
        const rel = `base64/${entry.folder}/${entry.name}.txt`;
        const label = `${entry.kind} #${entry.id} '${entry.sheetOf || entry.name}'`;
        if (used.has(rel)) { continue; }
        used.add(rel);
        const file = path.join(root, rel);
        if (!folderFiles[entry.folder].includes(entry.name + '.txt')) {
            const other = folderFiles[entry.folder].find((f) => f.toLowerCase() === (entry.name + '.txt').toLowerCase());
            errors.push(other
                ? `${rel} not found, but base64/${entry.folder}/${other} exists - file names must match capital letters exactly (needed by ${label})`
                : `${rel} is missing (needed by ${label})`);
            continue;
        }
        checked++;
        const text = fs.readFileSync(file, 'utf8');
        // same tolerance as the app: case-insensitive id, space or underscore
        const m = text.match(/^﻿?\s*<pre id="([^"]*)">([\s\S]*)<\/pre>/);
        if (!m) { errors.push(`${rel}: must look like <pre id="${entry.name}">data:image/png;base64,...</pre>`); continue; }
        const idOk = m[1].replace(/ /g, '_').toLowerCase() === entry.name.toLowerCase();
        if (!idOk) { errors.push(`${rel}: <pre id="${m[1]}"> should be <pre id="${entry.name}"> (the app cannot find the image otherwise)`); continue; }
        const uri = m[2].replace(/\s+/g, '');
        if (!uri.startsWith('data:image/png;base64,')) { errors.push(`${rel}: content must start with data:image/png;base64,`); continue; }
        const b64 = uri.slice('data:image/png;base64,'.length);
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || b64.length % 4 !== 0) { errors.push(`${rel}: the base64 text contains invalid characters or is cut off`); continue; }
        let size;
        try {
            size = inspectPng(Buffer.from(b64, 'base64'));
        } catch (e) {
            errors.push(`${rel}: ${e.message}`);
            continue;
        }
        // "None" entries are empty placeholders; their size does not matter
        if (entry.name === 'None') { continue; }
        const exp = expectedSheetSize(A, entry.kind, entry.sheetOf || entry.name);
        const rows = size.height / FRAME;
        const where = { mount: 'outfiter_sprites_mount_standing / _walking', creature: 'outfiter_sprites_creature_standing / _walking or outfiter_creature_props', outfit: 'outfiter_sprites_standing / _walking (and the addon / riding lists)' }[entry.kind];
        if (size.width % FRAME || size.height % FRAME) {
            errors.push(`${rel}: ${size.width}x${size.height}px is not a multiple of ${FRAME}px`);
        } else if (size.width !== exp.width) {
            errors.push(`${rel}: sheet is ${size.width}px wide but the rules expect ${exp.width}px (${exp.why})`);
        } else if (rows < exp.rows) {
            errors.push(`${rel}: sheet has ${rows} rows of ${FRAME}px but the rules need ${exp.rows} (${exp.why}). ` +
                `Missing rows show as blank frames - fix the frame counts in ${where}.`);
        } else if (rows > exp.rows) {
            warnings.push(`${rel}: sheet has ${rows} rows but the rules only use ${exp.rows} (${exp.why}). ` +
                `Some frames are never shown - check the frame counts in ${where}.`);
        }
    }

    // --- 4. files nothing refers to (fine, but good to know) ----------------
    const unused = [];
    for (const [folder, files] of Object.entries(folderFiles)) {
        for (const f of files) { if (!used.has(`base64/${folder}/${f}`)) { unused.push(`base64/${folder}/${f}`); } }
    }
    if (unused.length) { info.push(`${unused.length} sprite files are not used by any entry (they are kept, not an error).`); }

    return {
        errors, warnings, info, unused,
        stats: { mounts: A.outfiter_mount_names.length - 1, creatures: A.outfiter_creature_names.length - 1, outfits: outfitNames.size - 1, filesChecked: checked }
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
        console.log(`Checked ${s.mounts} mounts, ${s.creatures} creatures, ${s.outfits} outfits (${s.filesChecked} sprite files).\n`);
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

module.exports = { validate, inspectPng, expectedSheetSize, expectedFiles, loadAssets, crc32 };
