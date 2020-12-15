<?php
/**
 * Block support flags.
 *
 * @package gutenberg
 */

/**
 * Class encapsulating and implementing Block Supports.
 *
 * @access private
 */
class WP_Block_Supports {

	/**
	 * Config.
	 *
	 * @var array
	 */
	private $block_supports = array();

	/**
	 * Tracks the current block to be rendered.
	 *
	 * @var array
	 */
	public static $block_to_render = null;

	/**
	 * Container for the main instance of the class.
	 *
	 * @var WP_Block_Supports|null
	 */
	private static $instance = null;

	/**
	 * Utility method to retrieve the main instance of the class.
	 *
	 * The instance will be created if it does not exist yet.
	 *
	 * @return WP_Block_Supports The main instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Initializes the block supports. It registes the block supports block attributes.
	 */
	public static function init() {
		$instance = self::get_instance();
		$instance->register_attributes();
	}

	/**
	 * Applies the render_block filter.
	 *
	 * @param  string $block_content Rendered block content.
	 * @param  array  $block         Block object.
	 * @return string                Filtered block content.
	 */
	public static function render( $block_content, $block ) {
		$instance = self::get_instance();
		return $instance->render_block_supports( $block_content, $block );
	}

	/**
	 * Registers a block support.
	 *
	 * @param string $block_support_name Block support name.
	 * @param array  $block_support_config Array containing the properties of the block support.
	 */
	public function register( $block_support_name, $block_support_config ) {
		$this->block_supports[ $block_support_name ] = array_merge(
			$block_support_config,
			array( 'name' => $block_support_name )
		);
	}


	/**
	 * Generates an array of HTML attributes, such as classes, by applying to
	 * the given block all of the features that the block supports.
	 *
	 * @return array               Array of HTML attributes.
	 */
	public function apply_block_supports() {
		$block_attributes = self::$block_to_render['attrs'];
		$block_type       = WP_Block_Type_Registry::get_instance()->get_registered(
			self::$block_to_render['blockName']
		);

		// If no render_callback, assume styles have been previously handled.
		if ( ! $block_type || empty( $block_type ) ) {
			return array();
		}

		$output = array();
		foreach ( $this->block_supports as $block_support_config ) {
			if ( ! isset( $block_support_config['apply'] ) ) {
				continue;
			}

			$new_attributes = call_user_func(
				$block_support_config['apply'],
				$block_type,
				$block_attributes
			);

			if ( ! empty( $new_attributes ) ) {
				foreach ( $new_attributes as $attribute_name => $attribute_value ) {
					if ( empty( $output[ $attribute_name ] ) ) {
						$output[ $attribute_name ] = $attribute_value;
					} else {
						$output[ $attribute_name ] .= " $attribute_value";
					}
				}
			}
		}

		return $output;
	}

	/**
	 * Registers the block attributes required by the different block supports.
	 */
	private function register_attributes() {
		$block_registry         = WP_Block_Type_Registry::get_instance();
		$registered_block_types = $block_registry->get_all_registered();
		foreach ( $registered_block_types as $block_type ) {
			if ( ! property_exists( $block_type, 'supports' ) ) {
				continue;
			}
			if ( ! $block_type->attributes ) {
				$block_type->attributes = array();
			}

			foreach ( $this->block_supports as $block_support_config ) {
				if ( ! isset( $block_support_config['register_attribute'] ) ) {
					continue;
				}

				call_user_func(
					$block_support_config['register_attribute'],
					$block_type
				);
			}
		}
	}

	/**
	 * Modify the rendered block content with additional filters.
	 *
	 * @param  string $block_content Rendered block content.
	 * @param  array  $block         Block object.
	 * @return string                Filtered block content.
	 */
	public function render_block_supports( $block_content, $block ) {
		$block_type       = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );
		$block_attributes = $block['attrs'];

		if ( ! $block_type ) {
			return $block_content;
		}

		foreach ( $this->block_supports as $name => $block_support_config ) {
			if ( ! isset( $block_support_config['render_block'] ) ) {
				continue;
			}

			$block_content = call_user_func(
				$block_support_config['render_block'],
				$block_type,
				$block_attributes,
				$block_content
			);
		}

		return $block_content;
	}
}

/**
 * Generates a string of attributes by applying to the current block being
 * rendered all of the features that the block supports.
 *
 * @param array $extra_attributes Optional. Extra attributes to render on the block wrapper.
 *
 * @return string String of HTML classes.
 */
function get_block_wrapper_attributes( $extra_attributes = array() ) {
	$new_attributes = WP_Block_Supports::get_instance()->apply_block_supports();

	if ( empty( $new_attributes ) && empty( $extra_attributes ) ) {
		return '';
	}

	// This is hardcoded on purpose.
	// We only support a fixed list of attributes.
	$attributes_to_merge = array( 'style', 'class' );
	$attributes          = array();
	foreach ( $attributes_to_merge as $attribute_name ) {
		if ( empty( $new_attributes[ $attribute_name ] ) && empty( $extra_attributes[ $attribute_name ] ) ) {
			continue;
		}

		if ( empty( $new_attributes[ $attribute_name ] ) ) {
			$attributes[ $attribute_name ] = $extra_attributes[ $attribute_name ];
			continue;
		}

		if ( empty( $extra_attributes[ $attribute_name ] ) ) {
			$attributes[ $attribute_name ] = $new_attributes[ $attribute_name ];
			continue;
		}

		$attributes[ $attribute_name ] = $extra_attributes[ $attribute_name ] . ' ' . $new_attributes[ $attribute_name ];
	}

	foreach ( $extra_attributes as $attribute_name => $value ) {
		if ( ! in_array( $attribute_name, $attributes_to_merge, true ) ) {
			$attributes[ $attribute_name ] = $value;
		}
	}

	if ( empty( $attributes ) ) {
		return '';
	}

	$normalized_attributes = array();
	foreach ( $attributes as $key => $value ) {
		$normalized_attributes[] = $key . '="' . esc_attr( $value ) . '"';
	}

	return implode( ' ', $normalized_attributes );
}

/**
 * Callback hooked to the register_block_type_args filter.
 *
 * This hooks into block registration to wrap the render_callback
 * of dynamic blocks with a closure that keeps track of the
 * current block to be rendered.
 *
 * @param array $args Block attributes.
 * @return array Block attributes.
 */
function wp_block_supports_track_block_to_render( $args ) {
	if ( is_callable( $args['render_callback'] ) ) {
		$block_render_callback   = $args['render_callback'];
		$args['render_callback'] = function( $attributes, $content, $block = null ) use ( $block_render_callback ) {
			// Check for null for back compatibility with WP_Block_Type->render
			// which is unused since the introduction of WP_Block class.
			//
			// See:
			// - https://core.trac.wordpress.org/ticket/49927
			// - commit 910de8f6890c87f93359c6f2edc6c27b9a3f3292 at wordpress-develop.

			if ( null === $block ) {
				return $block_render_callback( $attributes, $content );
			}

			$parent_block                       = WP_Block_Supports::$block_to_render;
			WP_Block_Supports::$block_to_render = $block->parsed_block;
			$result                             = $block_render_callback( $attributes, $content, $block );
			WP_Block_Supports::$block_to_render = $parent_block;
			return $result;
		};
	}
	return $args;
}

add_action( 'init', array( 'WP_Block_Supports', 'init' ), 22 );
add_filter( 'register_block_type_args', 'wp_block_supports_track_block_to_render' );
add_filter( 'render_block', array( 'WP_Block_Supports', 'render' ), 10, 2 );
