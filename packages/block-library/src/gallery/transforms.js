/**
 * External dependencies
 */
import { filter, every } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { createBlobURL } from '@wordpress/blob';

/**
 * Internal dependencies
 */
import { pickRelevantMediaFiles } from './shared';
import {
	LINK_DESTINATION_ATTACHMENT,
	LINK_DESTINATION_NONE,
	LINK_DESTINATION_MEDIA,
} from './constants';

const parseShortcodeIds = ( ids ) => {
	if ( ! ids ) {
		return [];
	}

	return ids.split( ',' ).map( ( id ) => parseInt( id, 10 ) );
};

const transforms = {
	from: [
		{
			type: 'block',
			isMultiBlock: true,
			blocks: [ 'core/image' ],
			transform: ( attributes ) => {
				// Init the align and size from the first item which may be either the placeholder or an image.
				let { align, sizeSlug } = attributes[ 0 ];
				// Loop through all the images and check if they have the same align and size.
				align = every( attributes, [ 'align', align ] )
					? align
					: undefined;
				sizeSlug = every( attributes, [ 'sizeSlug', sizeSlug ] )
					? sizeSlug
					: undefined;

				const validImages = filter( attributes, ( { url } ) => url );
				const innerBlocks = validImages.map( ( image ) => {
					return createBlock( 'core/image', image );
				} );

				return createBlock(
					'core/gallery',
					{
						imageCount: innerBlocks.length,
						align,
						sizeSlug,
					},
					innerBlocks
				);
			},
		},
		{
			type: 'shortcode',
			tag: 'gallery',

			attributes: {
				shortCodeTransforms: {
					type: 'array',
					shortcode: ( { named: { ids } } ) => {
						return parseShortcodeIds( ids ).map( ( id ) => ( {
							id: parseInt( id ),
						} ) );
					},
				},
				columns: {
					type: 'number',
					shortcode: ( { named: { columns = '3' } } ) => {
						return parseInt( columns, 10 );
					},
				},
				linkTo: {
					type: 'string',
					shortcode: ( {
						named: { link = LINK_DESTINATION_NONE },
					} ) => {
						switch ( link ) {
							case 'post':
								return LINK_DESTINATION_ATTACHMENT;
							case 'file':
								return LINK_DESTINATION_MEDIA;
							default:
								return LINK_DESTINATION_NONE;
						}
					},
				},
			},
			isMatch( { named } ) {
				return undefined !== named.ids;
			},
		},
		{
			// When created by drag and dropping multiple files on an insertion point
			type: 'files',
			priority: 1,
			isMatch( files ) {
				return (
					files.length !== 1 &&
					every(
						files,
						( file ) => file.type.indexOf( 'image/' ) === 0
					)
				);
			},
			transform( files ) {
				const block = createBlock( 'core/gallery', {
					imageUploads: files.map( ( file ) =>
						pickRelevantMediaFiles( {
							url: createBlobURL( file ),
						} )
					),
				} );
				return block;
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/image' ],
			transform: ( { align }, innerBlocks ) => {
				if ( innerBlocks.length > 0 ) {
					return innerBlocks.map(
						( {
							attributes: { id, url, alt, caption, sizeSlug },
						} ) =>
							createBlock( 'core/image', {
								id,
								url,
								alt,
								caption,
								sizeSlug,
								align,
							} )
					);
				}
				return createBlock( 'core/image', { align } );
			},
		},
	],
};

export default transforms;
