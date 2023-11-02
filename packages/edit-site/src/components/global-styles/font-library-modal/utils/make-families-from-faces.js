/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export default function makeFamilyFromFaces( fontFaces ) {
	let fontFamilyObject = null;
	fontFaces.forEach( ( fontFace ) => {
		if ( ! fontFamilyObject ) {
			fontFamilyObject = {
				name: fontFace.fontFamily,
				fontFamily: fontFace.fontFamily,
				slug: fontFace.fontFamily.replace( /\s+/g, '-' ).toLowerCase(),
				fontFace: [],
			};
		} else if ( fontFamilyObject.name !== fontFace.fontFamily ) {
			throw new Error(
				__(
					'You may only batch upload fonts from the same font family.'
				)
			);
		}
		fontFamilyObject.fontFace.push( fontFace );
	} );
	return fontFamilyObject;
}
