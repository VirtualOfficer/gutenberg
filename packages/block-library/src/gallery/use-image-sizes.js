/**
 * External dependencies
 */
import { get, reduce, map, filter, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

export default function useImageSizes( images, isSelected, getSettings ) {
	return useMemo( () => getImageSizing(), [ images, isSelected ] );

	function getImageSizing() {
		if (
			! images ||
			images.length === 0 ||
			some( images, ( img ) => ! img.data )
		) {
			return [];
		}
		const { imageSizes } = getSettings();
		let resizedImages = {};

		if ( isSelected ) {
			resizedImages = reduce(
				images,
				( currentResizedImages, img ) => {
					if ( ! img.id ) {
						return currentResizedImages;
					}
					const image = img.data;
					const sizes = reduce(
						imageSizes,
						( currentSizes, size ) => {
							const defaultUrl = get( image, [
								'sizes',
								size.slug,
								'url',
							] );
							const mediaDetailsUrl = get( image, [
								'media_details',
								'sizes',
								size.slug,
								'source_url',
							] );
							return {
								...currentSizes,
								[ size.slug ]: defaultUrl || mediaDetailsUrl,
							};
						},
						{}
					);
					return {
						...currentResizedImages,
						[ parseInt( img.id, 10 ) ]: sizes,
					};
				},
				{}
			);
		}
		return map(
			filter( imageSizes, ( { slug } ) =>
				some( resizedImages, ( sizes ) => sizes[ slug ] )
			),
			( { name, slug } ) => ( { value: slug, label: name } )
		);
	}
}
