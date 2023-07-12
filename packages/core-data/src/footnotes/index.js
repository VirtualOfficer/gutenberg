/**
 * WordPress dependencies
 */
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../private-apis';

const { getRichTextValues } = unlock( blockEditorPrivateApis );

let oldFootnotes = {};

const cache = new WeakMap();

function getRichTextValuesCached( block ) {
	if ( ! cache.has( block ) ) {
		const values = getRichTextValues( [ block ] );
		cache.set( block, values );
	}
	return cache.get( block );
}

export function updateFootnotesFromMeta( blocks, meta ) {
	const output = { blocks };
	if ( ! meta ) return output;

	// If meta.footnotes is empty, it means the meta is not registered.
	if ( meta.footnotes === undefined ) return output;

	const _content = blocks.map( getRichTextValuesCached ).join( '' );

	const newOrder = [];

	// This can be avoided when
	// https://github.com/WordPress/gutenberg/pull/43204 lands. We can then
	// get the order directly from the rich text values.
	if ( _content.indexOf( 'data-fn' ) !== -1 ) {
		const regex = /data-fn="([^"]+)"/g;
		let match;
		while ( ( match = regex.exec( _content ) ) !== null ) {
			newOrder.push( match[ 1 ] );
		}
	}

	const footnotes = meta.footnotes ? JSON.parse( meta.footnotes ) : [];
	const currentOrder = footnotes.map( ( fn ) => fn.id );

	if ( currentOrder.join( '' ) === newOrder.join( '' ) ) return output;

	const newFootnotes = newOrder.map(
		( fnId ) =>
			footnotes.find( ( fn ) => fn.id === fnId ) ||
			oldFootnotes[ fnId ] || {
				id: fnId,
				content: '',
			}
	);

	function updateAttributes( attributes ) {
		// Only attempt to update attributes, if attributes is an object.
		if (
			! attributes ||
			Array.isArray( attributes ) ||
			typeof attributes !== 'object'
		) {
			return attributes;
		}

		attributes = { ...attributes };

		for ( const key in attributes ) {
			const value = attributes[ key ];

			if ( Array.isArray( value ) ) {
				attributes[ key ] = value.map( updateAttributes );
				continue;
			}

			if ( typeof value !== 'string' ) {
				continue;
			}

			if ( value.indexOf( 'data-fn' ) === -1 ) {
				continue;
			}

			// When we store rich text values, this would no longer
			// require a regex.
			const regex =
				/(<sup[^>]+data-fn="([^"]+)"[^>]*><a[^>]*>)[\d*]*<\/a><\/sup>/g;

			attributes[ key ] = value.replace(
				regex,
				( match, opening, fnId ) => {
					const index = newOrder.indexOf( fnId );
					return `${ opening }${ index + 1 }</a></sup>`;
				}
			);

			const compatRegex = /<a[^>]+data-fn="([^"]+)"[^>]*>\*<\/a>/g;

			attributes[ key ] = attributes[ key ].replace(
				compatRegex,
				( match, fnId ) => {
					const index = newOrder.indexOf( fnId );
					return `<sup data-fn="${ fnId }" class="fn"><a href="#${ fnId }" id="${ fnId }-link">${
						index + 1
					}</a></sup>`;
				}
			);
		}

		return attributes;
	}

	function updateBlocksAttributes( __blocks ) {
		return __blocks.map( ( block ) => {
			return {
				...block,
				attributes: updateAttributes( block.attributes ),
				innerBlocks: updateBlocksAttributes( block.innerBlocks ),
			};
		} );
	}

	// We need to go through all block attributes deeply and update the
	// footnote anchor numbering (textContent) to match the new order.
	const newBlocks = updateBlocksAttributes( blocks );

	oldFootnotes = {
		...oldFootnotes,
		...footnotes.reduce( ( acc, fn ) => {
			if ( ! newOrder.includes( fn.id ) ) {
				acc[ fn.id ] = fn;
			}
			return acc;
		}, {} ),
	};

	return {
		meta: {
			...meta,
			footnotes: JSON.stringify( newFootnotes ),
		},
		blocks: newBlocks,
	};
}
