/**
 * External dependencies
 */
import { find, kebabCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';

/**
 * Returns the default font size slug.
 */
export const getDefaultFontSizeSlug = 'normal';

/**
 *  Returns the font size object based on an array of named font sizes and the namedFontSize and customFontSize values.
 * 	If namedFontSize is undefined or not found in fontSizes an object with just the size value based on customFontSize is returned.
 *
 * @param {Array}   fontSizes               Array of font size objects containing at least the "name" and "size" values as properties.
 * @param {?string} fontSizeAttribute       Content of the font size attribute (slug).
 * @param {?number} customFontSizeAttribute Contents of the custom font size attribute (value).
 *
 * @return {?string} If a customFontSizeAttribute is set, return an object with the custom size value.
 * 					 Otherwise, return one of the pre-defined fonts, falling back on the size with the slug "normal".
 */
export const getFontSize = ( fontSizes, fontSizeAttribute, customFontSizeAttribute ) => {
	if ( customFontSizeAttribute !== undefined ) {
		return {
			name: _x( 'Custom', 'font size name' ),
			slug: 'custom',
			size: customFontSizeAttribute,
		};
	}

	const fontSizeObject = find( fontSizes, { slug: ( fontSizeAttribute === undefined ? getDefaultFontSizeSlug : fontSizeAttribute ) } );

	if ( fontSizeObject ) {
		return fontSizeObject;
	}
};

/**
 * Returns a class based on fontSizeName.
 *
 * @param {string} fontSizeSlug    Slug of the fontSize.
 *
 * @return {string} String with the class corresponding to the fontSize passed.
 *                  The class is generated by appending 'has-' followed by fontSizeSlug in kebabCase and ending with '-font-size'.
 */
export function getFontSizeClass( fontSizeSlug ) {
	if ( ! fontSizeSlug ) {
		return;
	}

	return `has-${ kebabCase( fontSizeSlug ) }-font-size`;
}
