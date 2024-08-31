<?php
/**
 * Server-side rendering of the `core/tabs` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/tabs` block on the server.
 *
 * @param array    $attributes The block attributes.
 * @param string   $content    The block content.
 * @param WP_Block $block      The block object.
 *
 * @return string The block content.
 */
function render_block_core_tabs( $attributes, $content ) {
	if ( ! $content ) {
		return '';
	}

	// Enqueue script modules for interactivity API.
	$suffix = wp_scripts_get_suffix();
	if ( defined( 'IS_GUTENBERG_PLUGIN' ) && IS_GUTENBERG_PLUGIN ) {
		$module_url = gutenberg_url( '/build/interactivity/tabs.min.js' );
	}

	wp_register_script_module(
		'@wordpress/block-library/tabs',
		isset( $module_url ) ? $module_url : includes_url( "blocks/tabs/view{$suffix}.js" ),
		array( '@wordpress/interactivity' ),
		defined( 'GUTENBERG_VERSION' ) ? GUTENBERG_VERSION : get_bloginfo( 'version' )
	);

	wp_enqueue_script_module( '@wordpress/block-library/tabs' );

	// Modify markup to include interactivity API attributes.
	$p        = new WP_HTML_Tag_Processor( $content );
	$title_id = wp_unique_id( 'tablist-label-' );

	$tab_label_index = 0;
	while ( $p->next_tag() ) {
		if ( $p->has_class( 'wp-block-tabs' ) ) {
			$p->set_attribute( 'data-wp-interactive', 'core/tabs' );
			$p->set_attribute( 'data-wp-context', '{ "activeTabIndex": 0 }' );
			$p->set_attribute( 'data-wp-init', 'callbacks.init' );
		}

		// Set a unique ID for the title, so it can be used by aria-labelledby.
		if ( $p->has_class( 'wp-block-tabs__title' ) ) {
			$p->set_attribute( 'id', $title_id );
		}

		if ( $p->has_class( 'wp-block-tabs__tab-label' ) ) {
			$p->set_attribute( 'data-wp-bind--aria-selected', 'state.isActiveTab' );
			$p->set_attribute( 'data-wp-bind--tabindex', 'state.tabindexLabelAttribute' );
			$p->set_attribute( 'data-wp-on--click', 'actions.handleTabClick' );
			$p->set_attribute( 'data-wp-on--keydown', 'actions.handleTabKeyDown' );
			$p->set_attribute( 'data-tab-index', $tab_label_index );
			++$tab_label_index;
		}
	}

	return $p->get_updated_html();
}

/**
 * Registers the `core/tabs` block on server.
 */
function register_block_core_tabs() {
	register_block_type_from_metadata(
		__DIR__ . '/tabs',
		array(
			'render_callback' => 'render_block_core_tabs',
		)
	);
}
add_action( 'init', 'register_block_core_tabs' );
