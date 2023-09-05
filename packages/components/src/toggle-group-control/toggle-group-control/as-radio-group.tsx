/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import { RadioGroup, useRadioState } from 'reakit';

/**
 * WordPress dependencies
 */
import { useInstanceId, usePrevious } from '@wordpress/compose';
import {
	forwardRef,
	useRef,
	useLayoutEffect,
	useEffect,
	useMemo,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { View } from '../../view';
import ToggleGroupControlContext from '../context';
import type { WordPressComponentProps } from '../../ui/context';
import type {
	ToggleGroupControlMainControlProps,
	ToggleGroupControlContextProps,
} from '../types';

function UnforwardedToggleGroupControlAsRadioGroup(
	{
		children,
		isAdaptiveWidth,
		label,
		onChange,
		size,
		value,
		...otherProps
	}: WordPressComponentProps<
		ToggleGroupControlMainControlProps,
		'div',
		false
	>,
	forwardedRef: ForwardedRef< HTMLDivElement >
) {
	const mounted = useRef( false );

	const baseId = useInstanceId(
		ToggleGroupControlAsRadioGroup,
		'toggle-group-control-as-radio-group'
	).toString();
	const radio = useRadioState( {
		baseId,
		state: value,
	} );
	const previousValue = usePrevious( value );

	const groupContextValue = useMemo(
		() =>
			( {
				...radio,
				isBlock: ! isAdaptiveWidth,
				size,
			} as ToggleGroupControlContextProps ),
		[ radio, isAdaptiveWidth, size ]
	);

	useEffect( () => {
		mounted.current = true;
	}, [] );

	const { setState: groupSetState, state: groupState } = groupContextValue;

	// Propagate groupContext.state change.
	useLayoutEffect( () => {
		// Avoid calling onChange if groupContext state changed
		// from incoming value.
		if ( mounted.current && previousValue !== groupState ) {
			onChange( groupState );
		}
	}, [ groupState, onChange, previousValue ] );

	// Sync incoming value with groupContext.state.
	useLayoutEffect( () => {
		if ( mounted.current && value !== groupState ) {
			groupSetState( value );
		}
	}, [ groupSetState, groupState, value ] );

	return (
		<ToggleGroupControlContext.Provider value={ groupContextValue }>
			<RadioGroup
				{ ...radio }
				aria-label={ label }
				as={ View }
				{ ...otherProps }
				ref={ forwardedRef }
			>
				{ children }
			</RadioGroup>
		</ToggleGroupControlContext.Provider>
	);
}

export const ToggleGroupControlAsRadioGroup = forwardRef(
	UnforwardedToggleGroupControlAsRadioGroup
);
