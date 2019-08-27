<?php
/**
 * Server-side rendering of the `core/navigation-menu` block.
 *
 * @package gutenberg
 */

/**
 * Renders the `core/navigation-menu` block on server.
 *
 * @param array $attributes The block attributes.
 * @param array $content The saved content.
 * @param array $block The parsed block.
 *
 * @return string Returns the post content with the legacy widget added.
 */
function render_block_navigation_menu( $attributes, $content, $block ) {
	return build_navigation_menu_html( $block );
}

/**
 * Walks the inner block structure and returns an HTML list for it.
 *
 * @param array $block The block.
 *
 * @return string Returns  an HTML list from innerBlocks.
 */
function build_navigation_menu_html( $block ) {
	$html = '';
	foreach ( (array) $block['innerBlocks'] as $key => $menu_item ) {
		$html .= '<li>' . $menu_item['innerContent'][0];
		if ( count( (array) $menu_item['innerBlocks'] ) > 0 ) {
			$html .= build_navigation_menu_html( $menu_item );
		}
		$html .= '</li>';
	}
	return '<ul>' . $html . '</ul>';
}

/**
 * Register the navigation menu block.
 */
function register_block_core_navigation_menu() {
	register_block_type(
		'core/navigation-menu',
		array(
			'category'        => 'layout',
			'attributes'      => array(
				'automaticallyAdd' => array(
					'type'    => 'boolean',
					'default' => 'false',
				),
			),
			'render_callback' => 'render_block_navigation_menu',
		)
	);
}

add_action( 'init', 'register_block_core_navigation_menu' );
