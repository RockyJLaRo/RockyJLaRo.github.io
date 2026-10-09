#!/usr/bin/env node
/*
 * Add a new creature, mount or outfit in one command (needs Node.js).
 * It does what the Asset Helper page tells you to do by hand:
 *   1. checks the sprite sheet and the settings (same rules as the Outfitter),
 *   2. writes the sprite file(s) into base64/<Folder>/,
 *   3. adds the block to the end of js/outfitter-new-assets.js,
 *   4. runs the full checker - and undoes steps 2 and 3 if anything new is wrong.
 * Existing items and files are never changed.
 *
 * Examples:
 *   node tools/add-asset.js --type creature --name "Example Creature" --image Example_Creature.png
 *   node tools/add-asset.js --type mount --name Example_Mount --image mount.png --colourisable
 *   node tools/add-asset.js --type outfit --name Example_Outfit --image male.png --female-image female.png
 *        --female yes --addons both --can-ride yes
 *
 * Options (anything left out is guessed from the sheet size and printed):
 *   --type creature|mount|outfit|other_outfit   (required)
 *   --name NAME            (required; spaces become underscores)
 *   --image FILE           (required; .png or an existing .txt sprite file)
 *   --female-image FILE    (outfits with a female version / separate female file)
 *   --standing N  --walking N  --colourisable  --addons none|addon_1|both|one_at_a_time
 *   --female yes|no  --can-ride yes|no  --female-name NAME  --separate-female-file
 *   --note TEXT            (free text, e.g. where the sprite comes from)
 *   --dry-run              (only check and show what would be written)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { isDeepStrictEqual } = require('util');
const rules = require('../js/outfitter-asset-rules.js');
const { validate, loadAssets, inspectPng } = require('./validate-assets.js');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        const key = argv[i];
        if (!key.startsWith('--')) { throw new Error(`unexpected "${key}" - options start with --`); }
        const name = key.slice(2);
        if (['colourisable', 'separate-female-file', 'dry-run', 'help'].includes(name)) { args[name] = true; continue; }
        if (i + 1 >= argv.length) { throw new Error(`${key} needs a value`); }
        args[name] = argv[++i];
    }
    return args;
}

const yesNo = (value, option) => {
    if (/^(yes|y|true)$/i.test(value)) { return true; }
    if (/^(no|n|false)$/i.test(value)) { return false; }
    throw new Error(`${option} must be yes or no`);
};

/** Read a .png or .txt sprite. Returns { base64, width, height }. */
function readSprite(file) {
    if (!fs.existsSync(file)) { throw new Error(`file not found: ${file}`); }
    let base64;
    if (/\.txt$/i.test(file)) {
        const text = fs.readFileSync(file, 'utf8');
        const match = /<pre id="([^"]*)">/i.exec(text);
        const sprite = rules.parseSpriteFile(text, match ? match[1] : '');
        if (sprite.error) { throw new Error(`${file}: ${sprite.error}`); }
        base64 = sprite.base64;
    } else {
        base64 = fs.readFileSync(file).toString('base64');
    }
    let size;
    try {
        size = inspectPng(Buffer.from(base64, 'base64'));
    } catch (e) {
        throw new Error(`${file}: ${e.message} (only PNG images are supported)`);
    }
    return { base64, width: size.width, height: size.height };
}

/** Plain copy of the entries (vm objects -> normal objects) for comparing. */
const plain = (value) => JSON.parse(JSON.stringify(value));

