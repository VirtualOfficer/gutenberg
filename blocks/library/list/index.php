<?php
/**
 * Server-side registration of the `core/list` block.
 *
 * @package gutenberg
 */

/**
 * Registers the `core/list` block on the server-side.
 *
 * @since 2.7.0
 */
function register_core_list_block() {
	wp_register_script(
		'core-list-block',
		gutenberg_url( '/build/__block_list.js' ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element' )
	);

	wp_register_style(
		'core-list-block-editor',
		gutenberg_url( '/build/__block_list_editor.css' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/__block_list_editor.css' )
	);

	wp_style_add_data( 'core-list-block-editor', 'rtl', 'replace' );

	register_block_type( 'core/list', array(
		'editor_style'  => 'core-list-block-editor',
		'editor_script' => 'core-list-block',
	) );
}

add_action( 'init', 'register_core_list_block' );
