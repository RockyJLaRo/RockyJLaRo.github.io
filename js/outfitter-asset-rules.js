/*
 * =============================================================================
 *  TibiaWiki Outfitter - ASSET RULES                      (program code)
 * =============================================================================
 *  Shared by the Outfitter (index.html), the Asset Helper page
 *  (tools/asset-helper.html) and the command-line tools (tools/*.js), so all of
 *  them read and check creatures, mounts and outfits in exactly the same way.
 *
 *  It does three things:
 *   1. mergeNewAssets(): adds the entries from js/outfitter-new-assets.js to the
 *      lists of js/outfitter-assets.js. A broken entry is skipped (and reported)
 *      instead of breaking the whole Outfitter.
 *   2. checkData(): finds mistakes in the lists and rules (typos, duplicates ...).
 *   3. Sprite-sheet helpers: which files an entry needs and what size its sheet
 *      must be (this mirrors how js/outfitter.js reads sheets).
 *
 *  Maintainers normally never edit this file. Written in plain ES5 so it runs in
 *  every browser and in Node.js.
 * =============================================================================
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.OutfiterAssetRules = api; }
}(this, function () {
    'use strict';

    var FRAME = 64; // every sprite frame is 64 x 64 pixels

    var has = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj || {}, key); };

    /* --------------------------------------------------------------------- */
    /* Entry types used in js/outfitter-new-assets.js                         */
    /* --------------------------------------------------------------------- */

    // list:   array in OutfiterAssets the name is added to
    // base:   ID of the list's first element (outfit lists start at 100 / 200)
    // folder: where the sprite file lives (player outfits: Male + Female)
    var TYPES = {
        creature: { label: 'creature', list: 'outfiter_creature_names', base: 0, folder: 'Creature', kind: 'creature' },
        mount: { label: 'mount', list: 'outfiter_mount_names', base: 0, folder: 'Mount', kind: 'mount' },
        outfit: { label: 'player outfit', list: 'outfiter_names200', base: 200, folder: 'Male', femaleFolder: 'Female', kind: 'outfit' },
        other_outfit: { label: 'other outfit', list: 'outfiter_names100', base: 100, max: 199, folder: 'Other', femaleFolder: 'Other', kind: 'outfit' }
    };

    // Fields each type accepts. Anything else is reported (usually a typo).
    var COMMON_FIELDS = ['type', 'id', 'name', 'note', 'standing_frames', 'walking_frames'];
    var FIELDS = {
        creature: COMMON_FIELDS.concat(['colourisable', 'addons', 'standing_delay_ms', 'walking_delay_ms', 'standing_delays_ms', 'walking_delays_ms']),
        mount: COMMON_FIELDS.concat(['colourisable', 'standing_delays_ms']),
        outfit: COMMON_FIELDS.concat(['female', 'female_name', 'addons', 'can_ride_mount', 'standing_delays_ms']),
        other_outfit: COMMON_FIELDS.concat(['female', 'female_name', 'separate_female_file', 'addons', 'can_ride_mount', 'standing_delays_ms'])
    };
    var REQUIRED = {
        creature: ['type', 'id', 'name'],
        mount: ['type', 'id', 'name'],
        outfit: ['type', 'id', 'name', 'female', 'addons', 'can_ride_mount'],
        other_outfit: ['type', 'id', 'name', 'female', 'addons', 'can_ride_mount']
    };
    var ADDON_CHOICES = {
        creature: ['none', 'addon_1', 'both', 'one_at_a_time'],
        outfit: ['none', 'both', 'one_at_a_time'],
        other_outfit: ['none', 'both', 'one_at_a_time']
    };
    // Letters, digits and _ ( ) ' - only: these names become file names and links.
    var NAME_PATTERN = /^[A-Za-z0-9_()'\-]+$/;

    /** "Example Creature " -> "Example_Creature" (what the Asset Helper does with typed names) */
    function toAssetName(text) {
        return String(text || '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, '_');
    }

    /** Readable label for messages, e.g. "creature 'Example_Creature' (ID 788)" */
    function describeEntry(entry, index) {
        var type = entry && TYPES[entry.type] ? TYPES[entry.type].label : 'entry';
        var parts = [type];
        if (entry && typeof entry.name === 'string' && entry.name) { parts.push("'" + entry.name + "'"); }
        if (entry && typeof entry.id === 'number') { parts.push('(ID ' + entry.id + ')'); }
        if (typeof index === 'number') { parts.push('- block #' + (index + 1) + ' in js/outfitter-new-assets.js'); }
        return parts.join(' ');
    }

    /* --------------------------------------------------------------------- */
    /* Reading the lists                                                      */
    /* --------------------------------------------------------------------- */

    /** Full outfit list: IDs 0-99, 100-199 and 200+ joined like the app does. */
    function allOutfits(A) {
        var list = A.outfiter_names0.slice();
        if (A.outfiter_names100.length) { list.length = 100; list = list.concat(A.outfiter_names100); }
        if (A.outfiter_names200.length) { list.length = 200; list = list.concat(A.outfiter_names200); }
        return list;
    }

    /** All names of one category, lower-cased -> ID (for duplicate checks) */
    function namesById(A, kind) {
        var map = {}, list;
        if (kind === 'outfit') { list = allOutfits(A); }
        else { list = kind === 'mount' ? A.outfiter_mount_names : A.outfiter_creature_names; }
        list.forEach(function (name, id) { if (typeof name === 'string') { map[name.toLowerCase()] = { id: id, name: name }; } });
        return map;
    }

    /** The ID a new entry of this type gets (= the next free position). */
    function nextFreeId(A, type) {
        var t = TYPES[type];
        return t ? t.base + A[t.list].length : null;
    }

    function creatureProps(A, name) {
        var p = { standing: 1, walking: 8, colourisable: false, addon1: false, addon2: false }, custom, key;
        if (has(A.outfiter_sprites_creature_standing, name)) { p.standing = A.outfiter_sprites_creature_standing[name]; }
        if (has(A.outfiter_sprites_creature_walking, name)) { p.walking = A.outfiter_sprites_creature_walking[name]; }
        custom = A.outfiter_creature_props[name] || {};
        for (key in custom) { if (has(custom, key) && custom[key] !== undefined) { p[key] = custom[key]; } }
        return p;
    }

    /**
     * Size the app expects for a sheet: { width, rows, why }.
     * kind: 'mount' | 'creature' | 'outfit'. Mirrors how js/outfitter.js reads sheets.
     */
    function expectedSheetSize(A, kind, name) {
        var standing, walking, colour, p, perFrame, noAddons, noRide, rows, why;
        if (kind === 'mount') {
            standing = has(A.outfiter_sprites_mount_standing, name) ? A.outfiter_sprites_mount_standing[name] : 1;
            walking = has(A.outfiter_sprites_mount_walking, name) ? A.outfiter_sprites_mount_walking[name] : 8;
            colour = A.outfiter_mount_colourisable[name] === true;
            return {
                width: FRAME * 4 * (colour ? 2 : 1),
                rows: standing + walking,
                why: standing + ' standing + ' + walking + ' walking frames, 1 row each' + (colour ? ', colourisable (512px wide)' : '')
            };
        }
        if (kind === 'creature') {
            p = creatureProps(A, name);
            perFrame = 1 + (p.addon1 ? 1 : 0) + (p.addon2 ? 1 : 0);
            return {
                width: FRAME * 4 * (p.colourisable ? 2 : 1),
                rows: (p.standing + p.walking) * perFrame,
                why: p.standing + ' standing + ' + p.walking + ' walking frames, ' + perFrame + ' row(s) per frame' + (p.colourisable ? ', colourisable (512px wide)' : '')
            };
        }
        noAddons = A.outfiter_a_names[name] === true;
        noRide = A.outfiter_no_ride_names[name] === true;
        perFrame = (noAddons ? 1 : 3) * (noRide ? 1 : 2);
        standing = has(A.outfiter_sprites_standing, name) ? A.outfiter_sprites_standing[name] : 1;
        walking = has(A.outfiter_sprites_walking, name) ? A.outfiter_sprites_walking[name] : 8;
        rows = (standing + walking) * perFrame;
        why = standing + ' standing + ' + walking + ' walking frames, ' + perFrame + ' rows per frame (' +
            (noAddons ? 'no addons' : 'base + 2 addons') + (noRide ? ', no riding rows' : ', x2 for riding') + ')';
        if (A.outfiter_4096h[name] === true) {
            // rows 64+ continue in a second block to the right
            return { width: FRAME * 8 * Math.ceil(rows / 64), rows: Math.min(rows, 64), why: why + ', split into blocks of 64 rows' };
        }
        return { width: FRAME * 8, rows: rows, why: why };
    }

    /** Every sprite file the app may download: [{ folder, name, kind, id, list, sheetOf }] */
    function expectedFiles(A) {
        var files = [];
        // mount #0 and creature #0 are "None": the app never downloads a file for them
        A.outfiter_mount_names.forEach(function (name, id) { if (id > 0) { files.push({ folder: 'Mount', name: name, kind: 'mount', id: id, list: 'outfiter_mount_names' }); } });
        A.outfiter_creature_names.forEach(function (name, id) { if (id > 0) { files.push({ folder: 'Creature', name: name, kind: 'creature', id: id, list: 'outfiter_creature_names' }); } });
        allOutfits(A).forEach(function (name, id) {
            var other, list, female;
            if (name === undefined) { return; }
            other = id >= 100 && id < 200;
            list = id < 100 ? 'outfiter_names0' : (other ? 'outfiter_names100' : 'outfiter_names200');
            files.push({ folder: other ? 'Other' : 'Male', name: name, kind: 'outfit', id: id, list: list });
            if (A.outfiter_u_names[name] !== true) {
                female = name + (A.outfiter_f_suffix_inames[name] === true ? '_Female' : '');
                if (!(other && female === name)) {
                    files.push({ folder: other ? 'Other' : 'Female', name: female, sheetOf: name, kind: 'outfit', id: id, list: list });
                }
            }
        });
        return files;
    }

    /**
     * Compare a sheet's real size with what the rules need.
     * Returns null when it fits, or { level: 'error' | 'warning', message }.
     */
    function compareSheetSize(A, kind, name, width, height) {
        var exp = expectedSheetSize(A, kind, name), rows = height / FRAME,
            where = {
                mount: 'its standing/walking frame counts',
                creature: 'its standing/walking frames or addon / colour settings',
                outfit: 'its standing/walking frames or addon / riding settings'
            }[kind];
        if (width % FRAME || height % FRAME) {
            return { level: 'error', message: width + 'x' + height + 'px is not a multiple of ' + FRAME + 'px (each frame is 64 x 64)' };
        }
        if (width !== exp.width) {
            return { level: 'error', message: 'the sheet is ' + width + 'px wide but should be ' + exp.width + 'px (' + exp.why + ')' };
        }
        if (rows < exp.rows) {
            return { level: 'error', message: 'the sheet has ' + rows + ' rows of 64px but the rules need ' + exp.rows + ' (' + exp.why + '). Missing rows show as blank frames - check ' + where + '.' };
        }
        if (rows > exp.rows) {
            return { level: 'warning', message: 'the sheet has ' + rows + ' rows but the rules only use ' + exp.rows + ' (' + exp.why + '). Some frames are never shown - check ' + where + '.' };
        }
        return null;
    }

    /**
     * Read a sprite file (<pre id="Name">data:image/png;base64,...</pre>).
     * Accepts the same variations as the Outfitter always did: id in any letter case and
     * with spaces instead of underscores, line breaks inside the data.
     * Returns { dataUri, base64 } or { error } with a plain-language reason.
     */
    function parseSpriteFile(text, name) {
        var pattern = /<pre id="([^"]*)">([\s\S]*?)<\/pre>/gi, match, wanted = String(name).replace(/ /g, '_').toLowerCase(),
            found = null, ids = [], uri, b64;
        text = String(text || '');
        while ((match = pattern.exec(text)) !== null) {
            ids.push(match[1]);
            if (match[1].replace(/ /g, '_').toLowerCase() === wanted) { found = match; break; }
        }
        if (!found) {
            return { error: ids.length ?
                'the file contains <pre id="' + ids[0] + '"> but it must be <pre id="' + name + '">' :
                'the file must look like <pre id="' + name + '">data:image/png;base64,...</pre>' };
        }
        uri = found[2].replace(/\s+/g, '');
        if (uri.indexOf('data:image/png;base64,') !== 0) {
            return { error: 'the image data must start with data:image/png;base64, (only PNG images are supported)' };
        }
        b64 = uri.slice('data:image/png;base64,'.length);
        if (!b64 || !/^[A-Za-z0-9+\/]*={0,2}$/.test(b64) || b64.length % 4 !== 0) {
            return { error: 'the base64 text contains invalid characters or is cut off' };
        }
        return { dataUri: uri, base64: b64 };
    }

    /** Text of a sprite file for a PNG given as base64 (same layout as the existing files). */
    function makeSpriteFile(name, base64) {
        return '<pre id="' + name + '">data:image/png;base64,' + base64 + '</pre>\n[[Category:Outfiter]]';
    }

    /* --------------------------------------------------------------------- */
    /* New entries (js/outfitter-new-assets.js)                               */
    /* --------------------------------------------------------------------- */

    var isCount = function (v) { return typeof v === 'number' && v >= 0 && Math.floor(v) === v; };
    var isDelays = function (v) {
        return Object.prototype.toString.call(v) === '[object Array]' && v.length > 0 &&
            v.every(function (d) { return typeof d === 'number' && d > 0; });
    };

    /** Problems with one entry's fields (before looking at the lists). Returns messages. */
    function checkEntryFields(entry) {
        var problems = [], t, key, standing, walking, required;
        if (!entry || typeof entry !== 'object' || Object.prototype.toString.call(entry) === '[object Array]') {
            return ['is not a { ... } block'];
        }
        t = entry.type;
        if (!has(TYPES, t)) {
            return ["type must be 'creature', 'mount', 'outfit' or 'other_outfit' (found " + JSON.stringify(t) + ')'];
        }
        required = REQUIRED[t];
        required.forEach(function (field) {
            if (!has(entry, field)) { problems.push("is missing the required field '" + field + "'"); }
        });
        for (key in entry) {
            if (has(entry, key) && FIELDS[t].indexOf(key) === -1) {
                problems.push("has the field '" + key + "', which is not used for a " + TYPES[t].label + ' (allowed: ' + FIELDS[t].join(', ') + ')');
            }
        }
        if (has(entry, 'id') && !(typeof entry.id === 'number' && Math.floor(entry.id) === entry.id && entry.id > 0)) {
            problems.push('id must be a whole number (the Asset Helper shows the next free ID)');
        }
        if (has(entry, 'name')) {
            if (typeof entry.name !== 'string' || !entry.name) { problems.push('name must be text in quotes'); }
            else if (/\s/.test(entry.name)) { problems.push("name contains a space - use underscores, e.g. '" + toAssetName(entry.name) + "'"); }
            else if (!NAME_PATTERN.test(entry.name)) { problems.push("name may only contain letters, digits and _ ( ) ' -"); }
            else if (entry.name.toLowerCase() === 'none') { problems.push("'None' is reserved"); }
        }
        ['standing_frames', 'walking_frames'].forEach(function (field) {
            if (has(entry, field) && !isCount(entry[field])) { problems.push(field + ' must be a whole number (0 or more)'); }
        });
        standing = has(entry, 'standing_frames') ? entry.standing_frames : 1;
        walking = has(entry, 'walking_frames') ? entry.walking_frames : 8;
        if (isCount(standing) && isCount(walking) && standing + walking === 0) { problems.push('needs at least one frame (standing_frames + walking_frames is 0)'); }
        ['colourisable', 'female', 'can_ride_mount', 'separate_female_file'].forEach(function (field) {
            if (has(entry, field) && typeof entry[field] !== 'boolean') { problems.push(field + ' must be true or false (without quotes)'); }
        });
        if (has(entry, 'addons') && ADDON_CHOICES[t] && ADDON_CHOICES[t].indexOf(entry.addons) === -1) {
            problems.push("addons must be one of '" + ADDON_CHOICES[t].join("', '") + "'");
        }
        if (has(entry, 'female_name') && !(typeof entry.female_name === 'string' && NAME_PATTERN.test(entry.female_name))) {
            problems.push("female_name must be a name like 'Noblewoman' (letters, digits and _ ( ) ' -)");
        }
        if (has(entry, 'female_name') && entry.female === false) { problems.push('female_name is set but female is false'); }
        if (has(entry, 'separate_female_file') && entry.female === false) { problems.push('separate_female_file is set but female is false'); }
        ['standing_delay_ms', 'walking_delay_ms'].forEach(function (field) {
            if (has(entry, field) && !(typeof entry[field] === 'number' && entry[field] > 0)) { problems.push(field + ' must be a number of milliseconds, e.g. 100'); }
        });
        ['standing_delays_ms', 'walking_delays_ms'].forEach(function (field) {
            if (has(entry, field) && !isDelays(entry[field])) { problems.push(field + ' must be a list of milliseconds, e.g. [100, 100, 200]'); }
        });
        if (isDelays(entry.standing_delays_ms) && entry.standing_delays_ms.length !== standing) {
            problems.push('standing_delays_ms lists ' + entry.standing_delays_ms.length + ' delays but standing_frames is ' + standing);
        }
        if (isDelays(entry.walking_delays_ms) && entry.walking_delays_ms.length !== walking) {
            problems.push('walking_delays_ms lists ' + entry.walking_delays_ms.length + ' delays but walking_frames is ' + walking);
        }
        if (t === 'outfit' && typeof entry.id === 'number' && entry.id < 200) {
            problems.push('player outfits use IDs from 200 (IDs below 100 are old outfits; 100-199 are other outfits)');
        }
        if (t === 'other_outfit' && typeof entry.id === 'number' && (entry.id < 100 || entry.id > 199)) {
            problems.push('other outfits use IDs 100-199');
        }
        return problems;
    }

    /** Write an accepted entry into the lists and rule tables of A. */
    function applyEntry(A, entry) {
        var t = entry.type, name = entry.name,
            standing = has(entry, 'standing_frames') ? entry.standing_frames : 1,
            walking = has(entry, 'walking_frames') ? entry.walking_frames : 8,
            props;
        A[TYPES[t].list].push(name);
        if (t === 'creature') {
            props = { standing: standing, walking: walking };
            if (entry.colourisable) { props.colourisable = true; }
            if (entry.addons === 'addon_1') { props.addon1 = true; }
            if (entry.addons === 'both' || entry.addons === 'one_at_a_time') { props.addon1 = true; props.addon2 = true; }
            if (entry.addons === 'one_at_a_time') { props.exclusive_addons = true; }
            if (has(entry, 'standing_delay_ms')) { props.standing_delay = entry.standing_delay_ms; }
            if (has(entry, 'walking_delay_ms')) { props.walking_delay = entry.walking_delay_ms; }
            if (has(entry, 'standing_delays_ms')) { props.standing_delays = entry.standing_delays_ms.slice(); }
            if (has(entry, 'walking_delays_ms')) { props.walking_delays = entry.walking_delays_ms.slice(); }
            A.outfiter_creature_props[name] = props;
            return;
        }
        if (t === 'mount') {
            if (standing !== 1) { A.outfiter_sprites_mount_standing[name] = standing; }
            if (walking !== 8) { A.outfiter_sprites_mount_walking[name] = walking; }
            if (entry.colourisable) { A.outfiter_mount_colourisable[name] = true; }
            if (has(entry, 'standing_delays_ms')) { A.outfiter_special_delays_mount_standing[name] = entry.standing_delays_ms.slice(); }
            return;
        }
        // player outfit / other outfit
        if (standing !== 1) { A.outfiter_sprites_standing[name] = standing; }
        if (walking !== 8) { A.outfiter_sprites_walking[name] = walking; }
        if (has(entry, 'standing_delays_ms')) { A.outfiter_special_delays_standing[name] = entry.standing_delays_ms.slice(); }
        if (entry.female === false) { A.outfiter_u_names[name] = true; }
        if (entry.female_name) { A.outfiter_f_names[name] = entry.female_name; }
        if (entry.separate_female_file) { A.outfiter_f_suffix_inames[name] = true; }
        if (entry.addons === 'none') { A.outfiter_a_names[name] = true; }
        if (entry.addons === 'one_at_a_time') { A.outfiter_o_names[name] = true; }
        if (entry.can_ride_mount === false) {
            // outfits that cannot ride have no riding rows in their sheet
            A.outfiter_m_names[name] = true;
            A.outfiter_no_ride_names[name] = true;
        }
    }

    /**
     * Add the entries of js/outfitter-new-assets.js to A (modifies A).
     * Entries are added per type in ID order. A broken entry is skipped and reported;
     * everything else keeps working.
     * options.inFile === false: the entries are not in the file yet (Asset Helper), so
     * messages do not mention their block number.
     * Returns { added: [{ type, id, name }], problems: [{ level, index, entry, message }] }.
     */
    function mergeNewAssets(A, entries, options) {
        var added = [], problems = [], byType = {}, type,
            inFile = !(options && options.inFile === false),
            skipped = inFile ? ' This entry was skipped.' : '',
            label = function (entry, index) { return describeEntry(entry, inFile ? index : undefined); };
        if (entries === null || entries === undefined) { return { added: added, problems: problems }; }
        if (Object.prototype.toString.call(entries) !== '[object Array]') {
            problems.push({ level: 'error', index: null, entry: null, message: 'window.OutfiterNewAssets must be a list: [ ... ]' });
            return { added: added, problems: problems };
        }
        entries.forEach(function (entry, index) {
            var fieldProblems = checkEntryFields(entry);
            if (fieldProblems.length) {
                fieldProblems.forEach(function (p) {
                    problems.push({ level: 'error', index: index, entry: entry, message: label(entry, index) + ' ' + p + '.' + skipped });
                });
                return;
            }
            (byType[entry.type] = byType[entry.type] || []).push({ entry: entry, index: index });
        });
        for (type in byType) {
            if (has(byType, type)) {
                byType[type].sort(function (a, b) { return a.entry.id - b.entry.id; });
                byType[type].forEach(function (item) {
                    var entry = item.entry, t = TYPES[type], expected = nextFreeId(A, type),
                        existing = namesById(A, t.kind)[entry.name.toLowerCase()],
                        text = label(entry, item.index), reason = null;
                    if (entry.id < expected) {
                        reason = 'uses ID ' + entry.id + ', which already belongs to ' + t.label + " '" +
                            (t.kind === 'outfit' ? allOutfits(A)[entry.id] : A[t.list][entry.id]) + "'. The next free ID is " + expected + '.';
                    } else if (entry.id > expected) {
                        reason = 'uses ID ' + entry.id + ' but the next free ID is ' + expected +
                            '. IDs must follow each other without gaps' +
                            (added.length || problems.length ? ' (if an entry before it was skipped, fix that one first).' : '.');
                    } else if (has(t, 'max') && entry.id > t.max) {
                        reason = 'cannot be added: the list of other outfits is full (IDs 100-199). Add it as a player outfit instead.';
                    } else if (existing) {
                        reason = "has the same name as existing " + t.label + " '" + existing.name + "' (ID " + existing.id + '). Names must be unique within a category.';
                    }
                    if (reason) {
                        problems.push({ level: 'error', index: item.index, entry: entry, message: text + ' ' + reason + skipped });
                        return;
                    }
                    applyEntry(A, entry);
                    added.push({ type: type, id: entry.id, name: entry.name });
                });
            }
        }
        return { added: added, problems: problems };
    }

    /** Sprite files one entry needs: [{ folder, name, path, female }] */
    function filesForEntry(entry) {
        var t = TYPES[entry.type], files = [{ folder: t.folder, name: entry.name, female: false }];
        if (t.femaleFolder && entry.female) {
            if (entry.type === 'outfit') { files.push({ folder: t.femaleFolder, name: entry.name, female: true }); }
            else if (entry.separate_female_file) { files.push({ folder: t.femaleFolder, name: entry.name + '_Female', female: true }); }
        }
        files.forEach(function (f) { f.path = 'base64/' + f.folder + '/' + f.name + '.txt'; });
        return files;
    }

    // rows per frame of a creature sheet for each addons choice
    var ADDON_ROWS = { none: 1, addon_1: 2, both: 3, one_at_a_time: 3 };

    /**
     * Suggest a layout from the sheet size (used by the Asset Helper and tools/add-asset.js).
     * For a creature, `addons` (if known) says how many rows each frame has.
     * Returns { fields: { standing_frames, walking_frames, colourisable?, addons?, can_ride_mount? },
     *           found: true|false, message }. The user should confirm it in the preview.
     */
    function guessLayout(type, width, height, addons) {
        var rows = height / FRAME, fields = {}, combos = [], found = null, i, perFrame, frames;
        if (width % FRAME || height % FRAME || !rows) {
            return { fields: fields, found: false, message: 'the sheet is ' + width + ' x ' + height + 'px, which is not made of 64 x 64 frames' };
        }
        if (type === 'creature' || type === 'mount') {
            fields.colourisable = width === FRAME * 8;
            addons = type === 'creature' && has(ADDON_ROWS, addons) ? addons : 'none';
            perFrame = ADDON_ROWS[addons];
            frames = rows / perFrame;
            if (frames % 1) {
                return {
                    fields: fields,
                    found: false,
                    message: 'the sheet has ' + rows + ' rows, which cannot be split into frames of ' + perFrame + ' rows (base + addons)'
                };
            }
            if (frames === 9) { fields.standing_frames = 1; fields.walking_frames = 8; }
            else if (frames === 16) { fields.standing_frames = 8; fields.walking_frames = 8; }
            else if (frames < 9) { fields.standing_frames = 0; fields.walking_frames = frames; }
            else { fields.standing_frames = frames - 8; fields.walking_frames = 8; }
            if (type === 'creature') { fields.addons = addons; }
            return {
                fields: fields,
                found: true,
                message: rows + ' rows = ' + fields.standing_frames + ' standing + ' + fields.walking_frames + ' walking frames' +
                    (perFrame > 1 ? ' of ' + perFrame + ' rows each (base + addons)' : '') +
                    (fields.colourisable ? ', with colour masks' : '') + (type === 'creature' && perFrame === 1 ? ', no addons' : '')
            };
        }
        [[1, 8], [8, 8]].forEach(function (frames) {
            [['both', true], ['both', false], ['none', true], ['none', false]].forEach(function (c) {
                combos.push({ standing: frames[0], walking: frames[1], addons: c[0], ride: c[1] });
            });
        });
        for (i = 0; i < combos.length && !found; i++) {
            if ((combos[i].standing + combos[i].walking) * (combos[i].addons === 'none' ? 1 : 3) * (combos[i].ride ? 2 : 1) === rows) { found = combos[i]; }
        }
        if (!found) {
            return { fields: fields, found: false, message: 'the sheet has ' + rows + ' rows, which is not a usual outfit layout' };
        }
        fields.standing_frames = found.standing;
        fields.walking_frames = found.walking;
        fields.addons = found.addons;
        fields.can_ride_mount = found.ride;
        return {
            fields: fields,
            found: true,
            message: rows + ' rows = ' + found.standing + ' standing + ' + found.walking + ' walking frames, ' +
                (found.addons === 'none' ? 'no addons' : 'base + 2 addon rows') + (found.ride ? ', with riding rows' : ', without riding rows')
        };
    }

    /** The entry as text, ready to paste into js/outfitter-new-assets.js */
    function formatEntry(entry) {
        var order = ['type', 'id', 'name', 'standing_frames', 'walking_frames', 'colourisable', 'addons', 'female', 'female_name',
                'separate_female_file', 'can_ride_mount', 'standing_delay_ms', 'walking_delay_ms', 'standing_delays_ms', 'walking_delays_ms', 'note'],
            lines = [];
        order.forEach(function (key) {
            if (has(entry, key) && entry[key] !== undefined) {
                lines.push('        ' + key + ': ' + (typeof entry[key] === 'string' ? "'" + entry[key].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'" : JSON.stringify(entry[key])) + ',');
            }
        });
        return '    {\n' + lines.join('\n') + '\n    },';
    }

    /* --------------------------------------------------------------------- */
    /* Checking the whole collection                                          */
    /* --------------------------------------------------------------------- */

    /** Mistakes in the lists and rule tables. Returns { errors: [], warnings: [] }. */
    function checkData(A) {
        var errors = [], warnings = [], i,
            LISTS = ['outfiter_mount_names', 'outfiter_creature_names', 'outfiter_names0', 'outfiter_names100', 'outfiter_names200'],
            RULES, PROP_KEYS, outfitNames, mountNames, creatureNames, rule, key, names, type, value, k, v, p, lowerSeen;
        for (i = 0; i < LISTS.length; i++) {
            if (Object.prototype.toString.call(A[LISTS[i]]) !== '[object Array]') {
                errors.push(LISTS[i] + ' is missing or is not a list [ ... ]');
                return { errors: errors, warnings: warnings };
            }
        }
        LISTS.forEach(function (list) {
            var seen = {};
            A[list].forEach(function (name, id) {
                if (typeof name !== 'string' || name === '') { errors.push(list + ': entry #' + id + ' is not a name (check for an extra comma)'); return; }
                if (/\s/.test(name)) { errors.push(list + ": '" + name + "' contains a space - use underscores (_) instead"); }
                if (/[\\\/:*?"<>|]/.test(name)) { errors.push(list + ": '" + name + "' contains a character that is not allowed in file names"); }
                if (has(seen, name)) { errors.push(list + ": '" + name + "' is listed twice (IDs " + seen[name] + ' and ' + id + ') - remove the newer one'); }
                seen[name] = id;
            });
        });
        // names that differ only in capital letters would need two files GitHub Pages treats as different
        [['mount', A.outfiter_mount_names], ['creature', A.outfiter_creature_names], ['outfit', allOutfits(A)]].forEach(function (pair) {
            lowerSeen = {};
            pair[1].forEach(function (name, id) {
                var low;
                if (typeof name !== 'string') { return; }
                low = name.toLowerCase();
                if (has(lowerSeen, low) && lowerSeen[low].name !== name) {
                    errors.push(pair[0] + " names '" + lowerSeen[low].name + "' (ID " + lowerSeen[low].id + ") and '" + name + "' (ID " + id + ') differ only in capital letters');
                }
                lowerSeen[low] = { name: name, id: id };
            });
        });
        if (A.outfiter_mount_names[0] !== 'None') { errors.push("outfiter_mount_names must start with 'None' (ID 0)"); }
        if (A.outfiter_creature_names[0] !== 'None') { errors.push("outfiter_creature_names must start with 'None' (ID 0)"); }
        if (A.outfiter_names100[5] !== 'None') { errors.push("outfiter_names100 must keep 'None' at ID 105"); }
        if (A.outfiter_names0.length > 100) { errors.push('outfiter_names0 has ' + A.outfiter_names0.length + ' entries; the limit is 100'); }
        if (A.outfiter_names100.length > 100) { errors.push('outfiter_names100 has ' + A.outfiter_names100.length + ' entries; the limit is 100'); }

        outfitNames = {}; allOutfits(A).forEach(function (n) { if (n) { outfitNames[n] = true; } });
        mountNames = {}; A.outfiter_mount_names.forEach(function (n) { mountNames[n] = true; });
        creatureNames = {}; A.outfiter_creature_names.forEach(function (n) { creatureNames[n] = true; });
        RULES = {
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
        PROP_KEYS = ['standing', 'walking', 'standing_delay', 'walking_delay', 'standing_delays', 'walking_delays', 'colourisable', 'addon1', 'addon2', 'exclusive_addons'];
        for (rule in RULES) {
            if (!has(RULES, rule)) { continue; }
            names = RULES[rule][0]; type = RULES[rule][1];
            if (A[rule] === null || typeof A[rule] !== 'object') { errors.push(rule + ' is missing - it must be { } even when empty'); continue; }
            for (key in A[rule]) {
                if (!has(A[rule], key)) { continue; }
                value = A[rule][key];
                if (!has(names, key)) { errors.push(rule + ": '" + key + "' does not match any name in the list (check spelling and capital letters)"); continue; }
                if (type === 'count' && !isCount(value)) { errors.push(rule + ": '" + key + "' must be a whole number, found " + JSON.stringify(value)); }
                if (type === 'flag' && value !== true) { errors.push(rule + ": '" + key + "' must be true"); }
                if (type === 'text' && typeof value !== 'string') { errors.push(rule + ": '" + key + "' must be a name in quotes"); }
                if (type === 'delays' && !isDelays(value)) { errors.push(rule + ": '" + key + "' must be a list of milliseconds, e.g. [100, 100, 200]"); }
                if (type === 'props') {
                    for (k in value || {}) {
                        if (!has(value, k)) { continue; }
                        v = value[k];
                        if (PROP_KEYS.indexOf(k) === -1) { errors.push("outfiter_creature_props: '" + key + "' has unknown setting '" + k + "' (allowed: " + PROP_KEYS.join(', ') + ')'); }
                        else if ((k === 'standing' || k === 'walking') && !isCount(v)) { errors.push("outfiter_creature_props: '" + key + "'." + k + ' must be a whole number'); }
                        else if (/_delays$/.test(k) && !isDelays(v)) { errors.push("outfiter_creature_props: '" + key + "'." + k + ' must be a list of milliseconds'); }
                        else if (/_delay$/.test(k) && !(typeof v === 'number' && v > 0)) { errors.push("outfiter_creature_props: '" + key + "'." + k + ' must be a number of milliseconds'); }
                        else if (['colourisable', 'addon1', 'addon2', 'exclusive_addons'].indexOf(k) !== -1 && typeof v !== 'boolean') { errors.push("outfiter_creature_props: '" + key + "'." + k + ' must be true or false'); }
                    }
                    p = creatureProps(A, key);
                    if (p.standing + p.walking === 0) { errors.push("outfiter_creature_props: '" + key + "' has 0 standing and 0 walking frames"); }
                }
            }
        }
        for (key in A.outfiter_special_delays_mount_standing || {}) {
            if (has(A.outfiter_special_delays_mount_standing, key) && isDelays(A.outfiter_special_delays_mount_standing[key])) {
                k = has(A.outfiter_sprites_mount_standing, key) ? A.outfiter_sprites_mount_standing[key] : 1;
                if (A.outfiter_special_delays_mount_standing[key].length !== k) {
                    warnings.push("outfiter_special_delays_mount_standing: '" + key + "' lists " + A.outfiter_special_delays_mount_standing[key].length + ' delays but has ' + k + ' standing frames');
                }
            }
        }
        return { errors: errors, warnings: warnings };
    }

    return {
        FRAME: FRAME,
        TYPES: TYPES,
        FIELDS: FIELDS,
        REQUIRED: REQUIRED,
        ADDON_CHOICES: ADDON_CHOICES,
        toAssetName: toAssetName,
        describeEntry: describeEntry,
        allOutfits: allOutfits,
        namesById: namesById,
        nextFreeId: nextFreeId,
        creatureProps: creatureProps,
        expectedSheetSize: expectedSheetSize,
        expectedFiles: expectedFiles,
        compareSheetSize: compareSheetSize,
        parseSpriteFile: parseSpriteFile,
        makeSpriteFile: makeSpriteFile,
        checkEntryFields: checkEntryFields,
        mergeNewAssets: mergeNewAssets,
        filesForEntry: filesForEntry,
        guessLayout: guessLayout,
        formatEntry: formatEntry,
        checkData: checkData
    };
}));
