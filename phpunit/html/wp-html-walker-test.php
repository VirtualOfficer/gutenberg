<?php
/**
 * Unit tests covering WP_HTML_Walker functionality.
 *
 * @package WordPress
 * @subpackage HTML
 */

if ( ! function_exists( 'esc_attr' ) ) {
	function esc_attr( $s ) {
		return str_replace( '"', '&quot;', $s );
	}
}

if ( ! class_exists( 'WP_UnitTestCase' ) ) {
	abstract class WP_UnitTestCase extends \PHPUnit\Framework\TestCase {}
}

require_once __DIR__ . '/../../lib/experimental/html/index.php';

/**
 * @group html
 */
class WP_HTML_Walker_Test extends WP_UnitTestCase {
	const HTML_SIMPLE       = '<div id="first"><span id="second">Text</span></div>';
	const HTML_WITH_CLASSES = '<div class="main with-border" id="first"><span class="not-main bold with-border" id="second">Text</span></div>';
	const HTML_MALFORMED    = '<div><span class="d-md-none" Notifications</span><span class="d-none d-md-inline">Back to notifications</span></div>';

	public function test_get_tag_returns_null_before_finding_tags() {
		$w = new WP_HTML_Walker( '<div>Test</div>' );
		$this->assertNull( $w->get_tag() );
	}

	public function test_get_tag_returns_null_when_not_in_open_tag() {
		$w = new WP_HTML_Walker( '<div>Test</div>' );
		$this->assertFalse( $w->next_tag( 'p' ) );
		$this->assertNull( $w->get_tag() );
	}

	public function test_get_tag_returns_open_tag_name() {
		$w = new WP_HTML_Walker( '<div>Test</div>' );
		$this->assertTrue( $w->next_tag( 'div' ) );
		$this->assertSame( 'div', $w->get_tag() );
	}

	public function test_get_tag_returns_raw_open_tag_name() {
		$w = new WP_HTML_Walker( '<DIV>Test</DIV>' );
		$this->assertTrue( $w->next_tag( 'div' ) );
		$this->assertSame( 'DIV', $w->get_tag() );
	}

	public function test_get_attribute_returns_null_before_finding_tags() {
		$w = new WP_HTML_Walker( '<div class="test">Test</div>' );
		$this->assertNull( $w->get_attribute( 'class' ) );
	}

	public function test_get_attribute_returns_null_when_not_in_open_tag() {
		$w = new WP_HTML_Walker( '<div class="test">Test</div>' );
		$this->assertFalse( $w->next_tag( 'p' ) );
		$this->assertNull( $w->get_attribute( 'class' ) );
	}

	public function test_get_attribute_returns_null_when_attribute_missing() {
		$w = new WP_HTML_Walker( '<div class="test">Test</div>' );
		$this->assertTrue( $w->next_tag( 'div' ) );
		$this->assertNull( $w->get_attribute( 'test-id' ) );
	}

	public function test_get_attribute_returns_attribute_value() {
		$w = new WP_HTML_Walker( '<div class="test">Test</div>' );
		$this->assertTrue( $w->next_tag( 'div' ) );
		$this->assertSame( 'test', $w->get_attribute( 'class' ) );
	}

	public function test_get_attribute_returns_true_for_boolean_attribute() {
		$w = new WP_HTML_Walker( '<div enabled class="test">Test</div>' );
		$this->assertTrue( $w->next_tag( array( 'class_name' => 'test' ) ) );
		$this->assertTrue( $w->get_attribute( 'enabled' ) );
	}

	public function test_get_attribute_returns_string_for_truthy_attributes() {
		$w = new WP_HTML_Walker( '<div enabled=enabled checked=1 hidden="true" class="test">Test</div>' );
		$this->assertTrue( $w->next_tag( array() ) );
		$this->assertSame( 'enabled', $w->get_attribute( 'enabled' ) );
		$this->assertSame( '1', $w->get_attribute( 'checked' ) );
		$this->assertSame( 'true', $w->get_attribute( 'hidden' ) );
	}

