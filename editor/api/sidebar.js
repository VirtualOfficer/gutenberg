/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/* External dependencies */
import { isFunction } from 'lodash';

/* Internal dependencies */
import store from '../store';
import { setGeneralSidebarActivePanel } from '../store/actions';
import { applyFilters } from '@wordpress/hooks';

const sidebars = {};

/**
 * Registers a sidebar to the editor.
 *
 * A button will be shown in the settings menu to open the sidebar. The sidebar
 * can be manually opened by calling the `activateSidebar` function.
 *
 * @param {string} name              The name of the sidebar. Should be in
 *                                   `[plugin]/[sidebar]` format.
 * @param {Object}   settings        The settings for this sidebar.
 * @param {string}   settings.title  The name to show in the settings menu.
 * @param {Function} settings.render The function that renders the sidebar.
 *
 * @returns {Object} The final sidebar settings object.
 */
export function registerSidebar( name, settings ) {
	settings = {
		name,
		...settings,
	};

	if ( typeof name !== 'string' ) {
		console.error(
			'Sidebar names must be strings.'
		);
		return null;
	}
	if ( ! /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( name ) ) {
		console.error(
			'Sidebar names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-sidebar'
		);
		return null;
	}
	if ( ! settings || ! isFunction( settings.render ) ) {
		console.error(
			'The "render" property must be specified and must be a valid function.'
		);
		return null;
	}
	if ( sidebars[ name ] ) {
		console.error(
			'Sidebar "' + name + '" is already registered.'
		);
	}

	if ( ! settings.title ) {
		console.error(
			'The sidebar "' + name + '" must have a title.'
		);
		return null;
	}
	if ( typeof settings.title !== 'string' ) {
		console.error(
			'Sidebar titles must be strings.'
		);
		return null;
	}

	settings = applyFilters( 'editor.registerSidebar', settings, name );

	return sidebars[ name ] = settings;
}

/**
 * Retrieves the sidebar settings object.
 *
 * @param {string} name The name of the sidebar to retrieve.
 *
 * @returns {Object} The settings object of the sidebar. Or false if the
 *                         sidebar doesn't exist.
 */
export function getSidebar( name ) {
	if ( ! sidebars.hasOwnProperty( name ) ) {
		return null;
	}
	return sidebars[ name ];
}

/**
 * Renders a plugin sidebar.
 *
 * @param {string}   name      The name of the plugin sidebar.
 * @param {Object}   render    The render function for the plugin sidebar.
 *
 * @returns {void}
 */
export function renderSidebar( name ) {
	if ( ! sidebars[ name ] ) {
		console.error(
			'Sidebar "' + name + '" is not registered yet.'
		);
	}

	let settings = sidebars[ name ].settings;

	/*if ( ! settings || ! isFunction( settings.renderFunction ) ) {
		console.error(
			'The "renderFunction" property must be specified and must be a valid function.'
		);
		return null;
	}*/

	let render = getSidebar( name ).render;
	render();
}

/**
 * Activates the given sidebar.
 *
 * @param  {string} pluginId The name of the sidebar to activate.
 * @return {void}
 */
export function activateSidebar( pluginId ) {
	store.dispatch( setGeneralSidebarActivePanel( 'plugins', pluginId ) );
}
