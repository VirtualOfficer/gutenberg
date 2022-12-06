<?php

class WP_Web_Fonts extends WP_Dependencies {

	/**
	 * An array of registered providers.
	 *
	 * @since 6.0.0
	 *
	 * @var array
	 */
	private $providers = array();

	/**
	 *
	 */
	public function __construct() {
		/**
		 * Fires when the WP_Web_Fonts instance is initialized.
		 *
		 * @since X.X.X
		 *
		 * @param WP_Web_Fonts $wp_web_fonts WP_Web_Fonts instance (passed by reference).
		 */
		do_action_ref_array( 'wp_default_web_fonts', array( &$this ) );
	}

	/**
	 * Get the list of all registered web fonts and variations.
	 *
	 * @since 6.0.0
	 *
	 * @return array[]
	 */
	public function get_registered() {
		return array_keys( $this->registered );
	}

	/**
	 * Get the list of enqueued web fonts and variations.
	 *
	 * @return array[]
	 */
	public function get_enqueued() {
		return $this->queue;
	}

	/**
	 * Gets a list of all variations registered for a font family.
	 *
	 * @param $font_family
	 * @return array
	 */
	public function get_variations( $font_family ) {
		$font_family_handle = sanitize_title( $font_family );

		if ( ! isset( $this->registered[ $font_family_handle ] ) ) {
			return array();
		}

		return $this->registered[ $font_family_handle ]->deps;
	}

	/**
	 * Removes a font family and all registered variations.
	 *
	 * @param mixed|string|string[] $font_family
	 */
	function remove_family( $font_family ) {
		$font_family_handle = sanitize_title( $font_family );

		if ( ! isset( $this->registered[ $font_family_handle ] ) ) {
			return;
		}

		$variations = $this->registered[ $font_family_handle ]->deps;

		foreach ( $variations as $variation ) {
			$this->remove( $variation );
		}

		$this->remove( $font_family_handle );
	}

	/**
	 * Removes a variation.
	 *
	 * @param $font_family
	 * @param $variation_handle
	 */
	function remove_variation( $font_family, $variation_handle ) {
		$font_family_handle = sanitize_title( $font_family );

		$this->remove( $variation_handle );

		if ( ! isset( $this->registered[ $font_family_handle ] ) ) {
			return;
		}

		// Remove the variation as a dependency.
		$this->registered[ $font_family_handle ]->deps = array_values( array_diff(
			$this->registered[ $font_family_handle ]->deps,
			array( $variation_handle )
		) );
	}

	/**
	 * Registers a variation for a font family.
	 *
	 * @param string $font_family
	 * @param string $variation_handle
	 * @param array  $variation
	 */
	public function add_variation( $font_family, $variation_handle, $variation ) {
		$font_family_handle = sanitize_title( $font_family );

		// Register the font family when it does not yet exist.
		if ( ! isset( $this->registered[ $font_family ] ) ) {
			$this->add( $font_family_handle, false );
		}

		$variation = $this->validate_variation( $font_family, $variation );

		// Variation validation failed.
		if ( ! $variation ) {
			return false;
		}

		if ( $variation['src'] ) {
			return $this->add( $variation_handle, $variation['src'], array(), false, $variation );
		} else {
			return $this->add( $variation_handle, false, array(), false, $variation );
		}
	}

	/**
	 * Adds a variation as a dependency for the main font alias.
	 *
	 * @param $font_family_handle
	 * @param $variation_handle
	 */
	public function add_dependency( $font_family_handle, $variation_handle ) {
		$dependencies = $this->registered[ $font_family_handle ];
		$dependencies[] = $variation_handle;
		$this->registered[ $font_family_handle ] = $dependencies;
	}

