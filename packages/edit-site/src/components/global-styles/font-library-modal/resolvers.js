/**
 * WordPress dependencies
 *
 */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

export async function fetchInstallFont( data ) {
	const config = {
		path: '/wp/v2/font-families',
		method: 'POST',
		body: data,
	};
	return apiFetch( config );
}

export async function fetchUninstallFont( fontFamily ) {
	const config = {
		path: `/wp/v2/font-families/${ fontFamily.slug }`,
		method: 'DELETE',
	};
	return apiFetch( config );
}

export async function fetchFontCollections() {
	const config = {
		path: '/wp/v2/font-collections',
		method: 'GET',
	};
	return apiFetch( config );
}

export async function fetchFontCollection( id ) {
	const config = {
		path: `/wp/v2/font-collections/${ id }`,
		method: 'GET',
	};
	return apiFetch( config );
}
