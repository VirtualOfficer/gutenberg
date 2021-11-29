<?php
/**
 * REST API: Gutenberg_REST_Templates_Controller class
 *
 * @package    Gutenberg
 * @subpackage REST_API
 */

/**
 * Base Templates REST API Controller.
 */
class Gutenberg_REST_Templates_Controller extends WP_REST_Controller {
	/**
	 * Post type.
	 *
	 * @var string
	 */
	protected $post_type;

	/**
	 * Constructor.
	 *
	 * @param string $post_type Post type.
	 */
	public function __construct( $post_type ) {
		$this->post_type = $post_type;
		$this->namespace = 'wp/v2';
		$obj             = get_post_type_object( $post_type );
		$this->rest_base = ! empty( $obj->rest_base ) ? $obj->rest_base : $obj->name;
	}

	/**
	 * Registers the controllers routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		// Lists all templates.
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
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		// Lists/updates a single template based on the given id.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\/\w-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description'       => __( 'The id of a template', 'gutenberg' ),
							'type'              => 'string',
							'sanitize_callback' => array( $this, '_sanitize_template_id' ),
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'delete_item_permissions_check' ),
					'args'                => array(
						'force' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Whether to bypass Trash and force deletion.', 'gutenberg' ),
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Checks if the user has permissions to make the request.
	 *
	 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
	 */
	protected function permissions_check() {
		// Verify if the current user has edit_theme_options capability.
		// This capability is required to edit/view/delete templates.
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return new WP_Error(
				'rest_cannot_manage_templates',
				__( 'Sorry, you are not allowed to access the templates on this site.', 'gutenberg' ),
				array(
					'status' => rest_authorization_required_code(),
				)
			);
		}

