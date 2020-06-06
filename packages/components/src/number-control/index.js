/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Input } from './styles/number-control-styles';
import {
	inputControlActionTypes,
	composeStateReducers,
} from '../input-control/state';
import { useRTL } from '../utils/style-mixins';
import { add, roundClamp } from '../utils/math';
import { useJumpStep } from '../utils/hooks';

export function NumberControl(
	{
		__unstableStateReducer: stateReducer = ( state ) => state,
		className,
		dragDirection = 'n',
		hideHTMLArrows = false,
		isDragEnabled = true,
		isShiftStepEnabled = true,
		label,
		max = Infinity,
		min = -Infinity,
		shiftStep = 10,
		step = 1,
		type: typeProp = 'number',
		value: valueProp,
		...props
	},
	ref
) {
	const isRtl = useRTL();

	const jumpStep = useJumpStep( {
		step,
		shiftStep,
		isShiftStepEnabled,
	} );

	const autoComplete = typeProp === 'number' ? 'off' : null;
	const classes = classNames( 'components-number-control', className );

	/**
	 * "Middleware" function that intercepts updates from InputControl.
	 * This allows us to tap into actions to transform the (next) state for
	 * InputControl.
	 *
	 * @param {Object} state State from InputControl
	 * @param {Object} action Action triggering state change
	 * @return {Object} The updated state to apply to InputControl
	 */
	const numberControlStateReducer = ( state, action ) => {
		const { type, payload } = action;
		const currentValue = state.value;

		/**
		 * Handles drag to update events
		 */
		if ( type === inputControlActionTypes.DRAG && isDragEnabled ) {
			const { delta, shiftKey } = payload;
			const [ x, y ] = delta;
			const modifier = shiftKey ? shiftStep : 1;

			let directionModifier;
			let directionBaseValue;

			switch ( dragDirection ) {
				case 'n':
					directionBaseValue = y;
					directionModifier = -1;
					break;

				case 'e':
					directionBaseValue = x;
					directionModifier = isRtl ? -1 : 1;
					break;

				case 's':
					directionBaseValue = y;
					directionModifier = 1;
					break;

				case 'w':
					directionBaseValue = x;
					directionModifier = isRtl ? 1 : -1;
					break;
			}

			const distance = directionBaseValue * modifier * directionModifier;
			let nextValue;

			if ( distance !== 0 ) {
				nextValue = roundClamp(
					add( currentValue, distance ),
					min,
					max,
					modifier
				);

				state.value = nextValue;
			}
		}

		/**
		 * Handles ENTER key press and submit
		 */
		if (
			type === inputControlActionTypes.PRESS_ENTER ||
			type === inputControlActionTypes.SUBMIT
		) {
			state.value = roundClamp( currentValue, min, max );
		}

		return state;
	};

	return (
		<Input
			autoComplete={ autoComplete }
			inputMode="numeric"
			{ ...props }
			className={ classes }
			dragDirection={ dragDirection }
			hideHTMLArrows={ hideHTMLArrows }
			isDragEnabled={ isDragEnabled }
			label={ label }
			max={ max }
			min={ min }
			ref={ ref }
			step={ jumpStep }
			type={ typeProp }
			value={ valueProp }
			__unstableStateReducer={ composeStateReducers(
				numberControlStateReducer,
				stateReducer
			) }
		/>
	);
}

export default forwardRef( NumberControl );
