<?php
/**
 * Test WP_Font_Library::get_font_collections().
 *
 * @package WordPress
 * @subpackage Font Library
 *
 * @group fonts
 * @group font-library
 *
 * @covers WP_Font_Library::get_font_collection
 */
class Tests_Fonts_WpFontLibrary_GetFontCollection extends WP_Font_Library_UnitTestCase {

	public function test_should_get_font_collection() {
		$my_font_collection_config = array(
			'slug'        => 'my-font-collection',
			'name'        => 'My Font Collection',
			'description' => 'Demo about how to a font collection to your WordPress Font Library.',
			'src'         => path_join( __DIR__, 'my-font-collection-data.json' ),
		);
		wp_register_font_collection( $my_font_collection_config );
		$font_collection = WP_Font_Library::get_font_collection( 'my-font-collection' );
		$this->assertInstanceOf( 'WP_Font_Collection', $font_collection );
	}

	public function test_should_get_no_font_collection_if_the_slug_is_not_registered() {
		$font_collection = WP_Font_Library::get_font_collection( 'not-registered-font-collection' );
		$this->assertWPError( $font_collection );
	}
}
