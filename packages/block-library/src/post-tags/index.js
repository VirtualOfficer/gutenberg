/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { tag as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';

const { name } = metadata;
export { metadata, name };

export const settings = {
	title: _x( 'Post Tags', 'block title' ),
	description: __( "Display a post's tags." ),
	icon,
	edit,
};
