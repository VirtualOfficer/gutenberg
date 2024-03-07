/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';

import icon from './icon';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	lazyEdit: () =>
		import( /* webpackChunkName: "post-time-to-read/editor" */ './edit' ),
};

export const init = () => initBlock( { name, metadata, settings } );
