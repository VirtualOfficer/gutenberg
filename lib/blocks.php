<?php
/**
 * Block and style registration functions.
 *
 * @package gutenberg
 */

/**
 * Substitutes the implementation of a core-registered block type, if exists,
 * with the built result from the plugin.
 */
function gutenberg_reregister_core_block_types() {
	// Blocks directory may not exist if working from a fresh clone.
	$blocks_dir = dirname( __FILE__ ) . '/../build/block-library/blocks/';
	if ( ! file_exists( $blocks_dir ) ) {
		return;
	}

	$block_folders = array(
		'audio',
		'button',
		'buttons',
		'classic',
		'code',
		'column',
		'columns',
		'file',
		'gallery',
		'group',
		'heading',
		'html',
		'image',
		'list',
		'media-text',
		'missing',
		'more',
		'navigation-link',
		'nextpage',
		'paragraph',
		'preformatted',
		'pullquote',
		'quote',
		'separator',
		'social-links',
		'spacer',
		'subhead',
		'table',
		'text-columns',
		'verse',
		'video',
		'widget-area',
	);

	$block_names = array(
		'archives.php'        => 'core/archives',
		'block.php'           => 'core/block',
		'calendar.php'        => 'core/calendar',
		'categories.php'      => 'core/categories',
		'cover.php'           => 'core/cover',
		'latest-comments.php' => 'core/latest-comments',
		'latest-posts.php'    => 'core/latest-posts',
		'legacy-widget.php'   => 'core/legacy-widget',
		'navigation.php'      => 'core/navigation',
		'rss.php'             => 'core/rss',
		'search.php'          => 'core/search',
		'shortcode.php'       => 'core/shortcode',
		'social-link.php'     => 'core/social-link',
		'tag-cloud.php'       => 'core/tag-cloud',
	);

	if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
		$block_names = array_merge(
			$block_names,
			array(
				'post-author.php'         => 'core/post-author',
				'post-comments.php'       => 'core/post-comments',
				'post-comments-count.php' => 'core/post-comments-count',
				'post-comments-form.php'  => 'core/post-comments-form',
				'post-content.php'        => 'core/post-content',
				'post-date.php'           => 'core/post-date',
				'post-excerpt.php'        => 'core/post-excerpt',
				'post-featured-image.php' => 'core/post-featured-image',
				'post-tags.php'           => 'core/post-tags',
				'post-title.php'          => 'core/post-title',
				'query.php'               => 'core/query',
				'query-loop.php'          => 'core/query-loop',
				'query-pagination.php'    => 'core/query-pagination',
				'site-title.php'          => 'core/site-title',
				'template-part.php'       => 'core/template-part',
			)
		);
	}

	$registry = WP_Block_Type_Registry::get_instance();

	foreach ( $block_folders as $folder_name ) {
		$block_json_file = $blocks_dir . '/' . $folder_name . '/block.json';
		if ( ! file_exists( $block_json_file ) ) {
			return;
		}

		// Ideally, all paths to block metadata files should be listed in
		// WordPress core. In this place we should rather use filter
		// to replace paths with overrides defined by the plugin.
		$metadata = json_decode( file_get_contents( $block_json_file ), true );
		if ( ! is_array( $metadata ) || ! $metadata['name'] ) {
			return false;
		}

		if ( $registry->is_registered( $metadata['name'] ) ) {
			$registry->unregister( $metadata['name'] );
		}

		register_block_type_from_metadata( $block_json_file );
	}

	foreach ( $block_names as $file => $block_names ) {
		if ( ! file_exists( $blocks_dir . $file ) ) {
			return;
		}

		if ( is_string( $block_names ) ) {
			if ( $registry->is_registered( $block_names ) ) {
				$registry->unregister( $block_names );
			}
		} elseif ( is_array( $block_names ) ) {
			foreach ( $block_names as $block_name ) {
				if ( $registry->is_registered( $block_name ) ) {
					$registry->unregister( $block_name );
				}
			}
		}

		require $blocks_dir . $file;
	}
}
add_action( 'init', 'gutenberg_reregister_core_block_types' );

