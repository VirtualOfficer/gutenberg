/**
 * External dependencies
 */
import { noop } from 'lodash';
/**
 * WordPress dependencies
 */
import {
	__experimentalAlignmentMatrixControl as AlignmentMatrixControl,
	__experimentalUnitControl as UnitControl,
	__experimentalFlex as Flex,
	__experimentalRadioGroup as RadioGroup,
	__experimentalRadio as Radio,
	Button,
	ColorIndicator,
	ColorPicker,
	Popover,
	ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const ALIGNMENTS = {
	'top left': [
		[ 0, '%' ],
		[ 0, '%' ],
	],
	'top center': [
		[ 50, '%' ],
		[ 0, '%' ],
	],
	'top right': [
		[ 100, '%' ],
		[ 0, '%' ],
	],
	'center left': [
		[ 0, '%' ],
		[ 50, '%' ],
	],
	'center center': [
		[ 50, '%' ],
		[ 50, '%' ],
	],
	'center right': [
		[ 100, '%' ],
		[ 50, '%' ],
	],
	'bottom left': [
		[ 0, '%' ],
		[ 100, '%' ],
	],
	'bottom center': [
		[ 50, '%' ],
		[ 100, '%' ],
	],
	'bottom right': [
		[ 100, '%' ],
		[ 100, '%' ],
	],
};

export default function BackgroundControl( {
	color = '#eee',
	position = 'center center',
	onPositionChange = noop,
	onSizeChange = noop,
	onColorChange = noop,
	onFixedChange = noop,
	fixed = false,
	size = 'cover',
} ) {
	return (
		<div style={ { padding: 30 } }>
			<BackgroundPositionControl
				position={ position }
				onPositionChange={ onPositionChange }
				fixed={ fixed }
				onFixedChange={ onFixedChange }
			/>
			<BackgroundSizeControl size={ size } onChange={ onSizeChange } />
			<div style={ { padding: '10px 0' } }>
				<hr />
			</div>
			<BackgroundColorControl
				color={ color }
				onChange={ onColorChange }
			/>
		</div>
	);
}

function BackgroundPositionControl( {
	fixed = false,
	onFixedChange = noop,
	position: positionProp = 'center center',
	onPositionChange = noop,
} ) {
	const initialPosition = ALIGNMENTS[ positionProp ];
	const [ isCustom, setIsCustom ] = useState( false );
	const [ alignment, setAlignment ] = useState( positionProp );
	const [ position, setPosition ] = useState( {
		x: initialPosition[ 0 ],
		y: initialPosition[ 1 ],
	} );

	const { x, y } = position;

	const updatePosition = ( next ) => {
		setPosition( next );

		const nextPosition = {
			x: `${ next.x[ 0 ] }${ next.x[ 1 ] }`,
			y: `${ next.y[ 0 ] }${ next.y[ 1 ] }`,
		};

		onPositionChange( nextPosition );
	};

	const handleOnMatrixChange = ( next ) => {
		const [ nextX, nextY ] = ALIGNMENTS[ next ];
		setAlignment( next );
		updatePosition( { x: nextX, y: nextY } );
		setIsCustom( false );
	};

	const handleOnAnyValueChange = () => {
		setIsCustom( true );
	};

	const handleOnXValueChange = ( next ) => {
		updatePosition( {
			...position,
			x: [ next, x[ 1 ] ],
		} );
		handleOnAnyValueChange();
	};

	const handleOnYValueChange = ( next ) => {
		updatePosition( {
			...position,
			y: [ next, y[ 1 ] ],
		} );
		handleOnAnyValueChange();
	};

	const handleOnXUnitChange = ( next ) => {
		updatePosition( {
			...position,
			x: [ x[ 0 ], next ],
		} );
		handleOnAnyValueChange();
	};

	const handleOnYUnitChange = ( next ) => {
		updatePosition( {
			...position,
			y: [ y[ 0 ], next ],
		} );
		handleOnAnyValueChange();
	};

	return (
		<div>
			<h3>Position</h3>
			<Flex justify="left">
				<Flex.Item>
					<AlignmentMatrixControl
						alignment={ alignment }
						onChange={ handleOnMatrixChange }
						style={ { opacity: isCustom ? 0.5 : 1 } }
					/>
				</Flex.Item>
				<Flex.Item>
					<Flex>
						<div style={ { maxWidth: 80 } }>
							Left
							<UnitControl
								label="Left"
								value={ x[ 0 ] }
								unit={ x[ 1 ] }
								isResetValueOnUnitChange={ false }
								onChange={ handleOnXValueChange }
								onUnitChange={ handleOnXUnitChange }
							/>
						</div>
						<div style={ { maxWidth: 80 } }>
							Top
							<UnitControl
								label="Top"
								value={ y[ 0 ] }
								unit={ y[ 1 ] }
								isResetValueOnUnitChange={ false }
								onChange={ handleOnYValueChange }
								onUnitChange={ handleOnYUnitChange }
							/>
						</div>
					</Flex>
				</Flex.Item>
			</Flex>
			<div style={ { padding: '10px 0' } }>
				<ToggleControl
					label="Fixed"
					checked={ fixed }
					onChange={ onFixedChange }
				/>
			</div>
		</div>
	);
}

function BackgroundSizeControl( { size = 'cover', onChange = noop } ) {
	const [ checked, setChecked ] = useState( size );
	const [ customSize, setCustomSize ] = useState( {
		width: [ 'auto', 'px' ],
		height: [ 'auto', 'px' ],
	} );

	const {
		width: [ width, widthUnit ],
		height: [ height, heightUnit ],
	} = customSize;

	const isWidthAuto = width === 'auto';
	const widthPlaceholder = isWidthAuto ? 'Auto' : null;
	const widthValue = width === 'auto' ? '' : width;

	const isHeightAuto = height === 'auto';
	const heightPlaceholder = isHeightAuto ? 'Auto' : null;
	const heightValue = height === 'auto' ? '' : height;

	const isCustom = checked !== 'cover' && checked !== 'contain';
	const currentChecked = isCustom ? 'custom' : checked;

	const handleOnChange = ( next ) => {
		let nextSize = next;

		if ( next === 'custom' ) {
			nextSize = 'auto auto';
		}

		setChecked( nextSize );
		setCustomSize( {
			width: [ 'auto', widthUnit ],
			height: [ 'auto', heightUnit ],
		} );
		onChange( nextSize );
	};

	const updateCustomSize = ( nextSize ) => {
		setCustomSize( nextSize );

		const nextWidth = isNaN( nextSize.width[ 0 ] )
			? nextSize.width[ 0 ]
			: `${ nextSize.width[ 0 ] }${ nextSize.width[ 1 ] }`;

		const nextHeight = isNaN( nextSize.height[ 0 ] )
			? nextSize.height[ 0 ]
			: `${ nextSize.height[ 0 ] }${ nextSize.height[ 1 ] }`;

		const nextSizeValue = `${ nextWidth } ${ nextHeight }`;

		onChange( nextSizeValue );
	};

	const handleOnWidthChange = ( next ) => {
		const nextValue = next === '' ? 'auto' : next;
		const nextSize = {
			...customSize,
			width: [ nextValue, widthUnit ],
		};

		updateCustomSize( nextSize );
	};

	const handleOnHeightChange = ( next ) => {
		const nextValue = next === '' ? 'auto' : next;
		const nextSize = {
			...customSize,
			height: [ nextValue, heightUnit ],
		};

		updateCustomSize( nextSize );
	};

	const handleOnWidthUnitChange = ( next ) => {
		const nextSize = {
			...customSize,
			width: [ width, next ],
		};

		updateCustomSize( nextSize );
	};

	const handleOnHeightUnitChange = ( next ) => {
		const nextSize = {
			...customSize,
			height: [ height, next ],
		};

		updateCustomSize( nextSize );
	};

	return (
		<div>
			<h3>Size</h3>
			<div style={ { paddingBottom: 10 } }>
				<RadioGroup
					checked={ currentChecked }
					onChange={ handleOnChange }
				>
					<Radio value="cover">Filled</Radio>
					<Radio value="contain">Fitted</Radio>
					<Radio value="custom">Custom</Radio>
				</RadioGroup>
			</div>
			{ isCustom && (
				<Flex align="bottom" justify="left">
					<Flex.Item>
						<div style={ { maxWidth: 80 } }>
							Width
							<UnitControl
								label="Width"
								value={ widthValue }
								placeholder={ widthPlaceholder }
								isResetValueOnUnitChange={ false }
								disableUnits={ isWidthAuto }
								unit={ widthUnit }
								onChange={ handleOnWidthChange }
								onUnitChange={ handleOnWidthUnitChange }
							/>
						</div>
					</Flex.Item>
					<Flex.Item>
						<div style={ { padding: '8px 0' } }>x</div>
					</Flex.Item>
					<Flex.Item>
						<div style={ { maxWidth: 80 } }>
							Height
							<UnitControl
								label="height"
								value={ heightValue }
								placeholder={ heightPlaceholder }
								isResetValueOnUnitChange={ false }
								disableUnits={ isHeightAuto }
								unit={ heightUnit }
								onChange={ handleOnHeightChange }
								onUnitChange={ handleOnHeightUnitChange }
							/>
						</div>
					</Flex.Item>
				</Flex>
			) }
		</div>
	);
}

function BackgroundColorControl( { color = '#eee', onChange = noop } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const handleOnChange = ( next ) => onChange( next.hex );

	return (
		<div>
			<h3>Color</h3>
			<span>
				<Button isSecondary onClick={ () => setIsOpen( ! isOpen ) }>
					<ColorIndicator colorValue={ color } />
				</Button>
				{ isOpen && (
					<Popover>
						<ColorPicker
							color={ color }
							onChangeComplete={ handleOnChange }
						/>
					</Popover>
				) }
			</span>
		</div>
	);
}
