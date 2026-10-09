/*
 * Asset Helper (tools/asset-helper.html)
 * --------------------------------------
 * Prepares a new creature, mount or outfit for js/outfitter-new-assets.js:
 * reads the sprite sheet, guesses its layout, checks everything with the same
 * rules as the Outfitter (js/outfitter-asset-rules.js), shows a live preview,
 * and produces the sprite file(s) and the block to paste.
 *
 * It never changes the project by itself: browsers cannot write into a GitHub
 * repository. The page says so and shows the upload steps instead.
 */
(function () {
    'use strict';

    // Repository used for the "On the GitHub website" links.
    var REPO = 'https://github.com/RockyJLaRo/RockyJLaRo.github.io';

    var R = window.OutfiterAssetRules;
    var MAIN = window.OutfiterAssets;
    var EXISTING = window.OutfiterNewAssets;
    var $ = function (id) { return document.getElementById(id); };
    var state = { files: { main: null, female: null }, guessed: false, existingFiles: {} };

    /* ------------------------------------------------------------------ */
    /* Start-up problems                                                   */
    /* ------------------------------------------------------------------ */

    function showPageProblem(text) {
        var box = $('page-problems');
        var p = document.createElement('p');
        p.textContent = text;
        box.appendChild(p);
        box.hidden = false;
    }

    if (!R || !MAIN) {
        showPageProblem('The asset lists could not be loaded (js/outfitter-assets.js or js/outfitter-asset-rules.js). Open this page from the Outfitter website or from a local server (npm start), not by double-clicking the file.');
        return;
    }
    if (EXISTING === undefined) {
        showPageProblem('js/outfitter-new-assets.js has an error (or is missing), so the new items in it are not shown on the website. Fix it first: run "npm run validate" or check the line the browser console (F12) points to.');
        EXISTING = [];
    }
    if (location.protocol === 'file:') {
        showPageProblem('This page was opened directly from disk, so the preview and the collection check cannot work. Start a local server ("npm start") and open http://localhost:8080/tools/asset-helper.html, or use the page on the live website.');
    }

    /** Copy of the published data with the new items already in js/outfitter-new-assets.js */
    function currentAssets() {
        var A = JSON.parse(JSON.stringify(MAIN));
        var merged = R.mergeNewAssets(A, EXISTING);
        return { A: A, problems: merged.problems, added: merged.added };
    }

    (function () {
        var base = currentAssets();
        if (base.problems.length) {
            showPageProblem(base.problems.length + ' item(s) in js/outfitter-new-assets.js have problems and are not shown on the website: ' +
                base.problems.map(function (p) { return p.message; }).join(' | '));
        }
    }());

    /* ------------------------------------------------------------------ */
    /* Reading the form                                                    */
    /* ------------------------------------------------------------------ */

    function selectedType() {
        return document.querySelector('input[name="type"]:checked').value;
    }

    function intValue(id, fallback) {
        var v = parseInt($(id).value, 10);
        return isNaN(v) ? fallback : v;
    }

    /** The entry exactly as it would go into js/outfitter-new-assets.js */
    function buildEntry() {
        var type = selectedType(), A = currentAssets().A,
            entry = { type: type, id: R.nextFreeId(A, type), name: R.toAssetName($('name').value) },
            standing = intValue('standing', 1), walking = intValue('walking', 8), addons = $('addons').value;
        if (standing !== 1) { entry.standing_frames = standing; }
        if (walking !== 8) { entry.walking_frames = walking; }
        if (type === 'creature' || type === 'mount') {
            if ($('colourisable').checked) { entry.colourisable = true; }
        }
        if (type === 'creature' && addons !== 'none') { entry.addons = addons; }
        if (type === 'outfit' || type === 'other_outfit') {
            entry.female = $('female').checked;
            entry.addons = addons === 'addon_1' ? 'both' : addons;
            entry.can_ride_mount = $('can-ride').checked;
            if (entry.female && $('female-name').value.trim()) { entry.female_name = R.toAssetName($('female-name').value); }
            if (type === 'other_outfit' && entry.female && $('separate-female').checked) { entry.separate_female_file = true; }
        }
        return entry;
    }

    /** Sprite files the entry needs, each with the chosen sheet (or null) */
    function neededFiles(entry) {
        return R.filesForEntry(entry).map(function (f) {
            var sheet = f.female && (entry.type === 'outfit' || entry.separate_female_file) ? state.files.female : state.files.main;
            return { folder: f.folder, name: f.name, path: f.path, female: f.female, sheet: sheet };
        });
    }

    /* ------------------------------------------------------------------ */
    /* Sprite files                                                        */
    /* ------------------------------------------------------------------ */

    function bufferToBase64(buffer) {
        var bytes = new Uint8Array(buffer), chunks = [], i;
        for (i = 0; i < bytes.length; i += 0x8000) {
            chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)));
        }
        return btoa(chunks.join(''));
    }

    function decodeImage(dataUri) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
            img.onerror = function () { resolve(null); };
            img.src = dataUri;
        });
    }

    /** Read a chosen .png or .txt file. Resolves to { fileName, base64, width, height, idInFile } or { fileName, error }. */
    function readSpriteFile(file) {
        var isText = /\.txt$/i.test(file.name) || file.type === 'text/plain';
        var read = isText ? file.text().then(function (text) {
            var match = /<pre id="([^"]*)">/i.exec(text);
            var parsed = R.parseSpriteFile(text, match ? match[1] : '');
            if (parsed.error) { return { error: 'This .txt file is not a sprite file: ' + parsed.error }; }
            return { base64: parsed.base64, idInFile: match[1] };
        }) : file.arrayBuffer().then(function (buffer) {
            var sig = new Uint8Array(buffer.slice(0, 8));
            if (!(sig[0] === 137 && sig[1] === 80 && sig[2] === 78 && sig[3] === 71)) {
                return { error: 'This file is not a PNG image. Only PNG sprite sheets are supported.' };
            }
            return { base64: bufferToBase64(buffer) };
        });
        return read.then(function (result) {
            result.fileName = file.name;
            if (result.error) { return result; }
            return decodeImage('data:image/png;base64,' + result.base64).then(function (size) {
                if (!size) { result.error = 'The image could not be read - the file may be damaged.'; return result; }
                result.width = size.width;
                result.height = size.height;
                return result;
            });
        });
    }

    function showSheets() {
        var box = $('sheets');
        box.textContent = '';
        ['main', 'female'].forEach(function (key) {
            var sheet = state.files[key], div, p, scroll, img;
            if (!sheet || sheet.error) { return; }
            div = document.createElement('div');
            div.className = 'sheet';
            p = document.createElement('p');
            p.textContent = (key === 'female' ? 'Female: ' : '') + sheet.fileName + ' - ' + sheet.width + ' x ' + sheet.height + ' px (' +
                (sheet.width / 64) + ' columns, ' + (sheet.height / 64) + ' rows of 64 px)';
            scroll = document.createElement('div');
            scroll.className = 'sheet-scroll';
            img = document.createElement('img');
            img.alt = 'Sprite sheet ' + sheet.fileName;
            img.src = 'data:image/png;base64,' + sheet.base64;
            img.width = Math.min(sheet.width, 512);
            scroll.appendChild(img);
            div.appendChild(p);
            div.appendChild(scroll);
            box.appendChild(div);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Guessing the layout from the sheet size                             */
    /* ------------------------------------------------------------------ */

    function guessLayout() {
        var type = selectedType(), sheet = state.files.main, guess, f;
        if (!sheet || sheet.error) { return; }
        guess = R.guessLayout(type, sheet.width, sheet.height, type === 'creature' ? $('addons').value : undefined);
        f = guess.fields;
        if (f.standing_frames !== undefined) { $('standing').value = f.standing_frames; $('walking').value = f.walking_frames; }
        if (f.colourisable !== undefined) { $('colourisable').checked = f.colourisable; }
        if (f.addons !== undefined) { $('addons').value = f.addons; }
        if (f.can_ride_mount !== undefined) { $('can-ride').checked = f.can_ride_mount; }
        $('guess-result').textContent = guess.found ?
            'Filled in from the sheet: ' + guess.message + '.' +
                (type === 'creature' ? ' If the creature has addon rows, choose them under Addons - the frame counts are then worked out again.' : '') +
                (type === 'outfit' || type === 'other_outfit' ? ' Check "Has a female version" yourself.' : '') :
            'Could not fill in the settings: ' + guess.message + '. Set the frame counts and options by hand.';
        state.guessed = true;
    }

    /* ------------------------------------------------------------------ */
    /* Checks                                                              */
    /* ------------------------------------------------------------------ */

    function checkExistingFile(path) {
        if (location.protocol === 'file:' || state.existingFiles.hasOwnProperty(path)) { return; }
        state.existingFiles[path] = null; // pending
        fetch('../' + path, { method: 'HEAD', cache: 'no-store' }).then(function (res) {
            state.existingFiles[path] = res.ok;
            update();
        }, function () { state.existingFiles[path] = false; });
    }

    /** Returns { results: [{ level, text }], entry, files, ok } */
    function runChecks() {
        var entry = buildEntry(), base = currentAssets(), A = base.A, results = [], merged, files, kind = R.TYPES[entry.type].kind,
            add = function (level, text) { results.push({ level: level, text: text }); };
        if (!entry.name) {
            add('error', 'Enter the name (step 2).');
        }
        merged = entry.name ? R.mergeNewAssets(A, [entry], { inFile: false }) : { problems: [], added: [] };
        merged.problems.forEach(function (p) { add('error', p.message); });
        files = neededFiles(entry);
        // problems with the chosen files are always shown, even while the name has a problem
        files.forEach(function (f) {
            var label = f.female ? 'female sprite sheet' : 'sprite sheet';
            if (!f.sheet) { add('error', 'Choose the ' + label + ' in step 3' + (entry.name ? ' (it becomes ' + f.path + ').' : '.')); }
            else if (f.sheet.error) { add('error', f.sheet.fileName + ': ' + f.sheet.error); }
        });
        if (merged.added.length) {
            add('ok', 'It becomes ' + R.TYPES[entry.type].label + ' number ' + entry.id + ' (the next free ID).');
            ['mount', 'creature', 'outfit'].forEach(function (other) {
                var hit = other !== kind && R.namesById(A, other)[entry.name.toLowerCase()];
                if (hit) { add('warning', 'A ' + other + " called '" + hit.name + "' also exists. That is fine if they are different things (they use different folders)."); }
            });
            files.forEach(function (f) {
                var label = f.female ? 'female sprite sheet' : 'sprite sheet', problem;
                if (!f.sheet || f.sheet.error) { return; } // already reported above
                problem = R.compareSheetSize(A, kind, entry.name, f.sheet.width, f.sheet.height);
                if (problem) { add(problem.level, 'The ' + label + ' does not fit the settings: ' + problem.message); }
                else { add('ok', 'The ' + label + ' (' + f.sheet.width + ' x ' + f.sheet.height + ' px) fits the settings.'); }
                checkExistingFile(f.path);
                if (state.existingFiles[f.path] === true) {
                    add('warning', f.path + ' already exists on this site (no item uses it). Uploading your file replaces it - make sure that is what you want.');
                }
            });
            if (state.files.main && state.files.main.idInFile && state.files.main.idInFile.replace(/ /g, '_').toLowerCase() !== entry.name.toLowerCase()) {
                add('warning', 'The .txt file was made for "' + state.files.main.idInFile + '". The downloaded file will use the name "' + entry.name + '".');
            }
        }
        return {
            results: results,
            entry: entry,
            files: files,
            ok: results.every(function (r) { return r.level !== 'error'; })
        };
    }

    function renderResults(list, results) {
        list.textContent = '';
        results.forEach(function (r) {
            var li = document.createElement('li');
            li.className = r.level;
            li.textContent = (r.level === 'ok' ? 'OK: ' : r.level === 'warning' ? 'Note: ' : 'Problem: ') + r.text;
            list.appendChild(li);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Output: downloads, block, instructions                             */
    /* ------------------------------------------------------------------ */

    function downloadText(fileName, text) {
        var url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 0);
    }

    function addStep(list, html) {
        var li = document.createElement('li');
        li.innerHTML = html; // only built from our own text and checked names
        list.appendChild(li);
    }

    function cliCommand(entry, files) {
        var parts = ['node tools/add-asset.js', '--type ' + entry.type, '--name ' + entry.name, '--image "path/to/' + (files[0].sheet ? files[0].sheet.fileName : 'sheet.png') + '"'];
        if (entry.standing_frames !== undefined) { parts.push('--standing ' + entry.standing_frames); }
        if (entry.walking_frames !== undefined) { parts.push('--walking ' + entry.walking_frames); }
        if (entry.colourisable) { parts.push('--colourisable'); }
        if (entry.addons && entry.addons !== 'none') { parts.push('--addons ' + entry.addons); }
        if (entry.type === 'outfit' || entry.type === 'other_outfit') {
            if (entry.addons === 'none') { parts.push('--addons none'); }
            parts.push('--female ' + (entry.female ? 'yes' : 'no'));
            parts.push('--can-ride ' + (entry.can_ride_mount ? 'yes' : 'no'));
            if (entry.female_name) { parts.push('--female-name ' + entry.female_name); }
            if (entry.separate_female_file) { parts.push('--separate-female-file'); }
        }
        if (files.length > 1 && files[1].sheet) { parts.push('--female-image "path/to/' + files[1].sheet.fileName + '"'); }
        return parts.join(' ');
    }

    function renderSave(check) {
        var entry = check.entry, files = check.files, downloads = $('downloads'), web = $('steps-web'), local = $('steps-local'),
            folders = {}, link = '../index.html?' + (entry.type === 'creature' ? 'o=105&cr=' : entry.type === 'mount' ? 'm=' : 'o=') + entry.id;
        $('save-blocked').hidden = check.ok;
        $('save-steps').hidden = !check.ok;
        if (!check.ok) { return; }
        document.querySelector('#save-steps .plural').hidden = files.length < 2;
        downloads.textContent = '';
        files.forEach(function (f) {
            var row = document.createElement('div'), button = document.createElement('button'), note = document.createElement('span');
            row.className = 'downloads-row';
            button.type = 'button';
            // male and female files of an outfit have the same name: say which is which
            button.textContent = 'Download ' + f.name + '.txt' + (entry.type === 'outfit' ? (f.female ? ' (female)' : ' (male)') : '');
            button.addEventListener('click', function () { downloadText(f.name + '.txt', R.makeSpriteFile(f.name, f.sheet.base64)); });
            note.className = 'hint';
            note.textContent = 'goes into the folder base64/' + f.folder + '/';
            row.appendChild(button);
            row.appendChild(note);
            downloads.appendChild(row);
            folders[f.folder] = true;
        });
        $('entry-text').value = R.formatEntry(entry);

        web.textContent = '';
        Object.keys(folders).forEach(function (folder) {
            var names = files.filter(function (f) { return f.folder === folder; }).map(function (f) { return '<code>' + f.name + '.txt</code>'; }).join(' and ');
            addStep(web, 'Open the folder <a href="' + REPO + '/tree/main/base64/' + folder + '" target="_blank" rel="noopener">base64/' + folder +
                '</a>, click <strong>Add file &rarr; Upload files</strong>, drop ' + names + ' and click <strong>Commit changes</strong>. ' +
                'If your browser renamed the download (e.g. "' + files[0].name + ' (1).txt"), rename it back first.');
        });
        addStep(web, 'Open <a href="' + REPO + '/edit/main/js/outfitter-new-assets.js" target="_blank" rel="noopener">js/outfitter-new-assets.js</a> (pencil = edit), ' +
            'paste the block on a new line just above the last line <code>];</code> and click <strong>Commit changes</strong>.');
        addStep(web, 'Wait 1-2 minutes, then open <a href="' + link + '" target="_blank" rel="noopener">the Outfitter with your item</a> (reload with Ctrl+F5) and search for it in the list. ' +
            'Afterwards press "Check new items" at the bottom of this page on the live site.');

        local.textContent = '';
        addStep(local, 'Save the downloaded file' + (files.length > 1 ? 's' : '') + ' into ' +
            Object.keys(folders).map(function (f) { return '<code>base64/' + f + '/</code>'; }).join(' and ') + ' in your copy of the project.');
        addStep(local, 'Open <code>js/outfitter-new-assets.js</code> in a text editor, paste the block on a new line just above the last line <code>];</code> and save.');
        addStep(local, 'Run <code>npm run validate</code>, preview with <code>npm start</code>, then commit and push (GitHub Desktop: <em>Commit to main</em>, <em>Push origin</em>).');
        addStep(local, 'Shortcut with Node.js - this one command does steps 1 and 2 and checks the result (it undoes everything if a check fails):<br><code>' +
            cliCommand(entry, files).replace(/</g, '&lt;') + '</code>');
    }

    /* ------------------------------------------------------------------ */
    /* Preview                                                             */
    /* ------------------------------------------------------------------ */

    function showPreview() {
        var check = runChecks(), entry = check.entry, files = {}, query;
        if (!check.ok) { return; }
        check.files.forEach(function (f) {
            files[f.folder + '/' + f.name] = R.makeSpriteFile(f.name, f.sheet.base64);
        });
        // read by js/outfitter.js inside the frame (only for this page, never saved)
        window.OutfiterPreview = { entry: entry, files: files };
        if (entry.type === 'creature') { query = 'o=105&cr=' + entry.id; }
        else if (entry.type === 'mount') { query = 'm=' + entry.id; }
        else { query = 'o=' + entry.id; }
        $('preview-box').hidden = false;
        $('preview-note').hidden = false;
        $('preview-frame').src = '../index.html?preview&' + query + '&a';
    }

    /* ------------------------------------------------------------------ */
    /* Update everything after a change                                    */
    /* ------------------------------------------------------------------ */

    function update() {
        var type = selectedType(), check, name = R.toAssetName($('name').value), nameBox = $('name-result');
        document.querySelectorAll('.for-creature, .for-mount, .for-outfit, .for-other_outfit').forEach(function (el) {
            el.hidden = !el.classList.contains('for-' + type);
        });
        document.querySelectorAll('.female-only').forEach(function (el) {
            if (el.classList.contains('for-' + type)) { el.hidden = !$('female').checked; }
        });
        $('female-file-row').hidden = !((type === 'outfit' && $('female').checked) || (type === 'other_outfit' && $('female').checked && $('separate-female').checked));
        $('file-main-label').textContent = type === 'outfit' ? 'Male sprite sheet' : 'Sprite sheet';
        if ($('addons').value === 'addon_1' && type !== 'creature') { $('addons').value = 'both'; }

        check = runChecks();
        nameBox.className = 'field-result';
        if (name) {
            var nameProblem = check.results.filter(function (r) { return r.level === 'error' && /same name|name (contains|may)|reserved/.test(r.text); })[0];
            nameBox.textContent = nameProblem ? nameProblem.text : 'Name used: ' + name + '  (file: ' + R.filesForEntry(check.entry).map(function (f) { return f.path; }).join(', ') + ')';
            nameBox.classList.add(nameProblem ? 'error' : 'ok');
        } else {
            nameBox.textContent = '';
        }
        renderResults($('check-results'), check.results);
        $('preview-button').disabled = !check.ok;
        renderSave(check);
    }

    /* ------------------------------------------------------------------ */
    /* Checking the published collection                                   */
    /* ------------------------------------------------------------------ */

    function checkCollection(everything) {
        var base = currentAssets(), A = base.A, results = [], data = R.checkData(A), list, done = 0, errors = 0, warnings = 0,
            progress = $('collection-progress'), buttons = [$('check-new'), $('check-all')],
            newNames = {}, add = function (level, text) {
                results.push({ level: level, text: text });
                if (level === 'error') { errors++; }
                if (level === 'warning') { warnings++; }
            };
        base.problems.forEach(function (p) { add('error', p.message); });
        data.errors.forEach(function (e) { add('error', e); });
        data.warnings.forEach(function (w) { add('warning', w); });
        base.added.forEach(function (a) { newNames[R.TYPES[a.type].kind + ':' + a.name] = true; });
        list = R.expectedFiles(A).filter(function (f) { return everything || newNames[f.kind + ':' + (f.sheetOf || f.name)]; });
        if (!everything) { add('ok', base.added.length + ' new item(s) in js/outfitter-new-assets.js were added without problems.'); }
        buttons.forEach(function (b) { b.disabled = true; });
        var queue = list.slice();
        function worker() {
            var f = queue.shift(), path;
            if (!f) { return Promise.resolve(); }
            path = 'base64/' + f.folder + '/' + f.name + '.txt';
            return fetch('../' + path, { cache: 'no-store' }).then(function (res) {
                if (!res.ok) { add('error', path + ' is missing (HTTP ' + res.status + ') - needed by ' + f.kind + " '" + (f.sheetOf || f.name) + "'"); return null; }
                return res.text().then(function (text) {
                    var sprite = R.parseSpriteFile(text, f.name);
                    if (sprite.error) { add('error', path + ': ' + sprite.error); return null; }
                    if (f.name === 'None') { return null; }
                    return decodeImage(sprite.dataUri).then(function (size) {
                        var problem;
                        if (!size) { add('error', path + ': the image could not be decoded (damaged data)'); return; }
                        problem = R.compareSheetSize(A, f.kind, f.sheetOf || f.name, size.width, size.height);
                        if (problem) { add(problem.level, path + ': ' + problem.message); }
                    });
                });
            }, function () { add('error', path + ' could not be downloaded'); }).then(function () {
                done++;
                progress.textContent = 'Checked ' + done + ' of ' + list.length + ' sprite files...';
                return worker();
            });
        }
        progress.textContent = list.length ? 'Checking ' + list.length + ' sprite files...' : '';
        Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
            progress.textContent = 'Done: ' + list.length + ' sprite file(s) checked - ' + errors + ' problem(s), ' + warnings + ' note(s).';
            if (!errors && !warnings) { add('ok', 'No problems found.'); }
            renderResults($('collection-results'), results);
            buttons.forEach(function (b) { b.disabled = false; });
        });
    }

    /* ------------------------------------------------------------------ */
    /* Events                                                              */
    /* ------------------------------------------------------------------ */

    function onFile(key, input) {
        var file = input.files && input.files[0];
        if (!file) { state.files[key] = null; update(); return; }
        readSpriteFile(file).then(function (sheet) {
            state.files[key] = sheet;
            if (key === 'main' && !sheet.error) {
                if (!$('name').value.trim()) {
                    $('name').value = sheet.idInFile || file.name.replace(/\.(png|txt)$/i, '');
                }
                guessLayout();
            }
            showSheets();
            update();
        });
    }

    document.querySelectorAll('input[name="type"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (selectedType() === 'outfit') { $('female').checked = true; $('can-ride').checked = true; }
            if (state.files.main) { guessLayout(); }
            update();
        });
    });
    ['name', 'standing', 'walking', 'female-name'].forEach(function (id) { $(id).addEventListener('input', update); });
    ['colourisable', 'female', 'separate-female', 'can-ride'].forEach(function (id) { $(id).addEventListener('change', update); });
    $('addons').addEventListener('change', function () {
        // creature addons change how many rows each frame has
        if (selectedType() === 'creature' && state.files.main) { guessLayout(); }
        update();
    });
    $('file-main').addEventListener('change', function () { onFile('main', this); });
    $('file-female').addEventListener('change', function () { onFile('female', this); });
    $('preview-button').addEventListener('click', showPreview);
    $('copy-entry').addEventListener('click', function () {
        var text = $('entry-text').value, done = function (ok) { $('copy-result').textContent = ok ? 'Copied.' : 'Select the text and copy it with Ctrl+C.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () { $('entry-text').select(); done(false); });
        } else {
            $('entry-text').select();
            done(false);
        }
    });
    $('check-new').addEventListener('click', function () { checkCollection(false); });
    $('check-all').addEventListener('click', function () { checkCollection(true); });

    update();
}());