/**
 * Complements the implementation of block type `core/social-icon`, whether it
 * be provided by core or the plugin, with derived block types for each
 * "service" (WordPress, Twitter, etc.) supported by Social Links.
 *
 * This ensures backwards compatibility for any users running the Gutenberg
 * plugin who have used Social Links prior to their conversion to block
 * variations.
 *
 * This shim is INTENTIONALLY left out of core, as Social Links haven't yet
 * landed there.
 *
 * @see https://github.com/WordPress/gutenberg/pull/19887
 */
function gutenberg_register_legacy_social_link_blocks() {
	$services = array(
		'amazon',
		'bandcamp',
		'behance',
		'chain',
		'codepen',
		'deviantart',
		'dribbble',
		'dropbox',
		'etsy',
		'facebook',
		'feed',
		'fivehundredpx',
		'flickr',
		'foursquare',
		'goodreads',
		'google',
		'github',
		'instagram',
		'lastfm',
		'linkedin',
		'mail',
		'mastodon',
		'meetup',
		'medium',
		'pinterest',
		'pocket',
		'reddit',
		'skype',
		'snapchat',
		'soundcloud',
		'spotify',
		'tumblr',
		'twitch',
		'twitter',
		'vimeo',
		'vk',
		'wordpress',
		'yelp',
		'youtube',
	);

	foreach ( $services as $service ) {
		register_block_type(
			'core/social-link-' . $service,
			array(
				'category'        => 'widgets',
				'attributes'      => array(
					'url'     => array(
						'type' => 'string',
					),
					'service' => array(
						'type'    => 'string',
						'default' => $service,
					),
					'label'   => array(
						'type' => 'string',
					),
				),
				'render_callback' => 'gutenberg_render_block_core_social_link',
			)
		);
	}
}
add_action( 'init', 'gutenberg_register_legacy_social_link_blocks' );

if ( ! function_exists( 'register_block_style' ) ) {
	/**
	 * Registers a new block style.
	 *
	 * @param string $block_name       Block type name including namespace.
	 * @param array  $style_properties Array containing the properties of the style name, label, style (name of the stylesheet to be enqueued), inline_style (string containing the CSS to be added).
	 *
	 * @return boolean True if the block style was registered with success and false otherwise.
	 */
	function register_block_style( $block_name, $style_properties ) {
		return WP_Block_Styles_Registry::get_instance()->register( $block_name, $style_properties );
	}
}

if ( ! function_exists( 'unregister_block_style' ) ) {
	/**
	 * Unregisters a block style.
	 *
	 * @param string $block_name       Block type name including namespace.
	 * @param array  $block_style_name Block style name.
	 *
	 * @return boolean True if the block style was unregistered with success and false otherwise.
	 */
	function unregister_block_style( $block_name, $block_style_name ) {
		return WP_Block_Styles_Registry::get_instance()->unregister( $block_name, $block_style_name );
	}
}

if ( ! has_action( 'enqueue_block_assets', 'enqueue_block_styles_assets' ) ) {
	/**
	 * Function responsible for enqueuing the styles required for block styles functionality on the editor and on the frontend.
	 */
	function gutenberg_enqueue_block_styles_assets() {
		$block_styles = WP_Block_Styles_Registry::get_instance()->get_all_registered();

		foreach ( $block_styles as $styles ) {
			foreach ( $styles as $style_properties ) {
				if ( isset( $style_properties['style_handle'] ) ) {
					wp_enqueue_style( $style_properties['style_handle'] );
				}
				if ( isset( $style_properties['inline_style'] ) ) {
					wp_add_inline_style( 'wp-block-library', $style_properties['inline_style'] );
				}
			}
		}
	}
	add_action( 'enqueue_block_assets', 'gutenberg_enqueue_block_styles_assets', 30 );
}
if ( ! has_action( 'enqueue_block_editor_assets', 'enqueue_editor_block_styles_assets' ) ) {
	/**
	 * Function responsible for enqueuing the assets required for block styles functionality on the editor.
	 */
	function gutenberg_enqueue_editor_block_styles_assets() {
		$block_styles = WP_Block_Styles_Registry::get_instance()->get_all_registered();

		$register_script_lines = array( '( function() {' );
		foreach ( $block_styles as $block_name => $styles ) {
			foreach ( $styles as $style_properties ) {
				$register_script_lines[] = sprintf(
					'	wp.blocks.registerBlockStyle( \'%s\', %s );',
					$block_name,
					wp_json_encode(
						array(
							'name'  => $style_properties['name'],
							'label' => $style_properties['label'],
						)
					)
				);
			}
		}
		$register_script_lines[] = '} )();';
		$inline_script           = implode( "\n", $register_script_lines );

		wp_register_script( 'wp-block-styles', false, array( 'wp-blocks' ), true, true );
		wp_add_inline_script( 'wp-block-styles', $inline_script );
		wp_enqueue_script( 'wp-block-styles' );
	}
	add_action( 'enqueue_block_editor_assets', 'gutenberg_enqueue_editor_block_styles_assets' );
}

