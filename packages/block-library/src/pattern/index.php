<?php
/**
 * Server-side rendering of the `core/pattern` block.
 *
 * @package WordPress
 */

/**
 *  Registers the `core/pattern` block on the server.
 *
 * @return void
 */
function register_block_core_pattern() {
	register_block_type_from_metadata(
		__DIR__ . '/pattern',
		array(
			'render_callback' => 'render_block_core_pattern',
		)
	);
}

/**
 * Renders the `core/pattern` block on the server.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    The block rendered content.
 *
 * @return string Returns the output of the pattern.
 */
function render_block_core_pattern( $attributes, $content ) {
	if ( empty( $attributes['slug'] ) ) {
		return '';
	}

	$align_class = isset($attributes['inheritedAlignment']) ? 'class="align' . $attributes['inheritedAlignment'] . '"' : '';
	$wrapper = '<div '. $align_class . ' data-pattern-slug="' . $attributes['slug'] . '">%s</div>';

	if ( isset( $attributes['syncStatus'] ) && 'unsynced' === $attributes['syncStatus'] ) {
		return sprintf( $wrapper, $content );
	}

	$slug     = $attributes['slug'];
	$registry = WP_Block_Patterns_Registry::get_instance();
	if ( ! $registry->is_registered( $slug ) ) {
		return '';
	}

	$pattern = $registry->get_registered( $slug );
	return sprintf( $wrapper, do_blocks( $pattern['content'] ) );
}

add_action( 'init', 'register_block_core_pattern' );
