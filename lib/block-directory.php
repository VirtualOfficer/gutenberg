<?php
/**
 * Block directory functions.
 *
 * @package gutenberg
 */

if (
	gutenberg_is_experiment_enabled( 'gutenberg-block-directory' ) &&
	! has_action( 'admin_enqueue_scripts', 'enqueue_block_editor_assets_block_directory' )
) {
	/**
	 * Function responsible for enqueuing the assets required
	 * for the block directory functionality in the editor.
	 */
	function gutenberg_enqueue_block_editor_assets_block_directory() {
		wp_enqueue_script( 'wp-block-directory' );
		wp_enqueue_style( 'wp-block-directory' );
	}
	add_action( 'enqueue_block_editor_assets', 'gutenberg_enqueue_block_editor_assets_block_directory' );

	/**
	 * Add data attribute of handle to all script tags output in the wp-admin.
	 *
	 * @param string $tag     The `<script>` tag for the enqueued script.
	 * @param string $handle  The script's registered handle.
	 * @param string $src_esc The script's pre-escaped registered src.
	 *
	 * @return string  Filtered script tag.
	 */
	function gutenberg_change_script_tag( $tag, $handle, $src_esc ) {
		if ( ! is_admin() ) {
			return $tag;
		}

		$tag = str_replace(
			sprintf( "<script src='%s'></script>", $src_esc ),
			sprintf( "<script data-handle='%s' src='%s'></script>", esc_attr( $handle ), $src_esc ),
			$tag
		);

		return $tag;
	}
	add_filter( 'script_loader_tag', 'gutenberg_change_script_tag', 1, 3 );
}
