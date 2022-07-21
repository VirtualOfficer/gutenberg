/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import {
	Button,
	RangeControl,
	CustomSelectControl,
	__experimentalUnitControl as UnitControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useSetting from '../use-setting';
import { LABELS, getSliderValueFromPreset } from './utils';

export default function SpacingInputControl( {
	spacingSizes,
	value,
	side,
	onChange,
} ) {
	const units = useCustomUnits( {
		availableUnits: useSetting( 'spacing.units' ) || [ 'px', 'em', 'rem' ],
	} );

	const [ valueNow, setValueNow ] = useState( null );

	const [ selectedUnit, setSelectedUnit ] = useState(
		parseQuantityAndUnitFromRawValue( value )[ 1 ] || units[ 0 ]
	);

	const [ showCustomValueControl, setShowCustomValueControl ] =
		useState( false );

	const customTooltipContent = ( newValue ) => spacingSizes[ newValue ]?.name;

	const currentValue = ! showCustomValueControl
		? getSliderValueFromPreset( value, spacingSizes )
		: value;

	const getNewCustomValue = ( newSize ) => {
		const isNumeric = ! isNaN( parseFloat( newSize ) );
		const nextValue = isNumeric ? newSize : undefined;
		return nextValue;
	};

	const getNewPresetValue = ( newSize ) => {
		setValueNow( newSize );
		const size = parseInt( newSize, 10 );
		if ( size === 0 ) {
			return '0';
		}
		return `var:preset|spacing|${ spacingSizes[ newSize ]?.slug }`;
	};

	const handleCustomValueSliderChange = ( next ) => {
		onChange(
			next !== undefined ? `${ next }${ selectedUnit }` : undefined
		);
	};

	const handleOnUnitChange = ( unit ) => {
		setSelectedUnit( unit );
	};

	const currentValueHint = customTooltipContent( currentValue );

	const options = spacingSizes.map( ( size, index ) => ( {
		key: index,
		name: size.name,
	} ) );

	const marks = spacingSizes.map( ( newValue, index ) => ( {
		value: index,
		lable: undefined,
	} ) );

	return (
		<>
			<HStack>
				{ side !== 'all' && (
					<Text className="components-spacing-sizes-control__side-label">
						{ LABELS[ side ] }
					</Text>
				) }

				{ spacingSizes.length <= 8 && ! showCustomValueControl && (
					<Text className="components-spacing-sizes-control__hint">
						{ currentValueHint !== undefined
							? currentValueHint
							: __( 'Default' ) }
					</Text>
				) }

				{ spacingSizes.length > 8 && ! showCustomValueControl && (
					<CustomSelectControl
						value={ options.find(
							( option ) => option.key === valueNow
						) }
						onChange={ ( selectedItem ) => {
							onChange( getNewPresetValue( selectedItem.key ) );
						} }
						options={ options }
						onHighlightedIndexChange={ ( index ) => {
							if ( index.type === '__item_mouse_move__' ) {
								onChange(
									getNewPresetValue( index.highlightedIndex )
								);
							}
						} }
					/>
				) }
				<Button
					label={
						showCustomValueControl
							? __( 'Use size preset' )
							: __( 'Set custom size' )
					}
					icon={ settings }
					onClick={ () => {
						setShowCustomValueControl( ! showCustomValueControl );
					} }
					isPressed={ showCustomValueControl }
					isSmall
					className="components-spacing-sizes-control__custom-toggle"
				/>
			</HStack>
			{ showCustomValueControl && (
				<HStack className="components-spacing-sizes-control__custom-value-control">
					<UnitControl
						onChange={ ( newSize ) =>
							onChange( getNewCustomValue( newSize ) )
						}
						value={ currentValue }
						units={ units }
						onUnitChange={ handleOnUnitChange }
					/>

					<RangeControl
						value={ value }
						min={ 0 }
						max={ 50 }
						withInputField={ false }
						onChange={ handleCustomValueSliderChange }
					/>
				</HStack>
			) }
			{ spacingSizes.length <= 8 && ! showCustomValueControl && (
				<RangeControl
					value={ currentValue }
					onChange={ ( newSize ) =>
						onChange( getNewPresetValue( newSize ) )
					}
					withInputField={ false }
					aria-valuenow={ valueNow }
					aria-valuetext={ spacingSizes[ valueNow ]?.name }
					renderTooltipContent={ customTooltipContent }
					min={ 0 }
					max={ spacingSizes.length - 1 }
					marks={ marks }
				/>
			) }
		</>
	);
}
