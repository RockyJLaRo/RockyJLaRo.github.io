// Unit tests for js/outfitter-asset-rules.js (shared by the app, the checker and the
// Asset Helper). Run with:  npm run test:unit
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const vm = require('vm');
const rules = require('../../js/outfitter-asset-rules.js');

/** Minimal asset data with the same shape as js/outfitter-assets.js */
function emptyAssets() {
    const A = {
        outfiter_mount_names: ['None', 'War_Bear'],
        outfiter_creature_names: ['None', 'Rat'],
        outfiter_names0: ['Citizen'],
        outfiter_names100: ['Frog', 'Elf', 'Dwarf', 'Archdemon', 'CM', 'None'],
        outfiter_names200: []
    };
    for (const key of ['outfiter_sprites_standing', 'outfiter_sprites_walking', 'outfiter_sprites_creature_standing', 'outfiter_sprites_creature_walking',
        'outfiter_creature_props', 'outfiter_special_delays_standing', 'outfiter_special_delays_moving', 'outfiter_special_delays_mount_standing',
        'outfiter_pingpong_animation', 'outfiter_4096h', 'outfiter_sprites_mount_standing', 'outfiter_sprites_mount_walking', 'outfiter_mount_colourisable',
        'outfiter_f_suffix_inames', 'outfiter_u_names', 'outfiter_m_names', 'outfiter_a_names', 'outfiter_no_ride_names', 'outfiter_no_floor_move_names',
        'outfiter_o_names', 'outfiter_separator', 'outfiter_mount_separator', 'outfiter_creature_separator', 'outfiter_f_names']) { A[key] = {}; }
    return A;
}

test('parseSpriteFile accepts the variations existing files use', () => {
    const uri = 'data:image/png;base64,iVBORw0KGgo=';
    assert.strictEqual(rules.parseSpriteFile(`<pre id="Sea_Devil">${uri}</pre>`, 'Sea_Devil').dataUri, uri);
    assert.strictEqual(rules.parseSpriteFile(`<pre id="Sea Devil">\n${uri.slice(0, 20)}\n${uri.slice(20)}</pre>\n[[Category:Outfiter]]`, 'Sea_Devil').dataUri, uri);
    assert.strictEqual(rules.parseSpriteFile(`<pre id="sea_devil">${uri}</pre>`, 'Sea_Devil').dataUri, uri);
});

test('parseSpriteFile explains what is wrong', () => {
    assert.match(rules.parseSpriteFile('data:image/png;base64,AAAA', 'X').error, /must look like <pre id="X">/);
    assert.match(rules.parseSpriteFile('<pre id="Y">data:image/png;base64,AAAA</pre>', 'X').error, /contains <pre id="Y"> but it must be <pre id="X">/);
    assert.match(rules.parseSpriteFile('<pre id="X">data:image/gif;base64,AAAA</pre>', 'X').error, /only PNG/);
    assert.match(rules.parseSpriteFile('<pre id="X">data:image/png;base64,AA!A</pre>', 'X').error, /invalid characters/);
});

test('formatEntry output can be pasted back as JavaScript and gives the same entry', () => {
    const entry = { type: 'outfit', id: 236, name: "Gaz'ha_Test", female: true, female_name: 'Test_Woman', addons: 'one_at_a_time', can_ride_mount: false, standing_frames: 8, note: 'from a "test"' };
    const text = rules.formatEntry(entry);
    assert.match(text, /^ {4}\{\n/);
    assert.match(text, /\n {4}\},$/);
    const parsed = vm.runInNewContext('[' + text + ']')[0];
    assert.deepStrictEqual(JSON.parse(JSON.stringify(parsed)), entry);
});

