/**
 * External dependencies
 */
import { isUndefined } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __experimentalUseBlockEditProps as useBlockEditProps } from '../../store';

export const BASE_DEFAULT_VALUE = 1.5;
export const STEP = 0.1;
/**
 * There are varying value types within LineHeightControl:
 *
 * {undefined} Initial value. No changes from the user.
 * {string} Input value. Value consumed/outputted by the input. Empty would be ''.
 * {number} Block attribute type. Input value needs to be converted for attribute setting.
 *
 * Note: If the value is undefined, the input requires it to be an empty string ('')
 * in order to be considered "controlled" by props (rather than internal state).
 */
export const RESET_VALUE = '';

/**
 * Retrieves whether custom lineHeight controls should be disabled from editor settings.
 *
 * @return {boolean} Whether lineHeight controls should be disabled.
 */
export function useIsLineHeightControlsDisabled() {
	const isDisabled = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		return !! getSettings().disableCustomLineHeight;
	}, [] );

	return isDisabled;
}

/**
 * Retrieves the attributes/setter for the block, but adjusted to target just the lineHeight attribute
 *
 * @return {Array<string|undefined, Function>} [lineHeight, setLineHeight] from the block's edit props.
 */
export function useLineHeightControlState() {
	const [ attributes, setAttributes ] = useBlockEditProps();

	const { lineHeight } = attributes;

	const setLineHeight = ( value ) => {
		const nextValue = isLineHeightDefined( value )
			? // Convert to a number for the block attribute
			  parseFloat( value )
			: // Unset for the block attribute
			  undefined;

		setAttributes( { lineHeight: nextValue } );
	};

	return [ lineHeight, setLineHeight ];
}

/**
 * Determines if the lineHeight attribute has been properly defined.
 *
 * @param {any} lineHeight The value to check.
 *
 * @return {boolean} Whether the lineHeight attribute is valid.
 */
export function isLineHeightDefined( lineHeight ) {
	return ! isUndefined( lineHeight ) && lineHeight !== RESET_VALUE;
}

/**
 * Generates the "inline" lineHeight attribute styles, if defined.
 *
 * @param {number|string} lineHeight The line-height value to stylize.
 *
 * @return {Object} Style properties with the lineHeight attribute, if defined.
 */
export function getLineHeightControlStyles( lineHeight ) {
	if ( ! isLineHeightDefined( lineHeight ) ) {
		return {};
	}

	// Using CSS variable to set the style. This reduces specifity, allowing for
	// easier overrides, if needed.
	return {
		'--wp--core-paragraph--line-height': `${ lineHeight }`,
	};
}

/**
 * Generates the CSS className representing the  lineHeight attribute styles, if defined.
 *
 * @param {number|string} lineHeight The line-height value render to className.
 *
 * @return {string} CSS className of the lineHeight attribute, if defined.
 */
export function getLineHeightControlClassName( lineHeight ) {
	if ( ! isLineHeightDefined( lineHeight ) ) {
		return '';
	}

	return 'has-line-height';
}
