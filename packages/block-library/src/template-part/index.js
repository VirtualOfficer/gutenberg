/**
 * External dependencies
 */
import { startCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';
import { select } from '@wordpress/data';
import { symbolFilled } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import { enhanceTemplatePartVariations } from './variations';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon: symbolFilled,
	__experimentalLabel: ( { slug, theme } ) => {
		// Attempt to find entity title if block is a template part.
		// Require slug to request, otherwise entity is uncreated and will throw 404.
		if ( ! slug ) {
			return;
		}

		const entity = select( coreDataStore ).getEntityRecord(
			'postType',
			'wp_template_part',
			theme + '//' + slug
		);
		if ( ! entity ) {
			return;
		}

		return startCase( entity.title?.rendered || entity.slug );
	},
	edit,
};

// Importing this file includes side effects. This is whitelisted in block-library/package.json under sideEffects
addFilter(
	'blocks.registerBlockType',
	'core/template-part',
	enhanceTemplatePartVariations
);

addFilter(
	'blockEditor.__unstableGetInserterItems',
	'removeTemplatePartsFromPostTemplates',
	( types, rootClientId, { getBlock, getBlockParentsByBlockName } ) => {
		const templateParts = types.filter(
			( type ) => type.name === 'core/template-part'
		);
		if ( ! templateParts.length ) {
			return types;
		}

		const hasDisallowedParent =
			getBlock( rootClientId )?.name === 'core/post-template' ||
			getBlockParentsByBlockName( rootClientId, 'core/post-template' )
				.length;
		if ( hasDisallowedParent ) {
			// Remove all template part-like blocks
			for ( let i = templateParts.length - 1; i >= 0; i-- ) {
				types.splice( types.indexOf( templateParts[ i ] ), 1 );
			}
		}

		return types;
	}
);
