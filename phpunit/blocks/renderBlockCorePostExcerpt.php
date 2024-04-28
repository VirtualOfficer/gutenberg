<?php
/**
 * Post Excerpt rendering tests.
 *
 * @package WordPress
 * @subpackage Blocks
 * @covers ::gutenberg_render_block_core_post_excerpt
 * @group blocks
 */
class Tests_Blocks_RenderBlockCorePostExcerpt extends WP_UnitTestCase {

	/**
	 * Post object with data.
	 *
	 * @var array
	 */
	protected static $post;

	/**
	 * Array of Attributes.
	 *
	 * @var int
	 */
	protected static $attributes;

	/**
	 * Setup method.
	 *
	 * @param WP_UnitTest_Factory $factory Helper that lets us create fake data.
	 */
	public static function wpSetUpBeforeClass( WP_UnitTest_Factory $factory ) {

		self::$post = $factory->post->create_and_get(
			array(
				'post_title'   => 'Post Expert block Unit Test',
				'post_excerpt' => 'Post Expert content',
			)
		);

		self::$attributes = array(
			'moreText'      => '',
			'excerptLength' => 55,
		);

		$block = array(
			'blockName'    => 'core/post-excerpt',
			'attrs'        => array(
				'moreText' => '',
			),
			'innerBlock'   => array(),
			'innerContent' => array(),
			'innerHTML'    => array(),
		);

		WP_Block_Supports::init();
		WP_Block_Supports::$block_to_render = $block;
	}

	/**
	 * Tear down method.
	 */
	public static function wpTearDownAfterClass() {
		wp_delete_post( self::$post->ID, true );
	}

	/**
	 * Test gutenberg_render_block_core_post_excerpt() method
	 * with empty data.
	 */
	public function test_gutenberg_render_block_core_post_excerpt_empty() {
		$block = new stdClass();

		// call render method with block context.
		$rendered = gutenberg_render_block_core_post_excerpt( self::$attributes, '', $block );
		$this->assertEmpty( $rendered, 'Failed to assert that $rendered is empty.' );
	}

	/**
	 * Test gutenberg_render_block_core_post_excerpt() method.
	 */
	public function test_gutenberg_render_block_core_post_excerpt() {

		$block           = new stdClass();
		$GLOBALS['post'] = self::$post;
		$block->context  = array( 'postId' => self::$post->ID );

		$rendered = gutenberg_render_block_core_post_excerpt( self::$attributes, '', $block );
		$this->assertNotEmpty( $rendered, 'Failed to assert the $rendered is not empty.' );
		$this->assertStringContainsString(
			'Post Expert content',
			$rendered,
			'Failed to assert that $rendered contain expected string.'
		);
		$this->assertStringContainsString(
			'</p',
			$rendered,
			'Failed to assert that $rendered contain html paragraph tag.'
		);
		$this->assertStringContainsString(
			'</p>',
			$rendered,
			'Failed to assert that $rendered contain html paragraph tag.'
		);
		$this->assertStringContainsString(
			'wp-block-post-excerpt__excerpt',
			$rendered,
			'Failed to assert that $rendered contain expected string.'
		);
		$this->assertStringNotContainsString(
			'has-text-align',
			$rendered,
			'Failed to assert that $rendered doest not contain text align class.'
		);

		self::$attributes['textAlign'] = 'left';

		$rendered = gutenberg_render_block_core_post_excerpt( self::$attributes, '', $block );
		$this->assertStringContainsString(
			'has-text-align-left',
			$rendered,
			'Failed to assert that $rendered contain text align class.'
		);

		self::$attributes = array(
			'moreText'      => 'Read More',
			'excerptLength' => 55,
		);

		$rendered = gutenberg_render_block_core_post_excerpt( self::$attributes, '', $block );
		$this->assertStringContainsString(
			'wp-block-post-excerpt__more-link',
			$rendered,
			'Failed to assert that $rendered contain expected string.'
		);

		self::$attributes = array(
			'moreText'          => 'Read More',
			'showMoreOnNewLine' => true,
		);
		$this->assertStringContainsString(
			'wp-block-post-excerpt__more-link',
			$rendered,
			'Failed to assert that $rendered contain expected string.'
		);
		$this->assertStringContainsString(
			get_permalink( self::$post->ID ),
			$rendered,
			'Failed to assert that $rendered contain expected post url.'
		);
	}
}