		return true;
	}

	/**
	 * Requesting this endpoint for a template like "twentytwentytwo//home" requires using
	 * a path like /wp/v2/templates/twentytwentytwo//home. There are special cases when
	 * WordPress routing corrects the name to contain only a single slash like "twentytwentytwo/home".
	 *
	 * This method doubles the last slash if it's not already doubled. It relies on the template
	 * ID format {theme_name}//{template_slug} and the fact that slugs cannot contain slashes.
	 *
	 * See https://core.trac.wordpress.org/ticket/54507 for more context
	 *
	 * @param string $id Template ID.
	 * @return string Sanitized template ID.
	 */
	public function _sanitize_template_id( $id ) {
		$last_slash_pos = strrpos( $id, '/' );
		if ( false === $last_slash_pos ) {
			return $id;
		}

		$is_double_slashed = substr( $id, $last_slash_pos - 1, 1 ) === '/';
		if ( $is_double_slashed ) {
			return $id;
		}
		return (
			substr( $id, 0, $last_slash_pos )
			. '/'
			. substr( $id, $last_slash_pos )
		);
	}

	/**
	 * Checks if a given request has access to read templates.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
	 */
	public function get_items_permissions_check( $request ) {
		return $this->permissions_check( $request );
	}

	/**
	 * Returns a list of templates.
	 *
	 * @param WP_REST_Request $request The request instance.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$query = array();
		if ( isset( $request['wp_id'] ) ) {
			$query['wp_id'] = $request['wp_id'];
		}
		if ( isset( $request['area'] ) ) {
			$query['area'] = $request['area'];
		}
		if ( isset( $request['post_type'] ) ) {
			$query['post_type'] = $request['post_type'];
		}

		$templates = array();
		foreach ( gutenberg_get_block_templates( $query, $this->post_type ) as $template ) {
			$data        = $this->prepare_item_for_response( $template, $request );
			$templates[] = $this->prepare_response_for_collection( $data );
		}

		return rest_ensure_response( $templates );
	}

	/**
	 * Checks if a given request has access to read a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access for the item, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		return $this->permissions_check( $request );
	}

	/**
	 * Returns the given template
	 *
	 * @param WP_REST_Request $request The request instance.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		if ( isset( $request['source'] ) && 'theme' === $request['source'] ) {
			$template = get_block_file_template( $request['id'], $this->post_type );
		} else {
			$template = gutenberg_get_block_template( $request['id'], $this->post_type );
		}

		if ( ! $template ) {
			return new WP_Error( 'rest_template_not_found', __( 'No templates exist with that id.', 'gutenberg' ), array( 'status' => 404 ) );
		}

		return $this->prepare_item_for_response( $template, $request );
	}

	/**
	 * Checks if a given request has access to write a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has write access for the item, WP_Error object otherwise.
	 */
	public function update_item_permissions_check( $request ) {
		return $this->permissions_check( $request );
	}

	/**
	 * Updates a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update_item( $request ) {
		$template = gutenberg_get_block_template( $request['id'], $this->post_type );
		if ( ! $template ) {
			return new WP_Error( 'rest_template_not_found', __( 'No templates exist with that id.', 'gutenberg' ), array( 'status' => 404 ) );
		}

		if ( isset( $request['source'] ) && 'theme' === $request['source'] ) {
			wp_delete_post( $template->wp_id, true );
			return $this->prepare_item_for_response( get_block_file_template( $request['id'], $this->post_type ), $request );
		}

		$changes = $this->prepare_item_for_database( $request );

		if ( is_wp_error( $changes ) ) {
			return $changes;
		}

		if ( 'custom' === $template->source ) {
			$result = wp_update_post( wp_slash( (array) $changes ), true );
		} else {
			$result = wp_insert_post( wp_slash( (array) $changes ), true );
		}
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$template      = gutenberg_get_block_template( $request['id'], $this->post_type );
		$fields_update = $this->update_additional_fields_for_object( $template, $request );
		if ( is_wp_error( $fields_update ) ) {
			return $fields_update;
		}

		return $this->prepare_item_for_response(
			gutenberg_get_block_template( $request['id'], $this->post_type ),
			$request
		);
	}

	/**
	 * Checks if a given request has access to create a template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to create items, WP_Error object otherwise.
	 */
	public function create_item_permissions_check( $request ) {
		return $this->permissions_check( $request );
	}

	/**
	 * Creates a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ) {
		$changes = $this->prepare_item_for_database( $request );

		if ( is_wp_error( $changes ) ) {
			return $changes;
		}

		$changes->post_name = $request['slug'];
		$result             = wp_insert_post( wp_slash( (array) $changes ), true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$posts = gutenberg_get_block_templates( array( 'wp_id' => $result ), $this->post_type );
		if ( ! count( $posts ) ) {
			return new WP_Error( 'rest_template_insert_error', __( 'No templates exist with that id.', 'gutenberg' ) );
		}
		$id            = $posts[0]->id;
		$template      = gutenberg_get_block_template( $id, $this->post_type );
		$fields_update = $this->update_additional_fields_for_object( $template, $request );
		if ( is_wp_error( $fields_update ) ) {
			return $fields_update;
		}

		return $this->prepare_item_for_response(
			gutenberg_get_block_template( $id, $this->post_type ),
			$request
		);
	}

	/**
	 * Checks if a given request has access to delete a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has delete access for the item, WP_Error object otherwise.
	 */
	public function delete_item_permissions_check( $request ) {
		return $this->permissions_check( $request );
	}

	/**
	 * Deletes a single template.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $request ) {
		$template = gutenberg_get_block_template( $request['id'], $this->post_type );
		if ( ! $template ) {
			return new WP_Error( 'rest_template_not_found', __( 'No templates exist with that id.', 'gutenberg' ), array( 'status' => 404 ) );
		}
		if ( 'custom' !== $template->source ) {
			return new WP_Error( 'rest_invalid_template', __( 'Templates based on theme files can\'t be removed.', 'gutenberg' ), array( 'status' => 400 ) );
		}

		$id    = $template->wp_id;
		$force = (bool) $request['force'];

		// If we're forcing, then delete permanently.
		if ( $force ) {
			$previous = $this->prepare_item_for_response( $template, $request );
			wp_delete_post( $id, true );
			$response = new WP_REST_Response();
			$response->set_data(
				array(
					'deleted'  => true,
					'previous' => $previous->get_data(),
				)
			);

			return $response;
		}

		// Otherwise, only trash if we haven't already.
		if ( 'trash' === $template->status ) {
			return new WP_Error(
				'rest_template_already_trashed',
				__( 'The template has already been deleted.', 'gutenberg' ),
				array( 'status' => 410 )
			);
		}

		wp_trash_post( $id );
		$template->status = 'trash';
		return $this->prepare_item_for_response( $template, $request );
	}

	/**
	 * Prepares a single template for create or update.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return stdClass Changes to pass to wp_update_post.
	 */
	protected function prepare_item_for_database( $request ) {
		$template = $request['id'] ? gutenberg_get_block_template( $request['id'], $this->post_type ) : null;
		$changes  = new stdClass();
		if ( null === $template ) {
			$changes->post_type   = $this->post_type;
			$changes->post_status = 'publish';
			$changes->tax_input   = array(
				'wp_theme' => isset( $request['theme'] ) ? $request['theme'] : wp_get_theme()->get_stylesheet(),
			);
		} elseif ( 'custom' !== $template->source ) {
			$changes->post_name   = $template->slug;
			$changes->post_type   = $this->post_type;
			$changes->post_status = 'publish';
			$changes->tax_input   = array(
				'wp_theme' => $template->theme,
			);
			$changes->meta_input  = array(
				'origin' => $template->source,
			);
		} else {
			$changes->post_name   = $template->slug;
			$changes->ID          = $template->wp_id;
			$changes->post_status = 'publish';
		}
		if ( isset( $request['content'] ) ) {
			$changes->post_content = $request['content'];
		} elseif ( null !== $template && 'custom' !== $template->source ) {
			$changes->post_content = $template->content;
		}
		if ( isset( $request['title'] ) ) {
			$changes->post_title = $request['title'];
		} elseif ( null !== $template && 'custom' !== $template->source ) {
			$changes->post_title = $template->title;
		}
		if ( isset( $request['description'] ) ) {
			$changes->post_excerpt = $request['description'];
		} elseif ( null !== $template && 'custom' !== $template->source ) {
			$changes->post_excerpt = $template->description;
		}

		if ( 'wp_template_part' === $this->post_type ) {
			if ( isset( $request['area'] ) ) {
				$changes->tax_input['wp_template_part_area'] = _filter_block_template_part_area( $request['area'] );
			} elseif ( null !== $template && 'custom' !== $template->source && $template->area ) {
				$changes->tax_input['wp_template_part_area'] = _filter_block_template_part_area( $template->area );
			} elseif ( ! $template->area ) {
				$changes->tax_input['wp_template_part_area'] = WP_TEMPLATE_PART_AREA_UNCATEGORIZED;
			}
		}

		if ( ! empty( $request['author'] ) ) {
			$post_author = (int) $request['author'];

			if ( get_current_user_id() !== $post_author ) {
				$user_obj = get_userdata( $post_author );

				if ( ! $user_obj ) {
					return new WP_Error(
						'rest_invalid_author',
						__( 'Invalid author ID.', 'gutenberg' ),
						array( 'status' => 400 )
					);
				}
			}

			$changes->post_author = $post_author;
		}

		return $changes;
	}

	/**
	 * Prepare a single template output for response
	 *
	 * @param WP_Block_Template $template Template instance.
	 * @param WP_REST_Request   $request Request object.
	 *
	 * @return WP_REST_Response $data
	 */
	public function prepare_item_for_response( $template, $request ) { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
		$result = array(
			'id'             => $template->id,
			'theme'          => $template->theme,
			'content'        => array( 'raw' => $template->content ),
			'slug'           => $template->slug,
			'source'         => $template->source,
			'origin'         => $template->origin,
			'type'           => $template->type,
			'description'    => $template->description,
			'title'          => array(
				'raw'      => $template->title,
				'rendered' => $template->title,
			),
			'status'         => $template->status,
			'wp_id'          => $template->wp_id,
			'has_theme_file' => $template->has_theme_file,
			'author'         => (int) $template->author,
		);

		if ( 'wp_template' === $template->type ) {
			$result['is_custom'] = $template->is_custom;
		}

		if ( 'wp_template_part' === $template->type ) {
			$result['area'] = $template->area;
		}

		$result = $this->add_additional_fields_to_object( $result, $request );

		$response = rest_ensure_response( $result );
		$links    = $this->prepare_links( $template->id );
		$response->add_links( $links );
		if ( ! empty( $links['self']['href'] ) ) {
			$actions = $this->get_available_actions();
			$self    = $links['self']['href'];
			foreach ( $actions as $rel ) {
				$response->add_link( $rel, $self );
			}
		}

		return $response;
	}


	/**
	 * Prepares links for the request.
	 *
	 * @param integer $id ID.
	 * @return array Links for the given post.
	 */
	protected function prepare_links( $id ) {
		$base = sprintf( '%s/%s', $this->namespace, $this->rest_base );

		$links = array(
			'self'       => array(
				'href' => rest_url( trailingslashit( $base ) . $id ),
			),
			'collection' => array(
				'href' => rest_url( $base ),
			),
			'about'      => array(
				'href' => rest_url( 'wp/v2/types/' . $this->post_type ),
			),
		);

		return $links;
	}

	/**
	 * Get the link relations available for the post and current user.
	 *
	 * @return array List of link relations.
	 */
	protected function get_available_actions() {
		$rels = array();

		$post_type = get_post_type_object( $this->post_type );

		if ( current_user_can( $post_type->cap->publish_posts ) ) {
			$rels[] = 'https://api.w.org/action-publish';
		}

		if ( current_user_can( 'unfiltered_html' ) ) {
			$rels[] = 'https://api.w.org/action-unfiltered-html';
		}

		return $rels;
	}

	/**
	 * Retrieves the query params for the posts collection.
	 *
	 * @return array Collection parameters.
	 */
	public function get_collection_params() {
		return array(
			'context'   => $this->get_context_param(),
			'wp_id'     => array(
				'description' => __( 'Limit to the specified post id.', 'gutenberg' ),
				'type'        => 'integer',
			),
			'area'      => array(
				'description' => __( 'Limit to the specified template part area.', 'gutenberg' ),
				'type'        => 'string',
			),
			'post_type' => array(
				'description' => __( 'Post type to get the templates for.', 'gutenberg' ),
				'type'        => 'string',
			),
		);
	}

	/**
	 * Retrieves the block type' schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => $this->post_type,
			'type'       => 'object',
			'properties' => array(
				'id'             => array(
					'description' => __( 'ID of template.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'slug'           => array(
					'description' => __( 'Unique slug identifying the template.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'required'    => true,
					'minLength'   => 1,
					'pattern'     => '[a-zA-Z_\-]+',
				),
				'theme'          => array(
					'description' => __( 'Theme identifier for the template.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
				),
				'source'         => array(
					'description' => __( 'Source of template', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'origin'         => array(
					'description' => __( 'Source of customized template', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'content'        => array(
					'description' => __( 'Content of template.', 'gutenberg' ),
					'type'        => array( 'object', 'string' ),
					'default'     => '',
					'context'     => array( 'embed', 'view', 'edit' ),
				),
				'title'          => array(
					'description' => __( 'Title of template.', 'gutenberg' ),
					'type'        => array( 'object', 'string' ),
					'default'     => '',
					'context'     => array( 'embed', 'view', 'edit' ),
				),
				'description'    => array(
					'description' => __( 'Description of template.', 'gutenberg' ),
					'type'        => 'string',
					'default'     => '',
					'context'     => array( 'embed', 'view', 'edit' ),
				),
				'status'         => array(
					'description' => __( 'Status of template.', 'gutenberg' ),
					'type'        => 'string',
					'default'     => 'publish',
					'context'     => array( 'embed', 'view', 'edit' ),
				),
				'wp_id'          => array(
					'description' => __( 'Post ID.', 'gutenberg' ),
					'type'        => 'integer',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'has_theme_file' => array(
					'description' => __( 'Theme file exists.', 'gutenberg' ),
					'type'        => 'bool',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'author'         => array(
					'description' => __( 'The ID for the author of the template.', 'gutenberg' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit', 'embed' ),
				),
			),
		);

		if ( 'wp_template' === $this->post_type ) {
			$schema['properties']['is_custom'] = array(
				'description' => __( 'Whether a template is a custom template.', 'gutenberg' ),
				'type'        => 'bool',
				'context'     => array( 'embed', 'view', 'edit' ),
				'readonly'    => true,
			);
		}

		if ( 'wp_template_part' === $this->post_type ) {
			$schema['properties']['area'] = array(
				'description' => __( 'Where the template part is intended for use (header, footer, etc.)', 'gutenberg' ),
				'type'        => 'string',
				'context'     => array( 'embed', 'view', 'edit' ),
			);
		}

		$this->schema = $schema;

		return $this->add_additional_fields_schema( $this->schema );
	}
}
