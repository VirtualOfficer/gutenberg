
/**
 * Returns a URL for display.
 *
 * @param {string} url Original URL.
 *
 * @return {string} Displayed URL.
 */
export function filterURLForDisplay( url ) {
	// remove protocol and www prefixes
	const filteredURL = url.replace( new RegExp( '^https?://(www\.)?' ), '' );

	// ends with / and only has that single slash, strip it
	if ( filteredURL.match( '^[^/]+/$' ) ) {
		return filteredURL.replace( '/', '' );
	}

	return filteredURL;
}