/**
 * Renders the classNames and styles for blocks
 *
 * @param string $block_content Output of the current block.
 * @param array $block Block Object.
 * @return string New block output.
 */
function gutenberg_experimental_apply_classnames_and_styles( $block_content, $block ) {
	// Don't filter template part blocks since we filter the blocks in each template
	// part individually.
	if ( 'core/template-part' == $block[ 'blockName' ] ) {
		return $block_content;
	}

	// TODO: Check for supports: _experimental* before adding any of this to a block.

	if ( isset( $block['attrs'] ) ) {
		$colors     = gutenberg_experimental_build_css_colors( $block['attrs'] );
		$font_sizes = gutenberg_experimental_build_css_font_sizes( $block['attrs'] );

		$extra_classes    = array_merge(
			$colors['background']['css_classes'],
			$colors['text']['css_classes'],
			$font_sizes['css_classes'],
			isset( $block['attrs']['className'] ) ? array( $block['attrs']['className'] ) : array(),
			isset( $block['attrs']['align'] ) ? array( 'has-text-align-' . $block['attrs']['align'] ) : array()
		);
		$extra_styles = (
			$colors['text']['inline_styles'] ||
			$colors['background']['inline_styles'] ||
			$font_sizes['inline_styles']
		) ? esc_attr( $colors['text']['inline_styles'] ) .
		  	esc_attr( $colors['background']['inline_styles'] ) .
			esc_attr( $font_sizes['inline_styles'] )
		: '';

		$dom = new DOMDocument( '1.0', 'utf-8' );
		@$dom->loadHTML( $block_content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_COMPACT );
		$xpath = new DOMXPath( $dom );
		$block_root = $xpath->query( "/*" )[0];

		if ( empty( $block_root ) ) {
			return $block_content;
		}

		// Merge and dedupe new and existing classes and styles
		$new_classes = implode( ' ', array_unique( explode( ' ', ltrim( $block_root->getAttribute( 'class' ) . ' ' ) . implode( ' ', $extra_classes ) ) ) );
		$new_styles = implode( ' ', array_unique( explode( ' ', ltrim( $block_root->getAttribute( 'style' ) . ' ' ) . $extra_styles ) ) );

		// Apply new styles and classes
		if ( ! empty( $new_classes ) ) {
			$block_root->setAttribute( 'class', $new_classes );
		}

		if ( ! empty( $new_styles ) ) {
			$block_root->setAttribute( 'style', $new_styles );
		}

		return $dom->saveHtml();
	}

	return $block_content;
}
add_filter( 'render_block', 'gutenberg_experimental_apply_classnames_and_styles', 10, 2 );

/**
 * Build an array with CSS classes and inline styles defining the colors
 * which will be applied to the block markup in the front-end.
 *
 * @param  array $attributes block attributes.
 * @return array Colors CSS classes and inline styles.
 */
