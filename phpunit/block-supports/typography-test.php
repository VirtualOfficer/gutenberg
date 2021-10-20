<?php

/**
 * Test the typography block supports.
 *
 * @package Gutenberg
 */

class WP_Block_Supports_Typography_Test extends WP_UnitTestCase {

	function test_font_size_slug_with_numbers_is_kebab_cased_properly() {
		register_block_type(
			'test/font-size-slug-with-numbers',
			array(
				'api_version' => 2,
				'attributes'  => array(
					'fontSize' => array(
						'type' => 'string',
					),
				),
				'supports'    => array(
					'typography' => array(
						'fontSize' => true,
					),
				),
			)
		);
		$registry   = WP_Block_Type_Registry::get_instance();
		$block_type = $registry->get_registered( 'test/font-size-slug-with-numbers' );

		$block_atts = array( 'fontSize' => 'h1' );

		$actual   = gutenberg_apply_typography_support( $block_type, $block_atts );
		$expected = array( 'class' => 'has-h-1-font-size' );

		$this->assertSame( $expected, $actual );
		unregister_block_type( 'test/font-size-slug-with-numbers' );
	}
}
