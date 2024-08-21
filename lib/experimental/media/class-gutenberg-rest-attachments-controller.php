<?php
/**
 * Class Gutenberg_REST_Attachments_Controller.
 *
 * @package MediaExperiments
 */

/**
 * Class Gutenberg_REST_Attachments_Controller.
 */
class Gutenberg_REST_Attachments_Controller extends WP_REST_Attachments_Controller {
	/**
	 * Registers the routes for attachments.
	 *
	 * @see register_rest_route()
	 */
	public function register_routes(): void {
		parent::register_routes();

		$args                       = $this->get_endpoint_args_for_item_schema();
		$args['generate_sub_sizes'] = array(
			'type'        => 'boolean',
			'default'     => true,
			'description' => __( 'Whether to generate image sub sizes.', 'gutenberg' ),
		);
		$args['convert_format']     = array(
			'type'        => 'boolean',
			'default'     => true,
			'description' => __( 'Whether to support server-side format conversion.', 'gutenberg' ),
		);

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
					'args'                => $args,
				),
				'allow_batch' => $this->allow_batch,
				'schema'      => array( $this, 'get_public_item_schema' ),
			),
			true
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sideload',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'sideload_item' ),
					'permission_callback' => array( $this, 'sideload_item_permissions_check' ),
					'args'                => array(
						'id'         => array(
							'description' => __( 'Unique identifier for the attachment.', 'gutenberg' ),
							'type'        => 'integer',
						),
						'image_size' => array(
							'description' => __( 'Image size.', 'gutenberg' ),
							'type'        => 'string',
							'required'    => true,
						),
					),
				),
				'allow_batch' => $this->allow_batch,
				'schema'      => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Prepares a single attachment output for response.
	 *
	 * Ensures 'missing_image_sizes' is set for PDFs and not just images.
	 *
	 * @param WP_Post         $item    Attachment object.
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function prepare_item_for_response( $item, $request ): WP_REST_Response {
		$fields   = $this->get_fields_for_response( $request );
		$response = parent::prepare_item_for_response( $item, $request );

		$data = $response->get_data();

		if ( rest_is_field_included( 'missing_image_sizes', $fields ) ) {
			$mime_type = get_post_mime_type( $item );
			if ( 'application/pdf' === $mime_type ) {
				// Try to create missing image sizes for PDFs.

				$metadata = wp_get_attachment_metadata( $item->ID, true );

				if ( ! is_array( $metadata ) ) {
					$metadata = array();
				}

				$metadata['sizes'] = $metadata['sizes'] ?? array();

				$fallback_sizes = array(
					'thumbnail',
					'medium',
					'large',
				);

				remove_filter( 'fallback_intermediate_image_sizes', '__return_empty_array', 100 );

				/** This filter is documented in wp-admin/includes/image.php */
				$fallback_sizes = apply_filters( 'fallback_intermediate_image_sizes', $fallback_sizes, $metadata ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

				$registered_sizes = wp_get_registered_image_subsizes();
				$merged_sizes     = array_keys( array_intersect_key( $registered_sizes, array_flip( $fallback_sizes ) ) );

				$missing_image_sizes         = array_diff( $merged_sizes, array_keys( $metadata['sizes'] ) );
				$data['missing_image_sizes'] = $missing_image_sizes;
			}
		}

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $data, $request );
		$data    = $this->filter_response_by_context( $data, $context );

		$links = $response->get_links();

		// Wrap the data in a response object.
		$response = rest_ensure_response( $data );

		foreach ( $links as $rel => $rel_links ) {
			foreach ( $rel_links as $link ) {
				$response->add_link( $rel, $link['href'], $link['attributes'] );
			}
		}

		return $response;
	}

	/**
	 * Creates a single attachment.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, WP_Error object on failure.
	 */
	public function create_item( $request ) {
		if ( false === $request['generate_sub_sizes'] ) {
			add_filter( 'intermediate_image_sizes_advanced', '__return_empty_array', 100 );
			add_filter( 'fallback_intermediate_image_sizes', '__return_empty_array', 100 );

		}

		if ( false === $request['convert_format'] ) {
			// Prevent image conversion as that is done client-side.
			add_filter( 'image_editor_output_format', '__return_empty_array', 100 );
		}

		$response = parent::create_item( $request );

		remove_filter( 'intermediate_image_sizes_advanced', '__return_empty_array', 100 );
		remove_filter( 'fallback_intermediate_image_sizes', '__return_empty_array', 100 );
		remove_filter( 'image_editor_output_format', '__return_empty_array', 100 );

		return $response;
	}


	/**
	 * Checks if a given request has access to sideload a file.
	 *
	 * Sideloading a file for an existing attachment
	 * requires both update and create permissions.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to update the item, WP_Error object otherwise.
	 */
	public function sideload_item_permissions_check( $request ) {
		$post = $this->get_post( $request['id'] );

		if ( is_wp_error( $post ) ) {
			return $post;
		}

		if ( ! $this->check_update_permission( $post ) ) {
			return new WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to edit this post.', 'gutenberg' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		if ( ! current_user_can( 'upload_files' ) ) {
			return new WP_Error(
				'rest_cannot_create',
				__( 'Sorry, you are not allowed to upload media on this site.', 'gutenberg' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * Side-loads a media file without creating an attachment.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, WP_Error object on failure.
	 */
	public function sideload_item( WP_REST_Request $request ) {
		$attachment_id = $request['id'];

		if ( 'attachment' !== get_post_type( $attachment_id ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Invalid parent type.', 'gutenberg' ),
				array( 'status' => 400 )
			);
		}

		if ( false === $request['convert_format'] ) {
			// Prevent image conversion as that is done client-side.
			add_filter( 'image_editor_output_format', '__return_empty_array', 100 );
		}

		// Get the file via $_FILES or raw data.
		$files   = $request->get_file_params();
		$headers = $request->get_headers();

		// wp_unique_filename() will always add numeric suffix if the name looks like a sub-size to avoid conflicts.
		// See https://github.com/WordPress/wordpress-develop/blob/30954f7ac0840cfdad464928021d7f380940c347/src/wp-includes/functions.php#L2576-L2582
		// With this filter we can work around this safeguard.

		$attachment_filename = get_attached_file( $attachment_id, true );
		$attachment_filename = $attachment_filename ? basename( $attachment_filename ) : null;

		/**
		 * Filters the result when generating a unique file name.
		 *
		 * @param string        $filename                 Unique file name.
		 * @param string        $ext                      File extension. Example: ".png".
		 * @param string        $dir                      Directory path.
		 * @param callable|null $unique_filename_callback Callback function that generates the unique file name.
		 * @param string[]      $alt_filenames            Array of alternate file names that were checked for collisions.
		 * @param int|string    $number                   The highest number that was used to make the file name unique
		 *                                                or an empty string if unused.
		 *
		 * @return string Filtered file name.
		 */
		$filter_filename = static function ( $filename, $ext, $dir, $unique_filename_callback, $alt_filenames, $number ) use ( $attachment_filename ) {
			if ( empty( $number ) || ! $attachment_filename ) {
				return $filename;
			}

			$ext       = pathinfo( $filename, PATHINFO_EXTENSION );
			$name      = pathinfo( $filename, PATHINFO_FILENAME );
			$orig_name = pathinfo( $attachment_filename, PATHINFO_FILENAME );

			if ( ! $ext || ! $name ) {
				return $filename;
			}

			$matches = array();
			if ( preg_match( '/(.*)(-\d+x\d+)-' . $number . '$/', $name, $matches ) ) {
				$filename_without_suffix = $matches[1] . $matches[2] . ".$ext";
				if ( $matches[1] === $orig_name && ! file_exists( "$dir/$filename_without_suffix" ) ) {
					return $filename_without_suffix;
				}
			}

			return $filename;
		};

		add_filter( 'wp_unique_filename', $filter_filename, 10, 6 );

		// See https://github.com/swissspidy/media-experiments/issues/465.
		// See https://core.trac.wordpress.org/ticket/61189.
		if ( version_compare( get_bloginfo( 'version' ), '6.6-beta1', '>=' ) ) {
			$parent_post = get_post_parent( $attachment_id );

			$time = null;

			// Matches logic in media_handle_upload().
			// The post date doesn't usually matter for pages, so don't backdate this upload.
			if ( $parent_post && 'page' !== $parent_post->post_type && substr( $parent_post->post_date, 0, 4 ) > 0 ) {
				$time = $parent_post->post_date;
			}

			if ( ! empty( $files ) ) {
				$file = $this->upload_from_file( $files, $headers, $time );
			} else {
				$file = $this->upload_from_data( $request->get_body(), $headers, $time );
			}
		} else {
			if ( ! empty( $files ) ) {
				$file = $this->upload_from_file( $files, $headers );
			} else {
				$file = $this->upload_from_data( $request->get_body(), $headers );
			}
		}

		remove_filter( 'wp_unique_filename', $filter_filename );
		remove_filter( 'image_editor_output_format', '__return_empty_array', 100 );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		$type = $file['type'];
		$path = $file['file'];

		// TODO: Better fallback if image_size is not provided.
		$image_size = $request['image_size'];

		$metadata = wp_get_attachment_metadata( $attachment_id, true );

		if ( ! $metadata ) {
			$metadata = array();
		}

		if ( 'original' === $image_size ) {
			$metadata['original_image'] = basename( $path );
		} else {
			$metadata['sizes'] = $metadata['sizes'] ?? array();

			$size = wp_getimagesize( $path );

			$metadata['sizes'][ $image_size ] = array(
				'width'     => $size ? $size[0] : 0,
				'height'    => $size ? $size[1] : 0,
				'file'      => basename( $path ),
				'mime-type' => $type,
				'filesize'  => wp_filesize( $path ),
			);
		}

		wp_update_attachment_metadata( $attachment_id, $metadata );

		$response_request = new WP_REST_Request(
			WP_REST_Server::READABLE,
			rest_url( sprintf( '%s/%s/%d', $this->namespace, $this->rest_base, $attachment_id ) )
		);

		$response_request->set_param( 'context', 'edit' );

		if ( isset( $request['_fields'] ) ) {
			$response_request['_fields'] = $request['_fields'];
		}

		$response = $this->prepare_item_for_response( get_post( $attachment_id ), $response_request );

		$response->set_status( 201 );
		$response->header( 'Location', rest_url( sprintf( '%s/%s/%d', $this->namespace, $this->rest_base, $attachment_id ) ) );

		return $response;
	}
}
