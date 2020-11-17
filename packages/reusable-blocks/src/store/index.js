/**
 * WordPress dependencies
 */
import { createReduxStoreDefinition, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import * as actions from './actions';
import controls from './controls';
import reducer from './reducer';
import * as selectors from './selectors';

const STORE_NAME = 'core/reusable-blocks';

/**
 * Store definition for the reusable blocks namespace.
 *
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/data/README.md#createReduxStoreDefinition
 *
 * @type {Object}
 */
export const storeDefinition = createReduxStoreDefinition( STORE_NAME, {
	actions,
	controls,
	reducer,
	selectors,
} );

register( storeDefinition );
