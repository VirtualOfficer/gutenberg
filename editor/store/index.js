/**
 * WordPress Dependencies
 */
import { registerReducer, registerSelectors, withRehydratation, loadAndPersist } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import applyMiddlewares from './middlewares';
import {
	getBlockCount,
	getBlocks,
	getCurrentPost,
	getEditedPostAttribute,
	getLastMultiSelectedBlockUid,
	getSelectedBlockCount,
} from './selectors';

/**
 * Module Constants
 */
const STORAGE_KEY = `GUTENBERG_PREFERENCES_${ window.userSettings.uid }`;
const MODULE_KEY = 'core/editor';

const store = applyMiddlewares(
	registerReducer( MODULE_KEY, withRehydratation( reducer, 'preferences', STORAGE_KEY ) )
);
loadAndPersist( store, reducer, 'preferences', STORAGE_KEY );

registerSelectors( MODULE_KEY, {
	getBlockCount,
	getBlocks,
	getCurrentPost,
	getEditedPostAttribute,
	getLastMultiSelectedBlockUid,
	getSelectedBlockCount,
} );

export default store;
