/**
 * WordPress dependencies
 */
import { comment as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';

import save from './save';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	lazyEdit: () =>
		import( /* webpackChunkName: "post-comment/editor" */ './edit' ),
	save,
};

export const init = () => initBlock( { name, metadata, settings } );