test('new entries are written into the same rule lists the app always used', () => {
    const A = emptyAssets();
    const result = rules.mergeNewAssets(A, [
        { type: 'creature', id: 2, name: 'Ghost', standing_frames: 0, walking_frames: 2, colourisable: true, addons: 'addon_1', walking_delay_ms: 300 },
        { type: 'mount', id: 2, name: 'Drake', standing_frames: 8, colourisable: true },
        { type: 'outfit', id: 200, name: 'Ranger_X', female: false, addons: 'none', can_ride_mount: false },
        { type: 'other_outfit', id: 106, name: 'Npc_X', female: true, separate_female_file: true, addons: 'one_at_a_time', can_ride_mount: true }
    ]);
    assert.deepStrictEqual(result.problems, []);
    assert.deepStrictEqual(result.added.map((a) => a.id), [2, 2, 200, 106]);
    assert.strictEqual(A.outfiter_creature_names[2], 'Ghost');
    assert.deepStrictEqual(A.outfiter_creature_props.Ghost, { standing: 0, walking: 2, colourisable: true, addon1: true, walking_delay: 300 });
    assert.strictEqual(A.outfiter_sprites_mount_standing.Drake, 8);
    assert.strictEqual(A.outfiter_mount_colourisable.Drake, true);
    assert.strictEqual(A.outfiter_names200[0], 'Ranger_X');
    assert.ok(A.outfiter_u_names.Ranger_X && A.outfiter_a_names.Ranger_X && A.outfiter_m_names.Ranger_X && A.outfiter_no_ride_names.Ranger_X);
    assert.strictEqual(A.outfiter_names100[6], 'Npc_X');
    assert.ok(A.outfiter_f_suffix_inames.Npc_X && A.outfiter_o_names.Npc_X);
    // the sheet sizes the app expects follow from those rules
    assert.deepStrictEqual(rules.expectedSheetSize(A, 'creature', 'Ghost').rows, 4); // 2 frames x (base + addon 1)
    assert.strictEqual(rules.expectedSheetSize(A, 'creature', 'Ghost').width, 512);
    assert.strictEqual(rules.expectedSheetSize(A, 'outfit', 'Ranger_X').rows, 9);
    // files each entry needs
    assert.deepStrictEqual(rules.filesForEntry({ type: 'outfit', name: 'Y', female: true }).map((f) => f.path), ['base64/Male/Y.txt', 'base64/Female/Y.txt']);
    assert.deepStrictEqual(rules.filesForEntry({ type: 'other_outfit', name: 'Npc_X', female: true, separate_female_file: true }).map((f) => f.path), ['base64/Other/Npc_X.txt', 'base64/Other/Npc_X_Female.txt']);
});

test('a broken entry is skipped but the others are still added', () => {
    const A = emptyAssets();
    const result = rules.mergeNewAssets(A, [
        { type: 'creature', id: 2, name: 'Good_One' },
        { type: 'mount', id: 2 }, // no name
        'not a block'
    ]);
    assert.deepStrictEqual(result.added.map((a) => a.name), ['Good_One']);
    assert.strictEqual(result.problems.length, 2);
    assert.match(result.problems[0].message, /missing the required field 'name'.*skipped/);
    assert.match(result.problems[1].message, /is not a \{ \.\.\. \} block/);
    assert.deepStrictEqual(A.outfiter_mount_names, ['None', 'War_Bear']);
});

test('not a list at all is reported without touching the existing data', () => {
    const A = emptyAssets();
    const before = JSON.stringify(A);
    const result = rules.mergeNewAssets(A, { type: 'creature' });
    assert.match(result.problems[0].message, /must be a list/);
    assert.strictEqual(JSON.stringify(A), before);
});

test('nextFreeId and toAssetName', () => {
    const A = emptyAssets();
    assert.strictEqual(rules.nextFreeId(A, 'creature'), 2);
    assert.strictEqual(rules.nextFreeId(A, 'outfit'), 200);
    assert.strictEqual(rules.nextFreeId(A, 'other_outfit'), 106);
    assert.strictEqual(rules.toAssetName('  Rotten  Blob '), 'Rotten_Blob');
});
