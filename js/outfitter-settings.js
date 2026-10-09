/*
 * =============================================================================
 *  TibiaWiki Outfitter - SETTINGS                       (safe to edit)
 * =============================================================================
 *  Small adjustable values. If a value is removed or mistyped, the Outfitter
 *  falls back to the default shown in the comment.
 *
 *  Not here on purpose: the default outfit/colours. Shared links leave out
 *  values that equal the defaults, so changing them would change what every
 *  existing link shows.
 * =============================================================================
 */
window.OutfiterSettings = {
    // Folder that holds the Creature / Female / Male / Mount / Other sprite folders.
    asset_folder: 'base64/',                       // default 'base64/'

    // Shown in the preview while a sprite downloads / when it cannot be loaded.
    loading_image: 'images/outfitter-loading.gif', // default 'images/outfitter-loading.gif'
    error_image: 'images/outfitter-error.png',     // default 'images/outfitter-error.png'

    // Preview zoom steps (1 = smallest). The preview opens at default_zoom.
    default_zoom: 2,                               // default 2
    min_zoom: 1,                                   // default 1
    max_zoom: 4,                                   // default 4

    // How often a failed sprite download is retried before showing the error image.
    download_retries: 1,                           // default 1
    retry_wait_ms: 500,                            // default 500 (milliseconds)

    // Text stored inside downloaded GIF / PNG files.
    file_comment: 'Created using the TibiaWiki Outfitter, developed collaboratively by the TibiaWiki Team.'
};
