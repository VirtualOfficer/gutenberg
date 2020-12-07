/**
 * External dependencies
 */
import { merge, isPlainObject, get, has } from 'lodash';

/**
 * Internal dependencies
 */
import defaultStorage from './storage/default';
import { combineReducers } from '../../';

/** @typedef {import('../../registry').WPDataRegistry} WPDataRegistry */

/** @typedef {import('../../registry').WPDataPlugin} WPDataPlugin */

/**
 * @typedef {Object} WPDataPersistencePluginOptions Persistence plugin options.
 *
 * @property {Storage} storage    Persistent storage implementation. This must
 *                                at least implement `getItem` and `setItem` of
 *                                the Web Storage API.
 * @property {string}  storageKey Key on which to set in persistent storage.
 *
 */

/**
 * Default plugin storage.
 *
 * @type {Storage}
 */
const DEFAULT_STORAGE = defaultStorage;

/**
 * Default plugin storage key.
 *
 * @type {string}
 */
const DEFAULT_STORAGE_KEY = 'WP_DATA';

/**
 * Higher-order reducer which invokes the original reducer only if state is
 * inequal from that of the action's `nextState` property, otherwise returning
 * the original state reference.
 *
 * @param {Function} reducer Original reducer.
 *
 * @return {Function} Enhanced reducer.
 */
export const withLazySameState = ( reducer ) => ( state, action ) => {
	if ( action.nextState === state ) {
		return state;
	}

	return reducer( state, action );
};

/**
 * Creates a persistence interface, exposing getter and setter methods (`get`
 * and `set` respectively).
 *
 * @param {WPDataPersistencePluginOptions} options Plugin options.
 *
 * @return {Object} Persistence interface.
 */
export function createPersistenceInterface( options ) {
	const {
		storage = DEFAULT_STORAGE,
		storageKey = DEFAULT_STORAGE_KEY,
	} = options;

	let data;

	/**
	 * Returns the persisted data as an object, defaulting to an empty object.
	 *
	 * @return {Object} Persisted data.
	 */
	function getData() {
		if ( data === undefined ) {
			// If unset, getItem is expected to return null. Fall back to
			// empty object.
			const persisted = storage.getItem( storageKey );
			if ( persisted === null ) {
				data = {};
			} else {
				try {
					data = JSON.parse( persisted );
				} catch ( error ) {
					// Similarly, should any error be thrown during parse of
					// the string (malformed JSON), fall back to empty object.
					data = {};
				}
			}
		}

		return data;
	}

	/**
	 * Merges an updated reducer state into the persisted data.
	 *
	 * @param {string} key   Key to update.
	 * @param {*}      value Updated value.
	 */
	function setData( key, value ) {
		data = { ...data, [ key ]: value };
		storage.setItem( storageKey, JSON.stringify( data ) );
	}

	return {
		get: getData,
		set: setData,
	};
}

/**
 * Data plugin to persist store state into a single storage key.
 *
 * @param {WPDataRegistry}                  registry      Data registry.
 * @param {?WPDataPersistencePluginOptions} pluginOptions Plugin options.
 *
 * @return {WPDataPlugin} Data plugin.
 */
