/*global $ */
/*jslint devel: true, browser: true, indent: 2, white: true, plusplus: true, bitwise: true, vars: true, ass: true */

$(function () {
    'use strict';
    // Data and settings come from two separate files that index.html loads first:
    //   js/outfitter-assets.js   - creature / mount / outfit lists and sprite rules
    //   js/outfitter-settings.js - a few adjustable settings (zoom, image paths ...)
    var
        outfiter_settings = window.OutfiterSettings || {},
        outfiter_assets = window.OutfiterAssets;
    if (!outfiter_assets) {
        // Usually a typo (missing comma or quote) in js/outfitter-assets.js.
        $('#outfiter_container').html(
            '<p class="outfiter_fatal">The Outfitter could not start because js/outfitter-assets.js did not load. ' +
            'If you just edited that file, check it for a missing comma or quote (the browser console, F12, shows the line).</p>'
        );
        if (window.console && console.error) { console.error('[Outfitter] window.OutfiterAssets is missing - js/outfitter-assets.js failed to load or has a syntax error.'); }
        return;
    }
    // Rules shared with the Asset Helper and the checker (js/outfitter-asset-rules.js).
    var outfiter_rules = window.OutfiterAssetRules;
    if (!outfiter_rules) {
        $('#outfiter_container').html('<p class="outfiter_fatal">The Outfitter could not start because js/outfitter-asset-rules.js did not load.</p>');
        if (window.console && console.error) { console.error('[Outfitter] window.OutfiterAssetRules is missing - js/outfitter-asset-rules.js failed to load.'); }
        return;
    }
    // Preview of a not-yet-saved item: the Asset Helper (tools/asset-helper.html) loads
    // this page in a frame with "?preview" and hands over the item and its sprite data.
    // It exists only inside that frame and is never saved.
    var outfiter_preview = (function () {
        try {
            if (window.parent !== window && /[?&]preview(=|&|$)/.test(location.search) && window.parent.OutfiterPreview) {
                return window.parent.OutfiterPreview;
            }
        } catch (ignore) { } // a parent page from another site is not allowed to preview
        return null;
    }());
    // Add the items from js/outfitter-new-assets.js. A broken entry is skipped (and
    // reported) instead of stopping the whole Outfitter.
    var outfiter_new_asset_problems = (function () {
        var entries = window.OutfiterNewAssets, problems = [];
        if (entries === undefined) {
            problems.push('js/outfitter-new-assets.js did not load (missing file, or a typo such as a missing comma or quote). Newly added items are not shown.');
            entries = [];
        }
        if (outfiter_preview && outfiter_preview.entry) {
            entries = (Object.prototype.toString.call(entries) === '[object Array]' ? entries : []).concat([outfiter_preview.entry]);
        }
        $.each(outfiter_rules.mergeNewAssets(outfiter_assets, entries).problems, function (i, problem) {
            problems.push(problem.message);
        });
        if (window.console && console.error) {
            $.each(problems, function (i, message) { console.error('[Outfitter] ' + message); });
        }
        return problems;
    }());
    // read a numeric setting, falling back to the default when it is missing or invalid
    function outfiter_setting_number(name, fallback) {
        var value = outfiter_settings[name];
        return (typeof value === 'number' && isFinite(value) && value >= 0) ? value : fallback;
    }
    var
        // true when the Outfitter runs inside the Asset Helper's preview (tools/asset-helper.html)
        outfiter_preview_mode = !!outfiter_preview,
        loading_img = outfiter_settings.loading_image || 'images/outfitter-loading.gif',
        error_img = outfiter_settings.error_image || 'images/outfitter-error.png',
        outfiter_mount_names = outfiter_assets.outfiter_mount_names,
        outfiter_creature_names = outfiter_assets.outfiter_creature_names,
        outfiter_names0 = outfiter_assets.outfiter_names0,
        outfiter_names100 = outfiter_assets.outfiter_names100,
        outfiter_names200 = outfiter_assets.outfiter_names200,
        outfiter_sprites_standing = outfiter_assets.outfiter_sprites_standing,
        outfiter_sprites_walking = outfiter_assets.outfiter_sprites_walking,
        outfiter_sprites_creature_standing = outfiter_assets.outfiter_sprites_creature_standing,
        outfiter_sprites_creature_walking = outfiter_assets.outfiter_sprites_creature_walking,
        outfiter_creature_props = outfiter_assets.outfiter_creature_props,
        outfiter_special_delays_standing = outfiter_assets.outfiter_special_delays_standing,
        outfiter_special_delays_mount_standing = outfiter_assets.outfiter_special_delays_mount_standing,
        outfiter_pingpong_animation = outfiter_assets.outfiter_pingpong_animation,
        outfiter_4096h = outfiter_assets.outfiter_4096h,
        outfiter_sprites_mount_standing = outfiter_assets.outfiter_sprites_mount_standing,
        outfiter_sprites_mount_walking = outfiter_assets.outfiter_sprites_mount_walking,
        outfiter_mount_colourisable = outfiter_assets.outfiter_mount_colourisable,
        outfiter_f_suffix_inames = outfiter_assets.outfiter_f_suffix_inames,
        outfiter_u_names = outfiter_assets.outfiter_u_names,
        outfiter_m_names = outfiter_assets.outfiter_m_names,
        outfiter_a_names = outfiter_assets.outfiter_a_names,
        outfiter_no_ride_names = outfiter_assets.outfiter_no_ride_names,
        outfiter_no_floor_move_names = outfiter_assets.outfiter_no_floor_move_names,
        outfiter_o_names = outfiter_assets.outfiter_o_names,
        outfiter_separator = outfiter_assets.outfiter_separator,
        outfiter_mount_separator = outfiter_assets.outfiter_mount_separator,
        outfiter_creature_separator = outfiter_assets.outfiter_creature_separator,
        outfiter_f_names = outfiter_assets.outfiter_f_names,
        //combine outfit names preserving indexes/ids (copy, so the asset list itself is not modified)
        outfiter_names = outfiter_names0.slice();
    if (outfiter_names100.length) {
        outfiter_names.length = 100;
        outfiter_names = outfiter_names.concat(outfiter_names100);
    }
    if (outfiter_names200.length) {
        outfiter_names.length = 200;
        outfiter_names = outfiter_names.concat(outfiter_names200);
    }
    //automatically create list of 'Other' outfits
    var ii, outfiter_names_extra = [105],
        outfiter_names100_sorted = outfiter_names100.slice().sort();
    for (ii = 0; ii < outfiter_names100.length; ii++) {
        if (outfiter_names100_sorted[ii] == 'None') { continue; }
        outfiter_names_extra.push(100 + outfiter_names100.indexOf(outfiter_names100_sorted[ii]));
    }

    $('#outfiter_container').html(
        '<div class="outfiter show-list-oselector">' +
        // List switcher - only shown on narrow screens, where one list is visible at a time
        '<div class="list_tabs" role="group" aria-label="Choose a list">' +
        '<button type="button" class="list_tab" data-list="oselector" aria-pressed="true">Outfits</button>' +
        '<button type="button" class="list_tab" data-list="mselector" aria-pressed="false">Mounts</button>' +
        '<button type="button" class="list_tab" data-list="cselector" aria-pressed="false">Creatures</button>' +
        '</div>' +
        // Mounts Selector
        '<div class="outer_border radio_list_wrap mselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Mounts</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_mounts">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" aria-label="Search mounts" autocomplete="off" />' +
        '<div class="omsearch_empty" hidden>No matches</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Creatures Selector
        '<div class="outer_border radio_list_wrap cselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Creatures</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_creatures">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" aria-label="Search creatures" autocomplete="off" />' +
        '<div class="omsearch_empty" hidden>No matches</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Outfits Selector
        '<div class="outer_border radio_list_wrap oselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Outfits & Others</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_outfits">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" aria-label="Search outfits" autocomplete="off" />' +
        '<div class="omsearch_empty" hidden>No matches</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Viewer
        '<div class="outer_border viewer">' +
        '<div class="div2">' +
        '<div class="div2_title">TibiaWiki Outfitter</div>' +
        '<div class="omain_wrap">' +
        // side column: options, then colours (desktop); narrow screens reorder them (css)
        '<div class="omain_wrap_left">' +
        '<div class="omain_opts">' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Preview:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk animate" /><span class="darkchk_in"></span>Animate' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk sanim" /><span class="darkchk_in"></span>Standing Animation' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" checked="checked" class="darkchk show_outfit" /><span class="darkchk_in"></span>Show Outfit' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk floor" /><span class="darkchk_in"></span>Show Floor' +
        '</label>' +
        '</div>' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Extra:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk soft" /><span class="darkchk_in"></span>Soft Image' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk hpbar" /><span class="darkchk_in"></span>HP Bar' +
        '</label>' +
        // advanced options toggle
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_advanced" /><span class="darkchk_in"></span>Show Advanced Options' +
        '</label>' +
        // hidden until Show advanced options is checked
        '<div class="save_advanced_opts">' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk anistep" /><span class="darkchk_in"></span>Animation Steps' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk template_code" /><span class="darkchk_in"></span>Template Code' +
        '</label>' +
        '<div class="divtitle" style="margin-top:8px;">Save as: <span class="help_q help_save" tabindex="0" role="button" aria-label="Help" data-help="APNG: animated PNG (high quality). GIF: widely supported animation. 4x Rotate: one file walking South, East, North, West (1.6s each). All Addons: four rotating files — none, Addon 1, Addon 2, and both (Addon 3). Names look like Outfit_Name_Gender or Outfit_Name_Gender_Addon_#."></span></div>' +
        '<label class="divcheck">' +
        '<input type="radio" name="radio_save_format" class="darkrad save_format_apng" value="apng" /><span class="darkrad_in"></span>APNG' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="radio" name="radio_save_format" class="darkrad save_format_gif" value="gif" checked="checked" /><span class="darkrad_in"></span>GIF' +
        '</label>' +
        '<label class="divcheck rotate4x_wrap">' +
        '<input type="checkbox" class="darkchk rotate4x" /><span class="darkchk_in"></span><span class="help_label">4x Rotate</span><span class="help_q help_rotate4x" tabindex="0" role="button" aria-label="Help" data-help="One animated file that walks through all four directions (South, East, North, West), 1.6 seconds per facing. Uses the current outfit, gender, addons, and mount."></span>' +
        '</label>' +
        '<label class="divcheck rotate4x_wrap all_addons_wrap">' +
        '<input type="checkbox" class="darkchk all_addons" /><span class="darkchk_in"></span><span class="help_label">All Addons</span><span class="help_q help_all_addons" tabindex="0" role="button" aria-label="Help" data-help="Downloads four individual rotating files, one for each outfit variant: No Addons, Addon 1, Addon 2, and Both Addons (Addon 3). Every file includes a full animation cycle for all four directions."></span>' +
        '</label>' +
        '</div>' +
        // default label is Download GIF; switches to Download when advanced is on
        '<button type="button" class="nbutton download_image" title="Download the currently displayed options in the outfitter.">Download GIF</button>' +
        '</div>' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Configure:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk addon1" /><span class="darkchk_in"></span>Addon 1' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk addon2" /><span class="darkchk_in"></span>Addon 2' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk female" /><span class="darkchk_in"></span>Female' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_mount" /><span class="darkchk_in"></span>Mount' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_creature" /><span class="darkchk_in"></span>Creature' +
        '</label>' +
        '</div>' +
        '</div>' +
        '<div class="colourise_cont">' +
        '<div class="colourise_title">Colourise:</div>' +
        '<div class="colourise_btns">' +
        '<button type="button" class="nbutton colourise_copy">Copy to Mount</button>' +
        '<button type="button" class="nbutton colourise_random" title="Randomise Head, Primary, Secondary and Detail colours for the selected target (Outfit or Mount)">Random Colours</button>' +
        '<button type="button" class="nbutton random_outfit" title="Pick a random outfit (gender and addons are also randomised when available)">Random Outfit</button>' +
        '</div>' +
        '<label class="colourise_item">' +
        '<input type="radio" name="radio_colourise" class="darkrad" value="outfit" checked="checked" /><span class="darkrad_in"></span><div class="t">Outfit</div>' +
        '</label><label class="colourise_item">' +
        '<input type="radio" name="radio_colourise" class="darkrad" value="mount" /><span class="darkrad_in"></span><div class="t">Mount</div>' +
        '</label>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="colors_cont">' +
        '<button type="button" class="color_tab cb_1 sel" aria-pressed="true"><span class="color_tab_in outer_border_no_bottom">Head</span></button>' +
        '<button type="button" class="color_tab cb_2" aria-pressed="false"><span class="color_tab_in outer_border_no_bottom">Primary</span></button>' +
        '<button type="button" class="color_tab cb_3" aria-pressed="false"><span class="color_tab_in outer_border_no_bottom">Secondary</span></button>' +
        '<button type="button" class="color_tab cb_4" aria-pressed="false"><span class="color_tab_in outer_border_no_bottom">Detail</span></button>' +
        '<div class="clear"></div>' +
        '<div class="dcolor_table_out outer_border">' +
        '<div class="dcolor_table" role="radiogroup" aria-label="Head colour">' +
        // 133 colour swatches (7 rows x 19 colours); colours are filled in by outfiter_init()
        new Array(134).join('<div role="radio" aria-checked="false" tabindex="-1"></div>') +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="omain_wrap_right">' +
        '<div class="omain_cont_right">' +
        '<div class="body_main_div">' +
        '<button type="button" class="zoom_btn zoomout" title="Zoom Out" aria-label="Zoom Out"></button>' +
        '<button type="button" class="zoom_btn zoomreset" title="Reset View" aria-label="Reset View"></button>' +
        '<button type="button" class="zoom_btn zoomin" title="Zoom In" aria-label="Zoom In"></button>' +
        '<img class="body_main" width="128" height="128" src="' + encodeURI(loading_img) + '" alt="" />' +
        '<button type="button" class="leftb tleftb facingp" aria-label="Rotate left"></button>' +
        '<button type="button" class="rightb trightb facingm" aria-label="Rotate right"></button>' +
        '</div>' +
        '<div class="outfiter_status" role="status" aria-live="polite"></div>' +
        '<div class="oitem_select_cont">' +
        '<button type="button" class="leftb outfitm" aria-label="Previous outfit"></button>' +
        '<button type="button" class="rightb outfitp" aria-label="Next outfit"></button>' +
        '<div class="oitem_select_name outfit_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="oitem_select_cont">' +
        '<button type="button" class="leftb mountm" aria-label="Previous mount"></button>' +
        '<button type="button" class="rightb mountp" aria-label="Next mount"></button>' +
        '<div class="oitem_select_name mount_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="oitem_select_cont">' +
        '<button type="button" class="leftb creaturem" aria-label="Previous creature"></button>' +
        '<button type="button" class="rightb creaturep" aria-label="Next creature"></button>' +
        '<div class="oitem_select_name creature_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="charn_cont">' +
        '<div class="charn_row">' +
        '<span class="charn_title">Enter Name:</span>' +
        '<input type="text" size="30" value="" class="dark_input charn" placeholder="Name" aria-label="Character name" autocomplete="off" />' +
        '<button type="button" class="nbutton clear_name">Clear Name</button>' +
        '<button type="button" class="nbutton use_name">Use Name</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="clear"></div>' +
        '<div class="url_input_cont">' +
        '<span class="url_input_text">Link:&nbsp;</span>' +
        '<span class="url_input_out">' +
        '<input type="text" value="" readonly="readonly" class="dark_input url_input" aria-label="Link to this outfit" />' +
        '</span>' +
        '<button type="button" class="copy_btn copy_url" title="Copy" aria-label="Copy link"></button>' +
        '</div>' +
        '<div class="template_code_code_cont"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // full-width animation steps panel under selectors + viewer
        '<div class="outer_border anistep_panel">' +
        '<div class="div2">' +
        '<div class="div2_title">Animation Steps</div>' +
        '<div class="anistep_step_cont"></div>' +
        '</div>' +
        '</div>' +
        '<div class="hide hide_canvas">' +
        '<input type="hidden" value="0" class="show_outfit_prev" />' +
        '<input type="hidden" value="0" class="outfit" />' +
        '<input type="hidden" value="0" class="mount" />' +
        '<input type="hidden" value="0" class="show_mount_prev" />' +
        '<input type="hidden" value="0" class="creature" />' +
        '<input type="hidden" value="0" class="show_creature_prev" />' +
        '<input type="hidden" value="2" class="facing" />' +
        '<input type="hidden" value="0" class="c1" />' +
        '<input type="hidden" value="0" class="c2" />' +
        '<input type="hidden" value="0" class="c3" />' +
        '<input type="hidden" value="0" class="c4" />' +
        '<input type="hidden" value="0" class="mc1" />' +
        '<input type="hidden" value="0" class="mc2" />' +
        '<input type="hidden" value="0" class="mc3" />' +
        '<input type="hidden" value="0" class="mc4" />' +

        '<img class="floor_image" alt="floor_image" src="" />' +
        '<img class="letters_image" alt="letters_image" src="" />' +
        '<img class="hp_bar" alt="hp_bar" src="" />' +

        '<div>' +
        '<canvas class="canvas_work" width="64" height="64"></canvas>' +
        '<canvas class="canvas_zoom" width="64" height="64"></canvas>' +
        '</div>' +

        '<img class="main_image" src="" alt="main_image" />' +
        '<img class="mount_image" src="" alt="mount_image" />' +
        '<img class="creature_image" src="" alt="creature_image" />' +

        '<div>' +
        '<canvas class="canvas_main" width="512" height="6144"></canvas>' +
        '<canvas class="canvas_mount" width="256" height="1152"></canvas>' +
        '<canvas class="canvas_creature" width="256" height="2176"></canvas>' +
        '</div>' +

        '</div>' +
        '</div>'
    );
    $('div.outfiter').each(function () {
        var
            $this_main = $(this),
            browsers_base = 'Firefox/Chrome/Opera/Safari/Edge',
            outfiter_mount_names_extra = [],
            outfiter_mount_names_sorted = [],
            outfiter_creature_names_extra = [],
            outfiter_creature_names_sorted = [],
            outfiter_names_sorted = [],
            outfiter_color_t = [
                [255, 255, 255], [255, 212, 191], [255, 233, 191], [255, 255, 191], [233, 255, 191], [212, 255, 191], [191, 255, 191], [191, 255, 212], [191, 255, 233], [191, 255, 255], [191, 233, 255], [191, 212, 255], [191, 191, 255], [212, 191, 255], [233, 191, 255], [255, 191, 255], [255, 191, 233], [255, 191, 212], [255, 191, 191],
                [218, 218, 218], [191, 159, 143], [191, 175, 143], [191, 191, 143], [175, 191, 143], [159, 191, 143], [143, 191, 143], [143, 191, 159], [143, 191, 175], [143, 191, 191], [143, 175, 191], [143, 159, 191], [143, 143, 191], [159, 143, 191], [175, 143, 191], [191, 143, 191], [191, 143, 175], [191, 143, 159], [191, 143, 143],
                [182, 182, 181], [191, 127, 95], [191, 159, 95], [191, 191, 95], [159, 191, 95], [127, 191, 95], [95, 191, 95], [95, 191, 127], [95, 191, 159], [95, 191, 191], [95, 159, 191], [95, 127, 191], [95, 95, 191], [127, 95, 191], [159, 95, 191], [191, 95, 191], [191, 95, 159], [191, 95, 127], [191, 95, 95],
                [145, 145, 144], [191, 106, 63], [191, 148, 63], [191, 191, 63], [148, 191, 63], [106, 191, 63], [63, 191, 63], [63, 191, 106], [63, 191, 148], [63, 191, 191], [63, 148, 191], [63, 106, 191], [63, 63, 191], [106, 63, 191], [148, 63, 191], [191, 63, 191], [191, 63, 148], [191, 63, 106], [191, 63, 63],
                [109, 109, 109], [255, 85, 0], [255, 170, 0], [255, 255, 0], [170, 255, 0], [84, 255, 0], [0, 255, 0], [0, 255, 84], [0, 255, 170], [0, 255, 255], [0, 169, 255], [0, 85, 255], [0, 0, 255], [85, 0, 255], [169, 0, 255], [254, 0, 255], [255, 0, 170], [255, 0, 85], [255, 0, 0],
                [72, 72, 68], [191, 63, 0], [191, 127, 0], [191, 191, 0], [127, 191, 0], [63, 191, 0], [0, 191, 0], [0, 191, 63], [0, 191, 127], [0, 191, 191], [0, 127, 191], [0, 63, 191], [0, 0, 191], [63, 0, 191], [127, 0, 191], [191, 0, 191], [191, 0, 127], [191, 0, 63], [191, 0, 0],
                [36, 36, 36], [127, 42, 0], [127, 85, 0], [127, 127, 0], [85, 127, 0], [42, 127, 0], [0, 127, 0], [0, 127, 42], [0, 127, 85], [0, 127, 127], [0, 84, 127], [0, 42, 127], [0, 0, 127], [42, 0, 127], [84, 0, 127], [127, 0, 127], [127, 0, 85], [127, 0, 42], [127, 0, 0]
            ],
            outfiter_outfit_none_id = (function () {
                var ret;
                outfiter_names.some(function (v, i) {
                    if (v === 'None') { ret = i; return true; }
                });
                return ret;
            }()),

            outfiter_GET = {},
            outfiter_aframes,
            outfiter_bake_silent = false, // true while baking download frames — keep preview frozen
            outfiter_images_loaded = [false, false, false],
            outfiter_atime,
            outfiter_acurrent = 0,
            //Default Zoom Level (1-4)
            outfiter_zoom = outfiter_setting_number('default_zoom', 2),
            outfiter_base_w = 128,
            outfiter_base_h = 128,
            outfiter_zoom_min = outfiter_setting_number('min_zoom', 1),
            outfiter_zoom_max = outfiter_setting_number('max_zoom', 4),
            outfiter_pan_x = 0,
            outfiter_pan_y = 0,
            outfiter_dragging = false,
            outfiter_drag_start_x = 0,
            outfiter_drag_start_y = 0,
            outfiter_pan_start_x = 0,
            outfiter_pan_start_y = 0,
            // screen pixels per CSS pixel of the preview (very large screens scale the
            // Outfitter up, see css/page.css), so dragging moves the sprite with the pointer
            outfiter_drag_scale = 1,
            outfiter_measure_drag_scale = function () {
                var box = ogebi('body_main_div')[0];
                outfiter_drag_scale = (box && box.offsetWidth && box.getBoundingClientRect().width / box.offsetWidth) || 1;
            },
            //default outfiter options
            outfiter_def = {
                outfit: 0, addon1: false, addon2: false, female: false, facing: 2,
                c1: 0, c2: 0, c3: 0, c4: 0,
                soft: false, animate: false, sanim: false,
                hpbar: false, charn: '',
                mount: 0,
                creature: 0,
                mc1: 0, mc2: 0, mc3: 0, mc4: 0,
                floor: false
            },
            outfiter_def_template = {
                outfit: 0, addon1: false, addon2: false, female: false, facing: 2,
                c1: 0, c2: 0, c3: 0, c4: 0,
                soft: false, animate: false, sanim: false,
                hpbar: false, charn: '',
                mount: 0,
                creature: 0,
                mc1: 0, mc2: 0, mc3: 0, mc4: 0,
                floor: false
            },
            //long name and short name options that can be used
            outfiter_opt_names = {
                outfit: 'o', addon1: 'a1', addon2: 'a2', female: 'fm', facing: 'f',
                c1: 'c1', c2: 'c2', c3: 'c3', c4: 'c4',
                soft: 's', animate: 'a', sanim: 'sa',
                hpbar: 'h', charn: 'n',
                mount: 'm', creature: 'cr',
                mc1: 'mc1', mc2: 'mc2', mc3: 'mc3', mc4: 'mc4',
                floor: 'fl'
            },
            outfiter_opt_namesr = {
                o: 'outfit', a1: 'addon1', a2: 'addon2', fm: 'female', f: 'facing',
                c1: 'c1', c2: 'c2', c3: 'c3', c4: 'c4',
                s: 'soft', a: 'animate', sa: 'sanim',
                h: 'hpbar', n: 'charn',
                m: 'mount', cr: 'creature',
                mc1: 'mc1', mc2: 'mc2', mc3: 'mc3', mc4: 'mc4',
                fl: 'floor'
            },
            //floor
            floor_move_per_frame = 8, //has to be a factor of floor_spr_w and floor_spr_h
            floor_spr_w = 128, //has to be a multiple of floor_move_per_frame
            floor_spr_h = 64, //has to be a multiple of floor_move_per_frame
            floor_offset_x = 16, //left
            floor_offset_y = 16, //top
            floor_offset_y_bottom = 15, //bottom
            floor_w = 318 / 2,
            floor_h = (128 / 2) + floor_offset_y + floor_offset_y_bottom,
            outfiter_title = '', //fix for wikia
            //APNG support
            outfiter_apng_supported,
            ogebi = function (classname, all) { return $this_main.find(all === 1 ? classname : '.' + classname); },
            //canvases
            $canvas_main = ogebi('canvas_main'),
            $canvas_mount = ogebi('canvas_mount'),
            $canvas_creature = ogebi('canvas_creature'),
            $canvas_work = ogebi('canvas_work'),
            $canvas_zoom = ogebi('canvas_zoom'),
            canvas_main = $canvas_main[0],
            canvas_mount = $canvas_mount[0],
            canvas_creature = $canvas_creature[0],
            canvas_work = $canvas_work[0],
            canvas_zoom = $canvas_zoom[0],
            // Rendering reads pixels back from these canvases many times per frame
            // (getImageData). Creating their contexts with willReadFrequently keeps them
            // in normal memory, which makes those reads much faster (browsers that do not
            // know the option ignore it). Must happen before any other getContext call.
            outfiter_canvas_contexts = $.map([canvas_main, canvas_mount, canvas_creature, canvas_work, canvas_zoom], function (canvas) {
                return canvas.getContext('2d', { willReadFrequently: true });
            }),
            //map values depending on key/value.
            empty_string_maps_to = {
                addon1: true,
                addon2: true,
                female: true,
                soft: true,
                animate: true,
                sanim: true,
                hpbar: true,
                floor: true
            },
            // Decode a URL value without ever throwing (a stray "%" used to stop the app).
            outfiter_safe_decode = function (value) {
                var decoded = value;
                try { decoded = decodeURI(decoded); } catch (ignore) { }
                try { decoded = decodeURIComponent(decoded); } catch (ignore2) { }
                return decoded;
            },
            map_GET_values = function (key, value) {
                if (value === '') {
                    if (empty_string_maps_to.hasOwnProperty(key)) {
                        return empty_string_maps_to[key];
                    }
                }
                return outfiter_safe_decode(value);
            },
            //get options from url "search"
            //Accepts both short (?o=3) and long (?outfit=3) option names; unknown keys
            //(e.g. tracking parameters added by other sites) are ignored.
            outfiter_get_get = function () {
                var
                    i, key, assign, array = window.location.search.substring(1).split(/&|;/);
                //URLs can be like either "sample.html?test1=hi&test2=bye" or "sample.html?test1=hi;test2=bye"
                for (i = 0; i < array.length; i++) {
                    if (array[i] !== '') {
                        assign = array[i].indexOf('=');
                        key = assign === -1 ? array[i] : array[i].substring(0, assign);
                        if (key === 'title') { outfiter_title = assign === -1 ? '' : array[i].substring(assign + 1); }
                        else {
                            if (outfiter_opt_namesr.hasOwnProperty(key)) { key = outfiter_opt_namesr[key]; }
                            if (outfiter_def.hasOwnProperty(key)) {
                                outfiter_GET[key] = map_GET_values(key, assign === -1 ? '' : array[i].substring(assign + 1));
                            }
                        }
                    }
                }
            },
            // Turn URL values into valid options. Anything out of range falls back to the
            // default, so a mistyped or outdated link still opens a working outfitter.
            outfiter_sanitize_get = function () {
                var opt, v, n,
                    max_index = {
                        mount: outfiter_mount_names.length - 1,
                        creature: outfiter_creature_names.length - 1,
                        facing: 3,
                        c1: outfiter_color_t.length - 1, c2: outfiter_color_t.length - 1,
                        c3: outfiter_color_t.length - 1, c4: outfiter_color_t.length - 1,
                        mc1: outfiter_color_t.length - 1, mc2: outfiter_color_t.length - 1,
                        mc3: outfiter_color_t.length - 1, mc4: outfiter_color_t.length - 1
                    };
                for (opt in outfiter_def) {
                    if (outfiter_def.hasOwnProperty(opt)) {
                        v = outfiter_GET[opt];
                        if (typeof outfiter_def[opt] === 'boolean') {
                            // "?a1", "?a1=1", "?a1=true" -> on; "?a1=!", "?a1=0", "?a1=false" -> off
                            outfiter_GET[opt] = v === true || (typeof v === 'string' && !/^(!|0|false|no|off)$/i.test(v));
                        } else if (typeof outfiter_def[opt] === 'number') {
                            n = typeof v === 'number' ? v : (/^\s*\d+\s*$/.test(String(v)) ? parseInt(v, 10) : NaN);
                            if (opt === 'outfit') {
                                if (isNaN(n) || outfiter_names[n] === undefined) { n = outfiter_def.outfit; }
                            } else if (isNaN(n) || n < 0 || n > max_index[opt]) {
                                n = outfiter_def[opt];
                            }
                            outfiter_GET[opt] = n;
                        } else {
                            outfiter_GET[opt] = v === undefined || v === null ? outfiter_def[opt] : String(v);
                        }
                    }
                }
                // A creature replaces the outfit and mount (same rule as picking one in the list).
                if (outfiter_GET.creature > 0) {
                    outfiter_GET.outfit = outfiter_outfit_none_id;
                    outfiter_GET.mount = 0;
                }
            },
            //generate url for current options
            outfiter_gen_url = function () {
                var
                    l = location.protocol + '//' + location.host + location.pathname + '?',
                    basea = l.split('?'), base = basea[0],
                    params = '?',
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    can_color_mount = outfiter_mount_colourisable[mount_n] === true,
                    opt, url;
                if (outfiter_title !== '') { params += 'title=' + outfiter_title + '&'; }
                for (opt in outfiter_def) {
                    if (
                        outfiter_def.hasOwnProperty(opt) &&
                        outfiter_GET[opt] !== outfiter_def[opt] &&
                        (can_color_mount || !opt.match(/mc\d/))
                    ) {
                        params += outfiter_opt_names[opt] +
                            (typeof outfiter_GET[opt] === 'boolean' ? (outfiter_GET[opt] === true ? '' : '=!') : '=' + outfiter_GET[opt]) + '&';
                    }
                }
                while (params.substr(-1) === '&') { params = params.substr(0, params.length - 1); }
                url = encodeURI(base + (params.length > 1 ? params : ''));
                ogebi('url_input').val(url);
                // Also show it in the address bar (without adding history entries), so
                // reloading or bookmarking the page keeps the current view. Done a moment
                // later: it is slow in some browsers and must not delay the picture.
                if (!outfiter_preview_mode && window.history && history.replaceState) {
                    clearTimeout(outfiter_url_timer);
                    outfiter_url_timer = setTimeout(function () {
                        if (url !== location.href) {
                            try { history.replaceState(history.state, '', url); } catch (ignore) { }
                        }
                    }, 200);
                }
            },
            //generate template code for current options
            outfiter_gen_template = function () {
                var params = [], opt;
                for (opt in outfiter_def_template) {
                    if (outfiter_def_template.hasOwnProperty(opt)) {
                        if (outfiter_GET[opt] !== outfiter_def_template[opt]) {
                            params.push(opt + '=' + outfiter_GET[opt]);
                        }
                    }
                }
                params.push('height=' + canvas_zoom.height);
                params.push('width=' + canvas_zoom.width);
                return params.join('|');
            },
            //get options from currently selected options
            outfiter_options_to_get = function () {
                var opt;
                for (opt in outfiter_GET) {
                    if (outfiter_GET.hasOwnProperty(opt)) {
                        if (typeof outfiter_GET[opt] === 'boolean') { outfiter_GET[opt] = ogebi(opt).is(':checked'); }
                        else if (typeof outfiter_def[opt] === 'number') { outfiter_GET[opt] = parseInt(ogebi(opt).val(), 10); }
                        else { outfiter_GET[opt] = encodeURIComponent(ogebi(opt).val()); }
                    }
                }
            },
            //help other functions to handle default parameters
            outfiter_parameters_get = function (defp, par) {
                var attrname;
                if ((typeof par) !== 'object') { par = defp; }
                else { for (attrname in defp) { if (defp.hasOwnProperty(attrname)) { if (!par.hasOwnProperty(attrname)) { par[attrname] = defp[attrname]; } } } }
                return par;
            },
            //get pixel data from canvases
            // Resolve creature animation / appearance props with sensible defaults.
            // Merges outfiter_creature_props over legacy standing/walking maps.
            outfiter_creature_get_props = function (creature_n) {
                var
                    // Defaults match historic creature behaviour (1 standing, 8 walking)
                    props = {
                        standing: 1,
                        walking: 8,
                        standing_delay: null,
                        walking_delay: null,
                        standing_delays: null,
                        walking_delays: null,
                        colourisable: false,
                        addon1: false,
                        addon2: false,
                        exclusive_addons: false
                    },
                    custom, k;
                if (!creature_n) { return props; }
                // Legacy irregular frame counts
                if (outfiter_sprites_creature_standing.hasOwnProperty(creature_n)) {
                    props.standing = outfiter_sprites_creature_standing[creature_n];
                }
                if (outfiter_sprites_creature_walking.hasOwnProperty(creature_n)) {
                    props.walking = outfiter_sprites_creature_walking[creature_n];
                }
                // Per-creature overrides (win over legacy maps)
                if (outfiter_creature_props.hasOwnProperty(creature_n)) {
                    custom = outfiter_creature_props[creature_n];
                    for (k in custom) {
                        if (custom.hasOwnProperty(k) && custom[k] !== undefined) {
                            props[k] = custom[k];
                        }
                    }
                }
                return props;
            },
            outfiter_pixels_get_sub = function (par) {

                par = outfiter_parameters_get({ x: 0, y: 0, w: 64, h: 64, src: 'main', pink: true }, par);
                var
                    big_canvas, context, r, p, m,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    is_4096h = par.src === 'main' && outfiter_4096h[outfit_n] === true;

                if (par.src === 'mount') { big_canvas = canvas_mount; }
                else if (par.src === 'creature') { big_canvas = canvas_creature; }
                else { big_canvas = canvas_main; }

                context = big_canvas.getContext('2d');
                r = context.getImageData(
                    (is_4096h && par.y >= 64 ? (Math.floor(par.y / 64) * 8) + par.x : par.x) * par.w,
                    (is_4096h && par.y >= 64 ? par.y - 64 : par.y) * par.h,
                    par.w,
                    par.h
                );
                if (par.pink) {
                    p = 0; m = r.width * r.height * 4;
                    while (p < m) { if (r.data[p] === 255 && r.data[p + 1] === 0 && r.data[p + 2] === 255) { r.data[p + 3] = 0; } p += 4; }
                }
                return r;
            },
            //merge pixel data
            outfiter_pixels_merge = function (bottomp, topp) {
                if (bottomp === false) { return topp; }
                if (topp === false) { return bottomp; }
                var
                    i, bpix = bottomp.data, tpix = topp.data, p = bottomp.width * bottomp.height,
                    pixr = p * 4, pixg, pixb, pixa, r1, g1, b1, a1,
                    res = canvas_work.getContext('2d').createImageData(bottomp.width, bottomp.height),
                    rpix;
                rpix = res.data;
                if (rpix.set) { rpix.set(bpix); }
                else { for (i = 0; i < bpix.length; i++) { rpix[i] = bpix[i]; } }
                while (p--) {
                    r1 = tpix[pixr -= 4];
                    g1 = tpix[pixg = pixr + 1];
                    b1 = tpix[pixb = pixr + 2];
                    a1 = tpix[pixa = pixr + 3];
                    if (a1 !== 0) {
                        rpix[pixr] = r1;
                        rpix[pixg] = g1;
                        rpix[pixb] = b1;
                        rpix[pixa] = a1;
                    }
                }
                return res;
            },
            //apply colors to pixel data
            outfiter_pixels_blend = function (main, blend, is_mount) {
                var
                    color_t = outfiter_color_t,
                    c1 = is_mount ? outfiter_GET.mc1 : outfiter_GET.c1,
                    c2 = is_mount ? outfiter_GET.mc2 : outfiter_GET.c2,
                    c3 = is_mount ? outfiter_GET.mc3 : outfiter_GET.c3,
                    c4 = is_mount ? outfiter_GET.mc4 : outfiter_GET.c4,
                    bpix = blend.data, mpix = main.data, p = blend.width * blend.height,
                    pixr = p * 4, pixg, pixb, r1, g1, b1;
                while (p--) {
                    r1 = bpix[pixr -= 4]; g1 = bpix[pixg = pixr + 1]; b1 = bpix[pixb = pixr + 2];
                    //change blend colors
                    if (r1 === 255 && g1 === 255 && b1 === 0) { r1 = color_t[c1][0]; g1 = color_t[c1][1]; b1 = color_t[c1][2]; }
                    else if (r1 === 255 && g1 === 0 && b1 === 0) { r1 = color_t[c2][0]; g1 = color_t[c2][1]; b1 = color_t[c2][2]; }
                    else if (r1 === 0 && g1 === 255 && b1 === 0) { r1 = color_t[c3][0]; g1 = color_t[c3][1]; b1 = color_t[c3][2]; }
                    else if (r1 === 0 && g1 === 0 && b1 === 255) { r1 = color_t[c4][0]; g1 = color_t[c4][1]; b1 = color_t[c4][2]; }
                    if (mpix[pixr] === 255 && mpix[pixg] === 0 && mpix[pixb] === 255) { mpix[pixb + 1] = 0; }
                    if (!(r1 === 255 && g1 === 0 && b1 === 255)) {
                        //Multiply
                        mpix[pixr] = r1 * mpix[pixr] / 255;
                        mpix[pixg] = g1 * mpix[pixg] / 255;
                        mpix[pixb] = b1 * mpix[pixb] / 255;
                    }
                }
                return main;
            },
            //get outfit pixel data merged and colored
            outfiter_pixels_get_out = function (anim) {
                var
                    pixel_data = false,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    noaddons = outfiter_a_names[outfit_n] === true,
                    noride = outfiter_no_ride_names[outfit_n] === true,
                    pingpong = outfiter_pingpong_animation[outfit_n] === true,
                    //Don't treat "other" outfits differently
                    //mult_y = outfiter_GET.outfit >= 100 ? 1 : (noaddons ? 2 : 6),
                    mult_y = (noaddons ? 1 : 3) * (noride ? 1 : 2);
                anim = pingpong ? Math.abs(anim - (anim % (8 / 2)) * 2) : anim;
                var base_y = (outfiter_GET.mount ? (noaddons ? 1 : 3) : 0) + (anim * mult_y);
                base_y += (outfiter_GET.animate ?
                    (!outfiter_GET.sanim && outfiter_sprites_standing.hasOwnProperty(outfit_n) ?
                        outfiter_sprites_standing[outfit_n] : 0
                    ) : 0) * mult_y;
                $.each([true, outfiter_GET.addon1, outfiter_GET.addon2], function (i, v) {
                    if (v) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            outfiter_pixels_blend(
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * 2, y: base_y + i }),
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * 2 + 1, y: base_y + i })
                            )
                        );
                    }
                });
                return pixel_data;
            },
            //get mount pixel data merged and colored
            outfiter_pixels_get_mount = function (anim) {
                if (anim === undefined) { anim = 0; }
                var
                    pixel_data = false, colourisable, colourisable_mult, base_y_m,
                    mount_n = outfiter_mount_names[outfiter_GET.mount];
                if (outfiter_GET.mount) {
                    colourisable = outfiter_mount_colourisable[mount_n] === true;
                    colourisable_mult = colourisable ? 2 : 1;
                    base_y_m = anim + (outfiter_GET.animate ?
                        (!outfiter_GET.sanim && outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ?
                            outfiter_sprites_mount_standing[mount_n] : 0
                        ) : 0
                    );
                    //base
                    pixel_data = outfiter_pixels_get_sub({ x: outfiter_GET.facing * colourisable_mult, y: base_y_m, src: 'mount' });
                    //blend color
                    if (colourisable) {
                        pixel_data = outfiter_pixels_merge(
                            false,
                            outfiter_pixels_blend(
                                pixel_data,
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * colourisable_mult + 1, y: base_y_m, src: 'mount' }),
                                true
                            )
                        );
                    }
                }
                return pixel_data;
            },
            // Get creature pixel data (supports colourisation + optional addons).
            // Sheet layout is derived from props so any 256-wide height works.
            outfiter_pixels_get_creature = function (anim) {
                if (anim === undefined) { anim = 0; }
                var
                    pixel_data = false,
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    props, colourisable_mult, mult_y, addon2_row, base_y_c, standing_frames;
                if (outfiter_GET.creature) {
                    props = outfiter_creature_get_props(creature_n);
                    colourisable_mult = props.colourisable ? 2 : 1;
                    // One row per layer that exists: base, then addon1 (if any), then addon2 (if any).
                    // e.g. addon1 only -> 2 rows per frame; both addons -> 3 rows per frame.
                    mult_y = 1 + (props.addon1 ? 1 : 0) + (props.addon2 ? 1 : 0);
                    addon2_row = props.addon1 ? 2 : 1;
                    standing_frames = props.standing;
                    base_y_c = (anim * mult_y) + (outfiter_GET.animate ?
                        (!outfiter_GET.sanim ? standing_frames * mult_y : 0) : 0
                    );
                    // Base layer (always)
                    pixel_data = outfiter_pixels_get_sub({
                        x: outfiter_GET.facing * colourisable_mult,
                        y: base_y_c,
                        src: 'creature'
                    });
                    if (props.colourisable) {
                        pixel_data = outfiter_pixels_merge(
                            false,
                            outfiter_pixels_blend(
                                pixel_data,
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult + 1,
                                    y: base_y_c,
                                    src: 'creature'
                                }),
                                false
                            )
                        );
                    }
                    // Addon 1 layer
                    if (props.addon1 && outfiter_GET.addon1) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            props.colourisable ?
                                outfiter_pixels_blend(
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult,
                                        y: base_y_c + 1,
                                        src: 'creature'
                                    }),
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult + 1,
                                        y: base_y_c + 1,
                                        src: 'creature'
                                    }),
                                    false
                                ) :
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult,
                                    y: base_y_c + 1,
                                    src: 'creature'
                                })
                        );
                    }
                    // Addon 2 layer
                    if (props.addon2 && outfiter_GET.addon2) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            props.colourisable ?
                                outfiter_pixels_blend(
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult,
                                        y: base_y_c + addon2_row,
                                        src: 'creature'
                                    }),
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult + 1,
                                        y: base_y_c + addon2_row,
                                        src: 'creature'
                                    }),
                                    false
                                ) :
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult,
                                    y: base_y_c + addon2_row,
                                    src: 'creature'
                                })
                        );
                    }
                }
                return pixel_data;
            },
            //draw pixel data to a canvas
            outfiter_pixels_draw = function (par) {
                par = outfiter_parameters_get({ $canvas: $canvas_work, pixels: false, x: 0, y: 0, clear: false, resize: false }, par);
                if (par.pixels === false) { return; }
                if (par.resize) { par.$canvas.attr({ width: par.pixels.width, height: par.pixels.height }); }
                if (par.clear) { par.$canvas.attr({ width: par.$canvas[0].width, height: par.$canvas[0].height }); }
                par.$canvas[0].getContext('2d').putImageData(par.pixels, par.x, par.y);
            },
            //draw floor on canvas
            outfiter_floor_draw = function (par) {
                par = outfiter_parameters_get({ $canvas: $canvas_work, ctx: false, img: ogebi('floor_image')[0], floor_x: 0, floor_y: 0, clear: true }, par);
                if (!par.ctx) { par.ctx = par.$canvas[0].getContext('2d'); }
                var
                    floor_xs = [par.floor_x],
                    floor_ys = [par.floor_y];
                while (floor_xs[0] > 0) { floor_xs.unshift(floor_xs[0] - floor_spr_w); }
                while (floor_xs[floor_xs.length - 1] + floor_spr_w < floor_w) { floor_xs.push(floor_xs[floor_xs.length - 1] + floor_spr_w); }
                while (floor_ys[0] > 0) { floor_ys.unshift(floor_ys[0] - floor_spr_h); }
                while (floor_ys[floor_ys.length - 1] + floor_spr_h < floor_h) { floor_ys.push(floor_ys[floor_ys.length - 1] + floor_spr_h); }
                if (par.clear) { par.$canvas.attr({ width: par.$canvas[0].width, height: par.$canvas[0].height }); }
                floor_xs.forEach(function (floor_x) {
                    floor_ys.forEach(function (floor_y) {
                        par.ctx.drawImage(
                            ogebi('floor_image')[0],
                            0, 0, floor_spr_w, floor_spr_h,
                            floor_x, floor_y, floor_spr_w, floor_spr_h
                        );
                    });
                });
            },
            //get the limits to horizontally crop pixel data
            // Returns [left, right) — left inclusive, right exclusive — so hcrop keeps the
            // last non-transparent column (previously endx was inclusive and one px was lost).
            outfiter_pixels_hlimits = function (pixels) {
                var ppix = pixels.data, x, y, pixr, startx = false, endx = false;
                for (x = 0; x < pixels.width; x++) {
                    for (y = 0; y < pixels.height; y++) {
                        pixr = (y * pixels.width + x) * 4;
                        if (ppix[pixr + 3] !== 0) { startx = x; x = pixels.width; break; }
                    }
                    if (startx !== false) { break; }
                }
                // scan from the last valid column/row (width-1 / height-1)
                for (x = pixels.width - 1; x >= 0; x--) {
                    for (y = pixels.height - 1; y >= 0; y--) {
                        pixr = (y * pixels.width + x) * 4;
                        if (ppix[pixr + 3] !== 0) { endx = x; break; }
                    }
                    if (endx !== false) { break; }
                }
                // endx is inclusive; return exclusive right edge for hcrop (right - left)
                return (startx === false || endx === false) ? [0, pixels.width] : [startx, endx + 1];
            },
            //horizontally crops or extends area of pixel data
            outfiter_pixels_hcrop_expand = function (pixels, left, right, min_width) {
                if (min_width === undefined) { min_width = false; }
                var
                    ppix = pixels.data, npix, x, y, pixr, npixr, new_pixels,
                    neww = right - left,
                    x_extra = min_width === false ? 0 : neww < min_width ? Math.floor((min_width - neww) / 2) : 0;
                new_pixels = canvas_work.getContext('2d').createImageData(neww, pixels.height);
                npix = new_pixels.data;
                for (x = 0; x < neww; x++) {
                    for (y = 0; y < pixels.height; y++) {
                        pixr = (y * pixels.width + x + left) * 4;
                        npixr = (y * neww + x) * 4;
                        npix[npixr] = ppix[pixr];
                        npix[npixr + 1] = ppix[pixr + 1];
                        npix[npixr + 2] = ppix[pixr + 2];
                        npix[npixr + 3] = ppix[pixr + 3];
                    }
                }
                if (x_extra > 0) {
                    $canvas_work.attr({ width: min_width, height: pixels.height });
                    canvas_work.getContext('2d').putImageData(new_pixels, x_extra, 0);
                    new_pixels = canvas_work.getContext('2d').getImageData(0, 0, min_width, pixels.height);
                }
                return new_pixels;
            },
            // Controls that are locked while a sprite loads: buttons, checkboxes and radios,
            // except the list rows (users may pick another item at any time). Plain CSS
            // selectors keep this fast; it runs twice for every redraw.
            outfiter_lockable_controls = 'button, input[type="checkbox"], input[type="radio"]:not([name="radio_outfits"]):not([name="radio_mounts"]):not([name="radio_creatures"])',
            //toggle loading and some controls usability
            outfiter_hide_body = function (h, is_fail) {
                if (h === true) {
                    clearTimeout(outfiter_atime);
                    var
                        i = ogebi('.body_main_div .body_main', 1),
                        src = i.attr('src'),
                        new_src = is_fail ? error_img : loading_img;
                    ogebi(outfiter_lockable_controls, 1)
                        .not('.outfitm, .outfitp, .mountm, .mountp, .creaturem, .creaturep, .list_tab')
                        .prop({ disabled: true });
                    $this_main.addClass('outfiter_loading');
                    if (new_src && src !== new_src) {
                        outfiter_pan_x = 0;
                        outfiter_pan_y = 0;
                        outfiter_dragging = false;
                        i[0].style.setProperty('--outfiter-img-h', '128px');
                        i
                            .attr('src', '')
                            .attr({ src: new_src, alt: is_fail ? 'Sprite could not be loaded' : 'Loading' })
                            .css({ height: '', width: '', transform: 'translate(-50%, 0)', cursor: 'default' })
                            .attr({ height: 128, width: 128 })
                            .removeClass('body_main_with_floor is-zoomed is-dragging');
                    }
                }
                else {
                    ogebi(outfiter_lockable_controls, 1).filter(':disabled').prop({ disabled: false });
                    $this_main.removeClass('outfiter_loading');
                }
            },
            // Increases every time a new selection starts loading. Responses that arrive
            // for an older selection are ignored, so a slow download can never replace
            // the sprite the user picked afterwards.
            outfiter_load_token = 0,
            // Text shown under the preview (and read out by screen readers). Empty hides it.
            outfiter_status_timer = null,
            outfiter_set_status = function (message, is_error) {
                clearTimeout(outfiter_status_timer);
                ogebi('outfiter_status')
                    .text(message || '')
                    .toggleClass('is-error', !!is_error);
                // confirmations disappear on their own; errors stay until the next selection
                if (message && !is_error) {
                    outfiter_status_timer = setTimeout(function () { outfiter_set_status(''); }, 4000);
                }
            },
            // Show the error image plus a readable message, and log details for developers.
            outfiter_load_failed = function (token, file_url, reason) {
                if (token !== outfiter_load_token) { return; }
                if (window.console && console.error) {
                    console.error('[Outfitter] Could not load sprite sheet "' + file_url + '": ' + reason);
                }
                outfiter_hide_body(true, true);
                outfiter_set_status('Sorry, this sprite could not be loaded. Please pick another item or try again later.', true);
            },
            // get mount, outfit or creature sprite sheets
            outfiter_get_ajax = function (item_n, type, female_suffix) {
                var
                    token = outfiter_load_token,
                    iname = item_n + (female_suffix ? '_Female' : ''),
                    utype = type.substr(0, 1).toUpperCase() + type.substr(1),
                    file_url = (outfiter_settings.asset_folder || 'base64/') + utype + '/' + iname + '.txt',
                    retry_max = outfiter_setting_number('download_retries', 1),
                    retry_wait = outfiter_setting_number('retry_wait_ms', 500),
                    retry_i = 0,
                    // turn the downloaded file into the image of the right layer
                    use_text = function (text) {
                        var $img, sprite = outfiter_rules.parseSpriteFile(text, iname);
                        if (token !== outfiter_load_token) { return; } // user already picked something else
                        if (sprite.error) {
                            outfiter_load_failed(token, file_url, sprite.error);
                            return;
                        }
                        if (type === 'mount') { $img = ogebi('mount_image'); }
                        else if (type === 'creature') { $img = ogebi('creature_image'); }
                        else { $img = ogebi('main_image'); }
                        $img.data({ outfiter_token: token, outfiter_file: file_url });
                        $img.attr('src', '').attr('src', sprite.dataUri);
                    },
                    preview_text = outfiter_preview && outfiter_preview.files ? outfiter_preview.files[utype + '/' + iname] : undefined,
                    ajax_call = function () {
                        $.ajax({
                            dataType: 'text',
                            success: use_text,
                            error: function (xhr) {
                                if (token !== outfiter_load_token) { return; }
                                retry_i++;
                                if (retry_i <= retry_max) { setTimeout(ajax_call, retry_wait); }
                                else { outfiter_load_failed(token, file_url, 'HTTP ' + (xhr && xhr.status)); }
                            },
                            url: file_url
                        });
                    };
                // the Asset Helper's preview supplies the sprite of the item being added
                if (typeof preview_text === 'string') {
                    setTimeout(function () { use_text(preview_text); }, 0);
                    return;
                }
                ajax_call();
            },
            outfiter_load_outfit = function (param) {
                // show_outfit_prev save
                if (param !== 'mount') {
                    ogebi('show_outfit_prev').val(
                        ogebi('show_outfit').prop('checked') ? parseInt(ogebi('outfit').val(), 10) : outfiter_GET.outfit
                    );
                }
                outfiter_options_to_get();

                // creature vs outfit/mount are mutually exclusive
                if (param === 'creature' && outfiter_GET.creature !== 0) {
                    ogebi('outfit').val(outfiter_outfit_none_id);
                    ogebi('mount').val(0);
                    ogebi('radio_outfits_' + outfiter_outfit_none_id).prop('checked', true);
                    ogebi('radio_mounts_0').prop('checked', true);
                    outfiter_options_to_get();
                } else if ((param === 'outfit' || param === 'mount') && (outfiter_GET.outfit !== outfiter_outfit_none_id || outfiter_GET.mount !== 0)) {
                    ogebi('creature').val(0);
                    ogebi('radio_creatures_0').prop('checked', true);
                    outfiter_options_to_get();
                }

                var
                    outfit = outfiter_GET.outfit,
                    mount = outfiter_GET.mount,
                    creature = outfiter_GET.creature,
                    outfit_n = outfiter_names[outfit],
                    mount_n = outfiter_mount_names[mount],
                    creature_n = outfiter_creature_names[creature],
                    has_standing_animation_any = outfiter_sprites_standing.hasOwnProperty(outfit_n) || outfiter_sprites_mount_standing.hasOwnProperty(mount_n) || outfiter_sprites_creature_standing.hasOwnProperty(creature_n) || (creature > 0 && outfiter_creature_get_props(creature_n).standing > 1);

                if (outfiter_m_names[outfit_n] === true || outfiter_mount_names[mount] === undefined) {
                    mount = 0; ogebi('mount').val(0);
                    mount_n = outfiter_mount_names[mount];
                    ogebi('radio_mounts_0').trigger('click');
                    if (param === 'mount') { return; }
                    outfiter_options_to_get();
                }
                if (outfiter_u_names[outfit_n] === true) {
                    ogebi('female').prop({ checked: false });
                    if (param === 'female') { return; }
                    outfiter_options_to_get();
                }
                // Apply addon rules on every load (links used to keep addons the outfit
                // does not have, which drew an unrelated sprite row on top).
                (function () {
                    var cprops = creature > 0 ? outfiter_creature_get_props(creature_n) : null,
                        can1 = cprops ? !!cprops.addon1 : outfiter_a_names[outfit_n] !== true,
                        can2 = cprops ? !!cprops.addon2 : outfiter_a_names[outfit_n] !== true,
                        one_only = cprops ? !!cprops.exclusive_addons : outfiter_o_names[outfit_n] === true;
                    if (!can1) { ogebi('addon1').prop({ checked: false }); }
                    if (!can2) { ogebi('addon2').prop({ checked: false }); }
                    if (one_only && ogebi('addon1').is(':checked') && ogebi('addon2').is(':checked')) {
                        ogebi('addon2').prop({ checked: false });
                    }
                    outfiter_options_to_get();
                }());
                if (!has_standing_animation_any) {
                    ogebi('sanim').prop({ checked: false });
                    outfiter_options_to_get();
                }

                ogebi('radio_outfits_' + outfit).trigger('click');
                outfiter_hide_body(true);
                ogebi('outfit_name').text((
                    (outfiter_GET.female && outfiter_f_names[outfit_n]) ?
                        outfiter_f_names[outfit_n] : outfit_n
                ).replace(/_/g, ' '));
                ogebi('mount_name').text(mount_n.replace(/_/g, ' '));
                ogebi('creature_name').text(creature_n.replace(/_/g, ' '));

                outfiter_load_token++;
                outfiter_set_status('');
                outfiter_images_loaded[1] = mount === 0;
                outfiter_images_loaded[2] = creature === 0;
                outfiter_images_loaded[0] = false;

                if (mount !== 0) { outfiter_get_ajax(mount_n, 'mount'); }
                if (creature !== 0) { outfiter_get_ajax(creature_n, 'creature'); }
                outfiter_get_ajax(
                    outfit_n,
                    outfit >= 100 && outfit < 200 ? 'other' : (outfiter_GET.female ? 'female' : 'male'),
                    outfiter_GET.female && outfiter_f_suffix_inames[outfit_n] === true
                );
            },
            outfiter_do_get_outfit_pos = function (outfit) {
                var x;
                for (x = 0; x < outfiter_names_sorted.length; x++) { if (outfit === outfiter_names_sorted[x]) { break; } }
                if (outfiter_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_get_mount_pos = function (mount) {
                var x;
                for (x = 0; x < outfiter_mount_names_sorted.length; x++) { if (mount === outfiter_mount_names_sorted[x]) { break; } }
                if (outfiter_mount_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_get_creature_pos = function (creature) {
                var x;
                for (x = 0; x < outfiter_creature_names_sorted.length; x++) { if (creature === outfiter_creature_names_sorted[x]) { break; } }
                if (outfiter_creature_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_creature = function (i, absolute) {
                var
                    creature = outfiter_GET.creature,
                    creature_pos = absolute ? outfiter_do_get_creature_pos(i) : outfiter_do_get_creature_pos(creature) + i;
                creature = outfiter_creature_names[outfiter_creature_names_sorted[creature_pos]];
                if (outfiter_creature_names_sorted[creature_pos] === undefined) {
                    if (creature_pos < 0) { creature_pos = outfiter_creature_names_sorted.length - 1; }
                    else if (creature_pos >= outfiter_creature_names_sorted.length) { creature_pos = 0; }
                }
                ogebi('show_creature_prev').val(
                    ogebi('show_creature').length && ogebi('show_creature').prop('checked') ? outfiter_creature_names_sorted[creature_pos] : outfiter_GET.creature
                );
                ogebi('creature').val(outfiter_creature_names_sorted[creature_pos]);
                outfiter_load_outfit('creature');
            },
            outfiter_do_mount = function (i, absolute) {
                var
                    mount = outfiter_GET.mount,
                    mount_pos = absolute ? outfiter_do_get_mount_pos(i) : outfiter_do_get_mount_pos(mount) + i;
                mount = outfiter_mount_names[outfiter_mount_names_sorted[mount_pos]];
                if (outfiter_mount_names_sorted[mount_pos] === undefined) {
                    if (mount_pos < 0) { mount_pos = outfiter_mount_names_sorted.length - 1; }
                    else if (mount_pos >= outfiter_mount_names_sorted.length) { mount_pos = 0; }
                }
                ogebi('show_mount_prev').val(
                    ogebi('show_mount').prop('checked') ? outfiter_mount_names_sorted[mount_pos] : outfiter_GET.mount
                );
                ogebi('mount').val(outfiter_mount_names_sorted[mount_pos]);
                outfiter_load_outfit('mount');
            },
            outfiter_do_outfit = function (i, absolute) {
                outfiter_options_to_get();
                var
                    mount = outfiter_GET.mount,
                    mount_pos = outfiter_do_get_mount_pos(mount),
                    outfit = outfiter_GET.outfit,
                    outfit_pos = (absolute ? outfiter_do_get_outfit_pos(i) : outfiter_do_get_outfit_pos(outfit) + i),
                    has_standing_animation;
                if (outfiter_names_sorted[outfit_pos] === undefined) {
                    if (outfit_pos < 0) { outfit_pos = outfiter_names_sorted.length - 1; }
                    else if (outfit_pos >= outfiter_names_sorted.length) { outfit_pos = 0; }
                }
                outfit = outfiter_names[outfiter_names_sorted[outfit_pos]];
                mount = outfiter_mount_names[outfiter_mount_names_sorted[mount_pos]];
                ogebi('outfit').val(outfiter_names_sorted[outfit_pos]);
                if (outfiter_a_names[outfit] === true) {
                    ogebi('addon1').prop({ checked: false });
                    ogebi('addon2').prop({ checked: false });
                }
                else if (outfiter_o_names[outfit] === true) {
                    if (ogebi('addon1').is(':checked')) { ogebi('addon2').prop({ checked: false }); }
                    else if (ogebi('addon2').is(':checked')) { ogebi('addon1').prop({ checked: false }); }
                }
                if (outfiter_m_names[outfit] === true || mount === undefined) {
                    ogebi('radio_mounts_0').trigger('click');
                    outfiter_options_to_get();
                    mount = outfiter_GET.mount;
                    mount_pos = outfiter_do_get_mount_pos(mount);
                }
                if (ogebi('sanim').is(':checked')) {
                    has_standing_animation = outfiter_sprites_standing.hasOwnProperty(outfit) ||
                        outfiter_sprites_mount_standing.hasOwnProperty(mount) ||
                        outfiter_sprites_creature_standing.hasOwnProperty(outfiter_creature_names[outfiter_GET.creature]);
                    if (!has_standing_animation) { ogebi('sanim').prop({ checked: false }); }
                }
                outfiter_load_outfit('outfit');
            },
            outfiter_animate_char = function () {
                clearTimeout(outfiter_atime);
                outfiter_acurrent++;
                if (outfiter_acurrent >= outfiter_aframes.length) { outfiter_acurrent = 0; }
                if (!ogebi('animate').is(':checked')) { return; }
                ogebi('.body_main_div .body_main', 1).attr('src', '').attr('src', outfiter_aframes[outfiter_acurrent]);
                outfiter_atime = setTimeout(outfiter_animate_char, outfiter_outfit_speed(outfiter_acurrent));
            },
            greatest_common_factor = function (x, y) {
                var a = Math.max(x, y), b = Math.min(x, y), c = 1, res;
                if (!(b > 0)) { return a > 0 ? a : 1; } // gcd(n, 0) = n; avoids an endless loop on 0 / NaN
                do {
                    c = a % b;
                    // capture last value of $b as the potential last GCF result
                    res = b;
                    // if $c did not = 0 we need to repeat with the values held in $b and $c
                    // at this point $b is higher than $c so we set up for the next iteration
                    // set $a to the higher number and $b to the lower number
                    a = b;
                    b = c;
                } while (c !== 0);
                return res;
            },
            least_common_multiple = function (x, y) {
                return (x * y) / greatest_common_factor(x, y);
            },
            use_special_delays = false,
            special_delays = [],
            outfiter_outfit_speed = function (i) {
                var
                    res = 100,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    creature_n, props, frames;
                if (use_special_delays && special_delays && special_delays.length) {
                    res = special_delays[i % special_delays.length];
                }
                // Creature-specific timing when a creature is selected
                else if (outfiter_GET.creature > 0) {
                    creature_n = outfiter_creature_names[outfiter_GET.creature];
                    props = outfiter_creature_get_props(creature_n);
                    if (outfiter_GET.sanim) {
                        if (props.standing_delay !== null && props.standing_delay !== undefined) {
                            res = props.standing_delay;
                        } else {
                            frames = props.standing > 0 ? props.standing : 1;
                            res = 800 / frames;
                        }
                    } else {
                        if (props.walking_delay !== null && props.walking_delay !== undefined) {
                            res = props.walking_delay;
                        } else {
                            frames = props.walking > 0 ? props.walking : 8;
                            res = 800 / frames;
                        }
                    }
                    res = res < 100 ? 100 : res;
                }
                else {
                    res = 800 / (outfiter_sprites_walking.hasOwnProperty(outfit_n) ?
                        outfiter_sprites_walking[outfit_n] : 8
                    );
                    res = res < 100 ? 100 : res;
                }
                return res;
            },
            outfiter_do_display2 = function () {
                var
                    // Format: [column, row, width, leftOffset, rightOffset]
                    outfiter_letters = {
                        'À': [0, 5, 9, 0, 0], 'Á': [1, 5, 9, 0, 0], 'Â': [2, 5, 9, 0, 0], 'Ã': [3, 5, 9, 0, 0], 'Ä': [4, 5, 9, 0, 0], 'Å': [5, 5, 9, 0, 0], 'Æ': [6, 5, 12, 0, 0], 'Ç': [7, 5, 8, 0, 0],
                        'È': [8, 5, 8, 0, 0], 'É': [9, 5, 8, 0, 0], 'Ê': [10, 5, 8, 0, 0], 'Ë': [11, 5, 8, 0, 0], 'Ì': [12, 5, 6, 0, 0], 'Í': [13, 5, 6, 0, 0], 'Î': [14, 5, 6, 0, 0], 'Ï': [15, 5, 6, 0, 0],
                        'Ð': [16, 5, 9, 0, 0], 'Ñ': [17, 5, 9, 0, 0], 'Ò': [18, 5, 9, 0, 0], 'Ó': [19, 5, 9, 0, 0], 'Ô': [20, 5, 9, 0, 0], 'Õ': [21, 5, 9, 0, 0], 'Ö': [22, 5, 9, 0, 0], '×': [23, 5, 10, 0, 0],
                        'Ø': [24, 5, 9, 0, 0], 'Ù': [25, 5, 9, 0, 0], 'Ú': [26, 5, 9, 0, 0], 'Û': [27, 5, 9, 0, 0], 'Ü': [28, 5, 9, 0, 0], 'Ý': [29, 5, 8, 0, 0], 'Þ': [30, 5, 8, 0, 0], 'ß': [31, 5, 8, 0, 0],
                        'à': [0, 6, 8, 0, 0], 'á': [1, 6, 8, 0, 0], 'â': [2, 6, 8, 0, 0], 'ã': [3, 6, 8, 0, 0], 'ä': [4, 6, 8, 0, 0], 'å': [5, 6, 8, 0, 0], 'æ': [6, 6, 12, 0, 0], 'ç': [7, 6, 7, 0, 0],
                        'è': [8, 6, 8, 0, 0], 'é': [9, 6, 8, 0, 0], 'ê': [10, 6, 8, 0, 0], 'ë': [11, 6, 8, 0, 0], 'ì': [12, 6, 4, 0, 0], 'í': [13, 6, 4, 0, 0], 'î': [14, 6, 4, 0, 0], 'ï': [15, 6, 4, 0, 0],
                        'ð': [16, 6, 8, 0, 0], 'ñ': [17, 6, 8, 0, 0], 'ò': [18, 6, 8, 0, 0], 'ó': [19, 6, 8, 0, 0], 'ô': [20, 6, 8, 0, 0], 'õ': [21, 6, 8, 0, 0], 'ö': [22, 6, 8, 0, 0], '÷': [23, 6, 9, 0, 0],
                        'ø': [24, 6, 8, 0, 0], 'ù': [25, 6, 8, 0, 0], 'ú': [26, 6, 8, 0, 0], 'û': [27, 6, 8, 0, 0], 'ü': [28, 6, 8, 0, 0], 'ý': [29, 6, 8, 0, 0], 'þ': [30, 6, 8, 0, 0], 'ÿ': [31, 6, 8, 0, 0],
                        ' ': [0, 0, 4, 0, 0], '.': [14, 0, 4, 0, 0], '-': [13, 4, 6, 0, 0], ',': [12, 0, 4, 0, 0],
                        '@': [0, 1, 9, 0, 0], 'A': [1, 1, 9, 0, 0], 'B': [2, 1, 8, 0, 0], 'C': [3, 1, 8, 0, 0], 'D': [4, 1, 9, 0, 0], 'E': [5, 1, 8, 0, 0], 'F': [6, 1, 8, 0, 0], 'G': [7, 1, 9, 0, 0],
                        'H': [8, 1, 9, 0, 0], 'I': [9, 1, 6, 0, 0], 'J': [10, 1, 6, 1, 0], 'K': [11, 1, 8, 0, 0], 'L': [12, 1, 7, 0, 1], 'M': [13, 1, 10, 0, 0], 'N': [14, 1, 9, 0, 0], 'O': [15, 1, 9, 0, 0],
                        'P': [16, 1, 8, 0, 0], 'Q': [17, 1, 9, 0, 0], 'R': [18, 1, 8, 0, 1], 'S': [19, 1, 8, 0, 0], 'T': [20, 1, 8, 1, 1], 'U': [21, 1, 9, 0, 0], 'V': [22, 1, 8, 0, 0], 'W': [23, 1, 12, 0, 0],
                        'X': [24, 1, 8, 0, 0], 'Y': [25, 1, 8, 0, 0], 'Z': [26, 1, 8, 0, 0],
                        '\'': [7, 0, 4, 0, 0], 'a': [1, 2, 8, 0, 0], 'b': [2, 2, 8, 0, 0], 'c': [3, 2, 7, 0, 0], 'd': [4, 2, 8, 0, 0], 'e': [5, 2, 8, 0, 0], 'f': [6, 2, 5, 1, 1], 'g': [7, 2, 8, 0, 0],
                        'h': [8, 2, 8, 0, 0], 'i': [9, 2, 4, 0, 0], 'j': [10, 2, 5, 1, 0], 'k': [11, 2, 8, 0, 0], 'l': [12, 2, 4, 0, 0], 'm': [13, 2, 12, 0, 0], 'n': [14, 2, 8, 0, 0], 'o': [15, 2, 8, 0, 0],
                        'p': [16, 2, 8, 0, 0], 'q': [17, 2, 8, 0, 0], 'r': [18, 2, 6, 0, 1], 's': [19, 2, 7, 0, 0], 't': [20, 2, 5, 1, 1], 'u': [21, 2, 8, 0, 0], 'v': [22, 2, 8, 0, 0], 'w': [23, 2, 10, 0, 0],
                        'x': [24, 2, 8, 0, 0], 'y': [25, 2, 8, 0, 0], 'z': [26, 2, 7, 0, 0],
                        '0': [16, 0, 8, 0, 0], '1': [17, 0, 6, 0, 0], '2': [18, 0, 8, 0, 0], '3': [19, 0, 8, 0, 0], '4': [20, 0, 8, 0, 0],
                        '5': [21, 0, 8, 0, 0], '6': [22, 0, 8, 0, 0], '7': [23, 0, 8, 0, 0], '8': [24, 0, 8, 0, 0], '9': [25, 0, 8, 0, 0],
                    },
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    af_o = outfiter_GET.animate ?
                        (outfiter_GET.sanim ?
                            (outfiter_sprites_standing.hasOwnProperty(outfit_n) ?
                                outfiter_sprites_standing[outfit_n] +
                                (outfiter_pingpong_animation.hasOwnProperty(outfit_n) ?
                                    outfiter_sprites_standing[outfit_n] - 2 : 0) : 1
                            ) :
                            (outfiter_sprites_walking.hasOwnProperty(outfit_n) ?
                                outfiter_sprites_walking[outfit_n] +
                                (outfiter_pingpong_animation.hasOwnProperty(outfit_n) ?
                                    outfiter_sprites_walking[outfit_n] - 2 : 0) : 8
                            )
                        ) : 0,
                    af_m = outfiter_GET.mount ?
                        (outfiter_GET.animate ?
                            (outfiter_GET.sanim ?
                                (outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ?
                                    outfiter_sprites_mount_standing[mount_n] : 1
                                ) :
                                (outfiter_sprites_mount_walking.hasOwnProperty(mount_n) ?
                                    outfiter_sprites_mount_walking[mount_n] : 8
                                )
                            ) : 0
                        ) : af_o,
                    // Creature frame counts come from outfiter_creature_get_props
                    af_c = outfiter_GET.creature ?
                        (outfiter_GET.animate ?
                            (outfiter_GET.sanim ?
                                outfiter_creature_get_props(creature_n).standing :
                                outfiter_creature_get_props(creature_n).walking
                            ) : 0
                        ) : 0,
                    done = false,
                    delays_o, delays_m, total_o, total_m,
                    keyframes_o, keyframes_m, keyframes,
                    has_creature = outfiter_GET.creature > 0,
                    af = has_creature ? af_c : ((af_o === 0 || af_m === 0) ? 0 : least_common_multiple(af_o, af_m)),
                    af_tmp,
                    afi,
                    frames_all = [],
                    frames_o = [],
                    frames_m = [],
                    frames_c = [],
                    pos_o,
                    pos_m,
                    pos_c,
                    limit_left = false,
                    limit_right = false,
                    pixel_data,
                    ctx_zoom,
                    ctx_work,
                    neww, newh,
                    output_image,
                    soft_mult = outfiter_GET.soft ? 2 : 1,
                    //name vars
                    bar_xpos = outfiter_GET.soft ? (outfiter_GET.outfit === 103 ? 44 : 82) : (outfiter_GET.outfit === 103 ? 16 : 34),
                    namew,
                    name_center = bar_xpos + 13,
                    name_left,
                    name_right,
                    char_name = decodeURIComponent(outfiter_GET.charn).split(''),
                    lastpos,
                    //floor
                    floor_offset = { x: 1, y: 1 },
                    floor_move = outfiter_GET.animate && !outfiter_GET.sanim && outfiter_no_floor_move_names[outfit_n] !== true,
                    floor_x,
                    floor_y,
                    //
                    has_standing_animation_o = outfiter_GET.animate && outfiter_sprites_standing.hasOwnProperty(outfit_n),
                    has_standing_animation_m = outfiter_GET.animate && outfiter_sprites_mount_standing.hasOwnProperty(mount_n),
                    has_standing_animation_any = outfiter_sprites_standing.hasOwnProperty(outfit_n) || outfiter_sprites_mount_standing.hasOwnProperty(mount_n) || (outfiter_GET.creature > 0 && outfiter_creature_get_props(creature_n).standing > 1) || outfiter_sprites_creature_standing.hasOwnProperty(creature_n),
                    has_outfit = outfiter_GET.outfit !== outfiter_outfit_none_id,
                    can_have_mount = outfiter_m_names[outfit_n] !== true && has_outfit,
                    can_color_mount = outfiter_mount_colourisable[mount_n] === true,
                    show_mount_prev = parseInt(ogebi('show_mount_prev').val(), 10),
                    show_mount_checked = false,
                    show_mount_disabled = false,
                    show_outfit_prev = parseInt(ogebi('show_outfit_prev').val(), 10),
                    show_outfit_checked = false,
                    show_outfit_disabled = false,
                    draw_text_char = function (i) {
                        var v = char_name[i];
                        if (outfiter_letters.hasOwnProperty(v)) {
                            ctx_zoom.drawImage(
                                ogebi('letters_image')[0],
                                outfiter_letters[v][0] * 16 - outfiter_letters[v][3],
                                outfiter_letters[v][1] * 16,
                                outfiter_letters[v][2] + outfiter_letters[v][3] + outfiter_letters[v][4], 15,
                                lastpos + 1 + floor_offset.x - outfiter_letters[v][3],
                                (outfiter_GET.soft ? 48 : 16) - 1 + floor_offset.y,
                                outfiter_letters[v][2] + outfiter_letters[v][3] + outfiter_letters[v][4], 15
                            );
                            lastpos += outfiter_letters[v][2];
                        }
                    },
                    namew_add = function (i) { if (outfiter_letters.hasOwnProperty(char_name[i])) { namew += outfiter_letters[char_name[i]][2]; } },
                    array_fill = function (amount, val) {
                        var i, ret = [];
                        for (i = 0; i < amount; i++) { ret.push(typeof val === 'function' ? val(i) : val); }
                        return ret;
                    };
                //clean saved image frames
                outfiter_aframes = [];
                //clear canvases
                $canvas_main.attr({ width: canvas_main.width, height: canvas_main.height });
                $canvas_mount.attr({ width: canvas_mount.width, height: canvas_mount.height });
                $canvas_creature.attr({ width: canvas_creature.width, height: canvas_creature.height });
                //fill canvases with images
                try { canvas_main.getContext('2d').drawImage(ogebi('main_image')[0], 0, 0); } catch (ignore) { }
                try { canvas_mount.getContext('2d').drawImage(ogebi('mount_image')[0], 0, 0); } catch (ignore) { }
                try { canvas_creature.getContext('2d').drawImage(ogebi('creature_image')[0], 0, 0); } catch (ignore) { }

                ctx_zoom = canvas_zoom.getContext('2d');
                ctx_work = canvas_work.getContext('2d');
                use_special_delays = false;
                // Creature per-frame delay arrays (standing_delays / walking_delays)
                if (has_creature) {
                    (function () {
                        var cprops = outfiter_creature_get_props(creature_n), delay_arr = null, di;
                        if (outfiter_GET.sanim && cprops.standing_delays && cprops.standing_delays.length) {
                            delay_arr = cprops.standing_delays;
                        } else if (!outfiter_GET.sanim && cprops.walking_delays && cprops.walking_delays.length) {
                            delay_arr = cprops.walking_delays;
                        }
                        if (delay_arr) {
                            special_delays = [];
                            for (di = 0; di < delay_arr.length; di++) {
                                special_delays[di] = delay_arr[di];
                            }
                            use_special_delays = true;
                            af = delay_arr.length;
                        }
                    }());
                }
                if (outfiter_GET.sanim && (
                    outfiter_special_delays_standing.hasOwnProperty(outfit_n) ||
                    outfiter_special_delays_mount_standing.hasOwnProperty(mount_n))
                ) {
                    delays_o = [];
                    delays_m = [];
                    var special_o = outfiter_special_delays_standing.hasOwnProperty(outfit_n);
                    var special_m = outfiter_special_delays_mount_standing.hasOwnProperty(mount_n);
                    if (special_o && special_m) {
                        delays_o = outfiter_special_delays_standing[outfit_n];
                        delays_m = outfiter_special_delays_mount_standing[mount_n];
                    } else if (special_o) {
                        delays_o = outfiter_special_delays_standing[outfit_n];
                        if (outfiter_sprites_mount_standing.hasOwnProperty(mount_n)) {
                            delays_m = array_fill(outfiter_sprites_mount_standing[mount_n], 100);
                        } else {
                            delays_m = [delays_o.reduce(function (a, b) { return Math.min(a, b); })];
                        }
                    } else if (special_m) {
                        delays_m = outfiter_special_delays_mount_standing[mount_n];
                        if (outfiter_sprites_standing.hasOwnProperty(outfit_n)) {
                            delays_o = array_fill(outfiter_sprites_standing[outfit_n], 100);
                        } else {
                            delays_o = [delays_m.reduce(function (a, b) { return Math.min(a, b); })];
                        }
                    }
                    total_o = delays_o.reduce(function (a, b) { return a + b; });
                    total_m = delays_m.reduce(function (a, b) { return a + b; });
                    var
                        anim_duration = least_common_multiple(total_o, total_m),
                        delays_all_o = [],
                        delays_all_m = [],
                        d_all_i, keyframes_i;
                    keyframes_o = [];
                    keyframes_m = [];
                    keyframes = [];
                    special_delays = [];
                    for (d_all_i = 0; d_all_i < anim_duration / total_o; d_all_i++) {
                        delays_all_o = delays_all_o.concat(delays_o);
                    }
                    for (d_all_i = 0; d_all_i < anim_duration / total_m; d_all_i++) {
                        delays_all_m = delays_all_m.concat(delays_m);
                    }
                    delays_all_o.reduce(function (a, b, i) { return (keyframes_o[i] = a + b); }, 0);
                    delays_all_m.reduce(function (a, b, i) { return (keyframes_m[i] = a + b); }, 0);
                    keyframes = keyframes_o.concat(keyframes_m).sort(function (a, b) { return a - b; });
                    keyframes = keyframes.filter(function (v, i) { return keyframes.indexOf(v) === i; });
                    keyframes.unshift(0);
                    for (keyframes_i = 1; keyframes_i < keyframes.length; keyframes_i++) {
                        special_delays[keyframes_i - 1] = keyframes[keyframes_i] - keyframes[keyframes_i - 1];
                    }
                    use_special_delays = true;
                    af = keyframes.length - 1;
                    //console.log(delays_o.join(','));
                    //console.log(keyframes_o.join(','));
                    //console.log(delays_m.join(','));
                    //console.log(keyframes_m.join(','));
                    //console.log(keyframes.join(','));
                    //console.log(special_delays.join(','));
                }
                //floor_move frame adjust
                if (floor_move && af > 0) {
                    af_tmp = least_common_multiple(af, floor_spr_w / floor_move_per_frame);
                    af = af_tmp < 128 ? af_tmp : af;
                }
                //getting animation frame
                var kf_red = function (a, b) { return keyframes[afi + 1] < b ? a : b; };
                for (afi = 0; afi < af || (af === 0 && done === false); afi++) {
                    //get basic data
                    if (af === 0) {
                        if (has_creature) {
                            pixel_data = outfiter_pixels_get_creature(0);
                        } else {
                            pixel_data = outfiter_pixels_merge(outfiter_pixels_get_mount(0), outfiter_pixels_get_out(0));
                        }
                        done = true;
                    } else if (use_special_delays) {
                        if (has_creature) {
                            // Creature delay-array animation: one frame index per special_delays entry
                            pos_c = afi % special_delays.length;
                            if (!frames_c[pos_c]) { frames_c[pos_c] = outfiter_pixels_get_creature(pos_c); }
                            pixel_data = frames_c[pos_c];
                        } else {
                            pos_o = keyframes_o.indexOf(keyframes_o.reduce(kf_red));
                            pos_o = pos_o % delays_o.length;
                            pos_m = keyframes_m.indexOf(keyframes_m.reduce(kf_red));
                            pos_m = pos_m % delays_m.length;
                            //console.log({afi: afi, pos_o: pos_o, pos_m: pos_m});
                            if (!frames_m[pos_m]) { frames_m[pos_m] = outfiter_pixels_get_mount(pos_m); }
                            if (!frames_o[pos_o]) { frames_o[pos_o] = outfiter_pixels_get_out(pos_o); }
                            pixel_data = outfiter_pixels_merge(frames_m[pos_m], frames_o[pos_o]);
                        }
                    } else {
                        if (has_creature) {
                            // Frame index only; standing-row offset is applied inside outfiter_pixels_get_creature
                            pos_c = afi % af_c;
                            if (!frames_c[pos_c]) { frames_c[pos_c] = outfiter_pixels_get_creature(pos_c); }
                            pixel_data = frames_c[pos_c];
                        } else {
                            pos_o = (afi % af_o) + (has_standing_animation_o ? 0 : (outfiter_GET.sanim ? 0 : 1));
                            pos_m = (afi % af_m) + (has_standing_animation_m ? 0 : (outfiter_GET.sanim ? 0 : 1));
                            //console.log({afi: afi, pos_o: pos_o, pos_m: pos_m});
                            if (!frames_m[pos_m]) { frames_m[pos_m] = outfiter_pixels_get_mount(pos_m); }
                            if (!frames_o[pos_o]) { frames_o[pos_o] = outfiter_pixels_get_out(pos_o); }
                            pixel_data = outfiter_pixels_merge(frames_m[pos_m], frames_o[pos_o]);
                        }
                    }
                    //floor
                    if (outfiter_GET.floor) {
                        //resize/reposition
                        $canvas_work.attr({ width: floor_w, height: floor_h });
                        floor_offset.x = (floor_w - 64) / 2;
                        floor_offset.y = floor_offset_y;
                        outfiter_pixels_draw({ pixels: pixel_data, x: floor_offset.x, y: floor_offset.y });
                        pixel_data = ctx_work.getImageData(0, 0, canvas_work.width, canvas_work.height);
                        //coords (0 north 1 east 2 south 3 west)
                        floor_x = (floor_move && (outfiter_GET.facing % 2) ? (afi * floor_move_per_frame * (outfiter_GET.facing === 1 ? -1 : 1)) : 0) - floor_offset_x;
                        floor_y = (floor_move && !(outfiter_GET.facing % 2) ? (afi * floor_move_per_frame * (outfiter_GET.facing === 2 ? -1 : 1)) : 0) - floor_offset_y;
                        outfiter_floor_draw({ ctx: ctx_work, floor_x: floor_x, floor_y: floor_y });
                        //merge
                        pixel_data = outfiter_pixels_merge(
                            ctx_work.getImageData(0, 0, canvas_work.width, canvas_work.height),
                            pixel_data
                        );
                        //update offset
                        floor_offset.x *= soft_mult;
                        floor_offset.y *= soft_mult;
                    }
                    else {
                        $canvas_work.attr({ width: 64, height: 64 });
                    }
                    //draw normal
                    outfiter_pixels_draw({ pixels: pixel_data, clear: true });
                    //draw zoomed
                    $canvas_zoom.attr({ width: canvas_work.width * soft_mult, height: canvas_work.height * soft_mult });
                    ctx_zoom.drawImage(
                        canvas_work,
                        0, 0, canvas_work.width, canvas_work.height,
                        0, 0, canvas_work.width * soft_mult, canvas_work.height * soft_mult
                    );
                    pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    //hp bar
                    if (outfiter_GET.hpbar) {
                        ctx_zoom.drawImage(
                            ogebi('hp_bar')[0],
                            0, 0, 64, 64,
                            bar_xpos + floor_offset.x, (outfiter_GET.soft ? 60 : 28) + floor_offset.y, 64, 64
                        );
                        pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    }
                    //name
                    if (outfiter_GET.charn !== '') {
                        namew = 0;
                        name_left = 0;
                        name_right = 0;
                        //get total length
                        $.each(char_name, namew_add);
                        namew += 2;
                        //resize canvas if needed and set start position
                        if (canvas_zoom.width - name_center < namew / 2) { name_right = Math.ceil((namew / 2) - (canvas_zoom.width - name_center)); }
                        if (name_center < namew / 2) { name_left = Math.ceil((namew / 2) - name_center); }
                        $canvas_zoom.attr({ width: canvas_zoom.width + name_left + name_right });
                        outfiter_pixels_draw({ $canvas: $canvas_zoom, pixels: pixel_data, x: name_left });
                        lastpos = name_center + name_left - Math.floor(namew / 2);
                        //draw the text
                        $.each(char_name, draw_text_char);
                        pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    }
                    //save frame pixel_data
                    frames_all[afi] = pixel_data;
                }
                //get limits
                if (outfiter_GET.floor) {
                    limit_left = 0;
                    limit_right = canvas_zoom.width;
                } else {
                    $.each(frames_all, function (i) {
                        var limits = outfiter_pixels_hlimits(frames_all[i]);
                        limit_left = limit_left === false ? limits[0] : Math.min(limits[0], limit_left);
                        limit_right = limit_right === false ? limits[1] : Math.max(limits[1], limit_right);
                    });
                }

                $.each(frames_all, function (i) {
                    frames_all[i] = outfiter_pixels_hcrop_expand(frames_all[i], limit_left, limit_right, 64 * soft_mult);
                    outfiter_pixels_draw({ $canvas: $canvas_zoom, pixels: frames_all[i], resize: true });
                    outfiter_aframes[i] = canvas_zoom.toDataURL();
                });

                output_image = outfiter_aframes[0];

                if (outfiter_bake_silent) {
                    return;
                }

                if (outfiter_GET.animate) {
                    outfiter_animate_char();
                }

                neww = frames_all[0].width * 2 / soft_mult;
                newh = frames_all[0].height * 2 / soft_mult;
                outfiter_base_w = neww;
                outfiter_base_h = newh;
                ogebi('.body_main_div .body_main', 1)
                    .attr('src', '')
                    .attr({ src: output_image, alt: outfiter_describe_preview() }).toggleClass('body_main_with_floor', outfiter_GET.floor);
                outfiter_fit_zoom();
                outfiter_apply_zoom();

                ogebi('anistep_step_cont').empty();
                if (ogebi('anistep').is(':checked') && outfiter_aframes && outfiter_aframes.length) {
                    $.each(outfiter_aframes, function (i, v) {
                        ogebi('anistep_step_cont').append(
                            $('<div />', { class: 'anistep_step' }).append(
                                $('<img />', {
                                    alt: 'Animation step ' + (i + 1),
                                    title: 'Step ' + (i + 1),
                                    src: v
                                })
                            )
                        );
                    });
                    ogebi('anistep_panel').addClass('is-visible');
                } else {
                    ogebi('anistep_panel').removeClass('is-visible');
                }

                ogebi('template_code_code_cont').empty();
                if (ogebi('template_code').is(':checked')) {
                    ogebi('template_code_code_cont').append(
                        $('<span />', { class: 'url_input_text', html: 'Template:&nbsp;' }),
                        $('<span />', { class: 'template_code_out' }).append(
                            $('<textarea />', {
                                class: 'dark_input template_code_code',
                                rows: 2,
                                readonly: 'readonly'
                            }).val('{{Outfitter|' + outfiter_gen_template() + '}}')
                        ),
                        $('<button />', {
                            type: 'button',
                            class: 'copy_btn copy_template',
                            title: 'Copy',
                            'aria-label': 'Copy template'
                        })
                    );
                }

                outfiter_hide_body(false);
                outfiter_apply_zoom();

                // Colours: what can be recoloured right now? A recolourable creature uses the
                // "Outfit" colours (c1-c4); the "Mount" colours (mc1-mc4) only exist for
                // recolourable mounts. The palette always edits the selected target, so the
                // target is switched when the other one is the only thing that can change.
                (function () {
                    var cprops = has_creature ? outfiter_creature_get_props(creature_n) : null,
                        can_main = has_creature ? cprops.colourisable === true : has_outfit,
                        can_mnt = !has_creature && can_color_mount,
                        target = ogebi('[name="radio_colourise"]:checked', 1).val(),
                        nothing = !can_main && !can_mnt;
                    if (target === 'mount' && !can_mnt && can_main) { target = 'outfit'; }
                    if (target === 'outfit' && !can_main && can_mnt) { target = 'mount'; }
                    ogebi('[name="radio_colourise"][value="' + target + '"]', 1).prop({ checked: true }).trigger('change');
                    // choosing a target only makes sense when both can be coloured
                    ogebi('[name="radio_colourise"]', 1).prop({ disabled: !(can_main && can_mnt) }).parent().toggleClass('disabled', !(can_main && can_mnt));
                    ogebi('colourise_copy').prop({ disabled: !(can_main && can_mnt) });
                    ogebi('colourise_random').prop({ disabled: nothing });
                    ogebi('colors_cont').toggleClass('is-unavailable', nothing);
                    ogebi('dcolor_table').attr('aria-disabled', nothing ? 'true' : 'false');
                    if (has_creature) {
                        ogebi('female').parent().toggleClass('disabled', true);
                        // Per-addon enable based on creature props
                        ogebi('addon1').parent().toggleClass('disabled', !cprops.addon1);
                        ogebi('addon2').parent().toggleClass('disabled', !cprops.addon2);
                        if (!cprops.addon1) { ogebi('addon1').prop({ checked: false }); }
                        if (!cprops.addon2) { ogebi('addon2').prop({ checked: false }); }
                    } else {
                        ogebi('female').parent().toggleClass('disabled', outfiter_u_names[outfit_n] === true);
                        ogebi('.addon1, .addon2', 1).parent().toggleClass('disabled', outfiter_a_names[outfit_n] === true);
                    }
                }());
                ogebi('sanim').prop({ disabled: !has_standing_animation_any }).parent().toggleClass('disabled', !has_standing_animation_any);

                if (outfiter_GET.outfit === outfiter_outfit_none_id && show_outfit_prev === outfiter_outfit_none_id) { show_outfit_disabled = true; }
                else { show_outfit_checked = has_outfit; }
                ogebi('show_outfit').prop({ checked: show_outfit_checked, disabled: show_outfit_disabled }).parent().toggleClass('disabled', show_outfit_disabled);

                if ((has_outfit && !can_have_mount) || (!outfiter_GET.mount && !show_mount_prev)) { show_mount_disabled = true; }
                show_mount_checked = !!outfiter_GET.mount;
                ogebi('show_mount').prop({ checked: show_mount_checked, disabled: show_mount_disabled }).parent().toggleClass('disabled', show_mount_disabled);

                var show_creature_prev2 = parseInt(ogebi('show_creature_prev').val(), 10),
                    show_creature_checked = false, show_creature_disabled = false;
                if (!outfiter_GET.creature && !show_creature_prev2) { show_creature_disabled = true; }
                show_creature_checked = !!outfiter_GET.creature;
                ogebi('show_creature').prop({ checked: show_creature_checked, disabled: show_creature_disabled }).parent().toggleClass('disabled', show_creature_disabled);

                ogebi('.mountm, .mountp', 1).parent().toggleClass('disabled', !can_have_mount);
                outfiter_sync_lists();
                outfiter_gen_url();
            },
            outfiter_do_display = function () {
                var display2_delay;
                outfiter_options_to_get();
                outfiter_hide_body(true);
                clearTimeout(outfiter_atime);
                display2_delay = (outfiter_GET.animate && outfiter_apng_supported === '') ? 1500 : 1;
                outfiter_ui_images_ready.always(function () {
                    setTimeout(outfiter_do_display2, display2_delay);
                });
            },
            outfiter_do_addon = function (id) {
                id = (typeof id === 'number') ? id : 0;
                var
                    tmp, has_standing_animation,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    cprops;
                if (outfiter_GET.creature > 0) {
                    // Creature-mode addon rules (per-creature props)
                    cprops = outfiter_creature_get_props(creature_n);
                    if (!cprops.addon1 && !cprops.addon2) {
                        ogebi('addon1, .addon2').prop({ checked: false });
                        if (id) { return; }
                    } else {
                        if (!cprops.addon1) { ogebi('addon1').prop({ checked: false }); }
                        if (!cprops.addon2) { ogebi('addon2').prop({ checked: false }); }
                        // Mutually exclusive addons when configured
                        if (id && cprops.exclusive_addons) {
                            tmp = ogebi('addon' + id).is(':checked');
                            ogebi('addon1, .addon2').prop({ checked: false });
                            if (tmp && ((id === 1 && cprops.addon1) || (id === 2 && cprops.addon2))) {
                                ogebi('addon' + id).prop({ checked: true });
                            }
                        }
                    }
                } else if (outfiter_a_names[outfit_n] === true) {
                    ogebi('addon1, .addon2').prop({ checked: false });
                    if (id) { return; }
                }
                else if (id && outfiter_o_names[outfit_n] === true) {
                    tmp = ogebi('addon' + id).is(':checked');
                    ogebi('addon1, .addon2').prop({ checked: false });
                    if (tmp) { ogebi('addon' + id).prop({ checked: true }); }
                }
                if (ogebi('sanim').is(':checked')) {
                    has_standing_animation = outfiter_sprites_standing.hasOwnProperty(outfit_n) ||
                        outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ||
                        outfiter_sprites_creature_standing.hasOwnProperty(creature_n) ||
                        (outfiter_GET.creature > 0 && outfiter_creature_get_props(creature_n).standing > 1);
                    if (!has_standing_animation) { ogebi('sanim').prop({ checked: false }); }
                    if (!ogebi('animate').is(':checked')) {
                        if ($(this).hasClass('animate')) { ogebi('sanim').prop({ checked: false }); }
                        else if ($(this).hasClass('sanim')) { ogebi('animate').prop({ checked: true }); }
                    }
                }
                if (outfiter_m_names[outfit_n] === true) { ogebi('mount').val(0); ogebi('radio_mounts_0').trigger('click'); }
                outfiter_do_display();
            },
            outfiter_do_facing = function (i) {
                var facing = parseInt(ogebi('facing').val(), 10) + parseInt(i, 10);
                if (facing < 0) { facing = 3; }
                else if (facing > 3) { facing = 0; }
                ogebi('facing').val(facing);
                outfiter_do_display();
            },
            /* Pan is unrestricted when zoomed so the outfit can be dragged wherever needed. */
            outfiter_clamp_pan = function () {
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
            },
            // Narrow-screen layout (keep in sync with the @media rule in css/outfitter.css).
            outfiter_compact_query = '(max-width: 1180px)',
            outfiter_is_compact = function () {
                return !!(window.matchMedia && window.matchMedia(outfiter_compact_query).matches);
            },
            outfiter_zoom_user_set = false, // true once the user used the zoom buttons / wheel
            // Size of the preview box on narrow screens. Reading an element's size forces the
            // browser to lay out the whole page, so it is measured once and again only after
            // a resize / rotation (see the resize handler in outfiter_init).
            outfiter_box_size = null,
            outfiter_preview_box_size = function () {
                var box;
                if (!outfiter_box_size) {
                    box = ogebi('body_main_div')[0];
                    outfiter_box_size = box ? { w: box.clientWidth, h: box.clientHeight } : { w: 0, h: 0 };
                }
                return outfiter_box_size;
            },
            // Until the user zooms, pick the zoom that suits the preview box:
            //  - narrow screens: the largest zoom (up to the default) at which the sprite fits;
            //  - wide screens: bigger than the default (up to auto_zoom_max in
            //    js/outfitter-settings.js) when the sprite still fits with room for the
            //    buttons, otherwise as on narrow screens.
            outfiter_fit_zoom = function () {
                var box, z,
                    def = outfiter_setting_number('default_zoom', 2),
                    fits = function (zoom, margin_w, margin_h) {
                        return outfiter_base_w * zoom <= box.w - margin_w && outfiter_base_h * zoom <= box.h - margin_h;
                    };
                if (outfiter_zoom_user_set) { return; }
                box = outfiter_preview_box_size();
                if (!box.w) { return; }
                z = def;
                if (!outfiter_is_compact()) {
                    z = Math.min(Math.max(def, outfiter_setting_number('auto_zoom_max', 3)), outfiter_zoom_max);
                    while (z > def && !fits(z, 16, 72)) { z--; }
                }
                while (z > outfiter_zoom_min && !fits(z, 0, 0)) { z--; }
                outfiter_zoom = z;
            },
            outfiter_apply_zoom = function () {
                var
                    $img = ogebi('.body_main_div .body_main', 1),
                    w = Math.round(outfiter_base_w * outfiter_zoom),
                    h = Math.round(outfiter_base_h * outfiter_zoom),
                    box, tx;
                // used by the narrow-screen CSS to centre the sprite vertically
                if ($img[0]) { $img[0].style.setProperty('--outfiter-img-h', h + 'px'); }
                // Touch-dragging (panning) is allowed whenever zoomed in on the desktop layout
                // (as before). On narrow screens only when the sprite is bigger than the
                // preview, so swiping over it still scrolls the page on phones.
                if (outfiter_is_compact()) {
                    box = outfiter_preview_box_size();
                    $img.toggleClass('is-pannable', outfiter_zoom > 1 && (w > box.w || h > box.h));
                } else {
                    $img.toggleClass('is-pannable', outfiter_zoom > 1);
                }
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
                tx = 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)';
                $img
                    .css({
                        height: h,
                        width: w,
                        transform: tx,
                        cursor: outfiter_zoom > 1 ? (outfiter_dragging ? 'grabbing' : 'grab') : 'default'
                    })
                    .attr({ height: h, width: w })
                    .toggleClass('is-zoomed', outfiter_zoom > 1)
                    .toggleClass('is-dragging', outfiter_dragging);
                ogebi('zoomin').prop({ disabled: outfiter_zoom >= outfiter_zoom_max });
                ogebi('zoomout').prop({ disabled: outfiter_zoom <= outfiter_zoom_min });
            },
            outfiter_do_zoom = function (delta) {
                var next = outfiter_zoom + parseInt(delta, 10);
                outfiter_zoom_user_set = true;
                if (next < outfiter_zoom_min) { next = outfiter_zoom_min; }
                else if (next > outfiter_zoom_max) { next = outfiter_zoom_max; }
                if (next === outfiter_zoom) { return; }
                outfiter_zoom = next;
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
                outfiter_apply_zoom();
            },
            outfiter_do_zoom_reset = function () {
                outfiter_zoom_user_set = true;
                outfiter_zoom = 1;
                outfiter_pan_x = 0;
                outfiter_pan_y = 0;
                outfiter_apply_zoom();
            },
            // Multi-file downloads (4x Rotate / All Addons) render frames over several timer
            // ticks. While that runs, every enabled button / checkbox / list row is locked:
            // picking something else used to mix two outfits into one download and leave the
            // view turned the wrong way. Unlocking re-enables exactly what was locked.
            outfiter_busy_controls = null,
            outfiter_set_busy = function (busy) {
                if (busy) {
                    if (outfiter_busy_controls) { return; }
                    // everything that changes the picture (the colour palette checks the busy class itself)
                    outfiter_busy_controls = ogebi('button, input[type="checkbox"], input[type="radio"], input.charn', 1).filter(':enabled');
                    outfiter_busy_controls.prop({ disabled: true });
                    $this_main.addClass('outfiter_busy');
                    outfiter_set_status('Preparing your download...');
                } else if (outfiter_busy_controls) {
                    outfiter_busy_controls.prop({ disabled: false });
                    outfiter_busy_controls = null;
                    $this_main.removeClass('outfiter_busy');
                    outfiter_set_status('');
                }
            },
            /* ---- Download helpers: APNG assembler + compact GIF encoder ---- */
            outfiter_file_comment = String(outfiter_settings.file_comment || 'Created using the TibiaWiki Outfitter, developed collaboratively by the TibiaWiki Team.'),
            outfiter_dataurl_to_u8 = function (dataUrl) {
                var b64 = dataUrl.split(',')[1], bin = atob(b64), u8 = new Uint8Array(bin.length), i;
                for (i = 0; i < bin.length; i++) { u8[i] = bin.charCodeAt(i); }
                return u8;
            },
            outfiter_crc32_table = (function () {
                var table = new Uint32Array(256), n, c, k;
                for (n = 0; n < 256; n++) {
                    c = n;
                    for (k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
                    table[n] = c >>> 0;
                }
                return table;
            }()),
            outfiter_crc32 = function (buf) {
                var crc = 0xFFFFFFFF, i, table = outfiter_crc32_table;
                for (i = 0; i < buf.length; i++) { crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8); }
                return (crc ^ 0xFFFFFFFF) >>> 0;
            },
            outfiter_png_chunk = function (typeStr, data) {
                var type = new Uint8Array([typeStr.charCodeAt(0), typeStr.charCodeAt(1), typeStr.charCodeAt(2), typeStr.charCodeAt(3)]),
                    len = data ? data.length : 0,
                    out = new Uint8Array(12 + len),
                    view = new DataView(out.buffer),
                    crcBuf, i;
                view.setUint32(0, len);
                out[4] = type[0]; out[5] = type[1]; out[6] = type[2]; out[7] = type[3];
                if (data && len) { out.set(data, 8); }
                crcBuf = new Uint8Array(4 + len);
                crcBuf.set(type, 0);
                if (data && len) { crcBuf.set(data, 4); }
                view.setUint32(8 + len, outfiter_crc32(crcBuf));
                return out;
            },
            outfiter_concat_u8 = function (parts) {
                var total = 0, i, offset = 0, out;
                for (i = 0; i < parts.length; i++) { total += parts[i].length; }
                out = new Uint8Array(total);
                for (i = 0; i < parts.length; i++) { out.set(parts[i], offset); offset += parts[i].length; }
                return out;
            },
            outfiter_parse_png_chunks = function (u8) {
                var chunks = [], offset = 8, view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), len, type, data;
                while (offset + 12 <= u8.length) {
                    len = view.getUint32(offset);
                    type = String.fromCharCode(u8[offset + 4], u8[offset + 5], u8[offset + 6], u8[offset + 7]);
                    data = u8.subarray(offset + 8, offset + 8 + len);
                    chunks.push({ type: type, data: data });
                    offset += 12 + len;
                    if (type === 'IEND') { break; }
                }
                return chunks;
            },
            outfiter_build_apng = function (frameDataUrls, delaysMs) {
                var sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
                    parts = [sig],
                    first = outfiter_parse_png_chunks(outfiter_dataurl_to_u8(frameDataUrls[0])),
                    ihdr, idats = [], i, j, chunks, idatParts, seq = 0,
                    actl, fctl, fdat, delay;
                for (i = 0; i < first.length; i++) {
                    if (first[i].type === 'IHDR') { ihdr = first[i].data; }
                    if (first[i].type === 'IDAT') { idats.push(first[i].data); }
                }
                if (!ihdr) { return null; }
                parts.push(outfiter_png_chunk('IHDR', ihdr));
                (function () {
                    var kw = 'Comment',
                        text = outfiter_file_comment,
                        data = new Uint8Array(kw.length + 1 + text.length),
                        ti;
                    for (ti = 0; ti < kw.length; ti++) { data[ti] = kw.charCodeAt(ti) & 0xFF; }
                    data[kw.length] = 0;
                    for (ti = 0; ti < text.length; ti++) { data[kw.length + 1 + ti] = text.charCodeAt(ti) & 0xFF; }
                    parts.push(outfiter_png_chunk('tEXt', data));
                }());
                actl = new Uint8Array(8);
                new DataView(actl.buffer).setUint32(0, frameDataUrls.length);
                new DataView(actl.buffer).setUint32(4, 0);
                parts.push(outfiter_png_chunk('acTL', actl));
                for (i = 0; i < frameDataUrls.length; i++) {
                    chunks = (i === 0) ? first : outfiter_parse_png_chunks(outfiter_dataurl_to_u8(frameDataUrls[i]));
                    idatParts = [];
                    for (j = 0; j < chunks.length; j++) {
                        if (chunks[j].type === 'IDAT') { idatParts.push(chunks[j].data); }
                    }
                    delay = delaysMs[i] || 100;
                    fctl = new Uint8Array(26);
                    (function (v) {
                        v.setUint32(0, seq++);
                        v.setUint32(4, new DataView(ihdr.buffer, ihdr.byteOffset, 4).getUint32(0));
                        v.setUint32(8, new DataView(ihdr.buffer, ihdr.byteOffset, 8).getUint32(4));
                        v.setUint32(12, 0);
                        v.setUint32(16, 0);
                        v.setUint16(20, Math.max(1, Math.round(delay / 10)));
                        v.setUint16(22, 100);
                        v.setUint8(24, 1);
                        v.setUint8(25, 0);
                    }(new DataView(fctl.buffer)));
                    parts.push(outfiter_png_chunk('fcTL', fctl));
                    if (i === 0) {
                        for (j = 0; j < idatParts.length; j++) { parts.push(outfiter_png_chunk('IDAT', idatParts[j])); }
                    } else {
                        for (j = 0; j < idatParts.length; j++) {
                            fdat = new Uint8Array(4 + idatParts[j].length);
                            new DataView(fdat.buffer).setUint32(0, seq++);
                            fdat.set(idatParts[j], 4);
                            parts.push(outfiter_png_chunk('fdAT', fdat));
                        }
                    }
                }
                parts.push(outfiter_png_chunk('IEND', new Uint8Array(0)));
                return outfiter_concat_u8(parts);
            },
            outfiter_build_gif = function (frameDataUrls, delaysMs) {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    w = 0,
                    h = 0,
                    frames = [];

                function loadFrames() {
                    return new Promise(function (resolve) {
                        var n = 0;
                        function next() {
                            if (n >= frameDataUrls.length) {
                                resolve();
                                return;
                            }
                            var img = new Image();
                            img.onload = function () {
                                if (n === 0) {
                                    w = img.naturalWidth || img.width;
                                    h = img.naturalHeight || img.height;
                                    canvas.width = w;
                                    canvas.height = h;
                                }
                                ctx.clearRect(0, 0, w, h);
                                ctx.drawImage(img, 0, 0);
                                frames.push(new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data));
                                n += 1;
                                next();
                            };
                            img.onerror = function () {
                                n += 1;
                                next();
                            };
                            img.src = frameDataUrls[n];
                        }
                        next();
                    });
                }

                function buildPalette(rgbaFrames) {
                    var count = {},
                        keys = [],
                        palette = [],
                        map = {},
                        transparentIndex = -1,
                        i, j, r, g, b, a, key, parts, used;

                    for (i = 0; i < rgbaFrames.length; i++) {
                        for (j = 0; j < rgbaFrames[i].length; j += 4) {
                            a = rgbaFrames[i][j + 3];
                            if (a < 128) {
                                key = 't';
                            } else {
                                r = rgbaFrames[i][j];
                                g = rgbaFrames[i][j + 1];
                                b = rgbaFrames[i][j + 2];
                                key = r + ',' + g + ',' + b;
                            }
                            count[key] = (count[key] || 0) + 1;
                        }
                    }
                    for (key in count) {
                        if (count.hasOwnProperty(key)) {
                            keys.push(key);
                        }
                    }
                    keys.sort(function (a, b) { return count[b] - count[a]; });

                    if (count.t) {
                        transparentIndex = 0;
                        palette.push(0, 0, 0);
                        map.t = 0;
                    }
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        if (key === 't') { continue; }
                        if ((palette.length / 3) >= 256) { break; }
                        parts = key.split(',');
                        map[key] = palette.length / 3;
                        palette.push(+parts[0], +parts[1], +parts[2]);
                    }
                    if (!palette.length) {
                        palette.push(0, 0, 0);
                    }
                    used = palette.length / 3;
                    while (used < 2) {
                        palette.push(0, 0, 0);
                        used += 1;
                    }
                    while (used & (used - 1)) {
                        palette.push(0, 0, 0);
                        used += 1;
                    }
                    if (used > 256) {
                        palette = palette.slice(0, 768);
                        used = 256;
                    }
                    return {
                        palette: palette,
                        map: map,
                        transparentIndex: transparentIndex,
                        size: used
                    };
                }

                function indexFrame(rgba, pal) {
                    var indices = [],
                        map = pal.map,
                        ti = pal.transparentIndex,
                        i, r, g, b, a, key, p, pr, pg, pb, best, dist, d, n;

                    n = pal.size;
                    for (i = 0; i < rgba.length; i += 4) {
                        a = rgba[i + 3];
                        if (a < 128 && ti >= 0) {
                            indices.push(ti);
                            continue;
                        }
                        r = rgba[i];
                        g = rgba[i + 1];
                        b = rgba[i + 2];
                        key = r + ',' + g + ',' + b;
                        if (map.hasOwnProperty(key)) {
                            indices.push(map[key]);
                            continue;
                        }
                        best = (ti === 0) ? 1 : 0;
                        dist = 1e12;
                        for (p = 0; p < n; p++) {
                            if (p === ti) { continue; }
                            pr = pal.palette[p * 3];
                            pg = pal.palette[p * 3 + 1];
                            pb = pal.palette[p * 3 + 2];
                            d = (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
                            if (d < dist) {
                                dist = d;
                                best = p;
                            }
                        }
                        indices.push(best);
                    }
                    return indices;
                }

                /* gif.js / LZWEncoder-style compressor (verified round-trip) */
                function lzwEncode(minCodeSize, pixels) {
                    var htab = [],
                        codetab = [],
                        hsize = 5003,
                        clearCode = 1 << minCodeSize,
                        EOFCode = clearCode + 1,
                        freeEnt,
                        nBits,
                        maxCode,
                        clearFlg = false,
                        initBits = minCodeSize + 1,
                        remaining = pixels.length,
                        curPixel = 0,
                        curAccum = 0,
                        curBits = 0,
                        out = [],
                        masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F, 0x003F, 0x007F,
                            0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x0FFF],
                        i;

                    for (i = 0; i < hsize; i++) {
                        htab[i] = -1;
                        codetab[i] = 0;
                    }

                    function charOut(c) {
                        out.push(c & 0xff);
                    }

                    function output(code) {
                        curAccum &= masks[curBits];
                        if (curBits > 0) {
                            curAccum |= (code << curBits);
                        } else {
                            curAccum = code;
                        }
                        curBits += nBits;
                        while (curBits >= 8) {
                            charOut(curAccum & 0xff);
                            curAccum >>= 8;
                            curBits -= 8;
                        }
                        if (freeEnt > maxCode || clearFlg) {
                            if (clearFlg) {
                                nBits = initBits;
                                maxCode = (1 << nBits) - 1;
                                clearFlg = false;
                            } else {
                                nBits += 1;
                                if (nBits === 12) {
                                    maxCode = 4095;
                                } else {
                                    maxCode = (1 << nBits) - 1;
                                }
                            }
                        }
                    }

                    function clBlock() {
                        var j;
                        for (j = 0; j < hsize; j++) {
                            htab[j] = -1;
                        }
                        freeEnt = clearCode + 2;
                        clearFlg = true;
                        output(clearCode);
                    }

                    function nextPixel() {
                        if (remaining === 0) {
                            return -1;
                        }
                        remaining -= 1;
                        return pixels[curPixel++] & 0xff;
                    }

                    nBits = initBits;
                    maxCode = (1 << nBits) - 1;
                    freeEnt = clearCode + 2;
                    clearFlg = false;

                    output(clearCode);

                    var ent = nextPixel();
                    var hshift = 0;
                    for (var fcode = hsize; fcode < 65536; fcode *= 2) {
                        hshift += 1;
                    }
                    hshift = 8 - hshift;

                    outer:
                    while (true) {
                        var c = nextPixel();
                        if (c === -1) {
                            break;
                        }
                        fcode = (c << 12) + ent;
                        i = (c << hshift) ^ ent;
                        if (htab[i] === fcode) {
                            ent = codetab[i];
                            continue;
                        }
                        if (htab[i] >= 0) {
                            var disp = hsize - i;
                            if (i === 0) {
                                disp = 1;
                            }
                            do {
                                i -= disp;
                                if (i < 0) {
                                    i += hsize;
                                }
                                if (htab[i] === fcode) {
                                    ent = codetab[i];
                                    continue outer;
                                }
                            } while (htab[i] >= 0);
                        }
                        output(ent);
                        ent = c;
                        if (freeEnt < 4096) {
                            codetab[i] = freeEnt;
                            freeEnt += 1;
                            htab[i] = fcode;
                        } else {
                            clBlock();
                        }
                    }
                    output(ent);
                    output(EOFCode);
                    if (curBits > 0) {
                        charOut(curAccum & 0xff);
                    }
                    return out;
                }

                function encode() {
                    var out = [],
                        pal = buildPalette(frames),
                        colourCount = pal.size,
                        psize = 0,
                        i,
                        minCodeSize,
                        indices,
                        compressed,
                        delayCs,
                        packedGCE,
                        pos,
                        size,
                        gctSize;

                    function pushByte(b) { out.push(b & 0xFF); }
                    function pushBytes(arr) {
                        var k;
                        for (k = 0; k < arr.length; k++) { out.push(arr[k] & 0xFF); }
                    }
                    function pushStr(s) {
                        var k;
                        for (k = 0; k < s.length; k++) { out.push(s.charCodeAt(k) & 0xFF); }
                    }

                    while ((1 << (psize + 1)) < colourCount) { psize += 1; }
                    if (psize > 7) { psize = 7; }
                    gctSize = 1 << (psize + 1);

                    pushStr('GIF89a');
                    pushByte(w & 0xFF);
                    pushByte((w >> 8) & 0xFF);
                    pushByte(h & 0xFF);
                    pushByte((h >> 8) & 0xFF);
                    pushByte(0x80 | 0x70 | psize);
                    pushByte(pal.transparentIndex >= 0 ? pal.transparentIndex : 0);
                    pushByte(0);

                    for (i = 0; i < gctSize; i++) {
                        if (i < colourCount) {
                            pushByte(pal.palette[i * 3]);
                            pushByte(pal.palette[i * 3 + 1]);
                            pushByte(pal.palette[i * 3 + 2]);
                        } else {
                            pushByte(0);
                            pushByte(0);
                            pushByte(0);
                        }
                    }

                    pushBytes([0x21, 0xFF, 0x0B]);
                    pushStr('NETSCAPE2.0');
                    pushBytes([0x03, 0x01, 0x00, 0x00, 0x00]);

                    // GIF Comment Extension (0x21 0xFE)
                    (function () {
                        var text = outfiter_file_comment,
                            pos = 0,
                            size;
                        pushBytes([0x21, 0xFE]);
                        while (pos < text.length) {
                            size = Math.min(255, text.length - pos);
                            pushByte(size);
                            pushStr(text.substring(pos, pos + size));
                            pos += size;
                        }
                        pushByte(0x00);
                    }());

                    minCodeSize = Math.max(2, psize + 1);

                    for (i = 0; i < frames.length; i++) {
                        delayCs = Math.max(2, Math.round((delaysMs[i] || 100) / 10));
                        packedGCE = 0x08;
                        if (pal.transparentIndex >= 0) { packedGCE |= 0x01; }
                        pushBytes([
                            0x21, 0xF9, 0x04,
                            packedGCE,
                            delayCs & 0xFF, (delayCs >> 8) & 0xFF,
                            pal.transparentIndex >= 0 ? pal.transparentIndex : 0,
                            0x00
                        ]);
                        pushBytes([
                            0x2C,
                            0x00, 0x00, 0x00, 0x00,
                            w & 0xFF, (w >> 8) & 0xFF,
                            h & 0xFF, (h >> 8) & 0xFF,
                            0x00
                        ]);
                        indices = indexFrame(frames[i], pal);
                        compressed = lzwEncode(minCodeSize, indices);
                        pushByte(minCodeSize);
                        pos = 0;
                        while (pos < compressed.length) {
                            size = Math.min(255, compressed.length - pos);
                            pushByte(size);
                            pushBytes(compressed.slice(pos, pos + size));
                            pos += size;
                        }
                        pushByte(0);
                    }

                    pushByte(0x3B);
                    return new Uint8Array(out);
                }

                return loadFrames().then(function () {
                    if (!frames.length || !w || !h) { return null; }
                    return encode();
                });
            },
            outfiter_download_blob = function (u8, mime, filename) {
                var blob = new Blob([u8], { type: mime }),
                    url = URL.createObjectURL(blob),
                    a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
            },
            outfiter_download_name_base = function (opts) {
                // Naming: Outfit_<Name>_<Male|Female>[_Addon_1|_Addon_2|_Addon_3]
                // Addon_3 = both addons. opts.forceAddon1/2 override current selection (All Addons batch).
                var
                    parts = [],
                    // letters, digits and - only; other characters become single underscores
                    // ("Midnight_Panther_(Mount)" -> "Midnight_Panther_Mount")
                    clean = function (s) {
                        return String(s || '').replace(/[^a-zA-Z0-9\-]+/g, '_').replace(/^_+|_+$/g, '');
                    },
                    includeAddons = !opts || opts.includeAddons !== false,
                    a1 = opts && opts.hasOwnProperty('forceAddon1') ? opts.forceAddon1 : outfiter_GET.addon1,
                    a2 = opts && opts.hasOwnProperty('forceAddon2') ? opts.forceAddon2 : outfiter_GET.addon2,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    display_n,
                    gender;
                if (outfiter_GET.creature > 0) {
                    parts.push('Creature');
                    parts.push(clean(outfiter_creature_names[outfiter_GET.creature] || 'Unknown'));
                    if (includeAddons) {
                        if (a1 && a2) { parts.push('Addon_3'); }
                        else if (a1) { parts.push('Addon_1'); }
                        else if (a2) { parts.push('Addon_2'); }
                    }
                } else if (outfiter_GET.outfit === outfiter_outfit_none_id && outfiter_GET.mount > 0) {
                    // only a mount is shown
                    parts.push('Mount');
                    parts.push(clean(outfiter_mount_names[outfiter_GET.mount]));
                } else {
                    parts.push('Outfit');
                    // Prefer gendered display name when female + mapped (Noblewoman etc.), else list name
                    display_n = outfit_n;
                    if (display_n && display_n !== 'None') {
                        if (outfiter_GET.female && outfiter_f_names[outfit_n]) {
                            display_n = outfiter_f_names[outfit_n];
                        }
                        parts.push(clean(display_n));
                    } else {
                        parts.push('Unknown');
                    }
                    // Gender: Female if selected and outfit supports it, otherwise Male
                    if (outfiter_GET.female && outfiter_u_names[outfit_n] !== true) {
                        gender = 'Female';
                    } else {
                        gender = 'Male';
                    }
                    parts.push(gender);
                    // Addons: 1, 2, or 3 (both)
                    if (includeAddons) {
                        if (a1 && a2) { parts.push('Addon_3'); }
                        else if (a1) { parts.push('Addon_1'); }
                        else if (a2) { parts.push('Addon_2'); }
                    }
                    if (outfiter_GET.mount > 0) {
                        parts.push(clean(outfiter_mount_names[outfiter_GET.mount] || 'mount'));
                    }
                }
                return parts.join('_');
            },
            // Which addon combinations are valid for the current selection
            outfiter_addon_combo_list = function () {
                var
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    cprops,
                    can1 = true,
                    can2 = true,
                    exclusive = false,
                    combos = [];
                if (outfiter_GET.creature > 0) {
                    cprops = outfiter_creature_get_props(creature_n);
                    can1 = !!cprops.addon1;
                    can2 = !!cprops.addon2;
                    exclusive = !!cprops.exclusive_addons;
                } else {
                    if (outfiter_a_names[outfit_n] === true) {
                        can1 = false;
                        can2 = false;
                    } else if (outfiter_o_names[outfit_n] === true) {
                        // One-addon outfits (e.g. Yalaharian): only addon 1
                        can2 = false;
                    }
                }
                // Always include base (no addons)
                combos.push({ a1: false, a2: false, tag: 'no_addons' });
                if (can1) { combos.push({ a1: true, a2: false, tag: 'addon_1' }); }
                if (can2) { combos.push({ a1: false, a2: true, tag: 'addon_2' }); }
                if (can1 && can2 && !exclusive) {
                    combos.push({ a1: true, a2: true, tag: 'addon_1_addon_2' });
                }
                return combos;
            },
            // keep a copy of the current preview while multi-direction downloads run
            outfiter_preview_snapshot = function () {
                return {
                    src: ogebi('.body_main_div .body_main', 1).attr('src'),
                    withFloor: ogebi('.body_main_div .body_main', 1).hasClass('body_main_with_floor'),
                    aframes: (outfiter_aframes && outfiter_aframes.length) ? outfiter_aframes.slice() : [],
                    base_w: outfiter_base_w,
                    base_h: outfiter_base_h,
                    acurrent: outfiter_acurrent,
                    zoom: outfiter_zoom,
                    pan_x: outfiter_pan_x,
                    pan_y: outfiter_pan_y
                };
            },
            outfiter_preview_restore = function (snap) {
                if (!snap) { return; }
                clearTimeout(outfiter_atime);
                outfiter_aframes = snap.aframes || [];
                outfiter_base_w = snap.base_w;
                outfiter_base_h = snap.base_h;
                outfiter_acurrent = snap.acurrent || 0;
                outfiter_zoom = snap.zoom || 1;
                outfiter_pan_x = snap.pan_x || 0;
                outfiter_pan_y = snap.pan_y || 0;
                if (snap.src) {
                    ogebi('.body_main_div .body_main', 1)
                        .attr('src', '')
                        .attr({ src: snap.src })
                        .toggleClass('body_main_with_floor', !!snap.withFloor);
                }
                outfiter_apply_zoom();
                if (outfiter_GET.animate && outfiter_aframes.length > 1) {
                    outfiter_animate_char();
                }
            },
            // 4 directions (S, E, N, W), ~1600ms each using natural frame delays; opts.restore / opts.onDone for batching
            outfiter_do_download_4x_rotate = function (nameBase, format, opts) {
                var
                    DIR_MS = 1600,
                    dirs = [2, 1, 0, 3], // South, East, North, West (0=N 1=E 2=S 3=W)
                    dirIdx = 0,
                    allFrames = [],
                    allDelays = [],
                    options = opts || {},
                    doRestore = options.restore !== false,
                    onDone = typeof options.onDone === 'function' ? options.onDone : null,
                    previewSnap = options.previewSnap || (doRestore ? outfiter_preview_snapshot() : null),
                    saved = {
                        facing: outfiter_GET.facing,
                        animate: outfiter_GET.animate,
                        sanim: outfiter_GET.sanim,
                        facingVal: ogebi('facing').val(),
                        animateChk: ogebi('animate').is(':checked'),
                        sanimChk: ogebi('sanim').is(':checked')
                    },
                    emitFile = function () {
                        var fileBase = nameBase;
                        if (!allFrames.length) {
                            if (onDone) { onDone(); }
                            return;
                        }
                        if (format === 'gif') {
                            outfiter_build_gif(allFrames, allDelays).then(function (u8) {
                                if (u8) { outfiter_download_blob(u8, 'image/gif', fileBase + '.gif'); }
                                if (onDone) { onDone(); }
                            });
                        } else {
                            (function () {
                                var u8 = outfiter_build_apng(allFrames, allDelays);
                                if (u8) { outfiter_download_blob(u8, 'image/png', fileBase + '.png'); }
                                if (onDone) { onDone(); }
                            }());
                        }
                    },
                    finish = function () {
                        outfiter_bake_silent = false;
                        if (doRestore) {
                            ogebi('facing').val(saved.facingVal);
                            ogebi('animate').prop({ checked: saved.animateChk });
                            ogebi('sanim').prop({ checked: saved.sanimChk });
                            outfiter_GET.facing = saved.facing;
                            outfiter_GET.animate = saved.animate;
                            outfiter_GET.sanim = saved.sanim;
                            outfiter_preview_restore(previewSnap);
                            outfiter_set_busy(false);
                        }
                        emitFile();
                    },
                    processDir = function () {
                        var facing, frames, delays, i, sum, d, fi, safety;
                        if (dirIdx >= dirs.length) {
                            finish();
                            return;
                        }
                        facing = dirs[dirIdx];
                        ogebi('facing').val(facing);
                        outfiter_GET.facing = facing;
                        outfiter_GET.animate = true;
                        outfiter_GET.sanim = false;

                        clearTimeout(outfiter_atime);
                        outfiter_do_display2();

                        frames = (outfiter_aframes && outfiter_aframes.length) ? outfiter_aframes.slice() : [];
                        delays = [];
                        for (i = 0; i < frames.length; i++) {
                            d = outfiter_outfit_speed(i);
                            if (!(d > 0)) { d = 100; }
                            delays.push(d);
                        }
                        if (!frames.length) {
                            dirIdx += 1;
                            setTimeout(processDir, 0);
                            return;
                        }
                        // Keep natural frame timing (creature special delays, etc).
                        // Repeat the cycle until the direction is about DIR_MS long —
                        // e.g. 2 frames @ 500ms → three frames = 1500ms (~1.6s).
                        sum = 0;
                        fi = 0;
                        safety = 0;
                        while (safety < frames.length * 24) {
                            d = delays[fi % frames.length];
                            if (sum > 0 && sum + d > DIR_MS &&
                                Math.abs(sum - DIR_MS) <= Math.abs(sum + d - DIR_MS)) {
                                break;
                            }
                            if (sum >= DIR_MS) { break; }
                            allFrames.push(frames[fi % frames.length]);
                            allDelays.push(Math.max(20, Math.round(d)));
                            sum += d;
                            fi += 1;
                            safety += 1;
                        }
                        if (fi === 0) {
                            allFrames.push(frames[0]);
                            allDelays.push(Math.max(20, Math.round(delays[0])));
                        }
                        dirIdx += 1;
                        setTimeout(processDir, 0);
                    };

                if (doRestore) { outfiter_set_busy(true); }
                outfiter_GET.animate = true;
                outfiter_GET.sanim = false;
                outfiter_bake_silent = true;
                clearTimeout(outfiter_atime);
                processDir();
            },
            // one rotating download per addon combo (none / 1 / 2 / both)
            outfiter_do_download_4x_all_addons = function (format) {
                var
                    combos = outfiter_addon_combo_list(),
                    comboIdx = 0,
                    previewSnap = outfiter_preview_snapshot(),
                    saved = {
                        addon1: outfiter_GET.addon1,
                        addon2: outfiter_GET.addon2,
                        addon1Chk: ogebi('addon1').is(':checked'),
                        addon2Chk: ogebi('addon2').is(':checked'),
                        facing: outfiter_GET.facing,
                        animate: outfiter_GET.animate,
                        sanim: outfiter_GET.sanim,
                        facingVal: ogebi('facing').val(),
                        animateChk: ogebi('animate').is(':checked'),
                        sanimChk: ogebi('sanim').is(':checked')
                    },
                    restoreAll = function () {
                        outfiter_bake_silent = false;
                        ogebi('addon1').prop({ checked: saved.addon1Chk });
                        ogebi('addon2').prop({ checked: saved.addon2Chk });
                        ogebi('facing').val(saved.facingVal);
                        ogebi('animate').prop({ checked: saved.animateChk });
                        ogebi('sanim').prop({ checked: saved.sanimChk });
                        outfiter_GET.addon1 = saved.addon1;
                        outfiter_GET.addon2 = saved.addon2;
                        outfiter_GET.facing = saved.facing;
                        outfiter_GET.animate = saved.animate;
                        outfiter_GET.sanim = saved.sanim;
                        outfiter_preview_restore(previewSnap);
                        outfiter_set_busy(false);
                    },
                    nextCombo = function () {
                        var combo, nameBase;
                        if (comboIdx >= combos.length) {
                            restoreAll();
                            return;
                        }
                        combo = combos[comboIdx];
                        comboIdx += 1;
                        outfiter_GET.addon1 = combo.a1;
                        outfiter_GET.addon2 = combo.a2;
                        nameBase = outfiter_download_name_base({
                            forceAddon1: combo.a1,
                            forceAddon2: combo.a2
                        });
                        outfiter_do_download_4x_rotate(nameBase, format, {
                            restore: false,
                            previewSnap: previewSnap,
                            onDone: function () { setTimeout(nextCombo, 50); }
                        });
                    };

                outfiter_set_busy(true);
                clearTimeout(outfiter_atime);
                outfiter_bake_silent = true;
                nextCombo();
            },
            outfiter_do_download = function () {
                var advanced = ogebi('show_advanced').is(':checked'),
                    format = advanced
                        ? (ogebi('[name="radio_save_format"]:checked', 1).val() || 'gif')
                        : 'gif',
                    frames, delays = [], i, nameBase, single,
                    // 4x / All Addons only apply when advanced options are shown
                    rotate4x = advanced && ogebi('rotate4x').is(':checked'),
                    allAddons = advanced && ogebi('all_addons').is(':checked');
                if (!outfiter_aframes || !outfiter_aframes.length) { return; }

                // All Addons: one rotating file per addon combo
                if (allAddons) {
                    if (format !== 'gif' && format !== 'apng') { format = 'gif'; }
                    outfiter_do_download_4x_all_addons(format);
                    return;
                }

                nameBase = outfiter_download_name_base();

                // 4x Rotate: all four facings in sequence
                if (rotate4x) {
                    if (format !== 'gif' && format !== 'apng') { format = 'gif'; }
                    outfiter_do_download_4x_rotate(nameBase, format);
                    return;
                }

                frames = outfiter_aframes.slice();
                for (i = 0; i < frames.length; i++) { delays.push(outfiter_outfit_speed(i)); }

                if (!outfiter_GET.animate || frames.length < 2) {
                    single = outfiter_dataurl_to_u8(frames[0]);
                    outfiter_download_blob(single, 'image/png', nameBase + '.png');
                    return;
                }

                if (format === 'gif') {
                    outfiter_build_gif(frames, delays).then(function (u8) {
                        if (u8) { outfiter_download_blob(u8, 'image/gif', nameBase + '.gif'); }
                    });
                } else {
                    (function () {
                        var u8 = outfiter_build_apng(frames, delays);
                        if (u8) { outfiter_download_blob(u8, 'image/png', nameBase + '.png'); }
                    }());
                }
            },
            outfiter_do_colourise_copy = function () {
                var
                    i, from_suffix = ogebi('[name="radio_colourise"]:checked', 1).val() === 'mount' ? 'm' : '',
                    to_suffix = from_suffix === 'm' ? '' : 'm',
                    value = to_suffix === 'm' ? 'mount' : 'outfit';
                for (i = 1; i <= 4; i++) { ogebi(to_suffix + 'c' + i).val(ogebi(from_suffix + 'c' + i).val()); }
                ogebi('[name="radio_colourise"][value="' + value + '"]', 1).prop({ checked: true }).trigger('change', { is_copy: true });
            },
            // Pick a random outfit from the sorted list (skips "None"). Also randomises
            // gender and addons when the chosen outfit supports them.
            outfiter_do_random_outfit = function () {
                if ($this_main.hasClass('outfiter_loading')) { return; }
                var
                    candidates = [],
                    i, id, outfit_n, addon_roll;
                for (i = 0; i < outfiter_names_sorted.length; i++) {
                    id = outfiter_names_sorted[i];
                    if (id !== outfiter_outfit_none_id && outfiter_names[id] !== undefined) {
                        candidates.push(id);
                    }
                }
                if (!candidates.length) { return; }
                id = candidates[Math.floor(Math.random() * candidates.length)];
                outfit_n = outfiter_names[id];
                // Gender (skip unisex / no-female outfits)
                if (outfiter_u_names[outfit_n] !== true) {
                    ogebi('female').prop({ checked: Math.random() < 0.5 });
                }
                // Addons
                if (outfiter_a_names[outfit_n] === true) {
                    ogebi('addon1').prop({ checked: false });
                    ogebi('addon2').prop({ checked: false });
                } else if (outfiter_o_names[outfit_n] === true) {
                    // single-addon outfits: none / addon1 / addon2
                    addon_roll = Math.floor(Math.random() * 3);
                    ogebi('addon1').prop({ checked: addon_roll === 1 });
                    ogebi('addon2').prop({ checked: addon_roll === 2 });
                } else {
                    ogebi('addon1').prop({ checked: Math.random() < 0.5 });
                    ogebi('addon2').prop({ checked: Math.random() < 0.5 });
                }
                outfiter_do_outfit(id, true);
            },
            // Randomise the four colour slots for the currently selected colourise target
            // (Outfit → c1–c4, Mount → mc1–mc4). Updates the colour-table highlight and redraws.
            outfiter_do_random_colours = function () {
                if ($this_main.hasClass('outfiter_loading')) { return; }
                var
                    col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                    prefix = col_type === 'mount' ? 'm' : '',
                    n = outfiter_color_t.length,
                    i;
                for (i = 1; i <= 4; i++) {
                    ogebi(prefix + 'c' + i).val(Math.floor(Math.random() * n));
                }
                // Refresh selection highlight for the active colour tab
                ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').trigger('click');
                outfiter_do_addon();
            },
            outfiter_do_show_outfit = function () {
                var
                    checked = $(this).prop('checked'),
                    show_outfit_prev = checked ? parseInt(ogebi('show_outfit_prev').val(), 10) : outfiter_outfit_none_id;
                outfiter_do_outfit(show_outfit_prev, true);
            },
            outfiter_do_show_creature = function () {
                var
                    checked = $(this).prop('checked'),
                    show_creature_prev = checked ? parseInt(ogebi('show_creature_prev').val(), 10) : 0;
                outfiter_do_creature(show_creature_prev, true);
            },
            outfiter_do_show_mount = function () {
                var
                    checked = $(this).prop('checked'),
                    show_mount_prev = checked ? parseInt(ogebi('show_mount_prev').val(), 10) : 0;
                outfiter_do_mount(show_mount_prev, true);
            },
            // Sort [id, name] pairs: id 0 ("None") always first, the rest alphabetically.
            // (The old comparator returned contradictory answers, so "None" ended up mid-list.)
            // Normalised text used for searching: case, underscores, hyphens, apostrophes,
            // brackets and extra spaces are ignored ("black_sheep (mount" finds "Black Sheep (Mount)").
            outfiter_search_key = function (text) {
                return String(text || '').toLowerCase()
                    .replace(/[_\-]/g, ' ')
                    .replace(/['\u2019().,]/g, '')
                    .replace(/\s+/g, ' ')
                    .replace(/^\s+|\s+$/g, '');
            },
            // Create the rows of one selection list ("outfits", "mounts" or "creatures").
            // Rows are built with plain DOM calls into a fragment and inserted in one go:
            // growing a jQuery set row by row re-sorted it every time and made start-up slow.
            //   sorted_ids  - ids in display order       names      - id -> name
            //   separators  - names with a line above     checked_id - id selected initially
            //   alt_names   - extra searchable names (female outfit names)
            outfiter_build_list = function (kind, sorted_ids, names, separators, checked_id, alt_names) {
                var fragment = document.createDocumentFragment(), i, id, name, label, input, mark, text, line;
                for (i = 0; i < sorted_ids.length; i++) {
                    id = sorted_ids[i];
                    name = names[id];
                    if (separators[name]) {
                        line = document.createElement('div');
                        line.className = 'sep_line';
                        fragment.appendChild(line);
                    }
                    label = document.createElement('label');
                    label.className = 'list_el' + (i % 2 === 1 ? ' list_el_alt' : ''); // alternate row shading
                    label.setAttribute('data-search', outfiter_search_key(name + ' ' + ((alt_names && alt_names[name]) || '')));
                    input = document.createElement('input');
                    input.type = 'radio';
                    input.name = 'radio_' + kind;
                    input.className = 'darkrad radio_' + kind + '_' + id;
                    input.checked = checked_id !== null && String(id) === String(checked_id);
                    mark = document.createElement('span');
                    mark.className = 'darkrad_in';
                    text = document.createElement('div');
                    text.className = 't';
                    text.textContent = name.replace(/_/g, ' ');
                    label.appendChild(input);
                    label.appendChild(mark);
                    label.appendChild(text);
                    fragment.appendChild(label);
                }
                ogebi('radio_' + kind)[0].appendChild(fragment);
            },
            // Tick the list rows of the current outfit, mount and creature (the arrow buttons
            // used to leave the mount / creature lists showing the old row) and scroll each
            // list - not the page - so a newly selected row is visible.
            outfiter_revealed = {},
            outfiter_reveal_pending = false,
            outfiter_url_timer,
            outfiter_sync_lists = function () {
                var selected = { outfits: outfiter_GET.outfit, mounts: outfiter_GET.mount, creatures: outfiter_GET.creature },
                    after_draw = window.requestAnimationFrame || function (fn) { setTimeout(fn, 16); };
                $.each(selected, function (kind, id) {
                    var box = ogebi('radio_' + kind)[0],
                        input = box && box.querySelector('.radio_' + kind + '_' + id);
                    if (input) { input.checked = true; }
                });
                // Scrolling the lists needs the page layout; measure it after the picture
                // is drawn so it does not slow the drawing down.
                if (outfiter_reveal_pending) { return; }
                outfiter_reveal_pending = true;
                after_draw(function () {
                    outfiter_reveal_pending = false;
                    outfiter_reveal_selected();
                });
            },
            // scroll each list so that its selected row is visible (once per new selection)
            outfiter_reveal_selected = function () {
                $.each({ outfits: outfiter_GET.outfit, mounts: outfiter_GET.mount, creatures: outfiter_GET.creature }, function (kind, id) {
                    var box = ogebi('radio_' + kind)[0],
                        input = box && box.querySelector('.radio_' + kind + '_' + id),
                        row, search, box_rect, row_rect, top_limit, scale;
                    if (!input) { return; }
                    if (outfiter_revealed[kind] === id) { return; } // don't fight the user's own scrolling
                    row = input.parentNode;
                    if (!row.offsetParent || !box.clientHeight) { return; } // list hidden or row filtered out
                    outfiter_revealed[kind] = id;
                    search = box.querySelector('.omsearch');
                    box_rect = box.getBoundingClientRect();
                    row_rect = row.getBoundingClientRect();
                    // screen pixels per CSS pixel (very large screens scale the Outfitter up)
                    scale = (box.offsetHeight && box_rect.height / box.offsetHeight) || 1;
                    top_limit = box_rect.top + (search ? search.offsetHeight * scale : 0);
                    if (row_rect.top < top_limit || row_rect.bottom > box_rect.bottom) {
                        box.scrollTop += ((row_rect.top - top_limit) - Math.max(0, (box_rect.bottom - top_limit - row_rect.height) / 2)) / scale;
                    }
                });
            },
            // keep screen-reader state of the colour palette in sync with the highlighted swatch
            outfiter_sync_swatches = function () {
                ogebi('.dcolor_table div', 1).each(function () {
                    var on = $(this).hasClass('color_table_d_sel');
                    this.setAttribute('aria-checked', on ? 'true' : 'false');
                    this.tabIndex = on ? 0 : -1;
                });
            },
            // Short description of the preview for screen readers (the image's alt text).
            outfiter_describe_preview = function () {
                var nice = function (n) { return String(n || '').replace(/_/g, ' '); },
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    text = '';
                if (outfiter_GET.creature > 0) { return nice(outfiter_creature_names[outfiter_GET.creature]) + ' (creature)'; }
                if (outfiter_GET.outfit !== outfiter_outfit_none_id) {
                    text = nice(outfiter_GET.female && outfiter_f_names[outfit_n] ? outfiter_f_names[outfit_n] : outfit_n) + ' outfit';
                    if (outfiter_GET.female && outfiter_u_names[outfit_n] !== true) { text += ', female'; }
                    if (outfiter_GET.addon1 && outfiter_GET.addon2) { text += ', both addons'; }
                    else if (outfiter_GET.addon1) { text += ', addon 1'; }
                    else if (outfiter_GET.addon2) { text += ', addon 2'; }
                }
                if (outfiter_GET.mount) { text += text ? ' on ' + nice(outfiter_mount_names[outfiter_GET.mount]) : nice(outfiter_mount_names[outfiter_GET.mount]) + ' (mount)'; }
                return text || 'Empty preview';
            },
            outfiter_sort_none_first = function (a, b) {
                if (a[0] === 0 || b[0] === 0) { return a[0] === 0 ? (b[0] === 0 ? 0 : -1) : 1; }
                if (a[1] < b[1]) { return -1; }
                if (a[1] > b[1]) { return 1; }
                return 0;
            },
            // Images that are drawn onto the canvas (floor tile, name font, HP bar). The first
            // render waits for them, otherwise the floor / name could silently be missing.
            outfiter_ui_images_ready = null,
            outfiter_load_ui_images = function () {
                var folder = 'images/ui/',
                    files = { floor_image: 'floor.png', letters_image: 'name-font.png', hp_bar: 'hp-bar.png' },
                    waits = $.map(files, function (file, cls) {
                        var done = $.Deferred(), img = ogebi(cls)[0];
                        $(img).one('load error', function (e) {
                            if (e.type === 'error' && window.console && console.error) {
                                console.error('[Outfitter] Could not load ' + folder + file);
                            }
                            done.resolve();
                        });
                        img.src = folder + file;
                        return done.promise();
                    });
                outfiter_ui_images_ready = $.when.apply($, waits);
            },
            outfiter_init = function () {
                outfiter_load_ui_images();
                $.each(outfiter_mount_names, function (i, v) { if ($.inArray(i, outfiter_mount_names_extra) === -1) { outfiter_mount_names_sorted.push([i, v]); } });
                outfiter_mount_names_sorted.sort(outfiter_sort_none_first);
                $.each(outfiter_mount_names_sorted, function (i, v) { outfiter_mount_names_sorted[i] = v[0]; });
                outfiter_mount_names_sorted = outfiter_mount_names_sorted.concat(outfiter_mount_names_extra);

                $.each(outfiter_creature_names, function (i, v) { if ($.inArray(i, outfiter_creature_names_extra) === -1) { outfiter_creature_names_sorted.push([i, v]); } });
                outfiter_creature_names_sorted.sort(outfiter_sort_none_first);
                $.each(outfiter_creature_names_sorted, function (i, v) { outfiter_creature_names_sorted[i] = v[0]; });
                outfiter_creature_names_sorted = outfiter_creature_names_sorted.concat(outfiter_creature_names_extra);

                $.each(outfiter_names, function (i, v) {
                    if (v !== undefined && $.inArray(i, outfiter_names_extra) === -1) { outfiter_names_sorted.push([i, v]); }
                });
                outfiter_names_sorted.sort(function (a, b) { if (a[1] < b[1]) { return -1; } if (a[1] > b[1]) { return 1; } return 0; });
                $.each(outfiter_names_sorted, function (i, v) { outfiter_names_sorted[i] = v[0]; });
                outfiter_names_sorted = outfiter_names_sorted.concat(outfiter_names_extra);

                outfiter_get_get();
                var opt;
                for (opt in outfiter_def) {
                    if (outfiter_def.hasOwnProperty(opt)) {
                        if (!outfiter_GET.hasOwnProperty(opt)) { outfiter_GET[opt] = outfiter_def[opt]; }
                    }
                }
                outfiter_sanitize_get();
                // narrow screens show one list at a time: start with the creature list when
                // the link shows a creature
                if (outfiter_GET.creature > 0) {
                    $this_main.removeClass('show-list-oselector').addClass('show-list-cselector');
                    ogebi('.list_tab', 1).attr('aria-pressed', 'false').filter('[data-list="cselector"]').attr('aria-pressed', 'true');
                }
                for (opt in outfiter_def) {
                    if (outfiter_def.hasOwnProperty(opt)) {
                        if (typeof outfiter_def[opt] === 'boolean') { ogebi(opt).prop({ checked: outfiter_GET[opt] }); }
                        else { ogebi(opt).val(outfiter_GET[opt]); }
                    }
                }

                var d2h = function (d) { d = d.toString(16); return d.length === 1 ? '0' + d : d; };
                ogebi('dcolor_table div').removeClass('color_table_d_sel')
                    .each(function (i) {
                        $(this).css('background-color', '#' + d2h(outfiter_color_t[i][0]) + d2h(outfiter_color_t[i][1]) + d2h(outfiter_color_t[i][2]));
                    });
                ogebi('.dcolor_table div', 1).each(function (i) {
                    this.setAttribute('aria-label', 'Colour ' + (i + 1));
                });
                ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).on('click', function () {
                    ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).removeClass('sel').attr('aria-pressed', 'false');
                    $(this).addClass('sel').attr('aria-pressed', 'true');
                    ogebi('dcolor_table').attr('aria-label', $(this).text() + ' colour');
                    var
                        num = ($(this).attr('class').match(/\bcb_(\d+)\b/) || [])[1],
                        i = parseInt(num, 10),
                        col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                        val_name = (col_type === 'mount' ? 'm' : '') + 'c' + i;
                    ogebi('.dcolor_table div', 1).removeClass('color_table_d_sel')
                        .filter(':eq(' + ogebi(val_name).val() + ')').addClass('color_table_d_sel');
                    outfiter_sync_swatches();
                });
                ogebi('cb_1').trigger('click');

                var comp = true, big_canvas = ogebi('canvas_main')[0], context;
                if (!big_canvas || !big_canvas.getContext) { comp = false; }
                else {
                    context = big_canvas.getContext('2d');
                    if (!context || !context.getImageData || !context.putImageData || !context.drawImage) { comp = false; }
                }
                if (!comp) {
                    outfiter_hide_body(true);
                    alert('Browser not compatible, try latest version of ' + browsers_base);
                    return false;
                }

                ogebi('.dcolor_table div', 1).on('click', function () {
                    if ($this_main.is('.outfiter_loading, .outfiter_busy') || ogebi('colors_cont').hasClass('is-unavailable')) { return; }
                    var
                        num = (ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').attr('class').match(/\bcb_(\d+)\b/) || [])[1],
                        i = parseInt(num, 10),
                        col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                        val_name = (col_type === 'mount' ? 'm' : '') + 'c' + i;
                    ogebi('.dcolor_table div', 1).removeClass('color_table_d_sel');
                    $(this).addClass('color_table_d_sel');
                    outfiter_sync_swatches();
                    ogebi(val_name).val($(this).index());
                    outfiter_do_addon();
                });
                // Keyboard: arrow keys move through the palette (19 colours per row), Enter/Space pick.
                ogebi('dcolor_table').on('keydown', 'div', function (e) {
                    var i = $(this).index(), $all = ogebi('.dcolor_table div', 1), next;
                    if (e.which === 13 || e.which === 32) { e.preventDefault(); $(this).trigger('click'); return; }
                    next = { 37: i - 1, 39: i + 1, 38: i - 19, 40: i + 19, 36: 0, 35: $all.length - 1 }[e.which];
                    if (next === undefined) { return; }
                    e.preventDefault();
                    if (next < 0 || next >= $all.length || $this_main.is('.outfiter_loading, .outfiter_busy')) { return; }
                    $all.eq(next).trigger('click').focus();
                });
                ogebi('[name="radio_colourise"]', 1).on('change', function (e, data) {
                    ogebi('colourise_copy').text('Copy to ' + (
                        ogebi('[name="radio_colourise"]:checked', 1).val() === 'mount' ?
                            'Outfit' : 'Mount'
                    ));
                    ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').trigger('click');
                    if (data && data.is_copy) { outfiter_do_addon(); }
                });

                outfiter_apng_supported = '';
                try {
                    (function () {
                        var canvas = document.createElement('canvas');
                        if (!(canvas.getContext && canvas.getContext('2d'))) { outfiter_apng_supported = false; }
                        var image = new Image();
                        var ctx = canvas.getContext('2d');
                        image.onload = function () {
                            if (!canvas.getContext) { outfiter_apng_supported = false; }
                            else {
                                ctx.drawImage(image, 0, 0);
                                outfiter_apng_supported = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
                            }
                        };
                        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==';
                    }());
                } catch (ignore) { }

                ogebi('.main_image, .mount_image, .creature_image', 1).each(function (i) {
                    $(this).on('load', function () {
                        // ignore the empty src reset and images that belong to an older selection
                        if (!this.getAttribute('src') || $(this).data('outfiter_token') !== outfiter_load_token) { return true; }
                        outfiter_images_loaded[i] = true;
                        (i === 0 ? $canvas_main : (i === 1 ? $canvas_mount : $canvas_creature)).attr({ height: this.naturalHeight, width: this.naturalWidth });
                        if (outfiter_images_loaded[0] && outfiter_images_loaded[1] && outfiter_images_loaded[2]) { outfiter_do_display(); }
                        return true;
                    });
                    // a file that downloads fine but holds corrupt base64 / PNG data
                    $(this).on('error', function () {
                        if (!this.getAttribute('src') || $(this).data('outfiter_token') !== outfiter_load_token) { return; }
                        outfiter_load_failed(outfiter_load_token, $(this).data('outfiter_file'), 'image data could not be decoded (corrupt base64 or PNG)');
                    });
                });

                // Fill the three selection lists, then react to clicks on any row.
                outfiter_build_list('outfits', outfiter_names_sorted, outfiter_names, outfiter_separator, null, outfiter_f_names);
                outfiter_build_list('mounts', outfiter_mount_names_sorted, outfiter_mount_names, outfiter_mount_separator, ogebi('mount').val(), null);
                outfiter_build_list('creatures', outfiter_creature_names_sorted, outfiter_creature_names, outfiter_creature_separator, ogebi('creature').val(), null);
                // One click handler per list (instead of one per row). The id is the number in
                // the radio's class name, e.g. "radio_mounts_12".
                $.each({ outfits: ['outfit', outfiter_do_outfit], mounts: ['mount', outfiter_do_mount], creatures: ['creature', outfiter_do_creature] }, function (kind, cfg) {
                    ogebi('radio_' + kind).on('click', 'input[name="radio_' + kind + '"]', function () {
                        var match = this.className.match(new RegExp('\\bradio_' + kind + '_(\\d+)\\b')),
                            id = match ? parseInt(match[1], 10) : NaN;
                        if (!isNaN(id) && id !== parseInt(ogebi(cfg[0]).val(), 10)) { cfg[1](id, true); }
                    });
                });

                ogebi('animate').on('change', outfiter_do_addon);
                ogebi('sanim').on('change', outfiter_do_addon);
                ogebi('show_outfit').on('change', outfiter_do_show_outfit);
                ogebi('floor').on('change', outfiter_do_addon);
                ogebi('soft').on('change', outfiter_do_addon);
                ogebi('hpbar').on('change', outfiter_do_addon);
                ogebi('anistep').on('change', outfiter_do_addon);
                ogebi('template_code').on('change', outfiter_do_addon);
                ogebi('addon1').on('change', function () { outfiter_do_addon(1); });
                ogebi('addon2').on('change', function () { outfiter_do_addon(2); });
                ogebi('show_mount').on('change', outfiter_do_show_mount);
                ogebi('show_creature').on('change', outfiter_do_show_creature);
                ogebi('female').on('change', function () { outfiter_load_outfit('female'); });

                ogebi('facingm').on('click', function () { outfiter_do_facing(-1); });
                ogebi('facingp').on('click', function () { outfiter_do_facing(1); });
                ogebi('zoomin').on('click', function () { outfiter_do_zoom(1); });
                ogebi('zoomout').on('click', function () { outfiter_do_zoom(-1); });
                ogebi('zoomreset').on('click', function () { outfiter_do_zoom_reset(); });
                ogebi('download_image').on('click', function () { outfiter_do_download(); });

                // toggle advanced save options and download button label
                (function () {
                    var syncAdvanced = function () {
                        var on = ogebi('show_advanced').is(':checked'),
                            $btn = ogebi('download_image');
                        ogebi('save_advanced_opts').toggleClass('is-visible', on);
                        if (on) {
                            $btn.text('Download').attr('title', 'Download using the selected Save as options.');
                        } else {
                            // hide extras that live under advanced options
                            if (ogebi('anistep').is(':checked')) {
                                ogebi('anistep').prop({ checked: false });
                            }
                            if (ogebi('template_code').is(':checked')) {
                                ogebi('template_code').prop({ checked: false });
                            }
                            ogebi('anistep_step_cont').empty();
                            ogebi('anistep_panel').removeClass('is-visible');
                            ogebi('template_code_code_cont').empty();
                            $btn.text('Download GIF').attr(
                                'title',
                                'Download the currently displayed options in the outfitter.'
                            );
                        }
                    };
                    ogebi('show_advanced').on('change', syncAdvanced);
                    syncAdvanced();
                }());

                // help tips for the ? icons (shown next to the icon; works on hover/click)
                (function () {
                    var $tip = $('<div class="outfiter_help_tip" role="tooltip" />').appendTo('body'),
                        hideTimer = null,
                        activeEl = null,
                        showTip = function (el) {
                            var text, rect, tipW, tipH, left, top, pad = 8;
                            if (!el) { return; }
                            text = el.getAttribute('data-help') || '';
                            if (!text) { return; }
                            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                            activeEl = el;
                            $tip.text(text);
                            $tip.addClass('is-visible');
                            tipW = $tip.outerWidth() || 220;
                            tipH = $tip.outerHeight() || 40;
                            rect = el.getBoundingClientRect();
                            // place below icon, or above if near the bottom of the window
                            left = rect.left + (rect.width / 2) - (tipW / 2);
                            top = rect.bottom + pad;
                            if (top + tipH > window.innerHeight - 4) {
                                top = rect.top - tipH - pad;
                            }
                            if (left < 4) { left = 4; }
                            if (left + tipW > window.innerWidth - 4) {
                                left = window.innerWidth - tipW - 4;
                            }
                            if (top < 4) { top = 4; }
                            $tip.css({ left: Math.round(left) + 'px', top: Math.round(top) + 'px' });
                            $(el).addClass('is-open');
                        },
                        hideTip = function (immediate) {
                            var doHide = function () {
                                $tip.removeClass('is-visible');
                                ogebi('.help_q', 1).removeClass('is-open');
                                activeEl = null;
                                hideTimer = null;
                            };
                            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                            if (immediate) { doHide(); }
                            else { hideTimer = setTimeout(doHide, 120); }
                        };
                    ogebi('.help_q', 1)
                        .on('mouseenter focus', function () { showTip(this); })
                        .on('mouseleave blur', function () { hideTip(false); })
                        .on('click', function (e) {
                            var el = this, isOpen = $(el).hasClass('is-open') && activeEl === el;
                            e.preventDefault();
                            e.stopPropagation();
                            if (isOpen) { hideTip(true); }
                            else { showTip(el); }
                        })
                        .on('keydown', function (e) {
                            if (e.which === 13 || e.which === 32) {
                                e.preventDefault();
                                $(this).trigger('click');
                            }
                        });
                    $(document).on('click.outfiterHelp', function () { hideTip(true); });
                    $(window).on('scroll.outfiterHelp resize.outfiterHelp', function () {
                        if (activeEl) { showTip(activeEl); }
                    });
                }());

                /* Scroll-wheel zoom over the preview */
                ogebi('.body_main_div', 1).on('wheel', function (e) {
                    var oe = e.originalEvent, delta;
                    if (!oe) { return; }
                    delta = oe.deltaY !== undefined ? oe.deltaY : (oe.wheelDelta ? -oe.wheelDelta : 0);
                    if (delta === 0) { return; }
                    e.preventDefault();
                    outfiter_do_zoom(delta > 0 ? -1 : 1);
                });

                /* Drag-to-pan when zoomed in */
                ogebi('.body_main_div .body_main', 1).on('mousedown', function (e) {
                    if (outfiter_zoom <= 1 || e.which !== 1) { return; }
                    outfiter_dragging = true;
                    outfiter_measure_drag_scale();
                    outfiter_drag_start_x = e.clientX;
                    outfiter_drag_start_y = e.clientY;
                    outfiter_pan_start_x = outfiter_pan_x;
                    outfiter_pan_start_y = outfiter_pan_y;
                    $(this).css({ cursor: 'grabbing' }).addClass('is-dragging');
                    e.preventDefault();
                });
                $(document).on('mousemove.outfiter_pan', function (e) {
                    if (!outfiter_dragging) { return; }
                    outfiter_pan_x = outfiter_pan_start_x + (e.clientX - outfiter_drag_start_x) / outfiter_drag_scale;
                    outfiter_pan_y = outfiter_pan_start_y + (e.clientY - outfiter_drag_start_y) / outfiter_drag_scale;
                    outfiter_clamp_pan();
                    ogebi('.body_main_div .body_main', 1).css({
                        transform: 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)'
                    });
                });
                $(document).on('mouseup.outfiter_pan', function () {
                    if (!outfiter_dragging) { return; }
                    outfiter_dragging = false;
                    ogebi('.body_main_div .body_main', 1)
                        .css({ cursor: outfiter_zoom > 1 ? 'grab' : 'default' })
                        .removeClass('is-dragging');
                });
                /* Touch support for pan */
                ogebi('.body_main_div .body_main', 1).on('touchstart', function (e) {
                    var t;
                    if (outfiter_zoom <= 1 || !$(this).hasClass('is-pannable')) { return; }
                    t = e.originalEvent.touches[0];
                    if (!t) { return; }
                    outfiter_dragging = true;
                    outfiter_measure_drag_scale();
                    outfiter_drag_start_x = t.clientX;
                    outfiter_drag_start_y = t.clientY;
                    outfiter_pan_start_x = outfiter_pan_x;
                    outfiter_pan_start_y = outfiter_pan_y;
                    $(this).addClass('is-dragging');
                    e.preventDefault();
                });
                $(document).on('touchmove.outfiter_pan', function (e) {
                    var t;
                    if (!outfiter_dragging) { return; }
                    t = e.originalEvent.touches[0];
                    if (!t) { return; }
                    outfiter_pan_x = outfiter_pan_start_x + (t.clientX - outfiter_drag_start_x) / outfiter_drag_scale;
                    outfiter_pan_y = outfiter_pan_start_y + (t.clientY - outfiter_drag_start_y) / outfiter_drag_scale;
                    outfiter_clamp_pan();
                    ogebi('.body_main_div .body_main', 1).css({
                        transform: 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)'
                    });
                    e.preventDefault();
                });
                $(document).on('touchend.outfiter_pan touchcancel.outfiter_pan', function () {
                    if (!outfiter_dragging) { return; }
                    outfiter_dragging = false;
                    ogebi('.body_main_div .body_main', 1).removeClass('is-dragging');
                });
                // narrow screens: switch between the Outfits / Mounts / Creatures lists
                ogebi('.list_tab', 1).on('click', function () {
                    var list = $(this).attr('data-list');
                    ogebi('.list_tab', 1).attr('aria-pressed', 'false');
                    $(this).attr('aria-pressed', 'true');
                    $this_main.removeClass('show-list-oselector show-list-mselector show-list-cselector').addClass('show-list-' + list);
                    outfiter_sync_lists();
                });
                // re-fit the preview after rotating a phone / resizing the window, or when the
                // preview box changes size for another reason (e.g. template code shown on a
                // wide screen, where the preview takes the room that is left)
                (function () {
                    var resize_timer,
                        refit = function () {
                            clearTimeout(resize_timer);
                            resize_timer = setTimeout(function () {
                                outfiter_box_size = null; // measure the preview box again
                                if ($this_main.hasClass('outfiter_loading')) { return; }
                                outfiter_fit_zoom();
                                outfiter_apply_zoom();
                            }, 150);
                        };
                    $(window).on('resize.outfiter orientationchange.outfiter', refit);
                    if (window.ResizeObserver) {
                        new window.ResizeObserver(refit).observe(ogebi('body_main_div')[0]);
                    }
                }());
                ogebi('outfitm').on('click', function () { outfiter_do_outfit(-1); });
                ogebi('outfitp').on('click', function () { outfiter_do_outfit(1); });
                ogebi('mountm').on('click', function () { outfiter_do_mount(-1); });
                ogebi('mountp').on('click', function () { outfiter_do_mount(1); });
                ogebi('creaturem').on('click', function () { outfiter_do_creature(-1); });
                ogebi('creaturep').on('click', function () { outfiter_do_creature(1); });
                ogebi('colourise_copy').on('click', outfiter_do_colourise_copy);
                ogebi('colourise_random').on('click', outfiter_do_random_colours);
                ogebi('random_outfit').on('click', outfiter_do_random_outfit);
                ogebi('use_name').on('click', outfiter_do_addon);
                ogebi('clear_name').on('click', function () { ogebi('charn').val(''); outfiter_do_addon(); });
                // pressing Enter in the name box works like "Use Name"
                ogebi('charn').on('keydown', function (e) {
                    if (e.which === 13) { e.preventDefault(); outfiter_do_addon(); }
                });
                ogebi('url_input').on('click', function () { $(this).select(); });

                // copy text to clipboard and say whether it worked (no popup)
                var outfiter_copy_text = function (text, what) {
                    var
                        report = function (ok) {
                            outfiter_set_status(ok ? what + ' copied to clipboard.' : 'Could not copy automatically. Select the text and copy it manually.', !ok);
                        },
                        legacy_copy = function () {
                            var ta = document.createElement('textarea'), ok = false;
                            ta.value = text;
                            ta.setAttribute('readonly', 'readonly');
                            ta.style.position = 'fixed';
                            ta.style.left = '-9999px';
                            document.body.appendChild(ta);
                            ta.select();
                            try { ok = document.execCommand('copy'); } catch (ignore) { }
                            document.body.removeChild(ta);
                            report(ok);
                        };
                    text = text == null ? '' : String(text);
                    if (!text) { return; }
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        // writeText can be refused (permissions, insecure page) — fall back instead of failing silently
                        navigator.clipboard.writeText(text).then(function () { report(true); }, legacy_copy);
                        return;
                    }
                    legacy_copy();
                };
                $this_main.on('click', '.copy_url', function (e) {
                    e.preventDefault();
                    outfiter_copy_text(ogebi('url_input').val(), 'Link');
                });
                $this_main.on('click', '.copy_template', function (e) {
                    e.preventDefault();
                    outfiter_copy_text(ogebi('template_code_code').val(), 'Template code');
                });

                // Filter a list as the user types (also reacts to paste, autofill and clearing).
                ogebi('omsearch').on('input', function () {
                    var
                        query = outfiter_search_key(this.value),
                        shown = 0;
                    $(this).siblings('label').each(function () {
                        var match = query === '' || this.getAttribute('data-search').indexOf(query) !== -1;
                        this.style.display = match ? '' : 'none';
                        if (match) { shown++; }
                    });
                    $(this).siblings('.sep_line').toggle(query === '');
                    $(this).siblings('.omsearch_empty').prop('hidden', shown !== 0);
                });

                return true;
            };
        if (outfiter_init()) {
            if (outfiter_new_asset_problems.length) {
                $('<p class="outfiter_notice" role="status" />')
                    .text(outfiter_new_asset_problems.length === 1 ?
                        'One newly added item could not be added: ' + outfiter_new_asset_problems[0] :
                        outfiter_new_asset_problems.length + ' newly added items could not be added. Details are in the browser console (F12), or check them with tools/asset-helper.html.')
                    .insertBefore($this_main);
            }
            outfiter_load_outfit();
        }
    });
});
