<?php
/**
 * Temporary compatibility shims for block APIs present in Gutenberg.
 *
 * @package gutenberg
 */

/**
 * Replace the `__default` block bindings attribute with the full list of supported
 * attribute names for pattern overrides.
 *
 * @param array $parsed_block The full block, including name and attributes.
 *
 * @return string The parsed block with default binding replace.
 */
function gutenberg_replace_pattern_override_default_binding( $parsed_block ) {
	$supported_block_attrs = array(
		'core/paragraph' => array( 'content' ),
		'core/heading'   => array( 'content' ),
		'core/image'     => array( 'id', 'url', 'title', 'alt' ),
		'core/button'    => array( 'url', 'text', 'linkTarget', 'rel' ),
	);

	$bindings = $parsed_block['attrs']['metadata']['bindings'] ?? array();
	if (
		isset( $bindings[ '__default' ][ 'source' ] ) &&
		$bindings[ '__default' ][ 'source' ] === 'core/pattern-overrides'
	) {
		// Build an binding array of all supported attributes.
		foreach ( $supported_block_attrs[ $parsed_block['blockName'] ] as $attribute_name ) {
			$bindings[ $attribute_name ] = array( 'source' => 'core/pattern-overrides' );
		}
		// Merge this into the parsed block's bindings & avoid overwriting existing bindings.
		$parsed_block['attrs']['metadata']['bindings'] = array_merge(
			$bindings,
			$parsed_block['attrs']['metadata']['bindings']
		);
	}

	return $parsed_block;
}

add_filter( 'render_block_data', 'gutenberg_replace_pattern_override_default_binding', 10, 1 );
