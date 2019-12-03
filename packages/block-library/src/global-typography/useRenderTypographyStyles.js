/**
 * WordPress dependencies
 */
import { config } from '@wordpress/global-block-styles';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { generateFontSizes } from './utils';

function useUpdateCssVariable( key, value = '' ) {
	useEffect( () => {
		config.set( `typography.${ key }`, value );
	}, [ value ] );
}

function useUpdateFontSizes( fontSizeBase, typeScale ) {
	useEffect( () => {
		const headingSizes = generateFontSizes( fontSizeBase, typeScale );
		const headings = Object.keys( headingSizes );
		const paragraphSize = headingSizes.H6;

		headings.forEach( ( heading ) => {
			const size = headingSizes[ heading ];
			config.set(
				`typography.fontSize${ heading.toUpperCase() }`,
				`${ size }px`
			);
		} );

		config.set( 'typography.fontSizeBase', `${ paragraphSize }px` );
	}, [ fontSizeBase, typeScale ] );
}

export default function useRenderTypographyStyles( props ) {
	const {
		fontFamilyBase,
		fontFamilyHeading,
		fontSizeBase,
		lineHeightBase,
		lineHeightHeading,
		typeScale,
	} = props;

	useUpdateCssVariable( 'fontFamilyBase', fontFamilyBase );
	useUpdateCssVariable( 'fontFamilyHeading', fontFamilyHeading );
	useUpdateCssVariable( 'lineHeightBase', lineHeightBase );
	useUpdateCssVariable( 'lineHeightHeading', lineHeightHeading );
	useUpdateFontSizes( fontSizeBase, typeScale );
}