function gutenberg_experimental_build_css_colors( $attributes ) {
	$text_colors       = array(
		'css_classes'   => array(),
		'inline_styles' => '',
	);
	$background_colors = array(
		'css_classes'   => array(),
		'inline_styles' => '',
	);

	// Text color.
	$has_named_text_color  = array_key_exists( 'textColor', $attributes );
	$has_custom_text_color = array_key_exists( 'style', $attributes )
	&& array_key_exists( 'color', $attributes['style'] )
	&& array_key_exists( 'text', $attributes['style']['color'] );

	// If has text color.
	if ( $has_custom_text_color || $has_named_text_color ) {
		// Add has-text-color class.
		$text_colors['css_classes'][] = 'has-text-color';
	}

	if ( $has_named_text_color ) {
		// Add the color class.
		$text_colors['css_classes'][] = sprintf( 'has-%s-color', $attributes['textColor'] );
	} elseif ( $has_custom_text_color ) {
		// Add the custom color inline style.
		$text_colors['inline_styles'] .= sprintf( 'color: %s;', $attributes['style']['color']['text'] );
	}

	// Link colors.
	$has_link_color = array_key_exists( 'style', $attributes )
	&& array_key_exists( 'color', $attributes['style'] )
	&& array_key_exists( 'link', $attributes['style']['color'] );

	if ( $has_link_color ) {
		$text_colors['css_classes'][] = 'has-link-color';
		// If link is a named color.
		if ( strpos( $attributes['style']['color']['link'], 'var:preset|color|' ) !== false ) {
			// Get the name from the string and add proper styles.
			$index_to_splice               = strrpos( $attributes['style']['color']['link'], '|' ) + 1;
			$link_color_name               = substr( $attributes['style']['color']['link'], $index_to_splice );
			$text_colors['inline_styles'] .= sprintf( '--wp--style--color--link:var(--wp--preset--color--%s);', $link_color_name );
		} else {
			$text_colors['inline_styles'] .= sprintf( '--wp--style--color--link: %s;', $attributes['style']['color']['link'] );
		}
	}
	// Background color.
	$has_named_background_color  = array_key_exists( 'backgroundColor', $attributes );
	$has_custom_background_color = array_key_exists( 'style', $attributes )
	&& array_key_exists( 'color', $attributes['style'] )
	&& array_key_exists( 'background', $attributes['style']['color'] );

	// Gradient color.
	$has_named_gradient  = array_key_exists( 'gradient', $attributes );
	$has_custom_gradient = array_key_exists( 'style', $attributes )
	&& array_key_exists( 'color', $attributes['style'] )
	&& array_key_exists( 'gradient', $attributes['style']['color'] );

	// If has background color.
	if ( $has_custom_background_color || $has_named_background_color || $has_named_gradient || $has_custom_gradient ) {
		// Add has-background-color class.
		$background_colors['css_classes'][] = 'has-background-color';
	}

	if ( $has_named_background_color ) {
		// Add the background-color class.
		$background_colors['css_classes'][] = sprintf( 'has-%s-background-color', $attributes['backgroundColor'] );
	} elseif ( $has_custom_background_color ) {
		// Add the custom background-color inline style.
		$background_colors['inline_styles'] .= sprintf( 'background-color: %s;', $attributes['style']['color']['background'] );
	} elseif ( $has_named_gradient ) {
		$background_colors['css_classes'][] = sprintf( 'has-%s-gradient-background', $attributes['gradient'] );
	} elseif ( $has_custom_gradient ) {
		$background_colors['inline_styles'] .= sprintf( 'background: %s;', $attributes['style']['color']['gradient'] );
	}

	return array(
		'text'       => $text_colors,
		'background' => $background_colors,
	);
}

/**
 * Build an array with CSS classes and inline styles defining the font sizes
 * which will be applied to the block markup in the front-end.
 *
 * @param  array $attributes block attributes.
 * @return array Font size CSS classes and inline styles.
 */
function gutenberg_experimental_build_css_font_sizes( $attributes ) {
	// CSS classes.
	$font_sizes = array(
		'css_classes'   => array(),
		'inline_styles' => '',
	);

	$has_named_font_size  = array_key_exists( 'fontSize', $attributes );
	$has_custom_font_size = array_key_exists( 'style', $attributes )
	&& array_key_exists( 'typography', $attributes['style'] )
	&& array_key_exists( 'fontSize', $attributes['style']['typography'] );

	if ( $has_named_font_size ) {
		// Add the font size class.
		$font_sizes['css_classes'][] = sprintf( 'has-%s-font-size', $attributes['fontSize'] );
	} elseif ( $has_custom_font_size ) {
		// Add the custom font size inline style.
		$font_sizes['inline_styles'] = sprintf( 'font-size: %spx;', $attributes['style']['typography']['fontSize'] );
	}

	return $font_sizes;
}

