/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
/**
 * Internal dependencies
 */
import { hasBlockMetadataSupport } from './metadata';

/**
 * Filters registered block settings, adding an `__experimentalLabel` callback if one does not already exist.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addLabelCallback( settings ) {
	// If blocks provide their own label callback, do not override it.
	if ( settings.__experimentalLabel ) {
		return settings;
	}

	const supportsBlockNaming = hasBlockMetadataSupport(
		settings,
		'name',
		false
	);

	// Check whether block metadata is supported before using it.
	if ( supportsBlockNaming ) {
		settings.__experimentalLabel = ( attributes, { context } ) => {
			const { metadata } = attributes;

			// In the list view, use the block's name sattribute as the label.
			if ( context === 'list-view' && metadata?.name ) {
				return metadata.name;
			}
		};
	}

	return settings;
}

addFilter(
	'blocks.registerBlockType',
	'core/metadata/addLabelCallback',
	addLabelCallback
);
