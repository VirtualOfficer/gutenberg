<?php
/**
 * API to interact with global settings & styles.
 *
 * @package gutenberg
 */

if ( ! function_exists( 'wp_get_global_settings' ) ) {
	/**
	 * Function to get the settings resulting of merging core, theme, and user data.
	 *
	 * @param array $path    Path to the specific setting to retrieve. Optional.
	 *                       If empty, will return all settings.
	 * @param array $context {
	 *     Metadata to know where to retrieve the $path from. Optional.
	 *
	 *     @type string $block_name Which block to retrieve the settings from.
	 *                              If empty, it'll return the settings for the global context.
	 *     @type string $origin     Which origin to take data from.
	 *                              Valid values are 'all' (core, theme, and user) or 'base' (core and theme).
	 *                              If empty or unknown, 'all' is used.
	 * }
	 *
	 * @return array The settings to retrieve.
	 */
	function wp_get_global_settings( $path = array(), $context = array() ) {
		if ( ! empty( $context['block_name'] ) ) {
			$path = array_merge( array( 'blocks', $context['block_name'] ), $path );
		}

		$origin = 'custom';
		if ( isset( $context['origin'] ) && 'base' === $context['origin'] ) {
			$origin = 'theme';
		}

		$settings = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data( $origin )->get_settings();

		return _wp_array_get( $settings, $path, $settings );
	}
}

if ( ! function_exists( 'wp_get_global_styles' ) ) {
	/**
	 * Function to get the styles resulting of merging core, theme, and user data.
	 *
	 * @param array $path    Path to the specific style to retrieve. Optional.
	 *                       If empty, will return all styles.
	 * @param array $context {
	 *     Metadata to know where to retrieve the $path from. Optional.
	 *
	 *     @type string $block_name Which block to retrieve the styles from.
	 *                              If empty, it'll return the styles for the global context.
	 *     @type string $origin     Which origin to take data from.
	 *                              Valid values are 'all' (core, theme, and user) or 'base' (core and theme).
	 *                              If empty or unknown, 'all' is used.
	 * }
	 *
	 * @return array The styles to retrieve.
	 */
	function wp_get_global_styles( $path = array(), $context = array() ) {
		if ( ! empty( $context['block_name'] ) ) {
			$path = array_merge( array( 'blocks', $context['block_name'] ), $path );
		}

		$origin = 'custom';
		if ( isset( $context['origin'] ) && 'base' === $context['origin'] ) {
			$origin = 'theme';
		}

		$styles = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data( $origin )->get_raw_data()['styles'];

		return _wp_array_get( $styles, $path, $styles );
	}
}

if ( ! function_exists( 'wp_get_global_stylesheet' ) ) {
	/**
	 * Returns the stylesheet resulting of merging core, theme, and user data.
	 *
	 * @param array $types Types of styles to load. Optional.
	 *                     It accepts 'variables', 'styles', 'presets' as values.
	 *                     If empty, it'll load all for themes with theme.json support
	 *                     and only [ 'variables', 'presets' ] for themes without theme.json support.
	 *
	 * @return string Stylesheet.
	 */
	function wp_get_global_stylesheet( $types = array() ) {
		// Return cached value if it can be used and exists.
		// It's cached by theme to make sure that theme switching clears the cache.
		$can_use_cached = (
		( empty( $types ) ) &&
		( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) &&
		( ! defined( 'SCRIPT_DEBUG' ) || ! SCRIPT_DEBUG ) &&
		( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) &&
		! is_admin()
		);
		$transient_name = 'gutenberg_global_styles_' . get_stylesheet();
		if ( $can_use_cached ) {
			$cached = get_transient( $transient_name );
			if ( $cached ) {
				return $cached;
			}
		}

		$supports_theme_json = WP_Theme_JSON_Resolver_Gutenberg::theme_has_support();
		$supports_link_color = get_theme_support( 'experimental-link-color' );
		if ( empty( $types ) && ! $supports_theme_json ) {
			$types = array( 'variables', 'presets' );
		} elseif ( empty( $types ) ) {
			$types = array( 'variables', 'styles', 'presets' );
		}

		$origins = array( 'default', 'theme', 'custom' );
		if ( ! $supports_theme_json && ! $supports_link_color ) {
			// In this case we only enqueue the core presets (CSS Custom Properties + the classes).
			$origins = array( 'default' );
		} elseif ( ! $supports_theme_json && $supports_link_color ) {
			// For the legacy link color feature to work, the CSS Custom Properties
			// should be in scope (either the core or the theme ones).
			$origins = array( 'default', 'theme' );
		}

		$tree       = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data();
		$stylesheet = $tree->get_stylesheet( $types, $origins );

		if ( $can_use_cached ) {
			// Cache for a minute.
			// This cache doesn't need to be any longer, we only want to avoid spikes on high-traffic sites.
			set_transient( $transient_name, $stylesheet, MINUTE_IN_SECONDS );
		}

		return $stylesheet;
	}
}

/**
 * Returns the stylesheet resulting of merging core, theme, and user data.
 *
 * @return string Stylesheet.
 */
function wp_get_global_styles_svg_filters() {
	// Return cached value if it can be used and exists.
	// It's cached by theme to make sure that theme switching clears the cache.
	$transient_name = 'gutenberg_global_styles_svg_filters_' . get_stylesheet();
	$can_use_cached = gutenberg_can_use_cached();
	if ( $can_use_cached ) {
		$cached = get_transient( $transient_name );
		if ( $cached ) {
			return $cached;
		}
	}

	$supports_theme_json = WP_Theme_JSON_Resolver_Gutenberg::theme_has_support();
	$supports_link_color = get_theme_support( 'experimental-link-color' );

	// TODO: Which origins are needed for duotone filters?
	$origins = array( 'core', 'theme', 'user' );
	if ( ! $supports_theme_json && ! $supports_link_color ) {
		// In this case we only enqueue the core presets (CSS Custom Properties + the classes).
		$origins = array( 'core' );
	} elseif ( ! $supports_theme_json && $supports_link_color ) {
		// For the legacy link color feature to work, the CSS Custom Properties
		// should be in scope (either the core or the theme ones).
		$origins = array( 'core', 'theme' );
	}

	$tree = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data();
	$svgs = $tree->get_svg_filters( $origins );

	if ( $can_use_cached ) {
		// Cache for a minute, same as gutenberg_get_global_stylesheet.
		set_transient( $transient_name, $svgs, MINUTE_IN_SECONDS );
	}

	return $svgs;
}
