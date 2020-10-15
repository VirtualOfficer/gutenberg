/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import UnitControl from './unit-control';
import { LABELS, CUSTOM_VALUES, setAutoValue } from './utils';
import { LayoutContainer, Layout } from './styles/box-control-styles';

export default function BoxInputControls( {
	onChange = noop,
	onFocus = noop,
	onHoverOn = noop,
	onHoverOff = noop,
	values,
	...props
} ) {
	const createHandleOnFocus = ( side ) => ( event ) => {
		onFocus( event, { side } );
	};

	const createHandleOnHoverOn = ( side ) => () => {
		onHoverOn( { [ side ]: true } );
	};

	const createHandleOnHoverOff = ( side ) => () => {
		onHoverOff( { [ side ]: false } );
	};

	const handleOnChange = ( nextValues ) => {
		onChange( nextValues );
	};

	const { top, right, bottom, left } = values;

	const createHandleOnChange = ( side ) => ( next, { event } ) => {
		const { altKey } = event;
		const nextValues = { ...values };
		const val = setAutoValue( next );
		nextValues[ side ] = val;

		/**
		 * Supports changing pair sides. For example, holding the ALT key
		 * when changing the TOP will also update BOTTOM.
		 */
		if ( altKey ) {
			switch ( side ) {
				case 'top':
					nextValues.bottom = val;
					break;
				case 'bottom':
					nextValues.top = val;
					break;
				case 'left':
					nextValues.right = val;
					break;
				case 'right':
					nextValues.left = val;
					break;
			}
		}

		handleOnChange( nextValues );
	};

	return (
		<LayoutContainer className="component-box-control__input-controls-wrapper">
			<Layout
				gap={ 0 }
				align="top"
				className="component-box-control__input-controls"
			>
				<UnitControl
					{ ...props }
					isFirst
					value={ top }
					onChange={ createHandleOnChange( 'top' ) }
					onFocus={ createHandleOnFocus( 'top' ) }
					onHoverOn={ createHandleOnHoverOn( 'top' ) }
					onHoverOff={ createHandleOnHoverOff( 'top' ) }
					label={ LABELS.top }
					disableValue={ top === CUSTOM_VALUES.AUTO }
				/>
				<UnitControl
					{ ...props }
					value={ right }
					onChange={ createHandleOnChange( 'right' ) }
					onFocus={ createHandleOnFocus( 'right' ) }
					onHoverOn={ createHandleOnHoverOn( 'right' ) }
					onHoverOff={ createHandleOnHoverOff( 'right' ) }
					label={ LABELS.right }
					disableValue={ right === CUSTOM_VALUES.AUTO }
				/>
				<UnitControl
					{ ...props }
					value={ bottom }
					onChange={ createHandleOnChange( 'bottom' ) }
					onFocus={ createHandleOnFocus( 'bottom' ) }
					onHoverOn={ createHandleOnHoverOn( 'bottom' ) }
					onHoverOff={ createHandleOnHoverOff( 'bottom' ) }
					label={ LABELS.bottom }
					disableValue={ bottom === CUSTOM_VALUES.AUTO }
				/>
				<UnitControl
					{ ...props }
					isLast
					value={ left }
					onChange={ createHandleOnChange( 'left' ) }
					onFocus={ createHandleOnFocus( 'left' ) }
					onHoverOn={ createHandleOnHoverOn( 'left' ) }
					onHoverOff={ createHandleOnHoverOff( 'left' ) }
					label={ LABELS.left }
					disableValue={ left === CUSTOM_VALUES.AUTO }
				/>
			</Layout>
		</LayoutContainer>
	);
}
