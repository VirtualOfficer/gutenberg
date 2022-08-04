<?php
/**
 * Scans through an HTML document to find specific tags, then
 * transforms those tags by adding, removing, or updating the
 * values of the HTML attributes within that tag (opener).
 *
 * Does not fully parse HTML or _recurse_ into the HTML structure
 * Instead this scans linearly through a document and only parses
 * the HTML tag openers.
 *
 * @package WordPress
 * @subpackage HTML
 * @since 6.1.0
 */

/**
 * Processes an input HTML document by applying a specified set
 * of patches to that input. Tokenizes HTML but does not fully
 * parse the input document.
 *
 * @since 6.1.0
 */
class WP_HTML_Walker {

	/**
	 * The HTML document to parse.
	 *
	 * @since 6.1.0
	 * @var string
	 */
	private $html;

	/**
	 * The updated HTML document.
	 *
	 * @since 6.1.0
	 * @var string
	 */
	private $updated_html = '';

	/**
	 * How many bytes from the original HTML document were already read.
	 *
	 * @since 6.1.0
	 * @var int
	 */
	private $parsed_bytes = 0;

	/**
	 * How many bytes from the original HTML document were already treated
	 * with the requested replacements.
	 *
	 * @since 6.1.0
	 * @var int
	 */
	private $updated_bytes = 0;

	/**
	 * Whether the parsing is already finished.
	 *
	 * @since 6.1.0
	 * @var bool
	 */
	private $closed = false;

	/**
	 * The name of the currently matched tag.
	 *
	 * @since 6.1.0
	 * @var string|null
	 */
	private $tag_name;

	/**
	 * Byte offset after the name of current tag.
	 * Example:
	 *   <div
	 *   01234
	 *       ^ tag_name_ends_at = 4
	 *
	 * @since 6.1.0
	 * @var number
	 */
	private $tag_name_ends_at;

	/**
	 * Lazily-built index of attributes found within an HTML tag, keyed by the attribute name.
	 *
	 * Example:
	 * <code>
	 *     // supposing the parser is working through this content
	 *     // and stops after recognizing the `id` attribute
	 *     // <div id="test-4" class=outline title="data:text/plain;base64=asdk3nk1j3fo8">
	 *     //                 ^ parsing will continue from this point
	 *     $this->attributes = array(
	 *         'id' => new WP_HTML_Attribute_Match( 'id', null, 6, 17 )
	 *     );
	 *
	 *     // when picking up parsing again, or when asking to find the
	 *     // `class` attribute we will continue and add to this array
	 *     $this->attributes = array(
	 *         'id' => new WP_HTML_Attribute_Match( 'id', null, 6, 17 ),
	 *         'class' => new WP_HTML_Attribute_Match( 'class', 'outline', 18, 32 )
	 *     );
	 *
	 *     // Note that only the `class` attribute value is stored in the index.
	 *     // That's because it is the only value used by this class at the moment.
	 * </code>
	 *
	 * @since 6.1.0
	 * @var WP_HTML_Attribute_Token[]
	 */
	private $attributes = array();

	/**
	 * Which class names to add or remove from a tag.
	 *
	 * These are tracked separately from attribute updates because they are
	 * semantically distinct, whereas this interface exists for the common
	 * case of adding and removing class names while other attributes are
	 * generally modified as with DOM `setAttribute` calls.
	 *
	 * When modifying an HTML document these will eventually be collapsed
	 * into a single lexical update to replace the `class` attribute.
	 *
	 * Example:
	 * <code>
	 *     // Add the `WP-block-group` class, remove the `WP-group` class.
	 *     $class_changes = array(
	 *         // Indexed by a comparable class name
	 *         'wp-block-group' => new WP_Class_Name_Operation( 'WP-block-group', WP_Class_Name_Operation::ADD ),
	 *         'wp-group'       => new WP_Class_Name_Operation( 'WP-group', WP_Class_Name_Operation::REMOVE )
	 *     );
	 * </code>
	 *
	 * @since 6.1.0
	 * @var WP_Class_Name_Update[]
	 */
	private $classnames_updates = array();

