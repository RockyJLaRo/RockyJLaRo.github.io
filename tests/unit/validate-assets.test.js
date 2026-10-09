// Unit tests for tools/validate-assets.js. Run with:  npm run test:unit
// Each test builds a tiny fake project in a temporary folder, breaks one thing,
// and checks that the validator reports it.
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { validate, crc32 } = require('../../tools/validate-assets');

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
 * `change(assets, files)` may modify the data / files before they are written.
 */
function makeProject(change) {
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
    const files = {
        'Mount/War_Bear.txt': spriteFile('War_Bear', 256, 9 * 64),
        'Creature/Rat.txt': spriteFile('Rat', 256, 9 * 64),
        'Creature/Ghost.txt': spriteFile('Ghost', 256, 9 * 2 * 64), // base + addon 1 per frame
        'Male/Citizen.txt': spriteFile('Citizen', 512, 9 * 6 * 64),
        'Female/Citizen.txt': spriteFile('Citizen', 512, 9 * 6 * 64)
    };
    for (const n of assets.outfiter_names100) { files[`Other/${n}.txt`] = spriteFile(n, 512, 9 * 6 * 64); }
    let assetsSource = null;
    if (change) { assetsSource = change(assets, files) || null; }
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'outfitter-test-'));
    fs.mkdirSync(path.join(root, 'js'));
    fs.writeFileSync(path.join(root, 'js', 'outfitter-assets.js'), assetsSource || 'window.OutfiterAssets = ' + JSON.stringify(assets, null, 1) + ';');
    for (const folder of ['Creature', 'Female', 'Male', 'Mount', 'Other']) { fs.mkdirSync(path.join(root, 'base64', folder), { recursive: true }); }
    for (const [rel, content] of Object.entries(files)) { fs.writeFileSync(path.join(root, 'base64', rel), content); }
    return root;
}

const errorsOf = (change) => validate(makeProject(change)).errors.join('\n');

test('a valid project has no errors or warnings', () => {
    const result = validate(makeProject());
    assert.deepStrictEqual(result.errors, []);
    assert.deepStrictEqual(result.warnings, []);
});

test('reports a missing sprite file', () => {
    assert.match(errorsOf((a, f) => { delete f['Creature/Rat.txt']; }), /base64\/Creature\/Rat\.txt is missing/);
});

test('reports file names that only differ in capital letters', () => {
    assert.match(errorsOf((a, f) => { f['Creature/rat.txt'] = f['Creature/Rat.txt']; delete f['Creature/Rat.txt']; }), /capital letters/);
});

test('reports a wrong file wrapper and a wrong <pre id>', () => {
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = 'data:image/png;base64,AAAA'; }), /must look like <pre id="Rat">/);
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = f['Creature/Rat.txt'].replace('id="Rat"', 'id="Bat"'); }), /should be <pre id="Rat">/);
});

test('accepts the id variations the app accepts (space instead of underscore)', () => {
    const result = validate(makeProject((a, f) => { f['Mount/War_Bear.txt'] = f['Mount/War_Bear.txt'].replace('id="War_Bear"', 'id="War Bear"'); }));
    assert.deepStrictEqual(result.errors, []);
});

test('reports invalid base64 and corrupted PNG data', () => {
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = '<pre id="Rat">data:image/png;base64,iVBOR!!</pre>'; }), /invalid characters/);
    assert.match(errorsOf((a, f) => {
        const png = makePng(256, 576); png[40] ^= 0xFF; // flip bits inside a chunk
        f['Creature/Rat.txt'] = `<pre id="Rat">data:image/png;base64,${png.toString('base64')}</pre>`;
    }), /corrupted|cut off|decompressed/);
});

test('reports a sheet that is too short for its frame counts', () => {
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = spriteFile('Rat', 256, 2 * 64); }), /Rat\.txt: sheet has 2 rows .* need 9/);
});

test('warns about a sheet with unused rows', () => {
    const result = validate(makeProject((a, f) => { f['Creature/Rat.txt'] = spriteFile('Rat', 256, 16 * 64); }));
    assert.deepStrictEqual(result.errors, []);
    assert.match(result.warnings.join('\n'), /Rat\.txt: sheet has 16 rows but the rules only use 9/);
});

test('uses 2 rows per frame for creatures with only addon 1 (matches the app)', () => {
    // 9 frames x 3 rows is more than the 9 x 2 rows the app reads: a warning, not an error
    const result = validate(makeProject((a, f) => { f['Creature/Ghost.txt'] = spriteFile('Ghost', 256, 9 * 3 * 64); }));
    assert.deepStrictEqual(result.errors, []);
    assert.match(result.warnings.join('\n'), /Ghost\.txt: sheet has 27 rows but the rules only use 18/);
});

test('reports duplicates, spaces in names and misspelled rule names', () => {
    assert.match(errorsOf((a) => { a.outfiter_creature_names.push('Rat'); }), /'Rat' is listed twice/);
    assert.match(errorsOf((a) => { a.outfiter_mount_names.push('Black Sheep'); }), /contains a space/);
    assert.match(errorsOf((a) => { a.outfiter_sprites_creature_standing = { Ratt: 8 }; }), /'Ratt' does not match any name/);
    assert.match(errorsOf((a) => { a.outfiter_creature_props = { Rat: { walkng: 2 } }; }), /unknown setting 'walkng'/);
});

test('reports a syntax error in the asset list with its line number', () => {
    const errors = errorsOf(() => "window.OutfiterAssets = {\n  outfiter_mount_names: ['None' 'War_Bear']\n};");
    assert.match(errors, /could not be read/);
    assert.match(errors, /outfitter-assets\.js:2/);
});
