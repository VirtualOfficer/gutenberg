/**
 * External dependencies
 */
import { find } from 'lodash';

const entities = [
	{ name: 'postType', kind: 'root', key: 'slug', baseUrl: '/wp/v2/types' },
	{ name: 'media', kind: 'root', baseUrl: '/wp/v2/media' },
];

export function getEntity( kind, name ) {
	return find( entities, ( entity ) => entity.kind === kind && entity.name === name );
}

export default entities;
