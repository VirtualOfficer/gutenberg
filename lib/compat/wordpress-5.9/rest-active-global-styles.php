<?php
/**
 * Extends the themes endpoint to add the global styles link.
 *
 * @package gutenberg
 */

/**
 * Adds the current global styles link to the theme's REST API response.
 *
 * @param WP_REST_Response $response The response object.
 * @param WP_Theme         $theme    The theme object.
 */
function gutenberg_add_active_global_styles_link( $response, $theme ) {
	if ( $theme->get_stylesheet() === wp_get_theme()->get_stylesheet() ) {
		// This creates a record for the current theme if not existant.
		WP_Theme_JSON_Resolver_Gutenberg::get_user_custom_post_type_id();
	}

	$wp_query_args       = array(
		'post_status'    => array( 'publish' ),
		'post_type'      => 'wp_global_styles',
		'posts_per_page' => 1,
		'no_found_rows'  => true,
		'tax_query'      => array(
			array(
				'taxonomy' => 'wp_theme',
				'field'    => 'name',
				'terms'    => $theme->get_stylesheet(),
			),
		),
	);
	$global_styles_query = new WP_Query( $wp_query_args );
	if ( count( $global_styles_query->posts ) ) {
		$response->add_link(
			'https://api.w.org/user-global-styles',
			rest_url( 'wp/v2/global-styles/' . $global_styles_query->posts[0]->ID )
		);
	}

	return $response;
}

add_filter( 'rest_prepare_theme', 'gutenberg_add_active_global_styles_link', 10, 2 );
