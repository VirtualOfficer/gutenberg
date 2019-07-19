<?php
/**
 * Block registration functions.
 *
 * @package gutenberg
 */

/**
 * Substitutes the implementation of a core-registered block type, if exists,
 * with the built result from the plugin.
 */
function gutenberg_reregister_core_block_types() {
	// Blocks directory may not exist if working from a fresh clone.
	$blocks_dir = dirname( __FILE__ ) . '/../build/block-library/blocks/';
	if ( ! file_exists( $blocks_dir ) ) {
		return;
	}

	$block_names = array(
		'archives.php'        => 'core/archives',
		'block.php'           => 'core/block',
		'calendar.php'        => 'core/calendar',
		'categories.php'      => 'core/categories',
		'latest-comments.php' => 'core/latest-comments',
		'latest-posts.php'    => 'core/latest-posts',
		'legacy-widget.php'   => 'core/legacy-widget',
		'rss.php'             => 'core/rss',
		'shortcode.php'       => 'core/shortcode',
		'search.php'          => 'core/search',
		'tag-cloud.php'       => 'core/tag-cloud',
		'post-title.php'      => 'core/post-title',
		'post-content.php'    => 'core/post-content',
		'post-date.php'       => 'core/post-date',
	);

	$registry = WP_Block_Type_Registry::get_instance();

	foreach ( $block_names as $file => $block_name ) {
		if ( ! file_exists( $blocks_dir . $file ) ) {
			return;
		}

		if ( $registry->is_registered( $block_name ) ) {
			$registry->unregister( $block_name );
		}

		require $blocks_dir . $file;
	}
}
add_action( 'init', 'gutenberg_reregister_core_block_types' );

/**
 * Adds new block categories needed by the Gutenberg plugin.
 *
 * @param array $categories Array of block categories.
 *
 * @return array Array of block categories plus the new categories added.
 */
function gutenberg_block_categories( $categories ) {
	return array_merge(
		$categories,
		array(
			array(
				'slug'  => 'theme',
				'title' => __( 'Theme Blocks' ),
				'icon'  => null,
			),
		)
	);
}
add_filter( 'block_categories', 'gutenberg_block_categories' );
