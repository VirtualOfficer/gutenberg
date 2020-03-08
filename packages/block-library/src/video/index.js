/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { video as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Video' ),
	description: __(
		'Embed a video from your media library or upload a new one.'
	),
	icon,
	keywords: [ __( 'movie' ) ],
	example: {
		attributes: {
			autoplay: true,
			controls: true,
			src: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Wood_thrush_in_Central_Park_switch_sides_%2816510%29.webm',
		},
	},
	transforms,
	edit,
	save,
};
