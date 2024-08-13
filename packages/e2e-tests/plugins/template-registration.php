<?php
/**
 * Plugin Name: Gutenberg Test Template Registration
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-template-registration
 */

add_action(
	'init',
	function () {
		// Custom template used by most tests.
		wp_register_template(
			'gutenberg//plugin-template',
			array(
				'title'       => 'Plugin Template',
				'description' => 'A template registered by a plugin.',
				'content'     => '<!-- wp:template-part {"slug":"header","tagName":"header"} /--><!-- wp:group {"tagName":"main","layout":{"inherit":true}} --><main class="wp-block-group"><!-- wp:paragraph --><p>This is a plugin-registered template.</p><!-- /wp:paragraph --></main><!-- /wp:group -->',
				'post_types'  => array( 'post' ),
			)
		);
		add_action(
			'category_template_hierarchy',
			function () {
				return array( 'plugin-template' );
			}
		);

		// Custom template overridden by the theme.
		wp_register_template(
			'gutenberg//custom-template',
			array(
				'title'       => 'Custom Template (overridden by the theme)',
				'description' => 'A custom template registered by a plugin and overridden by a theme.',
				'content'     => '<!-- wp:template-part {"slug":"header","tagName":"header"} /--><!-- wp:group {"tagName":"main","layout":{"inherit":true}} --><main class="wp-block-group"><!-- wp:paragraph --><p>This is a plugin-registered template and overridden by a theme.</p><!-- /wp:paragraph --></main><!-- /wp:group -->',
				'post_types'  => array( 'post' ),
			)
		);

		// Custom template used to test unregistration.
		wp_register_template(
			'gutenberg//custom-unregistered-template',
			array(
				'title'       => 'Custom Unregistered Template',
				'description' => 'A custom template that is unregistered.',
				'content'     => '<!-- wp:template-part {"slug":"header","tagName":"header"} /--><!-- wp:group {"tagName":"main","layout":{"inherit":true}} --><main class="wp-block-group"><!-- wp:paragraph --><p>This is a plugin-registered template that is also unregistered.</p><!-- /wp:paragraph --></main><!-- /wp:group -->',
			)
		);
		wp_unregister_template( 'gutenberg//custom-unregistered-template' );

		// Custom template used to test overriding default WP templates.
		wp_register_template(
			'gutenberg//page',
			array(
				'title'       => 'Custom Page Template',
				'description' => 'A custom page template.',
				'content'     => '<!-- wp:template-part {"slug":"header","tagName":"header"} /--><!-- wp:group {"tagName":"main","layout":{"inherit":true}} --><main class="wp-block-group"><!-- wp:paragraph --><p>This is a plugin-registered page template.</p><!-- /wp:paragraph --></main><!-- /wp:group -->',
			)
		);

		// Custom template used to test overriding default WP templates which can be created by the user.
		wp_register_template(
			'gutenberg//author-admin',
			array(
				'title'       => 'Custom Author Template',
				'description' => 'A custom author template.',
				'content'     => '<!-- wp:template-part {"slug":"header","tagName":"header"} /--><!-- wp:group {"tagName":"main","layout":{"inherit":true}} --><main class="wp-block-group"><!-- wp:paragraph --><p>This is a plugin-registered author template.</p><!-- /wp:paragraph --></main><!-- /wp:group -->',
			)
		);
	}
);
