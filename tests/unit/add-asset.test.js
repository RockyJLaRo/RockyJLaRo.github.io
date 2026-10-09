// Unit tests for tools/add-asset.js (the one-command way to add an item).
// Each test works on a small fake project in a temporary folder.
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { addAsset, parseArgs } = require('../../tools/add-asset');
const { validate } = require('../../tools/validate-assets');
const rules = require('../../js/outfitter-asset-rules');
const { makePng, makeProject } = require('../fixtures');

/** Write a PNG of the given size to a temporary file and return its path. */
function pngFile(width, height, name = 'sheet.png') {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'outfitter-png-'));
    const file = path.join(dir, name);
    fs.writeFileSync(file, makePng(width, height));
    return file;
}

/** The entries in the project's js/outfitter-new-assets.js */
function newEntries(root) {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(root, 'js', 'outfitter-new-assets.js'), 'utf8'), sandbox);
    return JSON.parse(JSON.stringify(sandbox.window.OutfiterNewAssets));
}

/** Everything under base64/ and js/ as { relative path: content } */
function snapshot(root) {
    const out = {};
    const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            if (fs.statSync(full).isDirectory()) { walk(full); } else { out[path.relative(root, full)] = fs.readFileSync(full, 'utf8'); }
        }
    };
    walk(path.join(root, 'base64'));
    walk(path.join(root, 'js'));
    return out;
}

const quiet = () => {};

test('adds a creature: sprite file, block with the next free ID, checker passes', () => {
    const root = makeProject(); // its list is written on one line: window.OutfiterNewAssets = [];
    const entry = addAsset(root, { type: 'creature', name: 'Test Bat', image: pngFile(256, 9 * 64) }, quiet);
    assert.deepStrictEqual(entry, { type: 'creature', id: 3, name: 'Test_Bat' });
    const file = fs.readFileSync(path.join(root, 'base64', 'Creature', 'Test_Bat.txt'), 'utf8');
    assert.ok(file.startsWith('<pre id="Test_Bat">data:image/png;base64,'));
    assert.deepStrictEqual(newEntries(root), [entry]);
    assert.deepStrictEqual(validate(root).errors, []);
});

test('adds an outfit with a female version (two files) and a second item after it', () => {
    const root = makeProject();
    const male = pngFile(512, 9 * 6 * 64, 'male.png');
    const female = pngFile(512, 9 * 6 * 64, 'female.png');
    const outfit = addAsset(root, { type: 'outfit', name: 'Test_Outfit', image: male, 'female-image': female, female: 'yes' }, quiet);
    assert.deepStrictEqual(outfit, { type: 'outfit', id: 200, name: 'Test_Outfit', female: true, addons: 'both', can_ride_mount: true });
    assert.ok(fs.existsSync(path.join(root, 'base64', 'Male', 'Test_Outfit.txt')));
    assert.ok(fs.existsSync(path.join(root, 'base64', 'Female', 'Test_Outfit.txt')));
    const mount = addAsset(root, { type: 'mount', name: 'Test_Mount', image: pngFile(256, 9 * 64) }, quiet);
    assert.strictEqual(mount.id, 2);
    assert.deepStrictEqual(newEntries(root), [outfit, mount]);
    assert.deepStrictEqual(validate(root).errors, []);
});

test('guesses colour masks and frame counts from the sheet size', () => {
    const root = makeProject();
    const entry = addAsset(root, { type: 'mount', name: 'Test_Mount', image: pngFile(512, 3 * 64) }, quiet);
    // 512px wide = colour masks; fewer than 9 rows = walking frames only
    assert.deepStrictEqual(entry, { type: 'mount', id: 2, name: 'Test_Mount', standing_frames: 0, walking_frames: 3, colourisable: true });
    // creature with addons: every frame has base + addon rows (here 2 x 9 rows)
    const creature = addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 2 * 9 * 64), addons: 'addon_1' }, quiet);
    assert.deepStrictEqual(creature, { type: 'creature', id: 3, name: 'Test_Bat', addons: 'addon_1' });
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat2', image: pngFile(256, 10 * 64), addons: 'both' }, quiet),
        /cannot be split into frames of 3 rows/);
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat3', image: pngFile(250, 9 * 64) }, quiet), /not made of 64 x 64 frames/);
});

