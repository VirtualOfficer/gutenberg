<?php
/**
 * REST API: WP_REST_Post_Format_Search_Handler class
 *
 * @package Gutenberg
 */

/**
 * Core class representing a search handler for post formats in the REST API.
 *
 * @see WP_REST_Search_Handler
 */
class WP_REST_Post_Format_Search_Handler extends WP_REST_Search_Handler {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->type = 'post-format';
	}

	/**
	 * Searches the object type content for a given search request.
	 *
	 * @param WP_REST_Request $request Full REST request.
	 * @return array Associative array containing an `WP_REST_Search_Handler::RESULT_IDS` containing
	 *               an array of found IDs and `WP_REST_Search_Handler::RESULT_TOTAL` containing the
	 *               total count for the matching search results.
	 */
	public function search_items( WP_REST_Request $request ) {
		$format_strings = get_post_format_strings();
		$format_slugs   = array_keys( $format_strings );

		$query_args = array();

		if ( ! empty( $request['search'] ) ) {
			$query_args['search'] = $request['search'];
		}

		/**
		 * Filters the query arguments for a search request.
		 *
		 * Enables adding extra arguments or setting defaults for a post format search request.
		 *
		 * @param array           $query_args Key value array of query var to query value.
		 * @param WP_REST_Request $request    The request used.
		 */
		$query_args = apply_filters( 'rest_post_format_search_query', $query_args, $request );

		$found_ids = array();
		foreach ( $format_slugs as $index => $format_slug ) {
			if ( ! empty( $query_args['search'] ) ) {
				$format_string       = get_post_format_string( $format_slug );
				$format_slug_match   = stripos( $format_slug, $query_args['search'] ) !== false;
				$format_string_match = stripos( $format_string, $query_args['search'] ) !== false;
				if ( ! $format_slug_match && ! $format_string_match ) {
					continue;
				}
			}

			$format_link = get_post_format_link( $format_slug );
			if ( $format_link ) {
				// Formats don't have an ID, so fake one using the array index.
				$found_ids[] = $index + 1;
			}
		}

		$page     = (int) $request['page'];
		$per_page = (int) $request['per_page'];

		return array(
			self::RESULT_IDS   => array_slice( $found_ids, ( $page - 1 ) * $per_page, $per_page ),
			self::RESULT_TOTAL => count( $found_ids ),
		);
	}

	/**
	 * Prepares the search result for a given ID.
	 *
	 * @param int   $id     Item ID.
	 * @param array $fields Fields to include for the item.
	 * @return array Associative array containing all fields for the item.
	 */
	public function prepare_item( $id, array $fields ) {
		$format_strings = get_post_format_strings();
		$format_slugs   = array_keys( $format_strings );
		$format_slug    = $format_slugs[ $id - 1 ];

		$data = array();

		if ( in_array( WP_REST_Search_Controller::PROP_ID, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_ID ] = $id;
		}

		if ( in_array( WP_REST_Search_Controller::PROP_TITLE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TITLE ] = get_post_format_string( $format_slug );
		}

		if ( in_array( WP_REST_Search_Controller::PROP_URL, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_URL ] = get_post_format_link( $format_slug );
		}

		if ( in_array( WP_REST_Search_Controller::PROP_TYPE, $fields, true ) ) {
			$data[ WP_REST_Search_Controller::PROP_TYPE ] = $this->type;
		}

		return $data;
	}

	/**
	 * Prepares links for the search result.
	 *
	 * @param string $id Item ID.
	 * @return array Links for the given item.
	 */
	public function prepare_item_links( $id ) { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
		return array();
	}

}
