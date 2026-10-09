#!/usr/bin/env node
/*
 * Convert between normal PNG images and the Outfitter's sprite files
 * (base64/<Folder>/<Name>.txt, which hold the PNG as base64 text).
 *
 * IMPORT a PNG sprite sheet as a new (or replacement) sprite file:
 *     node tools/sprite-file.js import <Folder> <Name> <image.png>
 *     node tools/sprite-file.js import Creature Example_Creature ~/Downloads/Example_Creature.png
 *   -> writes base64/Creature/Example_Creature.txt and tells you how many frames the
 *      sheet holds. Asks for --force before replacing an existing file.
 *   To add a NEW item, tools/add-asset.js (or the Asset Helper page) is easier: it
 *   also writes the block for js/outfitter-new-assets.js and checks everything.
 *
 * EXPORT a sprite file back to a PNG (to look at it or edit it):
 *     node tools/sprite-file.js export <Folder> <Name> [output.png]
 *     node tools/sprite-file.js export Mount War_Bear
 *   -> writes War_Bear.png in the current folder.
 *
 * Folders: Creature, Female, Male, Mount, Other
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { inspectPng } = require('./validate-assets');

const ROOT = path.resolve(__dirname, '..');
const FOLDERS = ['Creature', 'Female', 'Male', 'Mount', 'Other'];

function fail(message) {
    console.error('Error: ' + message);
    process.exit(1);
}

function spritePath(folder, name) {
    if (!FOLDERS.includes(folder)) { fail(`folder must be one of ${FOLDERS.join(', ')} (got "${folder}")`); }
    if (!name || /[\s\\/:*?"<>|]/.test(name)) { fail(`"${name}" is not a valid name - use underscores instead of spaces, e.g. Black_Sheep`); }
    return path.join(ROOT, 'base64', folder, name + '.txt');
}

function importSprite(folder, name, pngFile, force) {
    const target = spritePath(folder, name);
    if (!pngFile || !fs.existsSync(pngFile)) { fail(`image "${pngFile}" not found`); }
    const png = fs.readFileSync(pngFile);
    let size;
    try {
        size = inspectPng(png);
    } catch (e) {
        fail(`${pngFile} is not a usable PNG: ${e.message}`);
    }
    if (fs.existsSync(target) && !force) {
        fail(`${path.relative(ROOT, target)} already exists. Add --force to replace it.`);
    }
    // same layout as the existing files: <pre id="Name">data:...</pre> + wiki category line
    fs.writeFileSync(target, `<pre id="${name}">data:image/png;base64,${png.toString('base64')}</pre>\n[[Category:Outfiter]]`);
    console.log(`Wrote ${path.relative(ROOT, target)} (${size.width} x ${size.height} px).`);
    if (size.width % 64 || size.height % 64) {
        console.log('WARNING: width and height should be multiples of 64 (one frame = 64 x 64 px).');
    } else {
        const rows = size.height / 64;
        console.log(`The sheet has ${size.width / 64} columns and ${rows} rows of 64 px.`);
        if (folder === 'Creature' || folder === 'Mount') {
            console.log(rows === 9
                ? 'That is the normal layout (1 standing + 8 walking frames) - no extra rules needed.'
                : 'Not the normal 9 rows: set standing_frames / walking_frames in its block (see docs/MAINTAINING.md, section 6).');
        }
    }
    console.log('Next: for a new item add its block to js/outfitter-new-assets.js, then run:  npm run validate');
}

function exportSprite(folder, name, outFile) {
    const source = spritePath(folder, name);
    if (!fs.existsSync(source)) { fail(`${path.relative(ROOT, source)} does not exist`); }
    const m = fs.readFileSync(source, 'utf8').match(/data:image\/png;base64,([^<]*)</);
    if (!m) { fail(`${path.relative(ROOT, source)} does not contain a data:image/png;base64 image`); }
    const png = Buffer.from(m[1].replace(/\s+/g, ''), 'base64');
    const target = outFile || name + '.png';
    fs.writeFileSync(target, png);
    console.log(`Wrote ${target}`);
}

if (require.main === module) {
    const args = process.argv.slice(2).filter((a) => a !== '--force');
    const force = process.argv.includes('--force');
    const [command, folder, name, file] = args;
    if (command === 'import') { importSprite(folder, name, file, force); }
    else if (command === 'export') { exportSprite(folder, name, file); }
    else {
        console.log('Usage:\n  node tools/sprite-file.js import <Folder> <Name> <image.png> [--force]\n  node tools/sprite-file.js export <Folder> <Name> [output.png]\nFolders: ' + FOLDERS.join(', '));
        process.exitCode = command ? 1 : 0;
    }
}

module.exports = { importSprite, exportSprite };