test('--dry-run checks everything but writes nothing', () => {
    const root = makeProject();
    const before = snapshot(root);
    const lines = [];
    addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 9 * 64), 'dry-run': true }, (l) => lines.push(l));
    assert.deepStrictEqual(snapshot(root), before);
    assert.match(lines.join('\n'), /Dry run - nothing was written/);
    assert.match(lines.join('\n'), /create base64\/Creature\/Test_Bat\.txt/);
});

test('refuses (and changes nothing) for a name that is already used', () => {
    const root = makeProject();
    const before = snapshot(root);
    assert.throws(() => addAsset(root, { type: 'creature', name: 'rat', image: pngFile(256, 9 * 64) }, quiet), /same name as existing creature 'Rat'/);
    assert.deepStrictEqual(snapshot(root), before);
});

test('refuses a sheet that does not fit the settings', () => {
    const root = makeProject();
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 9 * 64), walking: '12' }, quiet), /the sheet has 9 rows .* need 13/);
    assert.throws(() => addAsset(root, { type: 'outfit', name: 'Test_Outfit', image: pngFile(256, 9 * 64), female: 'no' }, quiet), /could not guess the layout|should be 512px/);
});

test('refuses files that are not PNG images, and outfits without --female', () => {
    const root = makeProject();
    const notPng = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'outfitter-png-')), 'sheet.png');
    fs.writeFileSync(notPng, 'hello');
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: notPng }, quiet), /only PNG images are supported/);
    assert.throws(() => addAsset(root, { type: 'outfit', name: 'Test_Outfit', image: pngFile(512, 9 * 6 * 64) }, quiet), /--female yes or --female no/);
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: '/no/such/file.png' }, quiet), /file not found/);
});

test('never overwrites an existing sprite file', () => {
    const root = makeProject();
    const target = path.join(root, 'base64', 'Creature', 'Test_Bat.txt');
    fs.writeFileSync(target, 'someone else\'s file');
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 9 * 64) }, quiet), /already exists/);
    assert.strictEqual(fs.readFileSync(target, 'utf8'), 'someone else\'s file');
});

test('stops when js/outfitter-new-assets.js already has a problem', () => {
    const root = makeProject((a, f, entries) => { entries.push({ type: 'mount', id: 9, name: 'Gap_Mount' }); });
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 9 * 64) }, quiet), /already has problems[\s\S]*next free ID is 2/);
});

test('undoes everything when the result does not check out', () => {
    // a comment with "]" after the list makes the new block land in the wrong place
    const source = 'window.OutfiterNewAssets = [\n];\n// list ends above ]\n';
    const root = makeProject(null, source);
    const before = snapshot(root);
    assert.throws(() => addAsset(root, { type: 'creature', name: 'Test_Bat', image: pngFile(256, 9 * 64) }, quiet), /Nothing was changed/);
    assert.deepStrictEqual(snapshot(root), before);
});

test('the written block reads back exactly (round trip through formatEntry)', () => {
    const root = makeProject();
    const entry = addAsset(root, {
        type: 'creature', name: "Test (Bat's) Cave", image: pngFile(256, 9 * 2 * 64), addons: 'addon_1', note: "it's a test"
    }, quiet);
    assert.deepStrictEqual(entry, { type: 'creature', id: 3, name: "Test_(Bat's)_Cave", addons: 'addon_1', note: "it's a test" });
    assert.deepStrictEqual(newEntries(root), [entry]);
    assert.ok(rules.formatEntry(entry).endsWith('},'));
    assert.deepStrictEqual(validate(root).errors, []);
});

test('command line options', () => {
    assert.deepStrictEqual(parseArgs(['--type', 'mount', '--name', 'A B', '--colourisable', '--dry-run']),
        { type: 'mount', name: 'A B', colourisable: true, 'dry-run': true });
    assert.throws(() => parseArgs(['--type']), /needs a value/);
    assert.throws(() => parseArgs(['mount']), /options start with --/);
});