	/**
	 * @ticket 56299
	 */
	public function test_to_string_with_no_updates_returns_the_original_html() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$this->assertSame( self::HTML_SIMPLE, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_finding_any_existing_tag() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$this->assertTrue( $w->next_tag(), 'Querying an existing tag returns true' );
	}

	/**
	 * @ticket 56299
	 */
	public function test_finding_non_existing_tag() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$this->assertFalse( $w->next_tag( 'p' ), 'Querying a non-existing tag returns false' );
	}

	/**
	 * @ticket 56299
	 */
	public function test_updates_ignored_after_a_non_existing_tag() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$this->assertFalse( $w->next_tag( 'p' ) );
		$this->assertFalse( $w->next_tag( 'div' ) );
		$w->set_attribute( 'id', 'primary' );
		$this->assertSame( self::HTML_SIMPLE, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_set_new_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->set_attribute( 'test-attribute', 'test-value' );
		$this->assertSame( '<div test-attribute="test-value" id="first"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * According to HTML spec, only the first instance of an attribute counts.
	 * The other ones are ignored.
	 *
	 * @ticket 56299
	 */
	public function test_update_first_when_duplicated_attribute() {
		$w = new WP_HTML_Walker( '<div id="update-me" id="ignored-id"><span id="second">Text</span></div>' );
		$w->next_tag();
		$w->set_attribute( 'id', 'updated-id' );
		$this->assertSame( '<div id="updated-id" id="ignored-id"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * Removing an attribute that's listed many times, e.g. `<div id="a" id="b" />` should remove
	 * all its instances and output just `<div />`.
	 *
	 * Today, however, WP_HTML_Walker only removes the first such attribute. It seems like a corner case
	 * and introducing additional complexity to correctly handle this scenario doesn't seem to be worth it.
	 * Let's revisit if and when this becomes a problem.
	 *
	 * This test is in place to confirm this behavior, while incorrect, is well-defined.
	 *
	 * @ticket 56299
	 */
	public function test_remove_first_when_duplicated_attribute() {
		$w = new WP_HTML_Walker( '<div id="update-me" id="ignored-id"><span id="second">Text</span></div>' );
		$w->next_tag();
		$w->remove_attribute( 'id' );
		$this->assertSame( '<div  id="ignored-id"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_set_existing_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->set_attribute( 'id', 'new-id' );
		$this->assertSame( '<div id="new-id"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_update_all_tags_using_a_loop() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		while ( $w->next_tag() ) {
			$w->set_attribute( 'data-foo', 'bar' );
		}

		$this->assertSame( '<div data-foo="bar" id="first"><span data-foo="bar" id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_existing_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->remove_attribute( 'id' );
		$this->assertSame( '<div ><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_ignored_when_non_existing_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->remove_attribute( 'no-such-attribute' );
		$this->assertSame( self::HTML_SIMPLE, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_add_class_when_there_is_no_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->add_class( 'foo-class' );
		$this->assertSame( '<div class="foo-class" id="first"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_add_two_classes_when_there_is_no_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->add_class( 'foo-class' );
		$w->add_class( 'bar-class' );
		$this->assertSame( '<div class="foo-class bar-class" id="first"><span id="second">Text</span></div>', (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_class_when_there_is_no_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_SIMPLE );
		$w->next_tag();
		$w->remove_class( 'foo-class' );
		$this->assertSame( self::HTML_SIMPLE, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_add_class_when_there_is_a_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->add_class( 'foo-class' );
		$w->add_class( 'bar-class' );
		$this->assertSame(
			'<div class="main with-border foo-class bar-class" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_class_when_there_is_a_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->remove_class( 'main' );
		$this->assertSame(
			'<div class=" with-border" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_removing_all_classes_removes_the_class_attribute() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->remove_class( 'main' );
		$w->remove_class( 'with-border' );
		$this->assertSame(
			'<div  id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_does_not_add_duplicate_class_names() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->add_class( 'with-border' );
		$this->assertSame(
			'<div class="main with-border" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_preserves_class_name_order_when_a_duplicate_class_name_is_added() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->add_class( 'main' );
		$this->assertSame(
			'<div class="main with-border" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_add_class_when_there_is_a_class_attribute_with_excessive_whitespaces() {
		$w = new WP_HTML_Walker(
			'<div class="   main   with-border   " id="first"><span class="not-main bold with-border" id="second">Text</span></div>'
		);
		$w->next_tag();
		$w->add_class( 'foo-class' );
		$this->assertSame(
			'<div class="   main   with-border foo-class" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_class_when_there_is_a_class_attribute_with_excessive_whitespaces() {
		$w = new WP_HTML_Walker(
			'<div class="   main   with-border   " id="first"><span class="not-main bold with-border" id="second">Text</span></div>'
		);
		$w->next_tag();
		$w->remove_class( 'with-border' );
		$this->assertSame(
			'<div class="   main" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_remove_all_classes_when_there_is_a_class_attribute_with_excessive_whitespaces() {
		$w = new WP_HTML_Walker(
			'<div class="   main   with-border   " id="first"><span class="not-main bold with-border" id="second">Text</span></div>'
		);
		$w->next_tag();
		$w->remove_class( 'main' );
		$w->remove_class( 'with-border' );
		$this->assertSame(
			'<div  id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_set_attribute_takes_priority_over_add_class() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->add_class( 'add_class' );
		$w->set_attribute( 'class', 'set_attribute' );
		$this->assertSame(
			'<div class="set_attribute" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);

		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->set_attribute( 'class', 'set_attribute' );
		$w->add_class( 'add_class' );
		$this->assertSame(
			'<div class="set_attribute" id="first"><span class="not-main bold with-border" id="second">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_throws_no_exception_when_updating_an_attribute_without_matching_a_tag() {
		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->set_attribute( 'id', 'first' );
		$this->assertSame( self::HTML_WITH_CLASSES, (string) $w );
	}

	/**
	 * @ticket 56299
	 *
	 * @dataProvider data_parser_methods
	 */
	public function test_interactions_with_a_closed_walker_throw_an_exception( $method, $args ) {
		$this->expectException( WP_HTML_Walker_Exception::class );
		$this->expectExceptionMessage( 'WP_HTML_Walker was already cast to a string' );

		$w = new WP_HTML_Walker( self::HTML_WITH_CLASSES );
		$w->next_tag();
		$w->__toString(); // Force the walker to get to the end of the document.

		$w->$method( ...$args );
	}

	/**
	 * Data provider for test_interactions_with_a_closed_walker_throw_an_exception().
	 *
	 * @return array {
	 *     @type array {
	 *         @type string $method The name of the method to execute.
	 *         @type array  $args   The arguments passed to the method.
	 *     }
	 * }
	 */
	public function data_parser_methods() {
		return array(
			array( 'next_tag', array( 'div' ) ),
			array( 'set_attribute', array( 'id', 'test' ) ),
			array( 'remove_attribute', array( 'id' ) ),
			array( 'add_class', array( 'main' ) ),
			array( 'remove_class', array( 'main' ) ),
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_advanced_use_case() {
		$input = <<<HTML
<div selected class="merge-message" checked>
	<div class="select-menu d-inline-block">
		<div checked class="BtnGroup MixedCaseHTML position-relative" />
		<div checked class="BtnGroup MixedCaseHTML position-relative">
			<button type="button" class="merge-box-button btn-group-merge rounded-left-2 btn  BtnGroup-item js-details-target hx_create-pr-button" aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Merge pull request
			</button>

			<button type="button" class="merge-box-button btn-group-squash rounded-left-2 btn  BtnGroup-item js-details-target hx_create-pr-button" aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Squash and merge
			</button>

			<button type="button" class="merge-box-button btn-group-rebase rounded-left-2 btn  BtnGroup-item js-details-target hx_create-pr-button" aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Rebase and merge
			</button>

			<button aria-label="Select merge method" disabled="disabled" type="button" data-view-component="true" class="select-menu-button btn BtnGroup-item"></button>
		</div>
	</div>
</div>
HTML;

		$expected_output = <<<HTML
<div data-details="{ &quot;key&quot;: &quot;value&quot; }" selected class="merge-message is-processed" checked>
	<div class="select-menu d-inline-block">
		<div checked class=" MixedCaseHTML position-relative button-group Another-Mixed-Case" />
		<div checked class=" MixedCaseHTML position-relative button-group Another-Mixed-Case">
			<button type="button" class="merge-box-button btn-group-merge rounded-left-2 btn  BtnGroup-item js-details-target hx_create-pr-button" aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Merge pull request
			</button>

			<button type="button" class="merge-box-button btn-group-squash rounded-left-2 btn  BtnGroup-item js-details-target hx_create-pr-button" aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Squash and merge
			</button>

			<button type="button"  aria-expanded="false" data-details-container=".js-merge-pr" disabled="">
			  Rebase and merge
			</button>

			<button aria-label="Select merge method" disabled="disabled" type="button" data-view-component="true" class="select-menu-button btn BtnGroup-item"></button>
		</div>
	</div>
</div>
HTML;

		$w = new WP_HTML_Walker( $input );
		$this->assertTrue( $w->next_tag( 'div' ) );
		$w->set_attribute( 'data-details', '{ "key": "value" }' );
		$w->add_class( 'is-processed' );
		$this->assertTrue(
			$w->next_tag(
				array(
					'tag_name'   => 'div',
					'class_name' => 'BtnGroup',
				)
			)
		);
		$w->remove_class( 'BtnGroup' );
		$w->add_class( 'button-group' );
		$w->add_class( 'Another-Mixed-Case' );
		$this->assertTrue(
			$w->next_tag(
				array(
					'tag_name'   => 'div',
					'class_name' => 'BtnGroup',
				)
			)
		);
		$w->remove_class( 'BtnGroup' );
		$w->add_class( 'button-group' );
		$w->add_class( 'Another-Mixed-Case' );
		$this->assertTrue(
			$w->next_tag(
				array(
					'tag_name'     => 'button',
					'class_name'   => 'btn',
					'match_offset' => 3,
				)
			)
		);
		$w->remove_attribute( 'class' );
		$this->assertFalse( $w->next_tag( 'non-existent' ) );
		$w->set_attribute( 'class', 'test' );
		$this->assertSame( $expected_output, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_works_with_single_quote_marks() {
		$w = new WP_HTML_Walker(
			'<div id=\'first\'><span id=\'second\'>Text</span></div>'
		);
		$w->next_tag(
			array(
				'tag_name' => 'div',
				'id'       => 'first',
			)
		);
		$w->remove_attribute( 'id' );
		$w->next_tag(
			array(
				'tag_name' => 'span',
				'id'       => 'second',
			)
		);
		$w->set_attribute( 'id', 'single-quote' );
		$this->assertSame(
			'<div ><span id="single-quote">Text</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_adds_boolean_attributes() {
		$w = new WP_HTML_Walker(
			'<form action="/action_page.php"><input type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>'
		);
		$w->next_tag( 'input' );
		$w->set_attribute( 'checked', true );
		$this->assertSame(
			'<form action="/action_page.php"><input checked type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_removes_boolean_attributes_when_false_passed() {
		$w = new WP_HTML_Walker(
			'<form action="/action_page.php"><input checked type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>'
		);
		$w->next_tag( 'input' );
		$w->set_attribute( 'checked', false );
		$this->assertSame(
			'<form action="/action_page.php"><input  type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_does_nothing_when_no_boolean_attribute_and_false_passed() {
		$html_input = '<form action="/action_page.php"><input type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>';
		$w          = new WP_HTML_Walker( $html_input );
		$w->next_tag( 'input' );
		$w->set_attribute( 'checked', false );
		$this->assertSame( $html_input, (string) $w );
	}

	/**
	 * @ticket 56299
	 */
	public function test_updates_boolean_attributes_when_string_passed() {
		$w = new WP_HTML_Walker(
			'<form action="/action_page.php"><input checked type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>'
		);
		$w->next_tag( 'input' );
		$w->set_attribute( 'checked', 'checked' );
		$this->assertSame(
			'<form action="/action_page.php"><input checked="checked" type="checkbox" name="vehicle" value="Bike"><label for="vehicle">I have a bike</label></form>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_works_with_wrongly_nested_tags() {
		$w = new WP_HTML_Walker(
			'<span>123<p>456</span>789</p>'
		);
		$w->next_tag( 'span' );
		$w->set_attribute( 'class', 'span-class' );
		$w->next_tag( 'p' );
		$w->set_attribute( 'class', 'p-class' );
		$this->assertSame(
			'<span class="span-class">123<p class="p-class">456</span>789</p>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_updates_attributes_in_malformed_html() {
		$w = new WP_HTML_Walker( self::HTML_MALFORMED );
		$w->next_tag( 'span' );
		$w->set_attribute( 'id', 'first' );
		$w->next_tag( 'span' );
		$w->set_attribute( 'id', 'second' );
		$this->assertSame(
			'<div><span id="first" class="d-md-none" Notifications</span><span id="second" class="d-none d-md-inline">Back to notifications</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_removes_attributes_in_malformed_html() {
		$w = new WP_HTML_Walker( self::HTML_MALFORMED );
		$w->next_tag( 'span' );
		$w->remove_attribute( 'Notifications<' );
		$this->assertSame(
			'<div><span class="d-md-none" /span><span class="d-none d-md-inline">Back to notifications</span></div>',
			(string) $w
		);
	}

	/**
	 * @ticket 56299
	 */
	public function test_unclosed_script_tag_should_not_cause_an_infinite_loop() {
		$w = new WP_HTML_Walker( '<script>' );
		$w->next_tag();
		$this->assertSame( 'script', $w->get_tag() );
		$w->next_tag();
	}

	/**
	 * @ticket 56299
	 * @dataProvider data_script_state
	 */
	public function test_ignores_contents_of_a_script_tag( $script_then_div ) {
		$w = new WP_HTML_Walker( $script_then_div );
		$w->next_tag();
		$this->assertSame( 'script', $w->get_tag() );
		$w->next_tag();
		$this->assertSame( 'div', $w->get_tag() );
	}

	public function data_script_state() {
		$examples = array();

		$examples['Simple script tag'] = array(
			'<script><span class="d-none d-md-inline">Back to notifications</span></script><div></div>',
		);

		$examples['Simple uppercase script tag'] = array(
			'<script><span class="d-none d-md-inline">Back to notifications</span></SCRIPT><div></div>',
		);

		$examples['Script with a comment opener inside should end at the next script tag closer (dash dash escaped state)'] = array(
			'<script class="d-md-none"><!--</script><div></div>-->',
		);

		$examples['Script with a comment opener and a script tag opener inside should end two script tag closer later (double escaped state)'] = array(
			'<script class="d-md-none"><!--<script><span></script><span></span></script><div></div>-->',
		);

		$examples['Double escaped script with a tricky opener'] = array(
			'<script class="d-md-none"><!--<script attr="</script>"></script>"><div></div>',
		);

		$examples['Double escaped script with a tricky closer'] = array(
			'<script class="d-md-none"><!--<script><span></script attr="</script>"><div></div>',
		);

		$examples['Double escaped, then escaped, then double escaped'] = array(
			'<script class="d-md-none"><!--<script></script><script></script><span></span></script><div></div>',
		);

		$examples['Script with a commented a script tag opener inside should at the next tag closer (dash dash escaped state)'] = array(
			'<script class="d-md-none"><!--<script>--><span></script><div></div>-->',
		);

		$examples['Script closer with another script tag in closer attributes'] = array(
			'<script><span class="d-none d-md-inline">Back to notifications</title</span></script <script><div></div>',
		);

		$examples['Script closer with attributes'] = array(
			'<script class="d-md-none"><span class="d-none d-md-inline">Back to notifications</span></script id="test"><div></div>',
		);

		$examples['Script opener with title closer inside'] = array(
			'<script class="d-md-none"></title></script><div></div>',
		);

		$examples['Complex script with many parsing states'] = array(
			'<script class="d-md-none"><!--<script>--><scRipt><span><!--<span><Script</script>--></scripT><div></div>-->',
		);
		return $examples;
	}

	/**
	 * @ticket 56299
	 * @dataProvider data_rcdata_state
	 */
	public function test_ignores_contents_of_a_rcdata_tag( $rcdata_then_div, $rcdata_tag ) {
		$w = new WP_HTML_Walker( $rcdata_then_div );
		$w->next_tag();
		$this->assertSame( $rcdata_tag, $w->get_tag() );
		$w->next_tag();
		$this->assertSame( 'div', $w->get_tag() );
	}

	public function data_rcdata_state() {
		$examples                    = array();
		$examples['Simple textarea'] = array(
			'<textarea><span class="d-none d-md-inline">Back to notifications</span></textarea><div></div>',
			'textarea',
		);

		$examples['Simple title'] = array(
			'<title><span class="d-none d-md-inline">Back to notifications</title</span></title><div></div>',
			'title',
		);

		$examples['Comment opener inside a textarea tag should be ignored'] = array(
			'<textarea class="d-md-none"><!--</textarea><div></div>-->',
			'textarea',
		);

		$examples['Textarea closer with another textarea tag in closer attributes'] = array(
			'<textarea><span class="d-none d-md-inline">Back to notifications</title</span></textarea <textarea><div></div>',
			'textarea',
		);

		$examples['Textarea closer with attributes'] = array(
			'<textarea class="d-md-none"><span class="d-none d-md-inline">Back to notifications</span></textarea id="test"><div></div>',
			'textarea',
		);

		$examples['Textarea opener with title closer inside'] = array(
			'<textarea class="d-md-none"></title></textarea><div></div>',
			'textarea',
		);
		return $examples;
	}

	/**
	 * @ticket 56299
	 * @dataProvider data_malformed_tag
	 */
	public function test_updates_when_malformed_tag( $html_input, $html_expected ) {
		$w = new WP_HTML_Walker( $html_input );
		$w->next_tag();
		$w->set_attribute( 'foo', 'bar' );
		$w->add_class( 'firstTag' );
		$w->next_tag( 'span' );
		$w->add_class( 'secondTag' );
		$this->assertSame(
			$html_expected,
			(string) $w
		);
	}

	public function data_malformed_tag() {
		$null_byte = chr( 0 );
		$examples  = array();
		$examples['Invalid entity inside attribute value'] = array(
			'<img src="https://s0.wp.com/i/atat.png" title="&; First &lt;title&gt; is &notit;" TITLE="seoncd title" title="An Imperial &imperial; AT-AT"><span>test</span>',
			'<img foo="bar" class="firstTag" src="https://s0.wp.com/i/atat.png" title="&; First &lt;title&gt; is &notit;" TITLE="seoncd title" title="An Imperial &imperial; AT-AT"><span class="secondTag">test</span>',
		);

		$examples['HTML tag opening inside attribute value'] = array(
			'<pre id="<code" class="wp-block-code <code is poetry&gt;"><code>This &lt;is> a &lt;strong is="true">thing.</code></pre><span>test</span>',
			'<pre foo="bar" id="<code" class="wp-block-code <code is poetry&gt; firstTag"><code>This &lt;is> a &lt;strong is="true">thing.</code></pre><span class="secondTag">test</span>',
		);

		$examples['HTML tag brackets in attribute values and data markup'] = array(
			'<pre id="<code-&gt;-block-&gt;" class="wp-block-code <code is poetry&gt;"><code>This &lt;is> a &lt;strong is="true">thing.</code></pre><span>test</span>',
			'<pre foo="bar" id="<code-&gt;-block-&gt;" class="wp-block-code <code is poetry&gt; firstTag"><code>This &lt;is> a &lt;strong is="true">thing.</code></pre><span class="secondTag">test</span>',
		);

		$examples['Single and double quotes in attribute value'] = array(
			'<p title="Demonstrating how to use single quote (\') and double quote (&quot;)"><span>test</span>',
			'<p foo="bar" class="firstTag" title="Demonstrating how to use single quote (\') and double quote (&quot;)"><span class="secondTag">test</span>',
		);

		$examples['Unquoted attribute values'] = array(
			'<hr a=1 a=2 a=3 a=5 /><span>test</span>',
			'<hr foo="bar" class="firstTag" a=1 a=2 a=3 a=5 /><span class="secondTag">test</span>',
		);

		$examples['Double-quotes escaped in double-quote attribute value'] = array(
			'<hr title="This is a &quot;double-quote&quot;"><span>test</span>',
			'<hr foo="bar" class="firstTag" title="This is a &quot;double-quote&quot;"><span class="secondTag">test</span>',
		);

		$examples['Unquoted attribute value'] = array(
			'<hr id=code><span>test</span>',
			'<hr foo="bar" class="firstTag" id=code><span class="secondTag">test</span>',
		);

		$examples['Unquoted attribute value with tag-like value'] = array(
			'<hr id= 	<code> ><span>test</span>',
			'<hr foo="bar" class="firstTag" id= 	<code> ><span class="secondTag">test</span>',
		);

		$examples['Unquoted attribute value with tag-like value followed by tag-like data'] = array(
			'<hr id=code>><span>test</span>',
			'<hr foo="bar" class="firstTag" id=code>><span class="secondTag">test</span>',
		);

		$examples['1'] = array(
			'<hr id=&quo;code><span>test</span>',
			'<hr foo="bar" class="firstTag" id=&quo;code><span class="secondTag">test</span>',
		);

		$examples['2'] = array(
			'<hr id/test=5><span>test</span>',
			'<hr foo="bar" class="firstTag" id/test=5><span class="secondTag">test</span>',
		);

		$examples['4'] = array(
			'<hr title="<hr>"><span>test</span>',
			'<hr foo="bar" class="firstTag" title="<hr>"><span class="secondTag">test</span>',
		);

		$examples['5'] = array(
			'<hr id=>code><span>test</span>',
			'<hr foo="bar" class="firstTag" id=>code><span class="secondTag">test</span>',
		);

		$examples['6'] = array(
			'<hr id"quo="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" id"quo="test"><span class="secondTag">test</span>',
		);

		$examples['7'] = array(
			'<hr id' . $null_byte . 'zero="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" id' . $null_byte . 'zero="test"><span class="secondTag">test</span>',
		);

		$examples['8'] = array(
			'<hr >id="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" >id="test"><span class="secondTag">test</span>',
		);

		$examples['9'] = array(
			'<hr =id="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" =id="test"><span class="secondTag">test</span>',
		);

		$examples['10'] = array(
			'</><span>test</span>',
			'</><span foo="bar" class="firstTag">test</span>',
		);

		$examples['11'] = array(
			'The applicative operator <* works well in Haskell; <data-tag> is what?<span>test</span>',
			'The applicative operator <* works well in Haskell; <data-tag foo="bar" class="firstTag"> is what?<span class="secondTag">test</span>',
		);

		$examples['12'] = array(
			'<3 is a heart but <t3> is a tag.<span>test</span>',
			'<3 is a heart but <t3 foo="bar" class="firstTag"> is a tag.<span class="secondTag">test</span>',
		);

		$examples['13'] = array(
			'<?comment --><span>test</span>',
			'<?comment --><span foo="bar" class="firstTag">test</span>',
		);

		$examples['14'] = array(
			'<!-- this is a comment. no <strong>tags</strong> allowed --><span>test</span>',
			'<!-- this is a comment. no <strong>tags</strong> allowed --><span foo="bar" class="firstTag">test</span>',
		);

		$examples['15'] = array(
			'<![CDATA[This <is> a <strong id="yes">HTML Tag</strong>]]><span>test</span>',
			'<![CDATA[This <is> a <strong id="yes">HTML Tag</strong>]]><span foo="bar" class="firstTag">test</span>',
		);

		$examples['16'] = array(
			'<hr ===name="value"><span>test</span>',
			'<hr foo="bar" class="firstTag" ===name="value"><span class="secondTag">test</span>',
		);

		$examples['17'] = array(
			'<hr asdf="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" asdf="test"><span class="secondTag">test</span>',
		);

		$examples['18'] = array(
			'<hr =asdf="tes"><span>test</span>',
			'<hr foo="bar" class="firstTag" =asdf="tes"><span class="secondTag">test</span>',
		);

		$examples['19'] = array(
			'<hr ==="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" ==="test"><span class="secondTag">test</span>',
		);

		$examples['20'] = array(
			'<hr =><span>test</span>',
			'<hr foo="bar" class="firstTag" =><span class="secondTag">test</span>',
		);

		$examples['21'] = array(
			'<hr =5><span>test</span>',
			'<hr foo="bar" class="firstTag" =5><span class="secondTag">test</span>',
		);

		$examples['22'] = array(
			'<hr ==><span>test</span>',
			'<hr foo="bar" class="firstTag" ==><span class="secondTag">test</span>',
		);

		$examples['23'] = array(
			'<hr ===><span>test</span>',
			'<hr foo="bar" class="firstTag" ===><span class="secondTag">test</span>',
		);

		$examples['24'] = array(
			'<hr disabled><span>test</span>',
			'<hr foo="bar" class="firstTag" disabled><span class="secondTag">test</span>',
		);

		$examples['25'] = array(
			'<hr a"sdf="test"><span>test</span>',
			'<hr foo="bar" class="firstTag" a"sdf="test"><span class="secondTag">test</span>',
		);

		$examples['26'] = array(
			'<hr id=">"code<span>test</span>',
			'<hr foo="bar" class="firstTag" id=">"code<span>test</span>',
		);

		$examples['27'] = array(
			'<hr id="value>"code<span>test</span>',
			'<hr foo="bar" class="firstTag" id="value>"code<span>test</span>',
		);

		$examples['28'] = array(
			'<hr id="/>"code<span>test</span>',
			'<hr foo="bar" class="firstTag" id="/>"code<span>test</span>',
		);

		$examples['29'] = array(
			'<hr id="value/>"code<span>test</span>',
			'<hr foo="bar" class="firstTag" id="value/>"code<span>test</span>',
		);

		$examples['30'] = array(
			'<hr id   =5><span>test</span>',
			'<hr foo="bar" class="firstTag" id   =5><span class="secondTag">test</span>',
		);

		$examples['31'] = array(
			'<hr id a  =5><span>test</span>',
			'<hr foo="bar" class="firstTag" id a  =5><span class="secondTag">test</span>',
		);

		return $examples;
	}
}
