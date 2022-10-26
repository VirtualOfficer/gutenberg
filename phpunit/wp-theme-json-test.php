<?php
/**
 * Tests theme.json related public APIs.
 *
 * @package Gutenberg
 */

class WP_Theme_Json_Test extends WP_UnitTestCase {

	/**
	 * Test that it reports correctly themes that have a theme.json.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_theme_has_theme_json() {
		switch_theme( 'block-theme' );
		$this->assertTrue( wp_theme_has_theme_json() );
	}

	/**
	 * Test that it reports correctly themes that do not have a theme.json.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_theme_has_no_theme_json() {
		switch_theme( 'default' );
		$this->assertFalse( wp_theme_has_theme_json() );
	}

	/**
	 * Test it reports correctly child themes that have a theme.json.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_child_theme_has_theme_json() {
		switch_theme( 'block-theme-child' );
		$this->assertTrue( wp_theme_has_theme_json() );
	}

	/**
	 * Test that it reports correctly child themes that do not have a theme.json
	 * and the parent does.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_child_theme_has_not_theme_json_but_parent_has() {
		switch_theme( 'block-theme-child-no-theme-json' );
		$this->assertTrue( wp_theme_has_theme_json() );
	}

	/**
	 * Test that it reports correctly child themes that do not have a theme.json
	 * and the parent does not either.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_neither_child_or_parent_themes_have_theme_json() {
		switch_theme( 'default-child-no-theme-json' );
		$this->assertFalse( wp_theme_has_theme_json() );
	}

	/**
	 * Test that switching themes recalculates theme support.
	 *
	 * @group theme_json
	 *
	 * @covers wp_theme_has_theme_json
	 */
	public function test_switching_themes_recalculates_support() {
		// The "default" theme doesn't have theme.json support.
		switch_theme( 'default' );
		$default = wp_theme_has_theme_json();

		// Switch to a theme that does have support.
		switch_theme( 'block-theme' );
		$block_theme = wp_theme_has_theme_json();

		$this->assertFalse( $default );
		$this->assertTrue( $block_theme );
	}
}
