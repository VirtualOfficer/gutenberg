<?php
/**
 * Blocks API: WP_Block_Type_Registry class
 *
 * @package gutenberg
 * @since 0.2.0
 */

/**
 * Core class used for interacting with block types.
 *
 * @since 0.2.0
 */
final class WP_Block_Type_Registry {
	/**
	 * Registered block types, as `$name => $instance` pairs.
	 *
	 * @since 0.2.0
	 * @access private
	 * @var array
	 */
	private $registered_block_types = array();

	/**
	 * Container for the main instance of the class.
	 *
	 * @since 0.2.0
	 * @access private
	 * @static
	 * @var WP_Block_Type_Registry|null
	 */
	private static $instance = null;

	/**
	 * Registers a block type.
	 *
	 * @since 0.2.0
	 * @access public
	 *
	 * @param string|WP_Block_Type $name Block type name including namespace, or alternatively a
	 *                                   complete WP_Block_Type instance. In case a WP_Block_Type
	 *                                   is provided, the $args parameter will be ignored.
	 * @param array                $args {
	 *     Optional. Array of block type arguments. Any arguments may be defined, however the
	 *     ones described below are supported by default. Default empty array.
	 *
	 *     @type callable $render Callback used to render blocks of this block type.
	 * }
	 * @return WP_Block_Type|false The registered block type on success, or false on failure.
	 */
	public function register( $name, $args = array() ) {
		$block_type = null;
		if ( is_a( $name, 'WP_Block_Type' ) ) {
			$block_type = $name;
			$name = $block_type->name;
		}

		if ( ! is_string( $name ) ) {
			$message = __( 'Block type names must be strings.' );
			_doing_it_wrong( __METHOD__, $message, '0.1.0' );
			return false;
		}

		$name_matcher = '/^[a-z0-9-]+\/[a-z0-9-]+$/';
		if ( ! preg_match( $name_matcher, $name ) ) {
			$message = __( 'Block type names must contain a namespace prefix. Example: my-plugin/my-custom-block-type' );
			_doing_it_wrong( __METHOD__, $message, '0.1.0' );
			return false;
		}

		if ( $this->is_registered( $name ) ) {
			/* translators: 1: block name */
			$message = sprintf( __( 'Block type "%s" is already registered.' ), $name );
			_doing_it_wrong( __METHOD__, $message, '0.1.0' );
			return false;
		}

		if ( ! $block_type ) {
			$block_type = new WP_Block_Type( $name, $args );
		}

		$this->registered_block_types[ $name ] = $block_type;

		return $block_type;
	}

	/**
	 * Unregisters a block type.
	 *
	 * @since 0.2.0
	 * @access public
	 *
	 * @param string $name Block type name including namespace.
	 * @return WP_Block_Type|false The unregistered block type on success, or false on failure.
	 */
	public function unregister( $name ) {
		if ( ! $this->is_registered( $name ) ) {
			/* translators: 1: block name */
			$message = sprintf( __( 'Block type "%s" is not registered.' ), $name );
			_doing_it_wrong( __METHOD__, $message, '0.1.0' );
			return false;
		}

		$unregistered_block_type = $this->registered_block_types[ $name ];
		unset( $this->registered_block_types[ $name ] );

		return $unregistered_block_type;
	}

	/**
	 * Retrieves a registered block type.
	 *
	 * @since 0.2.0
	 * @access public
	 *
	 * @param string $name Block type name including namespace.
	 * @return WP_Block_Type|null The registered block type, or null if it is not registered.
	 */
	public function get_registered( $name ) {
		if ( ! $this->is_registered( $name ) ) {
			return null;
		}

		return $this->registered_block_types[ $name ];
	}

	/**
	 * Retrieves all registered block types.
	 *
	 * @since 0.2.0
	 * @access public
	 *
	 * @return array Associative array of `$block_type_name => $block_type` pairs.
	 */
	public function get_all_registered() {
		return $this->registered_block_types;
	}

	/**
	 * Checks if a block type is registered.
	 *
	 * @since 0.2.0
	 * @access public
	 *
	 * @param tring $name Block type name including namespace.
	 * @return bool True if the block type is registered, false otherwise.
	 */
	public function is_registered( $name ) {
		return isset( $this->registered_block_types[ $name ] );
	}

	/**
	 * Utility method to retrieve the main instance of the class.
	 *
	 * The instance will be created if it does not exist yet.
	 *
	 * @since 0.2.0
	 * @access public
	 * @static
	 *
	 * @return WP_Block_Type_Registry The main instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
