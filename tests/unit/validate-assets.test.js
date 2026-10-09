// Unit tests for tools/validate-assets.js. Run with:  npm run test:unit
// Each test builds a tiny fake project in a temporary folder, breaks one thing,
// and checks that the validator reports it.
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../../tools/validate-assets');
const { makePng, spriteFile, makeProject } = require('../fixtures');

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
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = f['Creature/Rat.txt'].replace('id="Rat"', 'id="Bat"'); }), /must be <pre id="Rat">/);
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
    assert.match(errorsOf((a, f) => { f['Creature/Rat.txt'] = spriteFile('Rat', 256, 2 * 64); }), /Rat\.txt: the sheet has 2 rows .* need 9/);
});

test('warns about a sheet with unused rows', () => {
    const result = validate(makeProject((a, f) => { f['Creature/Rat.txt'] = spriteFile('Rat', 256, 16 * 64); }));
    assert.deepStrictEqual(result.errors, []);
    assert.match(result.warnings.join('\n'), /Rat\.txt: the sheet has 16 rows but the rules only use 9/);
});

test('uses 2 rows per frame for creatures with only addon 1 (matches the app)', () => {
    // 9 frames x 3 rows is more than the 9 x 2 rows the app reads: a warning, not an error
    const result = validate(makeProject((a, f) => { f['Creature/Ghost.txt'] = spriteFile('Ghost', 256, 9 * 3 * 64); }));
    assert.deepStrictEqual(result.errors, []);
    assert.match(result.warnings.join('\n'), /Ghost\.txt: the sheet has 27 rows but the rules only use 18/);
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

/* --------------------------------------------------------------------- */
/* New items (js/outfitter-new-assets.js)                                 */
/* --------------------------------------------------------------------- */

test('accepts a new creature, mount and outfit with their sprite files', () => {
    const result = validate(makeProject((a, f, n) => {
        n.push({ type: 'creature', id: 3, name: 'New_Creature' });
        n.push({ type: 'mount', id: 2, name: 'New_Mount', colourisable: true });
        n.push({ type: 'outfit', id: 200, name: 'New_Outfit', female: true, addons: 'both', can_ride_mount: true });
        f['Creature/New_Creature.txt'] = spriteFile('New_Creature', 256, 9 * 64);
        f['Mount/New_Mount.txt'] = spriteFile('New_Mount', 512, 9 * 64);
        f['Male/New_Outfit.txt'] = spriteFile('New_Outfit', 512, 9 * 6 * 64);
        f['Female/New_Outfit.txt'] = spriteFile('New_Outfit', 512, 9 * 6 * 64);
    }));
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.stats.newItems, 3);
});

test('new item: missing sprite file, wrong size and missing female file are reported', () => {
    const errors = errorsOf((a, f, n) => {
        n.push({ type: 'creature', id: 3, name: 'New_Creature' });
        n.push({ type: 'outfit', id: 200, name: 'New_Outfit', female: true, addons: 'none', can_ride_mount: false });
        f['Male/New_Outfit.txt'] = spriteFile('New_Outfit', 512, 2 * 64);
    });
    assert.match(errors, /base64\/Creature\/New_Creature\.txt is missing .*new item.*upload the sprite file/);
    assert.match(errors, /base64\/Male\/New_Outfit\.txt: the sheet has 2 rows .* need 9/);
    assert.match(errors, /base64\/Female\/New_Outfit\.txt is missing/);
});

test('new item: ID conflicts, gaps and duplicate names are reported', () => {
    assert.match(errorsOf((a, f, n) => { n.push({ type: 'creature', id: 2, name: 'Bat' }); }), /uses ID 2, which already belongs to creature 'Ghost'\. The next free ID is 3/);
    assert.match(errorsOf((a, f, n) => { n.push({ type: 'creature', id: 9, name: 'Bat' }); }), /uses ID 9 but the next free ID is 3/);
    assert.match(errorsOf((a, f, n) => { n.push({ type: 'creature', id: 3, name: 'rat' }); }), /same name as existing creature 'Rat'/);
    assert.match(errorsOf((a, f, n) => {
        n.push({ type: 'creature', id: 3, name: 'Bat' });
        n.push({ type: 'creature', id: 3, name: 'Wolf' });
    }), /creature 'Wolf' \(ID 3\).*already belongs to creature 'Bat'/);
});

test('new item: wrong fields are explained', () => {
    const errors = errorsOf((a, f, n) => {
        n.push({ type: 'monster', id: 3, name: 'X' });
        n.push({ type: 'creature', id: 3, name: 'Bad Name' });
        n.push({ type: 'mount', id: 2, name: 'M', walking_frame: 8 });
        n.push({ type: 'outfit', id: 200, name: 'O', female: 'yes', addons: 'both' });
        n.push({ type: 'outfit', id: 50, name: 'P', female: true, addons: 'both', can_ride_mount: true });
    });
    assert.match(errors, /type must be 'creature', 'mount', 'outfit' or 'other_outfit'/);
    assert.match(errors, /name contains a space - use underscores, e.g\. 'Bad_Name'/);
    assert.match(errors, /has the field 'walking_frame', which is not used for a mount/);
    assert.match(errors, /is missing the required field 'can_ride_mount'/);
    assert.match(errors, /female must be true or false/);
    assert.match(errors, /player outfits use IDs from 200/);
});

test('a syntax error in js/outfitter-new-assets.js is reported with its line, the rest is still checked', () => {
    const result = validate(makeProject(null, "window.OutfiterNewAssets = [\n  { type: 'creature' id: 3 }\n];"));
    const errors = result.errors.join('\n');
    assert.match(errors, /js\/outfitter-new-assets\.js could not be read/);
    assert.match(errors, /outfitter-new-assets\.js:2/);
    assert.ok(result.stats.filesChecked > 0, 'existing items are still checked');
});
