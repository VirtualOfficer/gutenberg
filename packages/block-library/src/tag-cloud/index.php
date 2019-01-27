<?php
/**
 * Server-side rendering of the `core/tag-cloud` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/tag-cloud` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the tag cloud for selected taxonomy.
 */
function render_block_core_tag_cloud( $attributes ) {
	if ( ! isset( $attributes['taxonomy'] ) ) {
		return '';
	}

	$class = isset( $attributes['align'] ) ? "wp-block-tag-cloud align{$attributes['align']}" : 'wp-block-tag-cloud';

	$args = array(
		'echo'       => false,
		'taxonomy'   => $attributes['taxonomy'],
		'show_count' => $attributes['showTagCounts'],
	);

	$tag_cloud = wp_tag_cloud( $args );

	$block_content = sprintf(
		'<p class="%1$s">%2$s</p>',
		esc_attr( $class ),
		$tag_cloud
	);

	return $block_content;
}

/**
 * Registers the `core/tag-cloud` block on server.
 */
function register_block_core_tag_cloud() {
	register_block_type(
		'core/tag-cloud',
		array(
			'attributes'      => array(
				'taxonomy'      => array(
					'type' => 'string',
				),
				'showTagCounts' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'align'         => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'render_block_core_tag_cloud',
		)
	);
}

add_action( 'init', 'register_block_core_tag_cloud' );
