<?php
/**
 * Server-side rendering of the `core/block` block.
 *
 * @package gutenberg
 */

/**
 * Renders the `core/block` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Rendered HTML of the referenced block.
 */
function render_block_core_block( $attributes ) {
	if ( empty( $attributes['ref'] ) ) {
		return '';
	}

	/**
	 * Filter to allow plugins to override the reusable block id.
	 *
	 * @since 3.5.0
	 *
	 * @param int $block_id     The id of the reusable block
	 */
	$reusable_block_id = apply_filters( 'reusable_block_id', $attributes['ref'] );
	$reusable_block    = get_post( $reusable_block_id );
	if ( ! $reusable_block || 'wp_block' !== $reusable_block->post_type ) {
		return '';
	}

	return do_blocks( $reusable_block->post_content );
}

register_block_type(
	'core/block',
	array(
		'attributes'      => array(
			'ref' => array(
				'type' => 'number',
			),
		),

		'render_callback' => 'render_block_core_block',
	)
);
