/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import {
	registerCoreBlocks,
	__experimentalGetCoreBlocks,
	__experimentalRegisterExperimentalCoreBlocks,
} from '@wordpress/block-library';
import { dispatch } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';
import { render } from '@wordpress/element';
import {
	PluginMoreMenuItem,
	PluginSidebar,
	PluginSidebarMoreMenuItem,
	store as editorStore,
} from '@wordpress/editor';
import { store as preferencesStore } from '@wordpress/preferences';
import {
	registerLegacyWidgetBlock,
	registerWidgetGroupBlock,
} from '@wordpress/widgets';

/**
 * Internal dependencies
 */
import './hooks';
import { store as editSiteStore } from './store';
import App from './components/app';

/**
 * Initializes the site editor screen.
 *
 * @param {string} id       ID of the root element to render the screen in.
 * @param {Object} settings Editor settings.
 */
export function initializeEditor( id, settings ) {
	const target = document.getElementById( id );

	dispatch( blocksStore ).reapplyBlockTypeFilters();
	const coreBlocks = __experimentalGetCoreBlocks().filter(
		( { name } ) => name !== 'core/freeform'
	);
	registerCoreBlocks( coreBlocks );
	dispatch( blocksStore ).setFreeformFallbackBlockName( 'core/html' );
	registerLegacyWidgetBlock( { inserter: false } );
	registerWidgetGroupBlock( { inserter: false } );
	if ( process.env.IS_GUTENBERG_PLUGIN ) {
		__experimentalRegisterExperimentalCoreBlocks( {
			enableFSEBlocks: true,
		} );
	}

	// We dispatch actions and update the store synchronously before rendering
	// so that we won't trigger unnecessary re-renders with useEffect.
	dispatch( preferencesStore ).setDefaults( 'core/edit-site', {
		welcomeGuide: true,
		welcomeGuideStyles: true,
		welcomeGuidePage: true,
		welcomeGuideTemplate: true,
	} );

	dispatch( preferencesStore ).setDefaults( 'core', {
		allowRightClickOverrides: true,
		distractionFree: false,
		editorMode: 'visual',
		fixedToolbar: false,
		focusMode: false,
		inactivePanels: [],
		keepCaretInsideBlock: false,
		openPanels: [ 'post-status' ],
		showBlockBreadcrumbs: true,
		showListViewByDefault: false,
	} );

	dispatch( editSiteStore ).updateSettings( settings );

	// Keep the defaultTemplateTypes in the core/editor settings too,
	// so that they can be selected with core/editor selectors in any editor.
	// This is needed because edit-site doesn't initialize with EditorProvider,
	// which internally uses updateEditorSettings as well.
	dispatch( editorStore ).updateEditorSettings( {
		defaultTemplateTypes: settings.defaultTemplateTypes,
		defaultTemplatePartAreas: settings.defaultTemplatePartAreas,
	} );

	// Prevent the default browser action for files dropped outside of dropzones.
	window.addEventListener( 'dragover', ( e ) => e.preventDefault(), false );
	window.addEventListener( 'drop', ( e ) => e.preventDefault(), false );

	render( <App />, target );
}

export function reinitializeEditor() {
	deprecated( 'wp.editSite.reinitializeEditor', {
		since: '6.2',
		version: '6.3',
	} );
}

export { PluginMoreMenuItem };
export { PluginSidebar };
export { PluginSidebarMoreMenuItem };
export { default as PluginTemplateSettingPanel } from './components/plugin-template-setting-panel';
export { store } from './store';
