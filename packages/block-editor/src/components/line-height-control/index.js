/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	BASE_DEFAULT_VALUE,
	RESET_VALUE,
	STEP,
	useIsLineHeightControlsDisabled,
	isLineHeightDefined,
} from './utils';

export default function LineHeightControl( { value: lineHeight, onChange } ) {
	const isDisabled = useIsLineHeightControlsDisabled();
	const isDefined = isLineHeightDefined( lineHeight );

	// Don't render the controls if disabled by editor settings
	if ( isDisabled ) {
		return null;
	}

	const handleOnChange = ( nextValue ) => {
		// Set the next value without modification if lineHeight has been defined
		if ( isDefined ) {
			onChange( nextValue );
			return;
		}

		// Otherwise...
		let adjustedNextValue = nextValue;

		switch ( nextValue ) {
			case `${ STEP }`:
				// Increment by step value
				adjustedNextValue = BASE_DEFAULT_VALUE + STEP;
				break;
			case '0':
				// Decrement by step value
				adjustedNextValue = BASE_DEFAULT_VALUE - STEP;
				break;
		}

		onChange( adjustedNextValue );
	};

	const value = isDefined ? lineHeight : RESET_VALUE;

	return (
		<div className="block-editor-line-height-control">
			<TextControl
				autoComplete="off"
				onChange={ handleOnChange }
				label={ __( 'Line height' ) }
				placeholder={ BASE_DEFAULT_VALUE }
				step={ STEP }
				type="number"
				value={ value }
				min={ 0 }
			/>
		</div>
	);
}