	/**
	 * Lexical replacements to apply to input HTML document.
	 *
	 * HTML modifications collapse into lexical replacements in order to
	 * provide an efficient mechanism to update documents lazily and in
	 * order to support a variety of semantic modifications without
	 * building a complicated parsing machinery. That is, it's up to
	 * the calling class to generate the lexical modification from the
	 * semantic change requested.
	 *
	 * Example:
	 * <code>
	 *     // Replace an attribute stored with a new value, indices
	 *     // sourced from the lazily-parsed HTML recognizer.
	 *     $start = $attributes['src']->start;
	 *     $end   = $attributes['src']->end;
	 *     $modifications[] = new WP_Text_Replacement( $start, $end, get_the_post_thumbnail_url() );
	 *
	 *     // Correspondingly, something like this
	 *     // will appear in the replacements array.
	 *     $replacements = array(
	 *         WP_Text_Replacement( 14, 28, 'https://my-site.my-domain/wp-content/uploads/2014/08/kittens.jpg' )
	 *     );
	 * </code>
	 *
	 * @since 6.1.0
	 * @var WP_Text_Replacement[]
	 */
	private $attributes_updates = array();

	/**
	 * Constructor.
	 *
	 * @since 6.1.0
	 *
	 * @param string $html HTML to process.
	 */
	public function __construct( $html ) {
		$this->html = $html;
	}

	/**
	 * Finds the next tag matching the $query.
	 *
	 * @since 6.1.0
	 *
	 * @param array|string $query {
	 *     Which tag name to find, having which class, etc.
	 *
	 *     @type string|null $tag_name     Which tag to find, or `null` for "any tag."
	 *     @type int|null    $match_offset Find the Nth tag matching all search criteria.
	 *                                     0 for "first" tag, 2 for "third," etc.
	 *                                     Defaults to first tag.
	 *     @type string|null $class_name   Tag must contain this whole class name to match.
	 * }
	 * @return boolean Whether a tag was matched.
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	public function next_tag( $query = null ) {
		$this->assert_not_closed();
		$descriptor           = WP_Tag_Find_Descriptor::parse( $query );
		$current_match_offset = - 1;
		do {
			/*
			 * Unfortunately we can't try to search for only the tag name we want because that might
			 * lead us to skip over other tags and lose track of our place. So we need to search for
			 * _every_ tag and then check after we find one if it's the one we are looking for.
			 */
			if ( false === $this->parse_next_tag() ) {
				$this->parsed_bytes = strlen( $this->html );

				return false;
			}

			// Parse all the attributes of the current tag.
			while ( $this->parse_next_attribute() ) {
				// Twiddle our thumbs...
			}

