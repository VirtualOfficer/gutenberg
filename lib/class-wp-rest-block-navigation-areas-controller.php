<?php
/**
 * REST API: WP_REST_Block_Navigation_Locations_Controller class
 *
 * @subpackage REST_API
 * @package    WordPress
 */

/**
 * Core class used to access block navigation locations via the REST API.
 *
 * @see   WP_REST_Controller
 */
class WP_REST_Block_Navigation_Areas_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = '__experimental';
		$this->rest_base = 'block-navigation-areas';
	}

	/**
	 * Registers the routes for the objects of the controller.
	 *
	 * @see   register_rest_route()
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<area>[\w-]+)',
			array(
				'args'   => array(
					'area' => array(
						'description' => __( 'An alphanumeric identifier for the menu location.', 'gutenberg' ),
						'type'        => 'string',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'context' => $this->get_context_param( array( 'default' => 'view' ) ),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Checks whether a given request has permission to read menu locations.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|bool True if the request has read access, WP_Error object otherwise.
	 */
	public function get_items_permissions_check( $request ) { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return new WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to view menu locations.', 'gutenberg' ),
				array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Retrieves all menu locations, depending on user context.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$data    = array();
		$mapping = get_option( 'fse_navigation_areas', array() );
		foreach ( $this->get_available_areas() as $name => $description ) {
			$area              = new stdClass();
			$area->name        = $name;
			$area->description = $description;
			$area->menu        = ! empty( $mapping[ $name ] ) ? $mapping[ $name ] : null;

			$area          = $this->prepare_item_for_response( $area, $request );
			$data[ $name ] = $this->prepare_response_for_collection( $area );
		}

		return rest_ensure_response( $data );
	}

	private function get_available_areas() {
		// @TODO: Source that from theme.json
		return array(
			'primary'   => 'Primary',
			'secondary' => 'Secondary',
			'tetriary'  => 'Tetriary'
		);
	}

	/**
	 * Checks if a given request has access to read a menu location.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|bool True if the request has read access for the item, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		// @TODO
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return new WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to view menu locations.', 'gutenberg' ),
				array( 'status' => rest_authorization_required_code() ) );
		}
		if ( ! array_key_exists( $request['area'], $this->get_available_areas() ) ) {
			return new WP_Error( 'rest_menu_location_invalid', __( 'Invalid menu location.', 'gutenberg' ), array( 'status' => 404 ) );
		}

		return true;
	}

	/**
	 * Checks if a request has access to update the specified term.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return bool|WP_Error True if the request has access to update the item, false or WP_Error object otherwise.
	 */
	public function update_item_permissions_check( $request ) {
		// @TODO
		return $this->get_item_permissions_check( $request );
	}

	/**
	 * Retrieves a specific menu location.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ) {
		$name            = $request['area'];
		$available_areas = $this->get_available_areas();
		$mapping         = get_option( 'fse_navigation_areas', array() );

		$area              = new stdClass();
		$area->name        = $name;
		$area->menu        = ! empty( $mapping[ $name ] ) ? $mapping[ $name ] : null;
		$area->description = $available_areas[ $name ];

		$data = $this->prepare_item_for_response( $area, $request );

		return rest_ensure_response( $data );
	}

	/**
	 * Updates a specific menu location.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function update_item( $request ) {
		$name = $request['area'];
		// @TODO: Validate $request[ 'menu' ]

		$mapping          = get_option( 'fse_navigation_areas', array() );
		$mapping[ $name ] = $request['menu'];
		update_option( 'fse_navigation_areas', $mapping );

		// @TODO: Don't call get_item here
		return $this->get_item( $request );
	}

	/**
	 * Prepares a menu location object for serialization.
	 *
	 * @param stdClass $area Post status data.
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response Post status data.
	 */
	public function prepare_item_for_response( $area, $request ) {
		$areas = $this->get_available_areas();
		$menu  = ( isset( $areas[ $area->name ] ) ) ? $area->menu : 0;

		$fields = $this->get_fields_for_response( $request );
		$data   = array();

		if ( rest_is_field_included( 'name', $fields ) ) {
			$data['name'] = $area->name;
		}

		if ( rest_is_field_included( 'description', $fields ) ) {
			$data['description'] = $area->description;
		}

		if ( rest_is_field_included( 'menu', $fields ) ) {
			$data['menu'] = (int) $menu;
		}

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $data, $request );
		$data    = $this->filter_response_by_context( $data, $context );

		$response = rest_ensure_response( $data );

//		$response->add_links( $this->prepare_links( $location ) );

		/**
		 * Filters a menu location returned from the REST API.
		 *
		 * Allows modification of the menu location data right before it is
		 * returned.
		 *
		 * @param WP_REST_Response $response The response object.
		 * @param object $area The original status object.
		 * @param WP_REST_Request $request Request used to generate the response.
		 */
		return apply_filters( 'rest_prepare_menu_location', $response, $area, $request );
	}

	/**
	 * Retrieves the menu location's schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'menu-location',
			'type'       => 'object',
			'properties' => array(
				'name'        => array(
					'description' => __( 'The name of the menu area.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'description' => array(
					'description' => __( 'The description of the menu area.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'menu'        => array(
					'description' => __( 'The ID of the assigned menu.', 'gutenberg' ),
					'type'        => 'integer',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}

	/**
	 * Retrieves the query params for collections.
	 *
	 * @return array Collection parameters.
	 */
	public function get_collection_params() {
		return array(
			'context' => $this->get_context_param( array( 'default' => 'view' ) ),
		);
	}

	/**
	 * Prepares links for the request.
	 *
	 * @param stdClass $location Menu location.
	 *
	 * @return array Links for the given menu location.
	 */
	protected function prepare_links( $location ) {
		$base = sprintf( '%s/%s', $this->namespace, $this->rest_base );

		// Entity meta.
		$links = array(
			'self'       => array(
				'href' => rest_url( trailingslashit( $base ) . $location->name ),
			),
			'collection' => array(
				'href' => rest_url( $base ),
			),
		);

		$locations = get_nav_menu_locations();
		$menu      = ( isset( $locations[ $location->name ] ) ) ? $locations[ $location->name ] : 0;
		if ( $menu ) {
			$taxonomy_object = get_taxonomy( 'nav_menu' );
			if ( $taxonomy_object->show_in_rest ) {
				$rest_base                         = ! empty( $taxonomy_object->rest_base ) ? $taxonomy_object->rest_base : $taxonomy_object->name;
				$url                               = rest_url( sprintf( '__experimental/%s/%d', $rest_base, $menu ) );
				$links['https://api.w.org/menu'][] = array(
					'href'       => $url,
					'embeddable' => true,
				);
			}
		}

		return $links;
	}

}
