/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
// import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Typography' ),
	description: __( 'Sets the fonts for your site' ),
	keywords: [ __( 'typography' ), __( 'text' ), __( 'font' ) ],
	supports: {
		align: true,
	},
	edit,
	save: () => null,
};
