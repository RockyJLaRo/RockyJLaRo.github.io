// Small fake projects and images for the tests (no real sprite files needed).
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { crc32 } = require('../tools/validate-assets');

/** Build a valid, fully transparent RGBA PNG of the given size. */
function makePng(width, height) {
    const chunk = (type, data) => {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
        const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
        const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
        return Buffer.concat([len, body, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
    const raw = Buffer.alloc(height * (width * 4 + 1)); // filter byte 0 + zero pixels per row
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))
    ]);
}

const spriteFile = (name, width, height) =>
    `<pre id="${name}">data:image/png;base64,${makePng(width, height).toString('base64')}</pre>\n[[Category:Outfiter]]`;

const EMPTY_RULES = [
    'outfiter_sprites_standing', 'outfiter_sprites_walking', 'outfiter_sprites_creature_standing',
    'outfiter_sprites_creature_walking', 'outfiter_creature_props', 'outfiter_special_delays_standing',
    'outfiter_special_delays_moving', 'outfiter_special_delays_mount_standing', 'outfiter_pingpong_animation',
    'outfiter_4096h', 'outfiter_sprites_mount_standing', 'outfiter_sprites_mount_walking',
    'outfiter_mount_colourisable', 'outfiter_f_suffix_inames', 'outfiter_m_names', 'outfiter_a_names',
    'outfiter_no_ride_names', 'outfiter_no_floor_move_names', 'outfiter_o_names', 'outfiter_separator',
    'outfiter_mount_separator', 'outfiter_creature_separator', 'outfiter_f_names'
];

/**
 * Create a small valid project:
 *   mount 'War_Bear', creatures 'Rat' and 'Ghost' (addon 1 only),
 *   outfit 'Citizen' (male + female) and the six "Other" outfits incl. None.
 * `change(assets, files, newEntries)` may modify the data / files / new entries before
 * they are written; returning a string replaces js/outfitter-assets.js. newAssetsSource
 * replaces js/outfitter-new-assets.js.
 */
function makeProject(change, newAssetsSource) {
    const assets = {
        outfiter_mount_names: ['None', 'War_Bear'],
        outfiter_creature_names: ['None', 'Rat', 'Ghost'],
        outfiter_names0: ['Citizen'],
        outfiter_names100: ['Frog', 'Elf', 'Dwarf', 'Archdemon', 'CM', 'None'],
        outfiter_names200: [],
        outfiter_u_names: { Frog: true, Elf: true, Dwarf: true, Archdemon: true, CM: true, None: true }
    };
    for (const rule of EMPTY_RULES) { assets[rule] = {}; }
    assets.outfiter_creature_props = { Ghost: { addon1: true } };
    const newEntries = [];
    const files = {
        'Mount/War_Bear.txt': spriteFile('War_Bear', 256, 9 * 64),
        'Creature/Rat.txt': spriteFile('Rat', 256, 9 * 64),
        'Creature/Ghost.txt': spriteFile('Ghost', 256, 9 * 2 * 64), // base + addon 1 per frame
        'Male/Citizen.txt': spriteFile('Citizen', 512, 9 * 6 * 64),
        'Female/Citizen.txt': spriteFile('Citizen', 512, 9 * 6 * 64)
    };
    for (const n of assets.outfiter_names100) { files[`Other/${n}.txt`] = spriteFile(n, 512, 9 * 6 * 64); }
    let assetsSource = null;
    if (change) { assetsSource = change(assets, files, newEntries) || null; }
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'outfitter-test-'));
    fs.mkdirSync(path.join(root, 'js'));
    fs.writeFileSync(path.join(root, 'js', 'outfitter-assets.js'), assetsSource || 'window.OutfiterAssets = ' + JSON.stringify(assets, null, 1) + ';');
    fs.writeFileSync(path.join(root, 'js', 'outfitter-new-assets.js'), newAssetsSource || 'window.OutfiterNewAssets = ' + JSON.stringify(newEntries, null, 1) + ';');
    for (const folder of ['Creature', 'Female', 'Male', 'Mount', 'Other']) { fs.mkdirSync(path.join(root, 'base64', folder), { recursive: true }); }
    for (const [rel, content] of Object.entries(files)) { fs.writeFileSync(path.join(root, 'base64', rel), content); }
    return root;
}

module.exports = { makePng, spriteFile, makeProject };
