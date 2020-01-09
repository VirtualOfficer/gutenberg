<?php
/**
 * Server-side rendering of the `core/shortcode` block.
 *
 * @package WordPress
 */

/**
 * Performs wpautop() on the shortcode block content.
 *
 * @param array  $attributes The block attributes.
 * @param string $content    The block content.
 *
 * @return string Returns the block content.
 */
function render_block_core_shortcode( $attributes, $content ) {
	return wpautop( $content );
}

/**
 * Registers the `core/shortcode` block on server.
 */
function register_block_core_shortcode() {
	$path     = gutenberg_dir_path() . 'packages/block-library/src/shortcode/block.json';
	$metadata = json_decode( file_get_contents( $path ), true );

	register_block_type(
		'core/shortcode',
		array(
			'attributes'      => $metadata['attributes'],
			'render_callback' => 'render_block_core_shortcode',
		)
	);
}
add_action( 'init', 'register_block_core_shortcode' );