function persistencePlugin( registry, pluginOptions ) {
	const persistence = createPersistenceInterface( pluginOptions );

	/**
	 * Creates an enhanced store dispatch function, triggering the state of the
	 * given store name to be persisted when changed.
	 *
	 * @param {Function}       getState  Function which returns current state.
	 * @param {string}         storeName Store name.
	 * @param {?Array<string>} keys      Optional subset of keys to save.
	 *
	 * @return {Function} Enhanced dispatch function.
	 */
	function createPersistOnChange( getState, storeName, keys ) {
		let getPersistedState;
		if ( Array.isArray( keys ) ) {
			// Given keys, the persisted state should by produced as an object
			// of the subset of keys. This implementation uses combineReducers
			// to leverage its behavior of returning the same object when none
			// of the property values changes. This allows a strict reference
			// equality to bypass a persistence set on an unchanging state.
			const reducers = keys.reduce(
				( accumulator, key ) =>
					Object.assign( accumulator, {
						[ key ]: ( state, action ) => action.nextState[ key ],
					} ),
				{}
			);

			getPersistedState = withLazySameState(
				combineReducers( reducers )
			);
		} else {
			getPersistedState = ( state, action ) => action.nextState;
		}

		let lastState = getPersistedState( undefined, {
			nextState: getState(),
		} );

		return () => {
			const state = getPersistedState( lastState, {
				nextState: getState(),
			} );
			if ( state !== lastState ) {
				persistence.set( storeName, state );
				lastState = state;
			}
		};
	}

	return {
		registerStore( storeName, options ) {
			if ( ! options.persist ) {
				return registry.registerStore( storeName, options );
			}

			// Load from persistence to use as initial state.
			const persistedState = persistence.get()[ storeName ];
			if ( persistedState !== undefined ) {
				let initialState = options.reducer( options.initialState, {
					type: '@@WP/PERSISTENCE_RESTORE',
				} );

				if (
					isPlainObject( initialState ) &&
					isPlainObject( persistedState )
				) {
					// If state is an object, ensure that:
					// - Other keys are left intact when persisting only a
					//   subset of keys.
					// - New keys in what would otherwise be used as initial
					//   state are deeply merged as base for persisted value.
					initialState = merge( {}, initialState, persistedState );
				} else {
					// If there is a mismatch in object-likeness of default
					// initial or persisted state, defer to persisted value.
					initialState = persistedState;
				}

				options = {
					...options,
					initialState,
				};
			}

			const store = registry.registerStore( storeName, options );

			store.subscribe(
				createPersistOnChange(
					store.getState,
					storeName,
					options.persist
				)
			);

			return store;
		},
	};
}

/**
 * Deprecated: Remove this function and the code in WordPress Core that calls
 * it once WordPress 5.4 is released.
 */

persistencePlugin.__unstableMigrate = ( pluginOptions ) => {
	const persistence = createPersistenceInterface( pluginOptions );

	const state = persistence.get();

	// Migrate 'insertUsage' from 'core/editor' to 'core/block-editor'
	const insertUsage = get( state, [
		'core/editor',
		'preferences',
		'insertUsage',
	] );
	if ( insertUsage ) {
		persistence.set( 'core/block-editor', {
			preferences: {
				insertUsage,
			},
		} );
	}

	let editPostState = state[ 'core/edit-post' ];

	// Default `fullscreenMode` to `false` if any persisted state had existed
	// and the user hadn't made an explicit choice about fullscreen mode. This
	// is needed since `fullscreenMode` previously did not have a default value
	// and was implicitly false by its absence. It is now `true` by default, but
	// this change is not intended to affect upgrades from earlier versions.
	const hadPersistedState = Object.keys( state ).length > 0;
	const hadFullscreenModePreference = has( state, [
		'core/edit-post',
		'preferences',
		'features',
		'fullscreenMode',
	] );
	if ( hadPersistedState && ! hadFullscreenModePreference ) {
		editPostState = merge( {}, editPostState, {
			preferences: { features: { fullscreenMode: false } },
		} );
	}

	// Migrate 'areTipsEnabled' from 'core/nux' to 'showWelcomeGuide' in 'core/edit-post'
	const areTipsEnabled = get( state, [
		'core/nux',
		'preferences',
		'areTipsEnabled',
	] );
	const hasWelcomeGuide = has( state, [
		'core/edit-post',
		'preferences',
		'features',
		'welcomeGuide',
	] );
	if ( areTipsEnabled !== undefined && ! hasWelcomeGuide ) {
		editPostState = merge( {}, editPostState, {
			preferences: {
				features: {
					welcomeGuide: areTipsEnabled,
				},
			},
		} );
	}

	if ( editPostState !== state[ 'core/edit-post' ] ) {
		persistence.set( 'core/edit-post', editPostState );
	}
};

export default persistencePlugin;
