/**
 * External dependencies
 */
import { uniq, without } from 'lodash';

/**
 * WordPress dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Reducer that tracks which tips are in a guide. Each guide is represented by
 * an array which contains the tip identifiers contained within that guide.
 *
 * @param {Array} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Array} Updated state.
 */
export function guides( state = [], action ) {
	switch ( action.type ) {
		case 'TRIGGER_GUIDE':
			return [
				...state,
				action.tipIds,
			];
	}

	return state;
}

/**
 * Reducer that maps each tip to an array of DotTip component instance IDs that are
 * displaying that tip. Tracking this allows us to only show one DotTip at a
 * time per tip.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function tipInstanceIds( state = {}, action ) {
	switch ( action.type ) {
		case 'REGISTER_TIP_INSTANCE': {
			const existingInstanceIds = state[ action.tipId ] || [];
			return {
				...state,
				[ action.tipId ]: uniq( [ ...existingInstanceIds, action.instanceId ] ),
			};
		}

		case 'UNREGISTER_TIP_INSTANCE':
			return {
				...state,
				[ action.tipId ]: without( state[ action.tipId ], action.instanceId ),
			};
	}

	return state;
}

/**
 * Reducer that tracks whether or not tips are globally enabled.
 *
 * @param {boolean} state Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {boolean} Updated state.
 */
export function areTipsEnabled( state = true, action ) {
	switch ( action.type ) {
		case 'DISABLE_TIPS':
			return false;

		case 'ENABLE_TIPS':
			return true;
	}

	return state;
}

/**
 * Reducer that tracks which tips have been dismissed. If the state object
 * contains a tip identifier, then that tip is dismissed.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function dismissedTips( state = {}, action ) {
	switch ( action.type ) {
		case 'DISMISS_TIP':
			return {
				...state,
				[ action.id ]: true,
			};

		case 'ENABLE_TIPS':
			return {};
	}

	return state;
}

const preferences = combineReducers( { areTipsEnabled, dismissedTips } );

export default combineReducers( { guides, tipInstanceIds, preferences } );
