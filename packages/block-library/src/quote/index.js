/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import deprecated from './deprecated';
import edit from './edit';
import icon from './icon';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Quote' ),
	description: __( 'Give quoted text visual emphasis. "In quoting others, we cite ourselves." — Julio Cortázar' ),
	icon,
	keywords: [ __( 'blockquote' ) ],
	example: {
		attributes: {
			value: '<p>' + __( 'One of the hardest things to do in technology is disrupt yourself.' ) + '</p>',
			citation: 'Matt Mullenweg',
		},
	},
	styles: [
		{ name: 'default', label: _x( 'Default', 'block style' ), isDefault: true },
		{ name: 'large', label: _x( 'Large', 'block style' ) },
	],
	transforms,
	edit,
	save,
	merge( attributes, { value, citation } ) {
		// Quote citations cannot be merged. Pick the second one unless it's
		// empty.
		if ( ! citation ) {
			citation = attributes.citation;
		}

		if ( ! value || value === '<p></p>' ) {
			return {
				...attributes,
				citation,
			};
		}

		return {
			...attributes,
			value: attributes.value + value,
			citation,
		};
	},
	deprecated,
};
