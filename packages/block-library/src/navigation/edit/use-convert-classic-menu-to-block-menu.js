/**
 * WordPress dependencies
 */
import { useRegistry } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	useReducer,
	useCallback,
	useRef,
	useLayoutEffect,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useCreateNavigationMenu from './use-create-navigation-menu';
import menuItemsToBlocks from '../menu-items-to-blocks';

function reducer( state, action ) {
	switch ( action.type ) {
		case 'RESOLVED':
			return {
				...state,
				status: 'success',
				navMenu: action.navMenu,
			};
		case 'ERROR':
			return {
				...state,
				status: 'error',
				error: action.error,
				navMenu: null,
			};
		case 'LOADING':
			return {
				...state,
				status: 'fetching',
				error: null,
			};
		default:
			throw new Error( `Unexpected action type ${ action.type }` );
	}
}

function useSafeDispatch( dispatch ) {
	const mounted = useRef( false );
	useLayoutEffect( () => {
		mounted.current = true;
		return () => ( mounted.current = false );
	}, [] );
	return useCallback(
		( ...args ) => ( mounted.current ? dispatch( ...args ) : void 0 ),
		[ dispatch ]
	);
}

function useConvertClassicToBlockMenu( clientId ) {
	const createNavigationMenu = useCreateNavigationMenu( clientId );
	const registry = useRegistry();

	const [ state, dispatch ] = useReducer( reducer, {
		navMenu: null,
		status: 'idle',
		error: null,
	} );

	const safeDispatch = useSafeDispatch( dispatch );

	async function convertClassicMenuToBlockMenu( menuId, menuName ) {
		const menuItemsParameters = {
			menus: menuId,
			per_page: -1,
			context: 'view',
		};

		// 1. Fetch the classic Menu items.
		const classicMenuItems = await registry
			.resolveSelect( coreStore )
			.getMenuItems( menuItemsParameters );

		// Offline response results in `null`
		if ( classicMenuItems === null ) {
			throw new Error(
				// TODO - i18n
				sprintf(
					// translators: %s: the name of a menu (e.g. Header navigation).
					__( `Unable to fetch classic menu "%s" from API.` ),
					menuName
				),
				{
					menuId,
					menuName,
				}
			);
		}

		// 2. Convert the classic items into blocks.
		const { innerBlocks } = menuItemsToBlocks( classicMenuItems );

		// 3. Create the `wp_navigation` Post with the blocks.
		const navigationMenu = await createNavigationMenu(
			menuName,
			innerBlocks
		);

		return navigationMenu;
	}

	const convert = useCallback(
		( menuId, menuName ) => {
			if ( ! menuId || ! menuName ) {
				safeDispatch( {
					type: 'ERROR',
					error: '',
				} );
			}

			safeDispatch( {
				type: 'LOADING',
			} );

			convertClassicMenuToBlockMenu( menuId, menuName )
				.then( ( navMenu ) => {
					safeDispatch( {
						type: 'RESOLVED',
						navMenu,
					} );
				} )
				.catch( ( e ) => {
					safeDispatch( {
						type: 'ERROR',
						error: e?.message,
					} );
				} );
		},
		[ clientId ]
	);

	return {
		convert,
		state,
	};
}

export default useConvertClassicToBlockMenu;
