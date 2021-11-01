/**
 * External dependencies
 */
import { mapValues, isObject, forEach } from 'lodash';

/**
 * WordPress dependencies
 */
import type { Ref } from '@wordpress/element';

/**
 * Internal dependencies
 */
import createReduxStore from './redux-store';
import createCoreDataStore from './store';
import { STORE_NAME } from './store/name';
import { createEmitter } from './utils/emitter';

import type {
	BaseActions,
	BaseSelectors,
	EmptyState,
	WPDataAttachedStore,
	WPDataReduxStoreConfig,
	WPDataRegistry,
	WPDataStore,
} from './types.d';

/**
 * @typedef {Object} WPDataRegistry An isolated orchestrator of store registrations.
 *
 * @property {Function} registerGenericStore Given a namespace key and settings
 *                                           object, registers a new generic
 *                                           store.
 * @property {Function} registerStore        Given a namespace key and settings
 *                                           object, registers a new namespace
 *                                           store.
 * @property {Function} subscribe            Given a function callback, invokes
 *                                           the callback on any change to state
 *                                           within any registered store.
 * @property {Function} select               Given a namespace key, returns an
 *                                           object of the  store's registered
 *                                           selectors.
 * @property {Function} dispatch             Given a namespace key, returns an
 *                                           object of the store's registered
 *                                           action dispatchers.
 */

/**
 * @typedef {Object} WPDataPlugin An object of registry function overrides.
 *
 * @property {Function} registerStore registers store.
 */

/**
 * Creates a new store registry, given an optional object of initial store
 * configurations.
 *
 * @param storeConfigs Initial store configurations.
 * @param parent       Parent registry.
 *
 * @return Data registry.
 */
export function createRegistry<
	Registry extends Record<
		string,
		WPDataAttachedStore< BaseActions, BaseSelectors >
	>
