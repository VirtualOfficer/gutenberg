<?php
/**
 * Overrides Core's wp-includes/block-patterns.php to add new wp_patterns taxonomy for WP 6.4.
 *
 * @package gutenberg
 */

/**
 * Adds a new taxonomy for organizing user created patterns.
 *
 * Note: This should be removed when the minimum required WP version is >= 6.4.
 *
 * @see https://github.com/WordPress/gutenberg/pull/51144
 *
 * @return void
 */
function gutenberg_register_taxonomy_patterns() {
	$labels = array(
		'name'          => _x( 'Pattern Categories', 'taxonomy general name' ),
		'singular_name' => _x( 'Pattern Category', 'taxonomy singular name' ),
	);
	$args   = array(
		'hierarchical'      => false,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_in_menu'      => false,
		'show_in_nav_menus' => false,
		'show_admin_column' => true,
		'query_var'         => true,
		'show_in_rest'      => true,
		'rewrite'           => array( 'slug' => 'wp_pattern_custom_category' ),
	);
	register_taxonomy( 'wp_pattern_custom_category', array( 'wp_block' ), $args );
}
add_action( 'init', 'gutenberg_register_taxonomy_patterns' );
