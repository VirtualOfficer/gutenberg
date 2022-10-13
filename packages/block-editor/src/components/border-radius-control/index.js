/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	BaseControl,
	RangeControl,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import AllInputControl from './all-input-control';
import InputControls from './input-controls';
import LinkedButton from './linked-button';
import useSetting from '../use-setting';
import {
	getAllValue,
	getAllUnit,
	hasDefinedValues,
	hasMixedValues,
} from './utils';

const DEFAULT_VALUES = {
	topLeft: undefined,
	topRight: undefined,
	bottomLeft: undefined,
	bottomRight: undefined,
};
const MIN_BORDER_RADIUS_VALUE = 0;
const MAX_BORDER_RADIUS_VALUES = {
	px: 100,
	em: 20,
	rem: 20,
};

/**
 * Control to display border radius options.
 *
 * @param {Object}   props                       Component props.
 * @param {Function} props.onChange              Callback to handle onChange.
 * @param {Object}   props.values                Border radius values.
 * @param {boolean}  props.__next40pxDefaultSize Toggles default height to 40px.
 *
 * @return {WPElement}              Custom border radius control.
 */
export default function BorderRadiusControl( {
	onChange,
	values,
	__next40pxDefaultSize = false,
} ) {
	const [ isLinked, setIsLinked ] = useState(
		! hasDefinedValues( values ) || ! hasMixedValues( values )
	);

	// Tracking selected units via internal state allows filtering of CSS unit
	// only values from being saved while maintaining preexisting unit selection
	// behaviour. Filtering CSS unit only values prevents invalid style values.
	const [ selectedUnits, setSelectedUnits ] = useState( {
		flat:
			typeof values === 'string'
				? parseQuantityAndUnitFromRawValue( values )[ 1 ]
				: undefined,
		topLeft: parseQuantityAndUnitFromRawValue( values?.topLeft )[ 1 ],
		topRight: parseQuantityAndUnitFromRawValue( values?.topRight )[ 1 ],
		bottomLeft: parseQuantityAndUnitFromRawValue( values?.bottomLeft )[ 1 ],
		bottomRight: parseQuantityAndUnitFromRawValue(
			values?.bottomRight
		)[ 1 ],
	} );

	const units = useCustomUnits( {
		availableUnits: useSetting( 'spacing.units' ) || [ 'px', 'em', 'rem' ],
	} );

	const unit = getAllUnit( selectedUnits );
	const unitConfig = units && units.find( ( item ) => item.value === unit );
	const step = unitConfig?.step || 1;

	const [ allValue ] = parseQuantityAndUnitFromRawValue(
		getAllValue( values )
	);

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleSliderChange = ( next ) => {
		onChange( next !== undefined ? `${ next }${ unit }` : undefined );
	};

	const classes = classnames( 'components-border-radius-control__wrapper', {
		'has-40px-default-size': __next40pxDefaultSize,
	} );

	return (
		<fieldset className="components-border-radius-control">
			<BaseControl.VisualLabel as="legend">
				{ __( 'Radius' ) }
			</BaseControl.VisualLabel>
			<div className={ classes }>
				{ isLinked ? (
					<>
						<AllInputControl
							wrapperClassName="components-border-radius-control__unit-control"
							values={ values }
							min={ MIN_BORDER_RADIUS_VALUE }
							onChange={ onChange }
							selectedUnits={ selectedUnits }
							setSelectedUnits={ setSelectedUnits }
							units={ units }
							__next40pxDefaultSize={ __next40pxDefaultSize }
						/>
						<RangeControl
							label={ __( 'Border radius' ) }
							hideLabelFromVision
							className="components-border-radius-control__range-control"
							value={ allValue ?? '' }
							min={ MIN_BORDER_RADIUS_VALUE }
							max={ MAX_BORDER_RADIUS_VALUES[ unit ] }
							initialPosition={ 0 }
							withInputField={ false }
							onChange={ handleSliderChange }
							step={ step }
							__nextHasNoMarginBottom
						/>
					</>
				) : (
					<InputControls
						min={ MIN_BORDER_RADIUS_VALUE }
						onChange={ onChange }
						selectedUnits={ selectedUnits }
						setSelectedUnits={ setSelectedUnits }
						values={ values || DEFAULT_VALUES }
						units={ units }
						__next40pxDefaultSize={ __next40pxDefaultSize }
					/>
				) }
				<LinkedButton onClick={ toggleLinked } isLinked={ isLinked } />
			</div>
		</fieldset>
	);
}
