/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * Returns an action object used in signalling that items have been received.
 *
 * @param {Array} items Items received.
 *
 * @return {Object} Action object.
 */
export function receiveItems( items ) {
	return {
		type: 'RECEIVE_ITEMS',
		items: castArray( items ),
	};
}

/**
 * Returns an action object used in signalling that entity records have been
 * deleted and it needs to be removed from entities state.
 *
 * @param {string} kind            Kind of the removed entity.
 * @param {string} name            Name of the removed entity.
 * @param {Array|Object} records   Records removed.
 * @param {Object} query           Original query of the removed items.
 * @return {Object} Action object.
 */
export function removeItems( kind, name, records, query ) {
	return {
		type: 'REMOVE_ITEMS',
		items: castArray( records ),
		kind,
		name,
		query,
		invalidateCache: false,
	};
}

/**
 * Returns an action object used in signalling that queried data has been
 * received.
 *
 * @param {Array}   items Queried items received.
 * @param {?Object} query Optional query object.
 *
 * @return {Object} Action object.
 */
export function receiveQueriedItems( items, query = {} ) {
	return {
		...receiveItems( items ),
		query,
	};
}
