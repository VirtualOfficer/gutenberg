/**
 * External dependencies
 */
import { get, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import AnglePickerControl from '../angle-picker-control';
import CustomGradientBar from './custom-gradient-bar';
import { Flex } from '../flex';
import SelectControl from '../select-control';
import { getGradientAstWithDefault, getGradientBarValue } from './utils';
import { serializeControlPoints, serializeGradient } from './serializer';
import {
	DEFAULT_LINEAR_GRADIENT_ANGLE,
	HORIZONTAL_GRADIENT_ORIENTATION,
	GRADIENT_OPTIONS,
} from './constants';
import {
	AccessoryWrapper,
	SelectWrapper,
} from './styles/custom-gradient-picker-styles';

const GradientAnglePicker = ( { gradientAST, hasGradient, onChange } ) => {
	const angle = get(
		gradientAST,
		[ 'orientation', 'value' ],
		DEFAULT_LINEAR_GRADIENT_ANGLE
	);
	const onAngleChange = ( newAngle ) => {
		onChange(
			serializeGradient( {
				...gradientAST,
				orientation: {
					type: 'angular',
					value: newAngle,
				},
			} )
		);
	};
	return (
		<AnglePickerControl
			hideLabelFromVision
			onChange={ onAngleChange }
			value={ hasGradient ? angle : '' }
		/>
	);
};

const GradientTypePicker = ( { gradientAST, hasGradient, onChange } ) => {
	const { type } = gradientAST;
	const onSetLinearGradient = () => {
		onChange(
			serializeGradient( {
				...gradientAST,
				...( gradientAST.orientation
					? {}
					: { orientation: HORIZONTAL_GRADIENT_ORIENTATION } ),
				type: 'linear-gradient',
			} )
		);
	};

	const onSetRadialGradient = () => {
		onChange(
			serializeGradient( {
				...omit( gradientAST, [ 'orientation' ] ),
				type: 'radial-gradient',
			} )
		);
	};

	const handleOnChange = ( next ) => {
		if ( next === 'linear-gradient' ) {
			onSetLinearGradient();
		}
		if ( next === 'radial-gradient' ) {
			onSetRadialGradient();
		}
	};

	return (
		<SelectControl
			className="components-custom-gradient-picker__type-picker"
			label={ __( 'Type' ) }
			labelPosition={ 'side' }
			onChange={ handleOnChange }
			options={ GRADIENT_OPTIONS }
			value={ hasGradient && type }
		/>
	);
};

export default function CustomGradientPicker( { value, onChange } ) {
	const gradientAST = getGradientAstWithDefault( value );
	const barValue = getGradientBarValue( gradientAST );
	const controlPoints = gradientAST.colorStops.map( ( p ) => ( {
		color: `${ p.type }(${ p.value.join( ',' ) })`,
		position: `${ p.length.value }${ p.length.type }`,
	} ) );

	return (
		<div className="components-custom-gradient-picker">
			<CustomGradientBar
				background={ barValue.background }
				hasGradient={ barValue.hasGradient }
				value={ controlPoints }
				onChange={ ( newControlPoints ) => {
					onChange(
						serializeControlPoints( gradientAST, newControlPoints )
					);
				} }
			/>
			<Flex
				gap={ 3 }
				className="components-custom-gradient-picker__ui-line"
			>
				<SelectWrapper>
					<GradientTypePicker
						gradientAST={ gradientAST }
						hasGradient={ barValue.hasGradient }
						onChange={ onChange }
					/>
				</SelectWrapper>
				<AccessoryWrapper>
					{ gradientAST.type === 'linear-gradient' && (
						<GradientAnglePicker
							gradientAST={ gradientAST }
							hasGradient={ barValue.hasGradient }
							onChange={ onChange }
						/>
					) }
				</AccessoryWrapper>
			</Flex>
		</div>
	);
}
