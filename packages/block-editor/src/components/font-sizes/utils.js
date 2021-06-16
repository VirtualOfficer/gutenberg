/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 *  Returns the font size object based on an array of named font sizes and the namedFontSize and customFontSize values.
 * 	If namedFontSize is undefined or not found in fontSizes an object with just the size value based on customFontSize is returned.
 *
 * @param {Array}   fontSizes               Array of font size objects containing at least the "name" and "size" values as properties.
 * @param {?string} fontSizeAttribute       Content of the font size attribute (slug).
 * @param {?number} customFontSizeAttribute Contents of the custom font size attribute (value).
 *
 * @return {?Object} If fontSizeAttribute is set and an equal slug is found in fontSizes it returns the font size object for that slug.
 * 					 Otherwise, an object with just the size value based on customFontSize is returned.
 */
export const getFontSize = (
	fontSizes,
	fontSizeAttribute,
	customFontSizeAttribute
) => {
	if ( fontSizeAttribute ) {
		const fontSizeObject = find( fontSizes, { slug: fontSizeAttribute } );
		if ( fontSizeObject ) {
			return fontSizeObject;
		}
	}
	return {
		size: customFontSizeAttribute,
	};
};

/**
 * Returns the corresponding font size object for a given value.
 *
 * @param {Array}  fontSizes Array of font size objects.
 * @param {number} value     Font size value.
 *
 * @return {Object} Font size object.
 */
export function getFontSizeObjectByValue( fontSizes, value ) {
	const fontSizeObject = find( fontSizes, { size: value } );
	if ( fontSizeObject ) {
		return fontSizeObject;
	}

	return {
		size: value,
	};
}

/**
 * Returns a class based on fontSizeName.
 *
 * @param {string} fontSizeSlug Slug of the fontSize.
 *
 * @return {string} String with the class corresponding to the fontSize passed.
 *                  The class is generated by appending 'has-' followed by fontSizeSlug and ending with '-font-size'.
 */
export function getFontSizeClass( fontSizeSlug ) {
	if ( ! fontSizeSlug ) {
		return;
	}

	// In the past, we used lodash's kebabCase to process slugs.
	// By doing so, this method also accepted and converted non string values
	// into strings. Some plugins relied on this behavior.
	if ( 'string' !== typeof fontSizeSlug ) {
		fontSizeSlug = String( fontSizeSlug );
		// eslint-disable-next-line no-console
		console.warn(
			'The font size slug to be used in generated a font size class should be a string.'
		);
	}

	// We don't want to use kebabCase from lodash here
	// see https://github.com/WordPress/gutenberg/issues/32347
	// However, we need to make sure the generated class
	// doesn't contain spaces.
	return `has-${ fontSizeSlug.replace( /\s+/g, '-' ) }-font-size`;
}
