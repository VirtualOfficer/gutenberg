/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import LatestPostsBlock from './block';

export { name } from './settings.json';

export const settings = {
	title: __( 'Latest Posts' ),

	description: __( 'Shows a list of your site\'s most recent posts.' ),

	icon: 'list-view',

	keywords: [ __( 'recent posts' ) ],

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: LatestPostsBlock,

	save() {
		return null;
	},
};