	/**
	 * Validates and sanitizes a variation.
	 *
	 * @param $font_family
	 * @param $variation
	 * @return array|false|object
	 */
	function validate_variation( $font_family, $variation ) {
		$defaults = array(
			'provider'     => 'local',
			'font-style'   => 'normal',
			'font-weight'  => '400',
			'font-display' => 'fallback',
		);

		$defaults = apply_filters( 'wp_web_font_variation_defaults', $defaults );

		$defaults['font-family'] = $font_family;
		$variation = wp_parse_args( $variation, $defaults );

		// Local fonts need a "src".
		if ( 'local' === $variation['provider'] ) {
			// Make sure that local fonts have 'src' defined.
			if ( empty( $variation['src'] ) || ( ! is_string( $variation['src'] ) && ! is_array( $variation['src'] ) ) ) {
				trigger_error( __( 'Webfont src must be a non-empty string or an array of strings.', 'gutenberg' ) );
				return false;
			}
		}

		// Validate the 'src' property.
		if ( ! empty( $variation['src'] ) ) {
			foreach ( (array) $variation['src'] as $src ) {
				if ( empty( $src ) || ! is_string( $src ) ) {
					trigger_error( __( 'Each webfont src must be a non-empty string.', 'gutenberg' ) );
					return false;
				}
			}
		}

		// Check the font-weight.
		if ( ! is_string( $variation['font-weight'] ) && ! is_int( $variation['font-weight'] ) ) {
			trigger_error( __( 'Webfont font weight must be a properly formatted string or integer.', 'gutenberg' ) );
			return false;
		}

		//Verify provider.
		if ( ! class_exists( $variation['provider'] ) ) {
			trigger_error( __( 'The provider class specified does not exist.', 'gutenberg' ) );
			return false;
		}

		// Check the font-display.
		if ( ! in_array( $webfont['font-display'], array( 'auto', 'block', 'fallback', 'swap', 'optional' ), true ) ) {
			$webfont['font-display'] = 'fallback';
		}

		$valid_props = array(
			'ascent-override',
			'descent-override',
			'font-display',
			'font-family',
			'font-stretch',
			'font-style',
			'font-weight',
			'font-variant',
			'font-feature-settings',
			'font-variation-settings',
			'line-gap-override',
			'size-adjust',
			'src',
			'unicode-range',

			// Exceptions.
			'provider',
		);

		foreach ( $variation as $prop => $value ) {
			if ( ! in_array( $prop, $valid_props, true ) ) {
				unset( $variation[ $prop ] );
			}
		}

		return $variation;
	}

	/**
	 * Generate styles for webfonts.
	 *
	 * @since 6.0.0
	 *
	 * @param array[] $webfonts_by_provider Webfonts organized by provider.
	 * @return string $styles Generated styles.
	 */
	public function do_item( $handle, $group = false ) {
		if ( ! parent::do_item( $handle ) ) {
			return false;
		}

		$styles    = '';
		$providers = $this->get_providers();

		/*
		 * Loop through each of the providers to get the CSS for their respective webfonts
		 * to incrementally generate the collective styles for all of them.
		 */
		foreach ( $providers as $provider_id => $provider_class ) {

			// Bail out if the provider class does not exist.
			if ( ! class_exists( $provider_class ) ) {
				/* translators: %s is the provider name. */
				trigger_error( sprintf( __( 'Webfont provider "%s" is not registered.', 'gutenberg' ), $provider_id ) );
				continue;
			}

			$provider_webfonts = isset( $webfonts_by_provider[ $provider_id ] )
				? $webfonts_by_provider[ $provider_id ]
				: array();

			// If there are no registered webfonts for this provider, skip it.
			if ( empty( $provider_webfonts ) ) {
				continue;
			}

			/*
			 * Process the webfonts by first passing them to the provider via `set_webfonts()`
			 * and then getting the CSS from the provider.
			 */
			$provider = new $provider_class();
			$provider->set_webfonts( $provider_webfonts );
			$styles .= $provider->get_css();
		}

		return $styles;
	}

	/**
	 * Register a provider.
	 *
	 * @since 6.0.0
	 *
	 * @param string $provider The provider name.
	 * @param string $class    The provider class name.
	 * @return bool True if successfully registered, else false.
	 */
	public function register_provider( $provider, $class ) {
		if ( empty( $provider ) || empty( $class ) || ! class_exists( $class ) ) {
			return false;
		}
		$this->providers[ $provider ] = $class;
		return true;
	}

	/**
	 * Get the list of providers.
	 *
	 * @since 6.0.0
	 *
	 * @return WP_Web_Fonts_Provider[] All registered providers, each keyed by their unique ID.
	 */
	public function get_providers() {
		return $this->providers;
	}

}
