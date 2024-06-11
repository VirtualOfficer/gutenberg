<?php
/**
 * Temporary compatibility shims for block APIs present in Gutenberg.
 *
 * @package gutenberg
 */

/**
 * Get the available rendering modes for the Block Editor.
 *
 * post-only: This mode extracts the post blocks from the template and renders only those.
 * The idea is to allow the user to edit the post/page in isolation without the wrapping template.
 *
 * template-locked: This mode renders both the template and the post blocks
 * but the template blocks are locked and can't be edited. The post blocks are editable.
 *
 * @return array Array of available rendering modes.
 */
function gutenberg_rendering_modes() {
	return [
		'post-only',
		'template-lock',
		'template-locked',
	];
}

/**
 * Add the default_rendering_mode property to the WP_Post_Type object.
 * This property can be overwritten by using the post_type_default_rendering_mode filter.
 *
 * @param array  $args      Array of post type arguments.
 * @return array Updated array of post type arguments.
 */
function gutenberg_post_type_default_rendering_mode( $args ) {
	$rendering_mode  = 'post-only';
	$rendering_modes = gutenberg_rendering_modes();

	// Make sure the post type supports the block editor.
	if (
		( isset( $args['show_in_rest'] ) && $args['show_in_rest'] ) &&
		( isset( $args['supports'] ) && in_array( 'editor', $args['supports'], true ) )
	) {
		// Validate the supplied rendering mode.
		if (
			isset( $args['default_rendering_mode'] ) &&
			in_array( $args['default_rendering_mode'], $rendering_modes, true )
		) {
			$rendering_mode = $args['default_rendering_mode'];
		}

		$args['default_rendering_mode'] = $rendering_mode;
	}

	return $args;
}
add_filter( 'register_post_type_args', 'gutenberg_post_type_default_rendering_mode', 10, 1 );