/**
 * External dependencies
 */
import { difference } from 'lodash';
import { html as beautifyHtml } from 'js-beautify';

/**
 * Internal dependencies
 */
import { getBlockSettings } from './registration';
import { parseBlockAttributes } from './parser';

/**
 * Given a block's save render implementation and attributes, returns the
 * static markup to be saved.
 *
 * @param  {Function|WPComponent} save       Save render implementation
 * @param  {Object}               attributes Block attributes
 * @return {string}                          Save content
 */
export function getSaveContent( save, attributes ) {
	let rawContent;

	if ( save.prototype instanceof wp.element.Component ) {
		rawContent = wp.element.createElement( save, { attributes } );
	} else {
		rawContent = save( { attributes } );

		// Special-case function render implementation to allow raw HTML return
		if ( 'string' === typeof rawContent ) {
			return rawContent;
		}
	}

	// Otherwise, infer as element
	return wp.element.renderToString( rawContent );
}

/**
 * Returns comment attributes as serialized string, determined by subset of
 * difference between actual attributes of a block and those expected based
 * on its settings.
 *
 * @param  {Object} realAttributes     Actual block attributes
 * @param  {Object} expectedAttributes Expected block attributes
 * @return {string}                    Comment attributes
 */
export function getCommentAttributes( realAttributes, expectedAttributes ) {
	// Find difference and build into object subset of attributes.
	const keys = difference(
		Object.keys( realAttributes ),
		Object.keys( expectedAttributes )
	);

	// Serialize the comment attributes
	return keys
		.filter( key => undefined !== realAttributes[ key ] )
		.map( key => `${ key }="${ realAttributes[ key ] }"` )
		.join( ' ' );
}

/**
 * Takes a block list and returns the serialized post content
 *
 * @param  {Array}  blocks Block list
 * @return {String}        The post content
 */
export default function serialize( blocks ) {
	return blocks
		.map( block => {
			const blockType = block.blockType;
			const settings = getBlockSettings( blockType );
			const saveContent = getSaveContent( settings.save, block.attributes );
			const beautifyOptions = {
				indent_inner_html: true,
				wrap_line_length: 0,
			};
			const attributes = getCommentAttributes(
				block.attributes,
				parseBlockAttributes( saveContent, settings )
			);

			return [
				`<!-- wp:${ blockType }${ attributes ? ` ${ attributes } ` : ' ' }-->`,
				saveContent ? beautifyHtml( saveContent, beautifyOptions ) : undefined,
				`<!-- /wp:${ blockType } -->`,
			].join( '\n' );
		} )
		.join( '\n\n' )
		.concat( '\n\n' ); // since we no longer have off-by-one-errors with spacing, we may not need this
}
