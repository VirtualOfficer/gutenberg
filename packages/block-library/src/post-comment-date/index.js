/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { postDate as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;
export { metadata, name };

export const settings = {
	title: __( 'Post Comment Date' ),
	description: __( 'Post Comment Date' ),
	icon,
	edit,
	parent: [ 'core/post-comment' ],
};
