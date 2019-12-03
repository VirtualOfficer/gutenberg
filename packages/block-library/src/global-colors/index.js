/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Colors' ),
	description: __( 'Sets the colors for your site.' ),
	keywords: [ __( 'color' ) ],
	supports: {
		align: true,
	},
	edit,
	save,
};
