/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';

export default function useInternalInputValue( value ) {
	const [ internalInputValue, setInternalInputValue ] = useState(
		value || ''
	);

	useEffect( () => {
		/**
		 * Update the state value internalInputValue if the url value changes
		 * for example when clicking on another anchor
		 */
		if ( value && value !== internalInputValue ) {
			setInternalInputValue( value );
		}
	}, [ value ] );

	return [ internalInputValue, setInternalInputValue ];
}
