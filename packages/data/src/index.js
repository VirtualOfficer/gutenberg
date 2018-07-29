/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import defaultRegistry from './default-registry';
import * as plugins from './plugins';

export { default as withSelect } from './components/with-select';
export { default as withResources } from './components/with-resources';
export { default as withDispatch } from './components/with-dispatch';
export { default as RegistryProvider } from './components/registry-provider';
export { createRegistry } from './registry';
export {
	withRehydration,
	loadAndPersist,
	restrictPersistence,
	setPersistenceStorage,
} from './deprecated';
export { plugins };

/**
 * The combineReducers helper function turns an object whose values are different
 * reducing functions into a single reducing function you can pass to registerReducer.
 *
 * @param {Object} reducers An object whose values correspond to different reducing
 *                          functions that need to be combined into one.
 *
 * @return {Function}       A reducer that invokes every reducer inside the reducers
 *                          object, and constructs a state object with the same shape.
 */
export { combineReducers };

export const select = defaultRegistry.select;
export const dispatch = defaultRegistry.dispatch;
export const subscribe = defaultRegistry.subscribe;
export const registerStore = defaultRegistry.registerStore;
export const registerApi = defaultRegistry.registerApi;
export const registerReducer = defaultRegistry.registerReducer;
export const registerActions = defaultRegistry.registerActions;
export const registerSelectors = defaultRegistry.registerSelectors;
export const registerResolvers = defaultRegistry.registerResolvers;
export const setupPersistence = defaultRegistry.setupPersistence;
export const use = defaultRegistry.use;

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
