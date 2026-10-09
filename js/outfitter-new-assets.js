/*
 * =============================================================================
 *  NEW CREATURES, MOUNTS AND OUTFITS                  <- add new items here
 * =============================================================================
 *  Each new item is ONE block { ... } in the list at the bottom of this file.
 *  The easiest way to make a block is the Asset Helper page
 *  (tools/asset-helper.html): it checks your sprite, previews it and writes the
 *  block for you. Step-by-step guide: docs/MAINTAINING.md
 *
 *  Rules:
 *   - Add new blocks at the END of the list, after the last "},".
 *   - Every block ends with "},". Text goes in 'single quotes'; true / false and
 *     numbers have no quotes.
 *   - id is the next free number of that type (the Asset Helper tells you). IDs are
 *     used in shared links, so never change or reuse the id of a published item.
 *   - name must match the sprite file name exactly (capital letters too) and use
 *     _ instead of spaces: name 'Example_Creature' -> base64/Creature/Example_Creature.txt
 *   - Upload the sprite file(s) BEFORE you publish the block.
 *   - A mistake here only hides the new items; everything else keeps working.
 *     The checker (npm run validate) or the Asset Helper names the problem.
 *
 *  Fields
 *   type             required  'creature', 'mount', 'outfit' (player outfit,
 *                              IDs 200+) or 'other_outfit' (NPC/monster outfit,
 *                              IDs 100-199)
 *   id               required  next free number of that type
 *   name             required  file name without .txt, e.g. 'Example_Creature'
 *   standing_frames  optional  rows of standing animation (default 1)
 *   walking_frames   optional  rows of walking animation (default 8)
 *   colourisable     optional  creature / mount: true if the sheet is 512px wide
 *                              with colour masks (default false)
 *   addons           creature: optional 'none' (default), 'addon_1', 'both' or
 *                              'one_at_a_time'
 *                    outfits:  required 'both', 'none' or 'one_at_a_time'
 *   female           outfits:  required true (has a female sprite) or false
 *   can_ride_mount   outfits:  required true (sheet has riding rows) or false
 *   female_name      optional  outfits: female display name, e.g. 'Example_Outfitwoman'
 *   separate_female_file  optional  other_outfit: female sprite is <Name>_Female.txt
 *   standing_delays_ms    optional  one delay per standing frame, e.g. [500, 100, 100]
 *   standing_delay_ms / walking_delay_ms / walking_delays_ms
 *                    optional  creature only: animation speed in milliseconds
 *   note             optional  any text (source, credits ...); not shown in the app
 *
 *  Examples with made-up names (they are comments, so nothing is added; the
 *  ids are only examples - use the next free id):
 *
 *    {
 *        type: 'creature',
 *        id: 788,
 *        name: 'Example_Creature',
 *    },
 *    {
 *        type: 'mount',
 *        id: 263,
 *        name: 'Example_Mount',
 *        colourisable: true,
 *    },
 *    {
 *        type: 'outfit',
 *        id: 236,
 *        name: 'Example_Outfit',
 *        female: true,
 *        addons: 'both',
 *        can_ride_mount: true,
 *    },
 * =============================================================================
 */
window.OutfiterNewAssets = [
    // ---- add new blocks below this line ----

];
