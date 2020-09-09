/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';

export default function useMenuLocations() {
	const [ menuLocationsByName, setMenuLocationsByName ] = useState( null );

	useEffect( () => {
		const fetchMenuLocationsByName = async () => {
			const newMenuLocationsByName = await apiFetch( {
				method: 'GET',
				path: '/__experimental/menu-locations',
			} );
			setMenuLocationsByName( newMenuLocationsByName );
		};
		fetchMenuLocationsByName();
	}, [] );

	const { saveMenu } = useDispatch( 'core' );

	const assignMenuToLocation = async ( locationName, newMenuId ) => {
		const oldMenuId = menuLocationsByName[ locationName ].menu;

		const newMenuLocationsByName = {
			...menuLocationsByName,
			[ locationName ]: {
				...menuLocationsByName[ locationName ],
				menu: newMenuId,
			},
		};

		setMenuLocationsByName( newMenuLocationsByName );

		const promises = [];

		if ( oldMenuId ) {
			promises.push(
				saveMenu( {
					id: oldMenuId,
					locations: Object.values( newMenuLocationsByName )
						.filter( ( { menu } ) => menu === oldMenuId )
						.map( ( { name } ) => name ),
				} )
			);
		}

		if ( newMenuId ) {
			promises.push(
				saveMenu( {
					id: newMenuId,
					locations: Object.values( newMenuLocationsByName )
						.filter( ( { menu } ) => menu === newMenuId )
						.map( ( { name } ) => name ),
				} )
			);
		}

		await Promise.all( promises );
	};

	return [
		menuLocationsByName ? Object.values( menuLocationsByName ) : null,
		assignMenuToLocation,
	];
}
