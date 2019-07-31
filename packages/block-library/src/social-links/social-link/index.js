/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import icon from './icon';
import metadata from './block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Social links' ),
	parent: [ 'core/social-links' ],
	icon,
	description: __( 'Social links.' ),
	supports: {
		inserter: false,
		reusable: false,
		html: false,
	},
	edit,
	save,
};

