/**
 * External dependencies
 */
import { omitBy, get } from 'lodash';
import { nodeListToReact } from 'dom-react';

/**
 * WordPress dependencies
 */
import { createElement, renderToString } from '@wordpress/element';

/**
 * Browser dependencies
 */

const { Node } = window;

/**
 * Transforms a WP Element to its corresponding HTML string.
 *
 * @param {WPElement} value Element.
 *
 * @return {string} HTML.
 */
export function elementToString( value ) {
	return renderToString( value );
}

/**
 * Transforms a value in a given format into string.
 *
 * @param {Array|string?}  value  DOM Elements.
 * @param {string} format Output format (string or element)
 *
 * @return {string} HTML output as string.
 */
export function valueToString( value, format ) {
	switch ( format ) {
		case 'string':
			return value || '';
		default:
			return elementToString( value );
	}
}

/**
 * Strips out TinyMCE specific attributes and nodes from a WPElement
 *
 * @param {string} type    Element type
 * @param {Object} props   Element Props
 * @param {Array} children Element Children
 *
 * @return {Element} WPElement.
 */
export function createTinyMCEElement( type, props, ...children ) {
	if ( props[ 'data-mce-bogus' ] === 'all' ) {
		return null;
	}

	if ( props.hasOwnProperty( 'data-mce-bogus' ) ) {
		return children;
	}

	return createElement(
		type,
		omitBy( props, ( _, key ) => key.indexOf( 'data-mce-' ) === 0 ),
		...children
	);
}

/**
 * Given a TinyMCE Node instance, returns an equivalent WordPress element.
 *
 * @param {tinyMCE.html.Node} node TinyMCE node
 *
 * @return {WPElement} WordPress element
 */
export function tinyMCENodeToElement( node ) {
	if ( node.type === Node.TEXT_NODE ) {
		return node.value;
	}

	const children = [];

	let child = node.firstChild;
	while ( child ) {
		children.push( tinyMCENodeToElement( child ) );
		child = child.next;
	}

	if ( node.type === Node.DOCUMENT_FRAGMENT_NODE ) {
		return children;
	}

	const attributes = get( node.attributes, [ 'map' ], {} );
	return createElement( node.name, attributes, ...children );
}

/**
 * Transforms an array of DOM Elements to their corresponding WP element.
 *
 * @param {Array} value DOM Elements.
 *
 * @return {WPElement} WP Element.
 */
export function domToElement( value ) {
	return nodeListToReact( value || [], createTinyMCEElement );
}

/**
 * Transforms an array of DOM Elements to their corresponding HTML string output.
 *
 * @param {Array}  value  DOM Elements.
 * @param {Editor} editor TinyMCE editor instance.
 *
 * @return {string} HTML.
 */
export function domToString( value, editor ) {
	const doc = document.implementation.createHTMLDocument( '' );

	Array.from( value ).forEach( ( child ) => {
		doc.body.appendChild( child );
	} );

	return editor ? editor.serializer.serialize( doc.body ) : doc.body.innerHTML;
}

/**
 * Transforms an array of DOM Elements to the given format.
 *
 * @param {Array}  value  DOM Elements.
 * @param {string} format Output format (string or element)
 * @param {Editor} editor TinyMCE editor instance.
 *
 * @return {*} Output.
 */
export function domToFormat( value, format, editor ) {
	switch ( format ) {
		case 'string':
			return domToString( value, editor );
		default:
			return domToElement( value );
	}
}
