/**
 * WordPress dependencies
 */
import { CustomSelectControl } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatFontWeight } from '../../utils/format-font-weight';

const FONT_STYLES = [
	{
		name: _x( 'Regular', 'font style' ),
		value: 'normal',
	},
	{
		name: _x( 'Italic', 'font style' ),
		value: 'italic',
	},
];

const FONT_WEIGHTS = [
	{
		name: _x( 'Thin', 'font weight' ),
		value: '100',
	},
	{
		name: _x( 'Extra Light', 'font weight' ),
		value: '200',
	},
	{
		name: _x( 'Light', 'font weight' ),
		value: '300',
	},
	{
		name: _x( 'Regular', 'font weight' ),
		value: '400',
	},
	{
		name: _x( 'Medium', 'font weight' ),
		value: '500',
	},
	{
		name: _x( 'Semi Bold', 'font weight' ),
		value: '600',
	},
	{
		name: _x( 'Bold', 'font weight' ),
		value: '700',
	},
	{
		name: _x( 'Extra Bold', 'font weight' ),
		value: '800',
	},
	{
		name: _x( 'Black', 'font weight' ),
		value: '900',
	},
];

/**
 * Adjusts font appearance field label in case either font styles or weights
 * are disabled.
 *
 * @param {boolean} hasFontStyles  Whether font styles are enabled and present.
 * @param {boolean} hasFontWeights Whether font weights are enabled and present.
 * @return {string} A label representing what font appearance is being edited.
 */
const getFontAppearanceLabel = ( hasFontStyles, hasFontWeights ) => {
	if ( ! hasFontStyles ) {
		return __( 'Font weight' );
	}

	if ( ! hasFontWeights ) {
		return __( 'Font style' );
	}

	return __( 'Appearance' );
};

/**
 * Control to display font style and weight options of the active font.
 *
 * @param {Object} props Component props.
 *
 * @return {Element} Font appearance control.
 */
export default function FontAppearanceControl( props ) {
	const {
		onChange,
		hasFontStyles = true,
		hasFontWeights = true,
		fontFamilyFaces,
		value: { fontStyle, fontWeight },
		...otherProps
	} = props;
	const hasStylesOrWeights = hasFontStyles || hasFontWeights;
	const label = getFontAppearanceLabel( hasFontStyles, hasFontWeights );
	const defaultOption = {
		key: 'default',
		name: __( 'Default' ),
		style: { fontStyle: undefined, fontWeight: undefined },
	};

	let fontWeights = [];
	let fontStyles = [];

	fontFamilyFaces?.forEach( ( face ) => {
		if ( face.fontWeight ) {
			if (
				fontWeights.findIndex(
					( weight ) => weight.value === face.fontWeight
				) === -1
			) {
				fontWeights.push( formatFontWeight( face.fontWeight ) );
			}
		}
		if ( face.fontStyle ) {
			if (
				fontStyles.findIndex(
					( style ) => style.value === face.fontStyle
				) === -1
			) {
				let styleName = face.fontStyle;
				if ( face.fontStyle === 'normal' ) {
					styleName = _x( 'Regular', 'font style' );
				}

				fontStyles.push( {
					name: styleName,
					value: face.fontStyle,
				} );
			}
		}
	} );

	fontWeights = fontWeights.length === 0 ? FONT_WEIGHTS : fontWeights;
	fontStyles = fontStyles.length === 0 ? FONT_STYLES : fontStyles;

	// Combines both font style and weight options into a single dropdown.
	const combineOptions = () => {
		const combinedOptions = [ defaultOption ];

		fontStyles.forEach( ( { name: styleName, value: styleValue } ) => {
			fontWeights.forEach(
				( { name: weightName, value: weightValue } ) => {
					const optionName =
						styleValue === 'normal'
							? weightName
							: sprintf(
									/* translators: 1: Font weight name. 2: Font style name. */
									__( '%1$s %2$s' ),
									weightName,
									styleName
							  );

					combinedOptions.push( {
						key: `${ styleValue }-${ weightValue }`,
						name: optionName,
						style: {
							fontStyle: styleValue,
							fontWeight: weightValue,
						},
					} );
				}
			);
		} );

		return combinedOptions;
	};

	// Generates select options for font styles only.
	const styleOptions = () => {
		const combinedOptions = [ defaultOption ];
		fontStyles.forEach( ( { name, value } ) => {
			combinedOptions.push( {
				key: value,
				name,
				style: { fontStyle: value, fontWeight: undefined },
			} );
		} );
		return combinedOptions;
	};

	// Generates select options for font weights only.
	const weightOptions = () => {
		const combinedOptions = [ defaultOption ];
		fontWeights.forEach( ( { name, value } ) => {
			combinedOptions.push( {
				key: value,
				name,
				style: { fontStyle: undefined, fontWeight: value },
			} );
		} );
		return combinedOptions;
	};

	// Map font styles and weights to select options.
	const selectOptions = useMemo( () => {
		if ( hasFontStyles && hasFontWeights ) {
			return combineOptions();
		}

		return hasFontStyles ? styleOptions() : weightOptions();
	}, [ props.options, fontStyles, fontWeights ] );

	// Find current selection by comparing font style & weight against options,
	// and fall back to the Default option if there is no matching option.
	const currentSelection =
		selectOptions.find(
			( option ) =>
				option.style.fontStyle === fontStyle &&
				option.style.fontWeight === fontWeight
		) || selectOptions[ 0 ];

	// Adjusts screen reader description based on styles or weights.
	const getDescribedBy = () => {
		if ( ! currentSelection ) {
			return __( 'No selected font appearance' );
		}

		if ( ! hasFontStyles ) {
			return sprintf(
				// translators: %s: Currently selected font weight.
				__( 'Currently selected font weight: %s' ),
				currentSelection.name
			);
		}

		if ( ! hasFontWeights ) {
			return sprintf(
				// translators: %s: Currently selected font style.
				__( 'Currently selected font style: %s' ),
				currentSelection.name
			);
		}

		return sprintf(
			// translators: %s: Currently selected font appearance.
			__( 'Currently selected font appearance: %s' ),
			currentSelection.name
		);
	};

	return (
		hasStylesOrWeights && (
			<CustomSelectControl
				{ ...otherProps }
				className="components-font-appearance-control"
				label={ label }
				describedBy={ getDescribedBy() }
				options={ selectOptions }
				value={ currentSelection }
				onChange={ ( { selectedItem } ) =>
					onChange( selectedItem.style )
				}
			/>
		)
	);
}
