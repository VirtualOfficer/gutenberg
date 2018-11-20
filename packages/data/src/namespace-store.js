/**
 * External dependencies
 */
import { createStore, applyMiddleware } from 'redux';
import {
	flow,
	flowRight,
	get,
	mapValues,
} from 'lodash';

/**
 * WordPress dependencies
 */
import createMiddleware from '@wordpress/redux-routine';

/**
 * Internal dependencies
 */
import promise from './promise-middleware';
import createResolversCacheMiddleware from './resolvers-cache-middleware';
import { createPersistOnChange, createPersistenceInterface, withInitialState } from './persistence';

/**
 * Creates a namespace object with a store derived from the reducer given.
 *
 * @param {string} key              Identifying string used for namespace and redex dev tools.
 * @param {Object} options          Contains reducer, actions, selectors, and resolvers.
 * @param {Object} registry         Temporary registry reference, required for namespace updates.
 *
 * @return {Object} Store Object.
 */
export default function createNamespace( key, options, registry ) {
	let reducer = options.reducer;
	let store;

	if ( options.persist ) {
		const persistence = createPersistenceInterface( options.persistenceOptions || {} );

		const initialState = persistence.get()[ key ];
		reducer = withInitialState( options.reducer, initialState );
		store = createReduxStore( reducer, key, registry );
		store.dispatch = flow( [
			store.dispatch,
			createPersistOnChange(
				store.getState,
				key,
				options.persist,
				persistence
			),
		] );
	} else {
		store = createReduxStore( reducer, key, registry );
	}

	let selectors, actions, resolvers;
	if ( options.actions ) {
		actions = mapActions( options.actions, store );
	}
	if ( options.selectors ) {
		selectors = mapSelectors( options.selectors, store );
	}
	if ( options.resolvers ) {
		const fulfillment = getCoreDataFulfillment( registry, key );
		const result = mapResolvers( options.resolvers, selectors, fulfillment, store );
		resolvers = result.resolvers;
		selectors = result.selectors;
	}
	if ( options.controls ) {
		const middleware = createMiddleware( options.controls );
		const enhancer = applyMiddleware( middleware );

		Object.assign( store, enhancer( () => store )( reducer ) );
	}

	const getSelectors = () => selectors;
	const getActions = () => actions;

	// Customize subscribe behavior to call listeners only on effective change,
	// not on every dispatch.
	const subscribe = store && function( listener ) {
		let lastState = store.getState();
		store.subscribe( () => {
			const state = store.getState();
			const hasChanged = state !== lastState;
			lastState = state;

			if ( hasChanged ) {
				listener();
			}
		} );
	};

	// This can be simplified to just { subscribe, getSelectors, getActions }
	// Once we remove the use function.
	return {
		reducer,
		store,
		actions,
		selectors,
		resolvers,
		getSelectors,
		getActions,
		subscribe,
	};
}

/**
 * Creates a redux store for a namespace.
 *
 * @param {Function} reducer    Root reducer for redux store.
 * @param {string} key          Part of the state shape to register the
 *                              selectors for.
 * @param {Object} registry     Registry reference, for resolver enhancer support.
 * @return {Object}             Newly created redux store.
 */
function createReduxStore( reducer, key, registry ) {
	const enhancers = [
		applyMiddleware( createResolversCacheMiddleware( registry, key ), promise ),
	];
	if ( typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ) {
		enhancers.push( window.__REDUX_DEVTOOLS_EXTENSION__( { name: key, instanceId: key } ) );
	}

	return createStore( reducer, flowRight( enhancers ) );
}

/**
 * Maps selectors to a redux store.
 *
 * @param {Object} selectors  Selectors to register. Keys will be used as the
 *                            public facing API. Selectors will get passed the
 *                            state as first argument.
 * @param {Object} store      The redux store to which the selectors should be mapped.
 * @return {Object}           Selectors mapped to the redux store provided.
 */
function mapSelectors( selectors, store ) {
	const createStateSelector = ( selector ) => ( ...args ) => selector( store.getState(), ...args );
	return mapValues( selectors, createStateSelector );
}

/**
 * Maps actions to dispatch from a given store.
 *
 * @param {Object} actions    Actions to register.
 * @param {Object} store      The redux store to which the actions should be mapped.
 * @return {Object}           Actions mapped to the redux store provided.
 */
function mapActions( actions, store ) {
	const createBoundAction = ( action ) => ( ...args ) => store.dispatch( action( ...args ) );
	return mapValues( actions, createBoundAction );
}

/**
 * Returns resolvers with matched selectors for a given namespace.
 * Resolvers are side effects invoked once per argument set of a given selector call,
 * used in ensuring that the data needs for the selector are satisfied.
 *
 * @param {Object} resolvers   Resolvers to register.
 * @param {Object} selectors   The current selectors to be modified.
 * @param {Object} fulfillment Fulfillment implementation functions.
 * @param {Object} store       The redux store to which the resolvers should be mapped.
 * @return {Object}            An object containing updated selectors and resolvers.
 */
function mapResolvers( resolvers, selectors, fulfillment, store ) {
	const mapSelector = ( selector, selectorName ) => {
		const resolver = resolvers[ selectorName ];
		if ( ! resolver ) {
			return selector;
		}

		return ( ...args ) => {
			async function fulfillSelector() {
				const state = store.getState();
				if ( typeof resolver.isFulfilled === 'function' && resolver.isFulfilled( state, ...args ) ) {
					return;
				}

				if ( fulfillment.hasStarted( selectorName, args ) ) {
					return;
				}

				fulfillment.start( selectorName, args );
				await fulfillment.fulfill( selectorName, ...args );
				fulfillment.finish( selectorName, args );
			}

			fulfillSelector( ...args );
			return selector( ...args );
		};
	};

	const mappedResolvers = mapValues( resolvers, ( resolver ) => {
		const { fulfill: resolverFulfill = resolver } = resolver;
		return { ...resolver, fulfill: resolverFulfill };
	} );

	return {
		resolvers: mappedResolvers,
		selectors: mapValues( selectors, mapSelector ),
	};
}

/**
 * Bundles up fulfillment functions for resolvers.
 * @param {Object} registry     Registry reference, for fulfilling via resolvers
 * @param {string} key          Part of the state shape to register the
 *                              selectors for.
 * @return {Object}             An object providing fulfillment functions.
 */
function getCoreDataFulfillment( registry, key ) {
	const { hasStartedResolution } = registry.select( 'core/data' );
	const { startResolution, finishResolution } = registry.dispatch( 'core/data' );

	return {
		hasStarted: ( ...args ) => hasStartedResolution( key, ...args ),
		start: ( ...args ) => startResolution( key, ...args ),
		finish: ( ...args ) => finishResolution( key, ...args ),
		fulfill: ( ...args ) => fulfillWithRegistry( registry, key, ...args ),
	};
}

/**
 * Calls a resolver given arguments
 *
 * @param {Object} registry     Registry reference, for fulfilling via resolvers
 * @param {string} key          Part of the state shape to register the
 *                              selectors for.
 * @param {string} selectorName Selector name to fulfill.
 * @param {Array} args         Selector Arguments.
 */
async function fulfillWithRegistry( registry, key, selectorName, ...args ) {
	const namespace = registry.stores[ key ];
	const resolver = get( namespace, [ 'resolvers', selectorName ] );
	if ( ! resolver ) {
		return;
	}

	const action = resolver.fulfill( ...args );
	if ( action ) {
		await namespace.store.dispatch( action );
	}
}