function addAsset(root, args, log) {
    const type = args.type;
    if (!rules.TYPES[type]) { throw new Error("--type must be creature, mount, outfit or other_outfit"); }
    if (!args.name) { throw new Error('--name is required'); }
    if (!args.image) { throw new Error('--image is required'); }
    const name = rules.toAssetName(args.name);
    const main = readSprite(args.image);
    const female = args['female-image'] ? readSprite(args['female-image']) : null;

    // current project data (stop if it already has problems: fix those first)
    const loaded = loadAssets(root);
    if (!loaded.A || loaded.errors.length) {
        throw new Error('the project already has problems - run "npm run validate" and fix them first:\n  ' + loaded.errors.join('\n  '));
    }
    const existing = rules.mergeNewAssets(loaded.A, loaded.newEntries);
    if (existing.problems.length) {
        throw new Error('js/outfitter-new-assets.js already has problems - fix them first:\n  ' + existing.problems.map((p) => p.message).join('\n  '));
    }

    // build the entry: given options win, the rest is guessed from the sheet
    const guess = rules.guessLayout(type, main.width, main.height, type === 'creature' ? args.addons : undefined);
    const entry = { type, id: rules.nextFreeId(loaded.A, type), name };
    const standing = args.standing !== undefined ? parseInt(args.standing, 10) : guess.fields.standing_frames;
    const walking = args.walking !== undefined ? parseInt(args.walking, 10) : guess.fields.walking_frames;
    if (standing === undefined || walking === undefined) {
        throw new Error(`could not guess the frame counts (${guess.message}) - give --standing and --walking`);
    }
    if (standing !== 1) { entry.standing_frames = standing; }
    if (walking !== 8) { entry.walking_frames = walking; }
    if (type === 'creature' || type === 'mount') {
        if (args.colourisable || (args.colourisable === undefined && guess.fields.colourisable)) { entry.colourisable = true; }
    }
    if (type === 'creature') {
        const addons = args.addons || 'none';
        if (addons !== 'none') { entry.addons = addons; }
    }
    if (type === 'outfit' || type === 'other_outfit') {
        if (args.female === undefined) { throw new Error('outfits need --female yes or --female no'); }
        entry.female = yesNo(args.female, '--female');
        entry.addons = args.addons || guess.fields.addons;
        entry.can_ride_mount = args['can-ride'] !== undefined ? yesNo(args['can-ride'], '--can-ride') : guess.fields.can_ride_mount;
        if (entry.addons === undefined || entry.can_ride_mount === undefined) {
            throw new Error(`could not guess the layout (${guess.message}) - give --addons and --can-ride`);
        }
        if (args['female-name']) { entry.female_name = rules.toAssetName(args['female-name']); }
        if (args['separate-female-file']) { entry.separate_female_file = true; }
    }
    if (args.note) { entry.note = args.note; }
    log(`Settings: ${guess.found ? 'guessed from the sheet: ' + guess.message : guess.message}; given options win.`);

    // check the entry and the sheets against the rules (on a copy, nothing written yet)
    const A = loaded.A;
    const merged = rules.mergeNewAssets(A, [entry], { inFile: false });
    if (merged.problems.length) { throw new Error(merged.problems.map((p) => p.message).join('\n')); }
    const files = rules.filesForEntry(entry).map((f) => ({ ...f, sprite: f.female && (type === 'outfit' || entry.separate_female_file) ? female : main }));
    const problems = [];
    for (const f of files) {
        if (!f.sprite) { problems.push(`${f.path} needs a sprite: add --female-image`); continue; }
        const result = rules.compareSheetSize(A, rules.TYPES[type].kind, name, f.sprite.width, f.sprite.height);
        if (result && result.level === 'error') { problems.push(`${f.path}: ${result.message}`); }
        if (result && result.level === 'warning') { log(`Note: ${f.path}: ${result.message}`); }
        if (fs.existsSync(path.join(root, f.path)) && !args.replace) {
            problems.push(`${f.path} already exists - choose another name (existing files are never overwritten)`);
        }
    }
    if (problems.length) { throw new Error(problems.join('\n')); }

    const block = rules.formatEntry(entry);
    if (args['dry-run']) {
        log('Dry run - nothing was written. It would:');
        files.forEach((f) => log(`  create ${f.path}`));
        log(`  add to js/outfitter-new-assets.js:\n${block}`);
        return entry;
    }

    // write, verify, and undo everything if a new problem appears
    const newAssetsFile = path.join(root, 'js', 'outfitter-new-assets.js');
    const originalText = fs.readFileSync(newAssetsFile, 'utf8');
    const close = originalText.lastIndexOf(']');
    if (close === -1) { throw new Error('js/outfitter-new-assets.js does not end with the closing ] of the list'); }
    // the block goes on its own line just before the closing ] of the list
    const head = originalText.slice(0, close).replace(/[ \t]*$/, '');
    const updatedText = head + (head.endsWith('\n') ? '' : '\n') + block + '\n' + originalText.slice(close);
    const before = validate(root).errors;
    const written = [];
    const undo = () => {
        fs.writeFileSync(newAssetsFile, originalText);
        written.forEach((file) => fs.unlinkSync(file));
    };
    try {
        for (const f of files) {
            const target = path.join(root, f.path);
            fs.writeFileSync(target, rules.makeSpriteFile(f.name, f.sprite.base64));
            written.push(target);
        }
        fs.writeFileSync(newAssetsFile, updatedText);
        // the old entries must be unchanged and the new one must read back exactly
        const sandbox = { window: {} };
        vm.createContext(sandbox);
        try {
            vm.runInContext(updatedText, sandbox);
        } catch (e) {
            throw new Error(`js/outfitter-new-assets.js could not be read after adding the block (${e.message}). ` +
                'Check that the file ends with the list\'s closing ]; and that every block in it ends with },');
        }
        const after = plain(sandbox.window.OutfiterNewAssets);
        const old = plain(loaded.newEntries);
        // (compared field by field; the order of the fields does not matter)
        if (!isDeepStrictEqual(after.slice(0, old.length), old) || !isDeepStrictEqual(after[old.length], plain(entry)) || after.length !== old.length + 1) {
            throw new Error('js/outfitter-new-assets.js did not read back as expected');
        }
        const newErrors = validate(root).errors.filter((e) => !before.includes(e));
        if (newErrors.length) { throw new Error('the checker found new problems:\n' + newErrors.join('\n')); }
    } catch (e) {
        undo();
        throw new Error(e.message + '\nNothing was changed (the new files were removed again).');
    }
    files.forEach((f) => log(`Created ${f.path}`));
    log(`Added ${rules.TYPES[type].label} '${name}' with ID ${entry.id} to js/outfitter-new-assets.js:\n${block}`);
    const query = type === 'creature' ? `o=105&cr=${entry.id}` : type === 'mount' ? `m=${entry.id}` : `o=${entry.id}`;
    log(`\nPreview: npm start, then open http://localhost:8080/?${query}&a`);
    log('Publish: commit and push the new file(s) and js/outfitter-new-assets.js (see docs/MAINTAINING.md).');
    return entry;
}

if (require.main === module) {
    let args;
    try {
        args = parseArgs(process.argv.slice(2));
        if (args.help || !process.argv[2]) {
            console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n\/\*/, '').replace(/^ \* ?/gm, ''));
            process.exit(0);
        }
        addAsset(path.resolve(__dirname, '..'), args, (line) => console.log(line));
    } catch (e) {
        console.error('Not added: ' + e.message);
        process.exitCode = 1;
    }
}

module.exports = { addAsset, parseArgs };
