/**
 * External dependencies
 */
import { parse as hpqParse } from 'hpq';
import { castArray, mapValues, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { autop } from '@wordpress/autop';

/**
 * Internal dependencies
 */
import { parse as grammarParse } from './post.pegjs';
import { getBlockType, getUnknownTypeHandlerName } from './registration';
import { createBlock } from './factory';
import { isValidBlock } from './validation';
import { getCommentDelimitedContent } from './serializer';
import { attr, prop, html, text, query, node, children } from './matchers';

/**
 * Returns value coerced to the specified JSON schema type string.
 *
 * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
 *
 * @param {*}      value Original value.
 * @param {string} type  Type to coerce.
 *
 * @return {*} Coerced value.
 */
export function asType( value, type ) {
	switch ( type ) {
		case 'string':
			return String( value );

		case 'boolean':
			return Boolean( value );

		case 'object':
			return Object( value );

		case 'null':
			return null;

		case 'array':
			if ( Array.isArray( value ) ) {
				return value;
			}

			return Array.from( value );

		case 'integer':
		case 'number':
			return Number( value );
	}

	return value;
}

/**
 * Returns an hpq matcher given a source object.
 *
 * @param {Object} sourceConfig Attribute Source object.
 *
 * @return {Function} A hpq Matcher.
 */
export function matcherFromSource( sourceConfig ) {
	switch ( sourceConfig.source ) {
		case 'attribute':
			return attr( sourceConfig.selector, sourceConfig.attribute );
		case 'property':
			return prop( sourceConfig.selector, sourceConfig.property );
		case 'html':
			return html( sourceConfig.selector );
		case 'text':
			return text( sourceConfig.selector );
		case 'children':
			return children( sourceConfig.selector );
		case 'node':
			return node( sourceConfig.selector );
		case 'query':
			const subMatchers = mapValues( sourceConfig.query, matcherFromSource );
			return query( sourceConfig.selector, subMatchers );
		default:
			// eslint-disable-next-line no-console
			console.error( `Unknown source type "${ sourceConfig.source }"` );
	}
}

/**
 * Given a block's raw content and an attribute's schema returns the attribute's
 * value depending on its source.
 *
 * @param {string} innerHTML         Block's raw content.
 * @param {Object} attributeSchema   Attribute's schema.
 *
 * @return {*} Attribute value.
 */
export function parseWithAttributeSchema( innerHTML, attributeSchema ) {
	return hpqParse( innerHTML, matcherFromSource( attributeSchema ) );
}

/**
 * Given an attribute key, an attribute's schema, a block's raw content and the
 * commentAttributes returns the attribute value depending on its source
 * definition of the given attribute key.
 *
 * @param {string} attributeKey      Attribute key.
 * @param {Object} attributeSchema   Attribute's schema.
 * @param {string} innerHTML         Block's raw content.
 * @param {Object} commentAttributes Block's comment attributes.
 *
 * @return {*} Attribute value.
 */
export function getBlockAttribute( attributeKey, attributeSchema, innerHTML, commentAttributes ) {
	let value;
	switch ( attributeSchema.source ) {
		// undefined source means that it's an attribute serialized to the block's "comment"
		case undefined:
			value = commentAttributes ? commentAttributes[ attributeKey ] : undefined;
			break;
		case 'attribute':
		case 'property':
		case 'html':
		case 'text':
		case 'children':
		case 'node':
		case 'query':
			value = parseWithAttributeSchema( innerHTML, attributeSchema );
			break;
	}

	return value === undefined ? attributeSchema.default : asType( value, attributeSchema.type );
}

/**
 * Returns the block attributes of a registered block node given its type.
 *
 * @param {?Object} blockType  Block type.
 * @param {string}  innerHTML  Raw block content.
 * @param {?Object} attributes Known block attributes (from delimiters).
 *
 * @return {Object} All block attributes.
 */
export function getBlockAttributes( blockType, innerHTML, attributes ) {
	const blockAttributes = mapValues( blockType.attributes, ( attributeSchema, attributeKey ) => {
		return getBlockAttribute( attributeKey, attributeSchema, innerHTML, attributes );
	} );

	return blockAttributes;
}

/**
 * Attempt to parse the innerHTML using using a supplied `deprecated`
 * definition.
 *
 * @param {?Object} blockType   Block type.
 * @param {string}  innerHTML   Raw block content.
 * @param {?Object} attributes  Known block attributes (from delimiters).
 * @param {?Array}  innerBlocks Array of innerBlocks.
 *
 * @return {Object} Block attributes.
 */
export function getAttributesAndInnerBlocksFromDeprecatedVersion( blockType, innerHTML, attributes, innerBlocks ) {
	// Not all blocks need a deprecated definition so avoid unnecessary computational cycles
	// as early as possible when `deprecated` property is not supplied.
	if ( ! blockType.deprecated || ! blockType.deprecated.length ) {
		return;
	}

	// There is no notion of version numbers for blocks. Instead, deprecated versions
	// are defined implicitly as successive array entries containing the relevant definitions
	// for handling each block variation. In order to validate a provided source, it has
	// to attempt to parse each array entry at a time.
	for ( let i = 0; i < blockType.deprecated.length; i++ ) {
		const deprecatedBlockType = {
			...omit( blockType, [ 'attributes', 'save', 'supports' ] ), // Parsing/Serialization properties
			...blockType.deprecated[ i ],
		};

		try {
			// Handle migration of older attributes into current version if necessary.
			const deprecatedBlockAttributes = getBlockAttributes( deprecatedBlockType, innerHTML, attributes );

			// Attempt to validate the parsed block. Ignore if the the validation step fails.
			const isValid = isValidBlock( innerHTML, deprecatedBlockType, deprecatedBlockAttributes );
			if ( isValid ) {
				const migratedBlockAttributesAndInnerBlocks = deprecatedBlockType.migrate &&
					deprecatedBlockType.migrate( deprecatedBlockAttributes, innerBlocks );

				if ( migratedBlockAttributesAndInnerBlocks ) {
					const [
						migratedAttributes,
						migratedInnerBlocks = innerBlocks,
					] = castArray( migratedBlockAttributesAndInnerBlocks );
					return { attributes: migratedAttributes, innerBlocks: migratedInnerBlocks };
				}

				return { attributes: deprecatedBlockAttributes, innerBlocks };
			}
		} catch ( error ) {
			// Ignore error, it means this deprecated version is invalid.
		}
	}
}

/**
 * Parses the content and extracts the list of footnotes.
 *
 * @param {?Array} content The content to parse.
 *
 * @return {Array} Array of footnote ids.
 */
export function parseFootnotesFromContent( content ) {
	if ( ! content || ! Array.isArray( content ) ) {
		return [];
	}

	return content.reduce( ( footnotes, element ) => {
		if ( element.type === 'sup' &&
				element.props.className === 'footnote' &&
				element.props[ 'data-footnote-id' ] ) {
			return footnotes.concat( element.props[ 'data-footnote-id' ] );
		}

		return footnotes;
	}, [] );
}

/**
 * Creates a block with fallback to the unknown type handler.
 *
 * @param {Object} blockNode Parsed block node.
 *
 * @return {?Object} An initialized block object (if possible).
 */
export function createBlockWithFallback( blockNode ) {
	let {
		blockName: name,
		attrs: attributes,
		innerBlocks = [],
		innerHTML,
	} = blockNode;

	attributes = attributes || {};

	// Trim content to avoid creation of intermediary freeform segments.
	innerHTML = innerHTML.trim();

	// Use type from block content, otherwise find unknown handler.
	name = name || getUnknownTypeHandlerName();

	// Convert 'core/text' blocks in existing content to 'core/paragraph'.
	if ( 'core/text' === name || 'core/cover-text' === name ) {
		name = 'core/paragraph';
	}

	// Try finding the type for known block name, else fall back again.
	let blockType = getBlockType( name );

	const fallbackBlock = getUnknownTypeHandlerName();

	// Fallback content may be upgraded from classic editor expecting implicit
	// automatic paragraphs, so preserve them. Assumes wpautop is idempotent,
	// meaning there are no negative consequences to repeated autop calls.
	if ( name === fallbackBlock ) {
		innerHTML = autop( innerHTML ).trim();
	}

	if ( ! blockType ) {
		// If detected as a block which is not registered, preserve comment
		// delimiters in content of unknown type handler.
		if ( name ) {
			innerHTML = getCommentDelimitedContent( name, attributes, innerHTML );
		}

		name = fallbackBlock;
		blockType = getBlockType( name );
	}

	// Coerce inner blocks from parsed form to canonical form.
	innerBlocks = innerBlocks.map( createBlockWithFallback );

	// Include in set only if type were determined.
	if ( ! blockType || ( ! innerHTML && name === fallbackBlock ) ) {
		return;
	}

	const block = createBlock(
		name,
		getBlockAttributes( blockType, innerHTML, attributes ),
		innerBlocks
	);

	// Block validation assumes an idempotent operation from source block to serialized block
	// provided there are no changes in attributes. The validation procedure thus compares the
	// provided source value with the serialized output before there are any modifications to
	// the block. When both match, the block is marked as valid.
	if ( name !== fallbackBlock ) {
		block.isValid = isValidBlock( innerHTML, blockType, block.attributes );
	}

	// Preserve original content for future use in case the block is parsed as
	// invalid, or future serialization attempt results in an error.
	block.originalContent = innerHTML;

	// When the block is invalid, attempt to parse it using a deprecated definition.
	// This enables blocks to modify its attributes and markup structure without
	// invalidating content written in previous formats.
	if ( ! block.isValid ) {
		const attributesAndInnerBlocksParsedWithDeprecatedVersion = getAttributesAndInnerBlocksFromDeprecatedVersion(
			blockType, innerHTML, attributes, block.innerBlocks
		);

		if ( attributesAndInnerBlocksParsedWithDeprecatedVersion ) {
			block.isValid = true;
			block.attributes = attributesAndInnerBlocksParsedWithDeprecatedVersion.attributes;
			block.innerBlocks = attributesAndInnerBlocksParsedWithDeprecatedVersion.innerBlocks || [];
		}
	}

	const footnotes = parseFootnotesFromContent( block.attributes.content );
	if ( footnotes.length ) {
		block.footnotes = footnotes;
	}

	return block;
}

/**
 * Parses the post content with a PegJS grammar and returns a list of blocks.
 *
 * @param {string} content The post content.
 *
 * @return {Array} Block list.
 */
export function parseWithGrammar( content ) {
	return grammarParse( content ).reduce( ( memo, blockNode ) => {
		const block = createBlockWithFallback( blockNode );
		if ( block ) {
			memo.push( block );
		}
		return memo;
	}, [] );
}

export default parseWithGrammar;
