/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	BaseControl,
	RangeControl,
	Flex,
	FlexItem,
	useBaseControlProps,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
	__experimentalUnitControl as UnitControl,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';

const DEFAULT_UNITS = [ 'px', 'em', 'rem', 'vw', 'vh' ];

function SizeControl( props ) {
	const { baseControlProps } = useBaseControlProps( props );
	const { value, onChange, fallbackValue, disabled } = props;

	const units = useCustomUnits( {
		availableUnits: DEFAULT_UNITS,
	} );

	const [ valueQuantity, valueUnit = 'px' ] =
		parseQuantityAndUnitFromRawValue( value, units );

	const isValueUnitRelative =
		!! valueUnit && [ 'em', 'rem', 'vw', 'vh' ].includes( valueUnit );

	// Receives the new value from the UnitControl component as a string containing the value and unit.
	const handleUnitControlChange = ( newValue ) => {
		onChange( newValue );
	};

	// Receives the new value from the RangeControl component as a number.
	const handleRangeControlChange = ( newValue ) => {
		onChange?.( newValue + valueUnit );
	};

	return (
		<BaseControl { ...baseControlProps }>
			<Flex>
				<FlexItem isBlock>
					<UnitControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Custom' ) }
						hideLabelFromVision
						value={ value }
						onChange={ handleUnitControlChange }
						units={ units }
						min={ 0 }
						disabled={ disabled }
					/>
				</FlexItem>
				<FlexItem isBlock>
					<Spacer marginX={ 2 } marginBottom={ 0 }>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Custom Size' ) }
							hideLabelFromVision
							value={ valueQuantity }
							initialPosition={ fallbackValue }
							withInputField={ false }
							onChange={ handleRangeControlChange }
							min={ 0 }
							max={ isValueUnitRelative ? 10 : 100 }
							step={ isValueUnitRelative ? 0.1 : 1 }
							disabled={ disabled }
						/>
					</Spacer>
				</FlexItem>
			</Flex>
		</BaseControl>
	);
}

export default SizeControl;
