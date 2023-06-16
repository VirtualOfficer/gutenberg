/**
 * WordPress dependencies
 */
import { addQueryArgs, hasQueryArg } from '@wordpress/url';

/**
 * This appends a `gutenberg_theme_preview` parameter to the REST API request URL if
 * the admin URL contains a `theme` GET parameter.
 *
 * @param {Record<string, any>} themePath
 * @return {import('../types').APIFetchMiddleware} Preloading middleware.
 */
const createThemePreviewMiddleware = ( themePath ) => ( options, next ) => {
	if (
		typeof options.url === 'string' &&
		! hasQueryArg( options.url, 'gutenberg_theme_preview' )
	) {
		options.url = addQueryArgs( options.url, {
			gutenberg_theme_preview: themePath,
		} );
	}

	if (
		typeof options.path === 'string' &&
		! hasQueryArg( options.path, 'gutenberg_theme_preview' )
	) {
		options.path = addQueryArgs( options.path, {
			gutenberg_theme_preview: themePath,
		} );
	}

	return next( options );
};

export default createThemePreviewMiddleware;
