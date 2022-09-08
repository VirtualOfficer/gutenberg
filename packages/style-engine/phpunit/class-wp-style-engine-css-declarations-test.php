<?php
/**
 * Tests the Style Engine CSS declarations class.
 *
 * @package    Gutenberg
 * @subpackage style-engine
 */

// Check for the existence of Style Engine classes and methods.
// Once the Style Engine has been migrated to Core we can remove the if statements and require imports.
// Testing new features from the Gutenberg package may require
// testing against `gutenberg_` and `_Gutenberg` functions and methods in the future.
if ( ! class_exists( 'WP_Style_Engine_CSS_Declarations' ) ) {
	require __DIR__ . '/../class-wp-style-engine-css-declarations.php';
}

/**
 * Tests registering, storing and generating CSS declarations.
 *
 * @coversDefaultClass WP_Style_Engine_CSS_Declarations
 */
class WP_Style_Engine_CSS_Declarations_Test extends WP_UnitTestCase {
	/**
	 * Tests setting declarations on instantiation.
	 *
	 * @covers ::__construct
	 */
	public function test_should_instantiate_with_declarations() {
		$input_declarations = array(
			'margin-top' => '10px',
			'font-size'  => '2rem',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );
		$this->assertSame( $input_declarations, $css_declarations->get_declarations() );
	}

