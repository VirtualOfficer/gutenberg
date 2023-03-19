/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';
import edit from './edit';
import icon from './icon';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	edit,
};

export const init = () => initBlock( { name, metadata, settings } );
