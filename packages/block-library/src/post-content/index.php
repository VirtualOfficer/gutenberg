<?php
/**
 * Server-side rendering of the `core/post-content` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/post-content` block on the server.
 *
 * @return string Returns the filtered post content of the current post.
 */
function render_block_core_post_content() {
	// TODO: Without this temporary fix, an infinite loop can occur.
	if ( is_admin() || defined( 'REST_REQUEST' ) ) {
		return '';
	}
	if ( ! in_the_loop() ) {
		rewind_posts();
		the_post();
	}
	return '<div class="entry-content">' . apply_filters( 'the_content', str_replace( ']]>', ']]&gt;', get_the_content() ) ) . '</div>';
}

/**
 * Registers the `core/post-content` block on the server.
 */
function register_block_core_post_content() {
	register_block_type(
		'core/post-content',
		array(
			'render_callback' => 'render_block_core_post_content',
		)
	);
}
add_action( 'init', 'register_block_core_post_content' );
