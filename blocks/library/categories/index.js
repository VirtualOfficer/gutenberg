/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import CategoriesBlock from './block';

export { name } from './settings.json';

export const settings = {
	title: __( 'Categories' ),

	description: __( 'Shows a list of your site\'s categories.' ),

	icon: 'list-view',

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: CategoriesBlock,

	save() {
		return null;
	},
};
