/**
 * WordPress dependencies
 */
import { postList as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import deprecated from './deprecated';

import metadata from './block.json';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	example: {},
	lazyEdit: () =>
		import( /* webpackChunkName: "latest-posts/editor" */ './edit' ),
	deprecated,
};

export const init = () => initBlock( { name, metadata, settings } );