>( storeConfigs = {}, parent: WPDataRegistry | null = null ): WPDataRegistry {
	const stores = {} as Registry;
	const emitter = createEmitter();
	const __experimentalListeningStores = new Set();

	/**
	 * Global listener called for each store's update.
	 */
	function globalListener() {
		emitter.emit();
	}

	/**
	 * Subscribe to changes to any data.
	 *
	 * @param listener Listener function.
	 *
	 * @return Unsubscribe function.
	 */
	const subscribe = ( listener: () => void ) => {
		return emitter.subscribe( listener );
	};

	/**
	 * Calls a selector given the current state and extra arguments.
	 *
	 * @param  storeNameOrDefinition Unique namespace identifier for the store
	 *                               or the store definition.
	 *
	 * @return The selector's returned value.
	 */
	function select<
		Name extends keyof Registry & string,
		Config extends Registry[ Name ]
	>(
		storeNameOrDefinition:
			| Name
			| WPDataStore<
					Name,
					ReturnType< Config[ 'getActions' ] >,
					ReturnType< Config[ 'getSelectors' ] >
			  >
	) {
		const storeName = isObject( storeNameOrDefinition )
			? storeNameOrDefinition.name
			: storeNameOrDefinition;
		__experimentalListeningStores.add( storeName );
		const store = stores[ storeName ];
		if ( store ) {
			return store.getSelectors();
		}

		return parent && parent.select( storeName );
	}

	function __experimentalMarkListeningStores< Response, T >(
		callback: () => Response,
		ref: Ref< T >
	): Response {
		__experimentalListeningStores.clear();
		const result = callback.call( this );
		ref.current = Array.from( __experimentalListeningStores );
		return result;
	}

	/**
	 * Given the name of a registered store, returns an object containing the store's
	 * selectors pre-bound to state so that you only need to supply additional arguments,
	 * and modified so that they return promises that resolve to their eventual values,
	 * after any resolvers have ran.
	 *
	 * @param {string|WPDataStore} storeNameOrDefinition Unique namespace identifier for the store
	 *                                                   or the store definition.
	 *
	 * @return {Object} Each key of the object matches the name of a selector.
	 */
	function resolveSelect( storeNameOrDefinition ) {
		const storeName = isObject( storeNameOrDefinition )
			? storeNameOrDefinition.name
			: storeNameOrDefinition;
		__experimentalListeningStores.add( storeName );
		const store = stores[ storeName ];
		if ( store ) {
			return store.getResolveSelectors();
		}

		return parent && parent.resolveSelect( storeName );
	}

	/**
	 * Returns the available actions for a part of the state.
	 *
	 * @param {string|WPDataStore} storeNameOrDefinition Unique namespace identifier for the store
	 *                                                   or the store definition.
	 *
	 * @return {*} The action's returned value.
	 */
	function dispatch( storeNameOrDefinition ) {
		const storeName = isObject( storeNameOrDefinition )
			? storeNameOrDefinition.name
			: storeNameOrDefinition;
		const store = stores[ storeName ];
		if ( store ) {
			return store.getActions();
		}

		return parent && parent.dispatch( storeName );
	}

	//
	// Deprecated
	// TODO: Remove this after `use()` is removed.
	//
	function withPlugins( attributes ) {
		return mapValues( attributes, ( attribute, key ) => {
			if ( typeof attribute !== 'function' ) {
				return attribute;
			}
			return function () {
				return registry[ key ].apply( null, arguments );
			};
		} );
	}

	/**
	 * Registers a generic store.
	 *
	 * @param key    Store registry key.
	 * @param config Configuration (getSelectors, getActions, subscribe).
	 */
	function registerGenericStore<
		Name extends string,
		Actions extends Record< string, Function | Generator >,
		Selectors extends Record< string, Function | Generator >
	>( key: Name, config: WPDataAttachedStore< Actions, Selectors > ) {
		if ( typeof config.getSelectors !== 'function' ) {
			throw new TypeError( 'config.getSelectors must be a function' );
		}
		if ( typeof config.getActions !== 'function' ) {
			throw new TypeError( 'config.getActions must be a function' );
		}
		if ( typeof config.subscribe !== 'function' ) {
			throw new TypeError( 'config.subscribe must be a function' );
		}
		// Thi emitter is used to keep track of active listeners when the registry
		// get paused, that way, when resumed we should be able to call all these
		// pending listeners.
		config.emitter = createEmitter();
		const currentSubscribe = config.subscribe;
		config.subscribe = ( listener ) => {
			const unsubscribeFromStoreEmitter = config.emitter.subscribe(
				listener
			);
			const unsubscribeFromRootStore = currentSubscribe( () => {
				if ( config.emitter.isPaused ) {
					config.emitter.emit();
					return;
				}
				listener();
			} );

			return () => {
				if ( unsubscribeFromRootStore ) {
					unsubscribeFromRootStore();
				}
				unsubscribeFromStoreEmitter();
			};
		};
		stores[ key ] = config;
		config.subscribe( globalListener );
	}

	/**
	 * Registers a new store definition.
	 *
	 * @param store Store definition.
	 */
	function register<
		Name extends string,
		Actions extends Record< string, Function | Generator >,
		Selectors extends Record< string, Function | Generator >
	>( store: WPDataStore< Name, Actions, Selectors > ) {
		registerGenericStore( store.name, store.instantiate( registry ) );
	}

	/**
	 * Subscribe handler to a store.
	 *
	 * @param storeName The store name.
	 * @param handler   The function subscribed to the store.
	 * @return A function to unsubscribe the handler.
	 */
	function __experimentalSubscribeStore(
		storeName: string,
		handler: () => void
	): () => void {
		if ( storeName in stores ) {
			return stores[ storeName ].subscribe( handler );
		}

		// Trying to access a store that hasn't been registered,
		// this is a pattern rarely used but seen in some places.
		// We fallback to regular `subscribe` here for backward-compatibility for now.
		// See https://github.com/WordPress/gutenberg/pull/27466 for more info.
		if ( ! parent ) {
			return subscribe( handler );
		}

		return parent.__experimentalSubscribeStore( storeName, handler );
	}

	function batch( callback ) {
		emitter.pause();
		forEach( stores, ( store ) => store.emitter.pause() );
		callback();
		emitter.resume();
		forEach( stores, ( store ) => store.emitter.resume() );
	}

	let registry = {
		batch,
		registerGenericStore,
		stores,
		namespaces: stores, // TODO: Deprecate/remove this.
		subscribe,
		select,
		resolveSelect,
		dispatch,
		use,
		register,
		__experimentalMarkListeningStores,
		__experimentalSubscribeStore,
	};

	/**
	 * Registers a standard `@wordpress/data` store.
	 *
	 * @param storeName Unique namespace identifier.
	 * @param options   Store description (reducer, actions, selectors, resolvers).
	 *
	 * @return Registered store object.
	 */
	registry.registerStore = <
		Name extends string,
		State extends EmptyState,
		Actions extends Record< string, Function | Generator >,
		Selectors extends Record< string, Function | Generator >
	>(
		storeName: Name,
		options: WPDataReduxStoreConfig< State, Actions, Selectors >
	): WPDataStore< Name, Actions, Selectors > => {
		if ( ! options.reducer ) {
			throw new TypeError( 'Must specify store reducer' );
		}

		const store = createReduxStore( storeName, options ).instantiate(
			registry
		);
		registerGenericStore( storeName, store );
		return store.store;
	};

	//
	// TODO:
	// This function will be deprecated as soon as it is no longer internally referenced.
	//
	function use( plugin, options ) {
		registry = {
			...registry,
			...plugin( registry, options ),
		};

		return registry;
	}

	registerGenericStore( STORE_NAME, createCoreDataStore( registry ) );

	Object.entries( storeConfigs ).forEach( ( [ name, config ] ) =>
		registry.registerStore( name, config )
	);

	if ( parent ) {
		parent.subscribe( globalListener );
	}

	return withPlugins( registry );
}
