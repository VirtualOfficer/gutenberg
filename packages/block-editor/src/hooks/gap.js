/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Platform } from '@wordpress/element';
import { getBlockSupport } from '@wordpress/blocks';
import {
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __unstableUseBlockRef as useBlockRef } from '../components/block-list/use-block-props/use-block-refs';
import useSetting from '../components/use-setting';
import { AXIAL_SIDES, SPACING_SUPPORT_KEY, useCustomSides } from './dimensions';
import { cleanEmptyObject } from './utils';

/**
 * Determines if there is gap support.
 *
 * @param {string|Object} blockType Block name or Block Type object.
 * @return {boolean}                Whether there is support.
 */
export function hasGapSupport( blockType ) {
	const support = getBlockSupport( blockType, SPACING_SUPPORT_KEY );
	return !! ( true === support || support?.blockGap );
}

/**
 * Checks if there is a current value in the gap block support attributes.
 *
 * @param {Object} props Block props.
 * @return {boolean}      Whether or not the block has a gap value set.
 */
export function hasGapValue( props ) {
	return props.attributes.style?.spacing?.blockGap !== undefined;
}

/**
 * Returns a BoxControl object value from a given blockGap style.
 * The string check is for backwards compatibility before Gutenberg supported
 * split gap values (row and column) and the value was a string n + unit.
 *
 * @param {string? | Object?} rawBlockGapValue A style object.
 * @return {Object?}                           A value to pass to the BoxControl component.
 */
export function getGapValueFromStyle( rawBlockGapValue ) {
	if ( ! rawBlockGapValue ) {
		return rawBlockGapValue;
	}

	const isValueString = typeof rawBlockGapValue === 'string';
	return {
		top: isValueString ? rawBlockGapValue : rawBlockGapValue?.top,
		left: isValueString ? rawBlockGapValue : rawBlockGapValue?.left,
	};
}

/**
 * Returns a CSS value for the `gap` property from a given blockGap style.
 *
 * @param {string? | Object?} blockGapValue A style object.
 * @param {string?}           defaultValue  A default gap value.
 * @return {string?}                        The concatenated gap value (row and column).
 */
export function getGapCSSValue( blockGapValue, defaultValue = '0' ) {
	const blockGapBoxControlValue = getGapValueFromStyle( blockGapValue );
	if ( ! blockGapBoxControlValue ) {
		return blockGapBoxControlValue;
	}

	const row = blockGapBoxControlValue?.top || defaultValue;
	const column = blockGapBoxControlValue?.left || defaultValue;

	return row === column ? row : `${ row } ${ column }`;
}

/**
 * Resets the gap block support attribute. This can be used when disabling
 * the gap support controls for a block via a progressive discovery panel.
 *
 * @param {Object} props               Block props.
 * @param {Object} props.attributes    Block's attributes.
 * @param {Object} props.setAttributes Function to set block's attributes.
 */
export function resetGap( { attributes = {}, setAttributes } ) {
	const { style } = attributes;

	setAttributes( {
		style: {
			...style,
			spacing: {
				...style?.spacing,
				blockGap: undefined,
			},
		},
	} );
}

/**
 * Custom hook that checks if gap settings have been disabled.
 *
 * @param {string} name The name of the block.
 * @return {boolean}     Whether the gap setting is disabled.
 */
export function useIsGapDisabled( { name: blockName } = {} ) {
	const isDisabled = ! useSetting( 'spacing.blockGap' );
	return ! hasGapSupport( blockName ) || isDisabled;
}

/**
 * Inspector control panel containing the gap related configuration
 *
 * @param {Object} props
 *
 * @return {WPElement} Gap edit element.
 */
export function GapEdit( props ) {
	const {
		clientId,
		attributes: { style },
		name: blockName,
		setAttributes,
	} = props;

	const units = useCustomUnits( {
		availableUnits: useSetting( 'spacing.units' ) || [
			'%',
			'px',
			'em',
			'rem',
			'vw',
		],
	} );
	const sides = useCustomSides( blockName, 'blockGap' );
	const ref = useBlockRef( clientId );

	if ( useIsGapDisabled( props ) ) {
		return null;
	}

	const onChange = ( next ) => {
		const newStyle = {
			...style,
			spacing: {
				...style?.spacing,
				blockGap: {
					...getGapValueFromStyle( next ),
				},
			},
		};

		setAttributes( {
			style: cleanEmptyObject( newStyle ),
		} );

		// In Safari, changing the `gap` CSS value on its own will not trigger the layout
		// to be recalculated / re-rendered. To force the updated gap to re-render, here
		// we replace the block's node with itself.
		const isSafari =
			window?.navigator.userAgent &&
			window.navigator.userAgent.includes( 'Safari' ) &&
			! window.navigator.userAgent.includes( 'Chrome ' ) &&
			! window.navigator.userAgent.includes( 'Chromium ' );

		if ( ref.current && isSafari ) {
			ref.current.parentNode?.replaceChild( ref.current, ref.current );
		}
	};

	const splitOnAxis =
		sides && sides.some( ( side ) => AXIAL_SIDES.includes( side ) );
	const gapValue = getGapValueFromStyle( style?.spacing?.blockGap );
	const boxControlGapValue = splitOnAxis
		? {
				...gapValue,
				right: gapValue?.left,
				bottom: gapValue?.top,
		  }
		: gapValue?.top;

	return Platform.select( {
		web: (
			<>
				{ splitOnAxis ? (
					<BoxControl
						label={ __( 'Block spacing' ) }
						min={ 0 }
						onChange={ onChange }
						units={ units }
						sides={ sides }
						values={ boxControlGapValue }
						allowReset={ false }
						splitOnAxis={ splitOnAxis }
					/>
				) : (
					<UnitControl
						label={ __( 'Block spacing' ) }
						__unstableInputWidth="80px"
						min={ 0 }
						onChange={ onChange }
						units={ units }
						// Default to `row` for combined values.
						value={ boxControlGapValue }
					/>
				) }
			</>
		),
		native: null,
	} );
}
