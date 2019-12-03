/**
 * WordPress dependencies
 */
import { config } from '@wordpress/global-block-styles';
import { useEffect } from '@wordpress/element';

export default function useRenderColorStyles( colors ) {
	useEffect( () => {
		colors.forEach( ( { slug, color } ) => {
			config.set( `color.${ slug }`, color );
		} );
	}, [ colors ] );
}
