/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import { isString } from 'util';
import { validateNamespacedId } from '../../utils/plugins';
import { activateSidebar } from './sidebar';

const menuItems = {};

/**
 * Registers a plugin under the more menu.
 *
 * @param {string}   menuItemId        The unique identifier of the plugin. Should be in
 *                                     `[namespace]/[name]` format.
 * @param {Object}   settings          The settings for this menu item.
 * @param {string}   settings.title    The name to show in the settings menu.
 * @param {func}     settings.target   The registered plugin that should be activated.
 * @param {string}   [settings.icon]   SVG Icon url.
 *
 * @return {Object} The final sidebar settings object.
 */
export function registerMoreMenuItem( menuItemId, settings ) {
	settings = {
		menuItemId,
		...settings,
	};

	settings = applyFilters( 'editor.registerMoreMenuItem', settings, menuItemId );

	if ( ! validateNamespacedId( menuItemId ) ) {
		return null;
	}
	if ( menuItems[ menuItemId ] ) {
		console.error(
			`Menu item "${ menuItemId }" is already registered.`
		);
	}

	if ( ! settings.title ) {
		console.error(
			`Menu item "${ menuItemId }" must have a title.`
		);
		return null;
	}
	if ( typeof settings.title !== 'string' ) {
		console.error(
			'Menu items title must be strings.'
		);
		return null;
	}

	if ( settings.icon && isString( settings.icon ) ) {
		console.error(
			'Menu item icon must be a react component'
		);
		return null;
	}

	if ( ! settings.target ) {
		console.error(
			`Menu item "${ menuItemId }" must have a target.`
		);
		return null;
	}
	if ( typeof settings.target !== 'string' ) {
		console.error(
			'Menu items target must be strings.'
		);
		return null;
	}

	settings.callback = activateSidebar.bind( null, settings.target );

	return menuItems[ menuItemId ] = settings;
}

/**
 * Retrieves all menu items that are registered.
 *
 * @return {Object} Registered menu items.
 */
export function getMoreMenuItems() {
	return menuItems;
}
