/**
 * External dependencies
 */
import { clamp, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { useCallback, useRef, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useControlledState } from '../utils/hooks';

/**
 * A float supported clamp function for a specific value.
 *
 * @param {number|null} value The value to clamp.
 * @param {number}      min   The minimum value.
 * @param {number}      max   The maximum value.
 *
 * @return {number} A (float) number
 */
export function floatClamp( value, min, max ) {
	if ( typeof value !== 'number' ) {
		return null;
	}

	return parseFloat( clamp( value, min, max ) );
}

/**
 * Hook to store a clamped value, derived from props.
 *
 * @param {Object} settings       Hook settings.
 * @param {number} settings.min   The minimum value.
 * @param {number} settings.max   The maximum value.
 * @param {number} settings.value The current value.
 */
export function useControlledRangeValue( { min, max, value: valueProp } ) {
	const [ value, setValue ] = useControlledState(
		floatClamp( valueProp, min, max )
	);

	const setClampValue = useCallback(
		( nextValue ) => {
			if ( nextValue === null ) {
				setValue( null );
			} else {
				setValue( floatClamp( nextValue, min, max ) );
			}
		},
		[ min, max ]
	);

	return [ value, setClampValue ];
}

/**
 * Hook to encapsulate the debouncing "hover" to better handle the showing
 * and hiding of the Tooltip.
 *
 * @param {Object}   settings                     Hook settings.
 * @param {Function} [settings.onShow=noop]       A callback function invoked when the element is shown.
 * @param {Function} [settings.onHide=noop]       A callback function invoked when the element is hidden.
 * @param {Function} [settings.onMouseMove=noop]  A callback function invoked when the mouse is moved.
 * @param {Function} [settings.onMouseLeave=noop] A callback function invoked when the mouse is moved out of the element.
 * @param {number}   [settings.timeout=300]       Timeout before the element is shown or hidden.
 */
export function useDebouncedHoverInteraction( {
	onShow = noop,
	onHide = noop,
	onMouseMove = noop,
	onMouseLeave = noop,
	timeout = 300,
} ) {
	const [ show, setShow ] = useState( false );
	const timeoutRef = useRef();

	const setDebouncedTimeout = useCallback(
		( callback ) => {
			window.clearTimeout( timeoutRef.current );

			timeoutRef.current = setTimeout( callback, timeout );
		},
		[ timeout ]
	);

	const handleOnMouseMove = useCallback( ( event ) => {
		onMouseMove( event );

		setDebouncedTimeout( () => {
			if ( ! show ) {
				setShow( true );
				onShow();
			}
		} );
	}, [] );

	const handleOnMouseLeave = useCallback( ( event ) => {
		onMouseLeave( event );

		setDebouncedTimeout( () => {
			setShow( false );
			onHide();
		} );
	}, [] );

	useEffect( () => {
		return () => {
			window.clearTimeout( timeoutRef.current );
		};
	} );

	return {
		onMouseMove: handleOnMouseMove,
		onMouseLeave: handleOnMouseLeave,
	};
}
