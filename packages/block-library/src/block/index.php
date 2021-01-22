<?php
/**
 * Server-side rendering of the `core/block` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/block` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Rendered HTML of the referenced block.
 */
function render_block_core_block( $attributes ) {
	static $seen_refs = array();

	if ( empty( $attributes['ref'] ) ) {
		return '';
	}

	if ( in_array( $attributes['ref'], $seen_refs, true ) ) {
		trigger_error(
			sprintf(
				// translators: %s is the block name, e.g. core/block.
				__( 'Block <strong>%s</strong> cannot be rendered inside itself.' ),
				'core/block'
			),
			E_USER_WARNING
		);

		return '[block rendering halted]';
	}

	$seen_refs[] = $attributes['ref'];

	$reusable_block = get_post( $attributes['ref'] );
	if ( ! $reusable_block || 'wp_block' !== $reusable_block->post_type ) {
		return '';
	}

	if ( 'publish' !== $reusable_block->post_status || ! empty( $reusable_block->post_password ) ) {
		return '';
	}

	return do_blocks( $reusable_block->post_content );
}

/**
 * Registers the `core/block` block.
 */
function register_block_core_block() {
	register_block_type_from_metadata(
		__DIR__ . '/block',
		array(
			'render_callback' => 'render_block_core_block',
		)
	);
}
add_action( 'init', 'register_block_core_block' );