	/**
	 * Tests that declarations are added.
	 *
	 * @covers ::add_declarations
	 * @covers ::add_declaration
	 */
	public function test_should_add_declarations() {
		$input_declarations = array(
			'padding' => '20px',
			'color'   => 'var(--wp--preset--elbow-patches)',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations();
		$css_declarations->add_declarations( $input_declarations );
		$this->assertSame( $input_declarations, $css_declarations->get_declarations() );
	}

	/**
	 * Tests that new declarations are added to existing declarations.
	 *
	 * @covers ::add_declarations
	 * @covers ::add_declaration
	 */
	public function test_should_add_new_declarations_to_existing() {
		$input_declarations = array(
			'border-width'     => '1%',
			'background-color' => 'var(--wp--preset--english-mustard)',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );
		$extra_declaration  = array(
			'letter-spacing' => '1.5px',
		);
		$css_declarations->add_declarations( $extra_declaration );
		$this->assertSame( array_merge( $input_declarations, $extra_declaration ), $css_declarations->get_declarations() );
	}

	/**
	 * Tests that properties are sanitized before storing.
	 *
	 * @covers ::filter_declaration
	 * @covers ::sanitize_property
	 */
	public function test_should_sanitize_properties() {
		$input_declarations = array(
			'^--wp--style--sleepy-potato$' => '40px',
			'<background-//color>'         => 'var(--wp--preset--english-mustard)',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );

		$this->assertSame(
			array(
				'--wp--style--sleepy-potato' => '40px',
				'background-color'           => 'var(--wp--preset--english-mustard)',
			),
			$css_declarations->get_declarations()
		);
	}

	/**
	 * Test that values are escaped and run the CSS through safecss_filter_attr().
	 *
	 * @covers ::filter_declaration
	 */
	public function test_should_remove_unsafe_properties_and_values() {
		$input_declarations = array(
			'color'        => 'url("https://wordpress.org")',
			'font-size'    => '<red/>',
			'margin-right' => '10em',
			'padding'      => '</style>',
			'potato'       => 'uppercase',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );

		$this->assertSame(
			'margin-right:10em;',
			$css_declarations->get_declarations_string()
		);
	}

	/**
	 * Tests that CSS declarations are compiled into a CSS declarations block string.
	 *
	 * @covers ::get_declarations_string
	 *
	 * @dataProvider data_should_compile_css_declarations_to_css_declarations_string
	 *
	 * @param string $expected        The expected declarations block string.
	 * @param bool   $should_prettify Optional. Whether to pretty the string. Default false.
	 * @param int    $indent_count    Optional. The number of tab indents. Default false.
	 */
	public function test_should_compile_css_declarations_to_css_declarations_string( $expected, $should_prettify = false, $indent_count = 0 ) {
		$input_declarations = array(
			'color'                  => 'red',
			'border-top-left-radius' => '99px',
			'text-decoration'        => 'underline',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );
		$this->assertSame(
			$expected,
			$css_declarations->get_declarations_string( $should_prettify, $indent_count )
		);
	}

	/**
	 * Data provider for test_should_compile_css_declarations_to_css_declarations_string().
	 *
	 * @return array
	 */
	public function data_should_compile_css_declarations_to_css_declarations_string() {
		return array(
			'unprettified, no indent'  => array(
				'expected' => 'color:red;border-top-left-radius:99px;text-decoration:underline;',
			),
			'unprettified, one indent' => array(
				'expected'        => 'color:red;border-top-left-radius:99px;text-decoration:underline;',
				'should_prettify' => false,
				'indent_count'    => 1,
			),
			'prettified, no indent'    => array(
				'expected'        => 'color: red; border-top-left-radius: 99px; text-decoration: underline;',
				'should_prettify' => true,
			),
			'prettified, one indent'   => array(
				'expected'        => "\tcolor: red;\n\tborder-top-left-radius: 99px;\n\ttext-decoration: underline;",
				'should_prettify' => true,
				'indent_count'    => 1,
			),
			'prettified, two indents'  => array(
				'expected'        => "\t\tcolor: red;\n\t\tborder-top-left-radius: 99px;\n\t\ttext-decoration: underline;",
				'should_prettify' => true,
				'indent_count'    => 2,
			),
		);
	}

	/**
	 * Tests that calc, clamp, min, max, and minmax CSS functions are allowed.
	 *
	 * @covers ::filter_declaration
	 * @covers ::get_declarations_string
	 */
	public function test_should_allow_css_functions() {
		$input_declarations = array(
			'background'       => 'var(--wp--preset--color--primary, 10px)', // Simple var().
			'font-size'        => 'clamp(36.00rem, calc(32.00rem + 10.00vw), 40.00rem)', // Nested clamp().
			'width'            => 'min(150vw, 100px)',
			'min-width'        => 'max(150vw, 100px)',
			'max-width'        => 'minmax(400px, 50%)',
			'padding'          => 'calc(80px * -1)',
			'background-image' => 'url("https://wordpress.org")',
			'line-height'      => 'url("https://wordpress.org")',
			'margin'           => 'illegalfunction(30px)',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );

		$this->assertSame(
			'background:var(--wp--preset--color--primary, 10px);font-size:clamp(36.00rem, calc(32.00rem + 10.00vw), 40.00rem);width:min(150vw, 100px);min-width:max(150vw, 100px);max-width:minmax(400px, 50%);padding:calc(80px * -1);background-image:url("https://wordpress.org");',
			$css_declarations->get_declarations_string()
		);
	}

	/**
	 * Tests removing a single declaration.
	 *
	 * @covers ::remove_declaration
	 */
	public function test_should_remove_single_declaration() {
		$input_declarations = array(
			'color'       => 'tomato',
			'margin'      => '10em 10em 20em 1px',
			'font-family' => 'Happy Font serif',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );

		$this->assertSame(
			'color:tomato;margin:10em 10em 20em 1px;font-family:Happy Font serif;',
			$css_declarations->get_declarations_string()
		);

		$css_declarations->remove_declaration( 'color' );
		$this->assertSame(
			'margin:10em 10em 20em 1px;font-family:Happy Font serif;',
			$css_declarations->get_declarations_string()
		);
	}

	/**
	 * Tests removing multiple declarations.
	 *
	 * @covers ::remove_declarations
	 */
	public function test_should_remove_multiple_declarations() {
		$input_declarations = array(
			'color'       => 'cucumber',
			'margin'      => '10em 10em 20em 1px',
			'font-family' => 'Happy Font serif',
		);
		$css_declarations   = new WP_Style_Engine_CSS_Declarations( $input_declarations );

		$this->assertSame(
			'color:cucumber;margin:10em 10em 20em 1px;font-family:Happy Font serif;',
			$css_declarations->get_declarations_string()
		);

		$css_declarations->remove_declarations( array( 'color', 'margin' ) );
		$this->assertSame(
			'font-family:Happy Font serif;',
			$css_declarations->get_declarations_string()
		);
	}
}
