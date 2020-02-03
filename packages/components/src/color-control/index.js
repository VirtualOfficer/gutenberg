/**
 * External dependencies
 */
import colorize from 'tinycolor2';
/**
 * WordPress dependencies
 */
import { useState, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ColorPicker from '../color-picker';
import Dropdown from '../dropdown';

import {
	ControlWrapper,
	ColorSwatch,
	ColorLabel,
} from './styles/color-control-styles';

export default function ColorControl( { value = 'black' } ) {
	const [ isFocused, setIsFocused ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ color, setColor ] = useState( toColor( value ) );
	const onChange = ( nextColor ) => setColor( nextColor );

	const renderToggle = useCallback(
		( { isOpen: isOpenProp, onToggle } ) => {
			setIsOpen( isOpenProp );
			return (
				<ColorSwatch
					aria-expanded={ isOpenProp }
					onBlur={ () => setIsFocused( false ) }
					onFocus={ () => setIsFocused( true ) }
					style={ { backgroundColor: color } }
					onClick={ onToggle }
				/>
			);
		},
		[ color ]
	);

	const renderContent = useCallback(
		() => (
			<ColorPicker
				color={ value }
				onChangeComplete={ ( nextColor ) => onChange( nextColor.hex ) }
				disableAlpha
			/>
		),
		[ color ]
	);

	const isFocusedOrOpen = isFocused || isOpen;

	return (
		<ControlWrapper isFocused={ isFocusedOrOpen }>
			<Dropdown
				noArrow={ true }
				position="middle left"
				renderToggle={ renderToggle }
				renderContent={ renderContent }
			/>
			<ColorLabel>{ color }</ColorLabel>
		</ControlWrapper>
	);
}

function toColor( color ) {
	return colorize( color ).toHexString();
}