			if ( $descriptor->matches( $this->tag_name, $this->attributes ) ) {
				++ $current_match_offset;
			}
		} while ( $current_match_offset !== $descriptor->match_offset );

		return true;
	}

	/**
	 * Parses the next tag.
	 *
	 * @since 6.1.0
	 */
	private function parse_next_tag() {
		$this->after_tag();
		$matches = $this->consume_regexp(
			'~<!--(?>.*?-->)|<!\[CDATA\[(?>.*?\]\]>)|<\?(?>.*?)>|<(?P<TAG_NAME>[a-z][^\x{09}\x{0a}\x{0c}\x{20}\/>]*)~mui'
		);
		if ( false === $matches ) {
			return false;
		}
		if ( empty( $matches['TAG_NAME'][0] ) ) {
			return $this->parse_next_tag();
		}
		$this->tag_name         = $matches['TAG_NAME'][0];
		$this->tag_name_ends_at = $this->parsed_bytes;
	}

	/**
	 * Parses the next attribute.
	 *
	 * @since 6.1.0
	 */
	private function parse_next_attribute() {
		$name_match = $this->consume_regexp(
			'~
			# Preceeding whitespace:
			[\x{09}\x{0a}\x{0c}\x{20} ]*
			# The next attribute:
			(?P<NAME>(?>
				# Attribute names starting with an equals sign (yes, this is valid)
				=?[^=\/>\x{09}\x{0a}\x{0c}\x{20}]*
				|
				# Attribute names starting with anything other than an equals sign:
				[^=\/>\x{09}\x{0a}\x{0c}\x{20}]+
			))
			~miux'
		);

		// No attribute, just tag closer.
		if ( empty( $name_match['NAME'][0] ) ) {
			return false;
		}

		list( $attribute_name, $attribute_start ) = $name_match['NAME'];

		// Skip whitespace.
		$this->consume_regexp( '~[\x{09}\x{0a}\x{0c}\x{20}]*~u' );

		$has_value = '=' === $this->html[ $this->parsed_bytes ];
		if ( $has_value ) {
			$this->parsed_bytes ++;
			$value_match     = $this->consume_regexp(
				"~
				# Preceeding whitespace
				[\x{09}\x{0a}\x{0c}\x{20}]*
				(?:
					# A quoted attribute value
					(?P<QUOTE>['\"])(?P<VALUE>.*?)\k<QUOTE>
					|
					# An unquoted attribute value
					(?P<VALUE>[^=\/>\x{09}\x{0a}\x{0c}\x{20}]*)
				)
				~miuJx"
			);
			$attribute_value = $value_match['VALUE'][0];
			$attribute_end   = $this->offset_after_match( $value_match[0] );
		} else {
			$attribute_value = 'true';
			$attribute_end   = $this->offset_after_match( $name_match['NAME'] );
		}

		if ( ! array_key_exists( $attribute_name, $this->attributes ) ) {
			$this->attributes[ $attribute_name ] = new WP_HTML_Attribute_Token(
				$attribute_name,
				// Avoid storing large, base64-encoded images. This class only ever uses the "class"
				// attribute value, so let's store just that. If we need to do attribute-based matching
				// in the future, this function could start accepting a list of relevant attributes.
				'class' === $attribute_name ? $attribute_value : null,
				$attribute_start,
				$attribute_end
			);
		}

		return $this->attributes[ $attribute_name ];
	}

	/**
	 * Asserts that the HTML Walker has not been closed for further lookup or modifications.
	 *
	 * @since 6.1.0
	 *
	 * @throws WP_HTML_Walker_Exception If the HTML Walker has been closed.
	 */
	private function assert_not_closed() {
		if ( $this->closed ) {
			throw new WP_HTML_Walker_Exception(
				'This WP_HTML_Walker was already cast to a string and ' .
				'no further lookups or updates are possible. This is because ' .
				'the HTML parsing algorithm only moves forward and the ' .
				'cursor is already at the end of the HTML document.'
			);
		}
	}

	/**
	 * Applies attribute updates and cleans up once a tag is fully parsed.
	 *
	 * @since 6.1.0
	 *
	 * @return void
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	private function after_tag() {
		$this->class_name_updates_to_attributes_updates();
		$this->apply_attributes_updates();
		$this->tag_name         = null;
		$this->tag_name_ends_at = null;
		$this->attributes       = array();
	}

	/**
	 * Converts class name updates into tag attributes updates
	 * (they are accumulated in different data formats for performance).
	 *
	 * This method is only meant to run right before the attribute updates are applied.
	 * The behavior in all other cases is undefined.
	 *
	 * @since 6.1.0
	 *
	 * @return void
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 * @see $classnames_updates
	 * @see $attributes_updates
	 */
	private function class_name_updates_to_attributes_updates() {
		$classname_updates        = $this->classnames_updates;
		$this->classnames_updates = array();
		if ( empty( $classname_updates ) || array_key_exists( 'class', $this->attributes_updates ) ) {
			return;
		}

		$existing_class_attr = $this->get_current_tag_attribute( 'class' );
		$existing_class      = $existing_class_attr ? $existing_class_attr->value : '';

		$seen_classes = array();

		// Remove unwanted classes.
		$new_class = preg_replace_callback(
			'~(?:^|[ \t])([^ \t]+)~miu',
			function ( $matches ) use ( &$seen_classes, $classname_updates ) {
				list( $full_match, $class_name ) = $matches;

				$comparable_name                  = self::comparable( $class_name );
				$seen_classes[ $comparable_name ] = true;
				if (
					array_key_exists( $comparable_name, $classname_updates ) &&
					WP_Class_Name_Update::REMOVE === $classname_updates[ $comparable_name ]->type
				) {
					return '';
				}

				return $full_match;
			},
			$existing_class
		);

		// Add new classes.
		foreach ( $classname_updates as $comparable_name => $operation ) {
			if ( WP_Class_Name_Update::ADD === $operation->type && ! isset( $seen_classes[ $comparable_name ] ) ) {
				$new_class .= " {$operation->class_name}";
			}
		}

		if ( $existing_class !== $new_class ) {
			if ( $new_class ) {
				$this->set_attribute( 'class', trim( $new_class ) );
			} else {
				$this->remove_attribute( 'class' );
			}
		}
	}

	/**
	 * Applies updates to attributes.
	 *
	 * @since 6.1.0
	 */
	private function apply_attributes_updates() {
		if ( ! count( $this->attributes_updates ) ) {
			return;
		}
		$updates = array_values( $this->attributes_updates );
		/**
		 * The replacement algorithm only works when the updates are
		 * sorted by their start byte offset. However, they can be
		 * enqueued by the user in any arbitrary order.
		 * Well, let's sort them!
		 */
		usort(
			$updates,
			function ( $update1, $update2 ) {
				return $update1->start - $update2->start;
			}
		);

		foreach ( $updates as $diff ) {
			$this->updated_html .= substr( $this->html, $this->updated_bytes, $diff->start - $this->updated_bytes );
			$this->updated_html .= $diff->text;
			$this->updated_bytes = $diff->end;
		}
		$this->attributes_updates = array();
	}

	/**
	 * Updates or creates a new attribute on the currently matched tag.
	 *
	 * @since 6.1.0
	 *
	 * @param string $name  The attribute name to target.
	 * @param string $value The new attribute value.
	 *
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	public function set_attribute( $name, $value ) {
		$this->assert_not_closed();
		if ( ! $this->tag_name ) {
			return;
		}
		$escaped_new_value = esc_attr( $value );
		$updated_attribute = "{$name}=\"{$escaped_new_value}\"";

		$attr = $this->get_current_tag_attribute( $name );
		if ( $attr ) {
			/*
			 * Update an existing attribute.
			 *
			 * Example – set attribute id to "new" in <div id="initial_id" />:
			 *    <div id="initial_id"/>
			 *         ^-------------^
			 *         start         end
			 *    replacement: `id="new"`
			 *
			 *    Result: <div id="new"/>
			 */
			$this->attributes_updates[ $name ] = new WP_Text_Replacement(
				$attr->start,
				$attr->end,
				$updated_attribute
			);
		} else {
			/*
			 * Create a new attribute at the tag's name end.
			 *
			 * Example – add attribute id="new" to <div />:
			 *    <div/>
			 *        ^
			 *        start and end
			 *    replacement: ` id="new"`
			 *
			 *    Result: <div id="new"/>
			 */
			$this->attributes_updates[ $name ] = new WP_Text_Replacement(
				$this->tag_name_ends_at,
				$this->tag_name_ends_at,
				' ' . $updated_attribute
			);
		}
	}

	/**
	 * Removes an attribute of the currently matched tag.
	 *
	 * @since 6.1.0
	 *
	 * @param string $name The attribute name to remove.
	 *
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	public function remove_attribute( $name ) {
		$this->assert_not_closed();
		$attr = $this->get_current_tag_attribute( $name );
		if ( $attr ) {
			/*
			 * Removes an existing tag attribute.
			 *
			 * Example – remove the attribute id from <div id="main"/>:
			 *    <div id="initial_id"/>
			 *         ^-------------^
			 *         start         end
			 *    replacement: ``
			 *
			 *    Result: <div />
			 */
			$this->attributes_updates[ $name ] = new WP_Text_Replacement(
				$attr->start,
				$attr->end,
				''
			);
		}
	}

	/**
	 * Returns the current tag attribute or false if not found.
	 *
	 * @since 6.1.0
	 *
	 * @param string $name The attribute name to target.
	 * @return WP_HTML_Attribute_Token|boolean The attribute token, or false if not found.
	 */
	private function get_current_tag_attribute( $name ) {
		if ( array_key_exists( $name, $this->attributes ) ) {
			return $this->attributes[ $name ];
		}

		return false;
	}

	/**
	 * Return true when the HTML Walker is closed for further lookups and modifications.
	 *
	 * @since 6.1.0
	 *
	 * @return boolean True if the HTML Walker is closed, false otherwise.
	 */
	public function is_closed() {
		return $this->closed;
	}

	/**
	 * Adds a new class name to the currently matched tag.
	 *
	 * @since 6.1.0
	 *
	 * @param string $class_name The class name to add.
	 *
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	public function add_class( $class_name ) {
		$this->assert_not_closed();
		if ( $this->tag_name ) {
			$this->classnames_updates[ self::comparable( $class_name ) ] = new WP_Class_Name_Update( $class_name, true );
		}
	}

	/**
	 * Removes a class name from the currently matched tag.
	 *
	 * @since 6.1.0
	 *
	 * @param string $class_name The class name to remove.
	 *
	 * @throws WP_HTML_Walker_Exception Once this object was already stringified and closed.
	 */
	public function remove_class( $class_name ) {
		$this->assert_not_closed();
		if ( $this->tag_name ) {
			$this->classnames_updates[ self::comparable( $class_name ) ] = new WP_Class_Name_Update( $class_name, false );
		}
	}

	/**
	 * Returns the result of the search on the HTML document using the passed regular expression.
	 * If there is no match found it returns false.
	 *
	 * @since 6.1.0
	 *
	 * @param string $regexp The regular expression to process with the HTML document.
	 * @return array|false The result of the search or false if no matches found.
	 */
	private function consume_regexp( $regexp ) {
		$matches = null;
		$result  = preg_match(
			$regexp,
			$this->html,
			$matches,
			PREG_OFFSET_CAPTURE,
			$this->parsed_bytes
		);
		if ( 1 !== $result ) {
			return false;
		}
		$this->parsed_bytes = $this->offset_after_match( $matches[0] );

		return $matches;
	}

	/**
	 * Returns the offset after the match.
	 *
	 * @since 6.1.0
	 *
	 * @param array $match The match result filled by preg_match.
	 * @return int The offset after the match.
	 */
	private function offset_after_match( $match ) {
		return $match[1] + strlen( $match[0] );
	}

	/**
	 * Returns the string representation of the HTML Walker.
	 * It closes the HTML Walker and prevents further lookups and modifications.
	 *
	 * @since 6.1.0
	 *
	 * @return string The processed HTML.
	 */
	public function __toString() {
		if ( ! $this->is_closed() ) {
			$this->after_tag();
			$this->updated_html .= substr( $this->html, $this->updated_bytes );
			$this->parsed_bytes  = strlen( $this->html );
			$this->closed        = true;
		}

		return $this->updated_html;
	}

	/**
	 * Processes the passed comparable value.
	 *
	 * @since 6.1.0
	 *
	 * @param string $value The comparable value to process.
	 * @return string The processed value.
	 */
	public static function comparable( $value ) {
		return trim( strtolower( $value ) );
	}
}
