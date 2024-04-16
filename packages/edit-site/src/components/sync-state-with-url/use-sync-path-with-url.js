/**
 * External dependencies
 */
import { match } from 'path-to-regexp';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import {
	TEMPLATE_POST_TYPE,
	TEMPLATE_PART_POST_TYPE,
	PATTERN_TYPES,
} from '../../utils/constants';

const { useLocation, useHistory } = unlock( routerPrivateApis );

const SCREENS = [
	'/',
	'/wp_global_styles',
	'/patterns',
	'/navigation',
	'/navigation/:postType/:postId',
	'/page',
	'/page/:postId',
	'/:postType(wp_template_part)/all',
	'/:postType(wp_template_part|wp_block)/:postId',
	'/:postType(wp_template)',
	'/:postType(wp_template)/:postId',
].map( ( path, id ) => ( { id, path } ) );

export function getPathFromURL( urlParams ) {
	let path = urlParams?.path ?? '/';

	// Compute the navigator path based on the URL params.
	if ( urlParams?.postType && urlParams?.postId ) {
		switch ( urlParams.postType ) {
			case PATTERN_TYPES.user:
			case TEMPLATE_POST_TYPE:
			case TEMPLATE_PART_POST_TYPE:
			case 'page':
				path = `/${ encodeURIComponent(
					urlParams.postType
				) }/${ encodeURIComponent( urlParams.postId ) }`;
				break;
			default:
				path = `/navigation/${ encodeURIComponent(
					urlParams.postType
				) }/${ encodeURIComponent( urlParams.postId ) }`;
		}
	}

	return path;
}

function getParamsFromPath( path, params ) {
	if ( params?.postType && params?.postId ) {
		return {
			postType: params?.postType,
			postId: params?.postId,
			path: undefined,
			layout: undefined,
		};
	} else if ( path.startsWith( '/page/' ) && params?.postId ) {
		return {
			postType: 'page',
			postId: params?.postId,
			path: undefined,
			layout: undefined,
		};
	} else if ( path === '/patterns' ) {
		return {
			postType: undefined,
			postId: undefined,
			canvas: undefined,
			path,
		};
	} else if (
		// These sidebar paths are special in the sense that the url in these pages may or may not have a postId and we need to retain it if it has.
		// The "type" property should be kept as well.
		path === '/page' ||
		path === '/wp_template' ||
		path === '/wp_template_part/all'
	) {
		return {
			postType: undefined,
			categoryType: undefined,
			categoryId: undefined,
			path,
		};
	}
	return {
		postType: undefined,
		postId: undefined,
		categoryType: undefined,
		categoryId: undefined,
		layout: undefined,
		path: path === '/' ? undefined : path,
	};
}

function matchPath( path, pattern ) {
	const matcher = match( pattern, { decode: decodeURIComponent } );
	return matcher( path );
}

function patternMatch( path, screens ) {
	for ( const screen of screens ) {
		const matched = matchPath( path, screen.path );
		if ( matched ) {
			return { params: matched.params, id: screen.id };
		}
	}

	return undefined;
}

function findParent( path, screens ) {
	if ( ! path.startsWith( '/' ) ) {
		return undefined;
	}
	const pathParts = path.split( '/' );
	while ( pathParts.length > 1 ) {
		pathParts.pop();
		const parentPath = pathParts.join( '/' ) || '/';
		if (
			screens.some(
				( screen ) => matchPath( parentPath, screen.path ) !== false
			)
		) {
			return parentPath;
		}
	}

	return undefined;
}

export function useRouter() {
	const history = useHistory();
	const { params } = useLocation();
	const path = getPathFromURL( params );

	const matchedPath = useMemo( () => {
		return path !== undefined ? patternMatch( path, SCREENS ) : undefined;
	}, [ path ] );

	const goMethods = useMemo( () => {
		const goTo = ( p ) => {
			const matched = patternMatch( p, SCREENS );
			history.push( getParamsFromPath( p, matched?.params ?? {} ) );
		};

		const goToParent = () => {
			const parentPath = findParent( path, SCREENS );
			if ( parentPath !== undefined ) {
				goTo( parentPath, {
					isBack: true,
				} );
			}
		};

		const goBack = () => {
			history.back();
		};

		return { goTo, goToParent, goBack };
	}, [ history, path ] );

	return useMemo(
		() => ( {
			location: { path },
			params: matchedPath?.params ?? {},
			match: matchedPath?.id,
			...goMethods,
		} ),
		[ path, matchedPath, goMethods ]
	);
}
