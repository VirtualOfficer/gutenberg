<?php
/**
 * Interactivity API functions specific for the Gutenberg editor plugin.
 *
 * @package gutenberg
 */

/**
 * Deregisters the Core Interactivity API Modules and replace them
 * with the ones from the Gutenberg plugin.
 */
function gutenberg_reregister_interactivity_script_modules() {
	$default_version = defined( 'GUTENBERG_VERSION' ) && ! SCRIPT_DEBUG ? GUTENBERG_VERSION : time();
	wp_deregister_script_module( '@wordpress/interactivity' );
	wp_deregister_script_module( '@wordpress/interactivity-router' );

	$experiments = get_option( 'gutenberg-experiments' );
	$full_page_navigation_enabled = isset( $experiments['gutenberg-full-page-client-side-navigation'] );

	wp_register_script_module(
		'@wordpress/interactivity',
		gutenberg_url( '/build/interactivity/' . ( SCRIPT_DEBUG ? 'debug.min.js' : 'index.min.js' ) ),
		array(),
		$full_page_navigation_enabled ? null : $default_version
	);

	wp_register_script_module(
		'@wordpress/interactivity-router',
		gutenberg_url( '/build/interactivity/router.min.js' ),
		array( '@wordpress/interactivity' ),
		$full_page_navigation_enabled ? null : $default_version
	);
}

add_action( 'init', 'gutenberg_reregister_interactivity_script_modules' );
