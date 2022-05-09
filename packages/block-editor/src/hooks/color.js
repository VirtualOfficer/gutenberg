/**
 * External dependencies
 */
import classnames from 'classnames';
import { isObject } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { getBlockSupport } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useRef, useEffect, useMemo, Platform } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	getColorObjectByColorValue,
	getColorObjectByAttributeValues,
} from '../components/colors';
import {
	getGradientValueBySlug,
	getGradientSlugByValue,
} from '../components/gradients';
import {
	cleanEmptyObject,
	transformStyles,
	immutableSet,
	shouldSkipSerialization,
} from './utils';
import ColorPanel from './color-panel';
import useSetting from '../components/use-setting';
import { getClassnames } from '@wordpress/style-engine';

export const COLOR_SUPPORT_KEY = 'color';

const hasColorSupport = ( blockType ) => {
	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );
	return (
		colorSupport &&
		( colorSupport.link === true ||
			colorSupport.gradient === true ||
			colorSupport.background !== false ||
			colorSupport.text !== false )
	);
};

const hasLinkColorSupport = ( blockType ) => {
	if ( Platform.OS !== 'web' ) {
		return false;
	}

	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );

	return isObject( colorSupport ) && !! colorSupport.link;
};

const hasGradientSupport = ( blockType ) => {
	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );

	return isObject( colorSupport ) && !! colorSupport.gradients;
};

const hasBackgroundColorSupport = ( blockType ) => {
	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );

	return colorSupport && colorSupport.background !== false;
};

const hasTextColorSupport = ( blockType ) => {
	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );

	return colorSupport && colorSupport.text !== false;
};

/**
 * Checks whether a color has been set either with a named preset color in
 * a top level block attribute or as a custom value within the style attribute
 * object.
 *
 * @param {string} name Name of the color to check.
 * @return {boolean} Whether or not a color has a value.
 */
const hasColor = ( name ) => ( props ) => {
	if ( name === 'background' ) {
		return (
			!! props.attributes.backgroundColor ||
			!! props.attributes.style?.color?.background ||
			!! props.attributes.gradient ||
			!! props.attributes.style?.color?.gradient
		);
	}

	if ( name === 'link' ) {
		return !! props.attributes.style?.elements?.link?.color?.text;
	}

	return (
		!! props.attributes[ `${ name }Color` ] ||
		!! props.attributes.style?.color?.[ name ]
	);
};

/**
 * Clears a single color property from a style object.
 *
 * @param {Array}  path  Path to color property to clear within styles object.
 * @param {Object} style Block attributes style object.
 * @return {Object} Styles with the color property omitted.
 */
const clearColorFromStyles = ( path, style ) =>
	cleanEmptyObject( immutableSet( style, path, undefined ) );

/**
 * Resets the block attributes for text color.
 *
 * @param {Object}   props               Current block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block's setAttributes prop used to apply reset.
 */
const resetTextColor = ( { attributes, setAttributes } ) => {
	setAttributes( {
		textColor: undefined,
		style: clearColorFromStyles( [ 'color', 'text' ], attributes.style ),
	} );
};

/**
 * Clears text color related properties from supplied attributes.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Update block attributes with text color properties omitted.
 */
const resetAllTextFilter = ( attributes ) => ( {
	textColor: undefined,
	style: clearColorFromStyles( [ 'color', 'text' ], attributes.style ),
} );

/**
 * Resets the block attributes for link color.
 *
 * @param {Object}   props               Current block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block's setAttributes prop used to apply reset.
 */
const resetLinkColor = ( { attributes, setAttributes } ) => {
	const path = [ 'elements', 'link', 'color', 'text' ];
	setAttributes( { style: clearColorFromStyles( path, attributes.style ) } );
};

/**
 * Clears link color related properties from supplied attributes.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Update block attributes with link color properties omitted.
 */
const resetAllLinkFilter = ( attributes ) => ( {
	style: clearColorFromStyles(
		[ 'elements', 'link', 'color', 'text' ],
		attributes.style
	),
} );

/**
 * Clears all background color related properties including gradients from
 * supplied block attributes.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Block attributes with background and gradient omitted.
 */
const clearBackgroundAndGradient = ( attributes ) => ( {
	backgroundColor: undefined,
	gradient: undefined,
	style: {
		...attributes.style,
		color: {
			...attributes.style?.color,
			background: undefined,
			gradient: undefined,
		},
	},
} );

/**
 * Resets the block attributes for both background color and gradient.
 *
 * @param {Object}   props               Current block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block's setAttributes prop used to apply reset.
 */
const resetBackgroundAndGradient = ( { attributes, setAttributes } ) => {
	setAttributes( clearBackgroundAndGradient( attributes ) );
};

/**
 * Filters registered block settings, extending attributes to include
 * `backgroundColor` and `textColor` attribute.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addAttributes( settings ) {
	if ( ! hasColorSupport( settings ) ) {
		return settings;
	}

	// Allow blocks to specify their own attribute definition with default values if needed.
	if ( ! settings.attributes.backgroundColor ) {
		Object.assign( settings.attributes, {
			backgroundColor: {
				type: 'string',
			},
		} );
	}
	if ( ! settings.attributes.textColor ) {
		Object.assign( settings.attributes, {
			textColor: {
				type: 'string',
			},
		} );
	}

	if ( hasGradientSupport( settings ) && ! settings.attributes.gradient ) {
		Object.assign( settings.attributes, {
			gradient: {
				type: 'string',
			},
		} );
	}

	return settings;
}

/**
 * Override props assigned to save component to inject colors classnames.
 *
 * @param {Object} props      Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addSaveProps( props, blockType, attributes ) {
	if (
		! hasColorSupport( blockType ) ||
		shouldSkipSerialization( blockType, COLOR_SUPPORT_KEY )
	) {
		return props;
	}

	// I'd have preferred to avoid the "style" attribute usage here
	const { backgroundColor, textColor, gradient, style } = attributes;

	const shouldSerialize = ( feature ) =>
		! shouldSkipSerialization( blockType, COLOR_SUPPORT_KEY, feature );

	const colorStyles = {};

	// Primary color classes must come before the `has-text-color`,
	// `has-background` and `has-link-color` classes to maintain backwards
	// compatibility and avoid block invalidations.
	if ( textColor && shouldSerialize( 'text' ) ) {
		colorStyles.text = `var:preset|color|${ textColor }`;
	}

	if (
		gradient &&
		shouldSerialize( 'gradients' ) &&
		hasGradientSupport( blockType )
	) {
		colorStyles.gradient = `var:preset|gradient|${ gradient }`;
	}

	if ( backgroundColor && shouldSerialize( 'background' ) ) {
		colorStyles.background = `var:preset|color|${ backgroundColor }`;
	}

	const newClassName = classnames(
		props.className,
		...getClassnames( {
			...style,
			color: {
				...colorStyles,
			},
			elements: {
				...style?.elements,
				link: {
					color: {
						text: shouldSerialize( 'link' )
							? style?.elements?.link?.color
							: undefined,
					},
				},
			},
		} )
	);
	props.className = newClassName ? newClassName : undefined;

	return props;
}

/**
 * Filters registered block settings to extend the block edit wrapper
 * to apply the desired styles and classnames properly.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addEditProps( settings ) {
	if (
		! hasColorSupport( settings ) ||
		shouldSkipSerialization( settings, COLOR_SUPPORT_KEY )
	) {
		return settings;
	}
	const existingGetEditWrapperProps = settings.getEditWrapperProps;
	settings.getEditWrapperProps = ( attributes ) => {
		let props = {};
		if ( existingGetEditWrapperProps ) {
			props = existingGetEditWrapperProps( attributes );
		}
		return addSaveProps( props, settings, attributes );
	};

	return settings;
}

const getLinkColorFromAttributeValue = ( colors, value ) => {
	const attributeParsed = /var:preset\|color\|(.+)/.exec( value );
	if ( attributeParsed && attributeParsed[ 1 ] ) {
		return getColorObjectByAttributeValues( colors, attributeParsed[ 1 ] )
			.color;
	}
	return value;
};

/**
 * Inspector control panel containing the color related configuration
 *
 * @param {Object} props
 *
 * @return {WPElement} Color edit element.
 */
export function ColorEdit( props ) {
	const { name: blockName, attributes } = props;
	// Some color settings have a special handling for deprecated flags in `useSetting`,
	// so we can't unwrap them by doing const { ... } = useSetting('color')
	// until https://github.com/WordPress/gutenberg/issues/37094 is fixed.
	const userPalette = useSetting( 'color.palette.custom' );
	const themePalette = useSetting( 'color.palette.theme' );
	const defaultPalette = useSetting( 'color.palette.default' );
	const allSolids = useMemo(
		() => [
			...( userPalette || [] ),
			...( themePalette || [] ),
			...( defaultPalette || [] ),
		],
		[ userPalette, themePalette, defaultPalette ]
	);
	const userGradientPalette = useSetting( 'color.gradients.custom' );
	const themeGradientPalette = useSetting( 'color.gradients.theme' );
	const defaultGradientPalette = useSetting( 'color.gradients.default' );
	const allGradients = useMemo(
		() => [
			...( userGradientPalette || [] ),
			...( themeGradientPalette || [] ),
			...( defaultGradientPalette || [] ),
		],
		[ userGradientPalette, themeGradientPalette, defaultGradientPalette ]
	);
	const areCustomSolidsEnabled = useSetting( 'color.custom' );
	const areCustomGradientsEnabled = useSetting( 'color.customGradient' );
	const isBackgroundEnabled = useSetting( 'color.background' );
	const isLinkEnabled = useSetting( 'color.link' );
	const isTextEnabled = useSetting( 'color.text' );

	const solidsEnabled =
		areCustomSolidsEnabled || ! themePalette || themePalette?.length > 0;

	const gradientsEnabled =
		areCustomGradientsEnabled ||
		! themeGradientPalette ||
		themeGradientPalette?.length > 0;

	// Shouldn't be needed but right now the ColorGradientsPanel
	// can trigger both onChangeColor and onChangeBackground
	// synchronously causing our two callbacks to override changes
	// from each other.
	const localAttributes = useRef( attributes );
	useEffect( () => {
		localAttributes.current = attributes;
	}, [ attributes ] );

	if ( ! hasColorSupport( blockName ) ) {
		return null;
	}

	const hasLinkColor =
		hasLinkColorSupport( blockName ) && isLinkEnabled && solidsEnabled;
	const hasTextColor =
		hasTextColorSupport( blockName ) && isTextEnabled && solidsEnabled;
	const hasBackgroundColor =
		hasBackgroundColorSupport( blockName ) &&
		isBackgroundEnabled &&
		solidsEnabled;
	const hasGradientColor =
		hasGradientSupport( blockName ) && gradientsEnabled;

	if (
		! hasLinkColor &&
		! hasTextColor &&
		! hasBackgroundColor &&
		! hasGradientColor
	) {
		return null;
	}

	const { style, textColor, backgroundColor, gradient } = attributes;
	let gradientValue;
	if ( hasGradientColor && gradient ) {
		gradientValue = getGradientValueBySlug( allGradients, gradient );
	} else if ( hasGradientColor ) {
		gradientValue = style?.color?.gradient;
	}

	const onChangeColor = ( name ) => ( value ) => {
		const colorObject = getColorObjectByColorValue( allSolids, value );
		const attributeName = name + 'Color';
		const newStyle = {
			...localAttributes.current.style,
			color: {
				...localAttributes.current?.style?.color,
				[ name ]: colorObject?.slug ? undefined : value,
			},
		};

		const newNamedColor = colorObject?.slug ? colorObject.slug : undefined;
		const newAttributes = {
			style: cleanEmptyObject( newStyle ),
			[ attributeName ]: newNamedColor,
		};

		props.setAttributes( newAttributes );
		localAttributes.current = {
			...localAttributes.current,
			...newAttributes,
		};
	};

	const onChangeGradient = ( value ) => {
		const slug = getGradientSlugByValue( allGradients, value );
		let newAttributes;
		if ( slug ) {
			const newStyle = {
				...localAttributes.current?.style,
				color: {
					...localAttributes.current?.style?.color,
					gradient: undefined,
				},
			};
			newAttributes = {
				style: cleanEmptyObject( newStyle ),
				gradient: slug,
			};
		} else {
			const newStyle = {
				...localAttributes.current?.style,
				color: {
					...localAttributes.current?.style?.color,
					gradient: value,
				},
			};
			newAttributes = {
				style: cleanEmptyObject( newStyle ),
				gradient: undefined,
			};
		}
		props.setAttributes( newAttributes );
		localAttributes.current = {
			...localAttributes.current,
			...newAttributes,
		};
	};

	const onChangeLinkColor = ( value ) => {
		const colorObject = getColorObjectByColorValue( allSolids, value );
		const newLinkColorValue = colorObject?.slug
			? `var:preset|color|${ colorObject.slug }`
			: value;

		const newStyle = cleanEmptyObject(
			immutableSet(
				style,
				[ 'elements', 'link', 'color', 'text' ],
				newLinkColorValue
			)
		);
		props.setAttributes( { style: newStyle } );
	};

	const enableContrastChecking =
		Platform.OS === 'web' && ! gradient && ! style?.color?.gradient;

	const defaultColorControls = getBlockSupport( props.name, [
		COLOR_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	return (
		<ColorPanel
			enableContrastChecking={ enableContrastChecking }
			clientId={ props.clientId }
			enableAlpha={ true }
			settings={ [
				...( hasTextColor
					? [
							{
								label: __( 'Text' ),
								onColorChange: onChangeColor( 'text' ),
								colorValue: getColorObjectByAttributeValues(
									allSolids,
									textColor,
									style?.color?.text
								).color,
								isShownByDefault: defaultColorControls?.text,
								hasValue: () => hasColor( 'text' )( props ),
								onDeselect: () => resetTextColor( props ),
								resetAllFilter: resetAllTextFilter,
							},
					  ]
					: [] ),
				...( hasBackgroundColor || hasGradientColor
					? [
							{
								label: __( 'Background' ),
								onColorChange: hasBackgroundColor
									? onChangeColor( 'background' )
									: undefined,
								colorValue: getColorObjectByAttributeValues(
									allSolids,
									backgroundColor,
									style?.color?.background
								).color,
								gradientValue,
								onGradientChange: hasGradientColor
									? onChangeGradient
									: undefined,
								isShownByDefault:
									defaultColorControls?.background,
								hasValue: () =>
									hasColor( 'background' )( props ),
								onDeselect: () =>
									resetBackgroundAndGradient( props ),
								resetAllFilter: clearBackgroundAndGradient,
							},
					  ]
					: [] ),
				...( hasLinkColor
					? [
							{
								label: __( 'Link' ),
								onColorChange: onChangeLinkColor,
								colorValue: getLinkColorFromAttributeValue(
									allSolids,
									style?.elements?.link?.color?.text
								),
								clearable: !! style?.elements?.link?.color
									?.text,
								isShownByDefault: defaultColorControls?.link,
								hasValue: () => hasColor( 'link' )( props ),
								onDeselect: () => resetLinkColor( props ),
								resetAllFilter: resetAllLinkFilter,
							},
					  ]
					: [] ),
			] }
		/>
	);
}

/**
 * This adds inline styles for color palette colors.
 * Ideally, this is not needed and themes should load their palettes on the editor.
 *
 * @param {Function} BlockListBlock Original component.
 *
 * @return {Function} Wrapped component.
 */
export const withColorPaletteStyles = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes } = props;
		const { backgroundColor, textColor } = attributes;
		const userPalette = useSetting( 'color.palette.custom' ) || [];
		const themePalette = useSetting( 'color.palette.theme' ) || [];
		const defaultPalette = useSetting( 'color.palette.default' ) || [];
		const colors = useMemo(
			() => [
				...( userPalette || [] ),
				...( themePalette || [] ),
				...( defaultPalette || [] ),
			],
			[ userPalette, themePalette, defaultPalette ]
		);
		if (
			! hasColorSupport( name ) ||
			shouldSkipSerialization( name, COLOR_SUPPORT_KEY )
		) {
			return <BlockListBlock { ...props } />;
		}
		const extraStyles = {};

		if (
			textColor &&
			! shouldSkipSerialization( name, COLOR_SUPPORT_KEY, 'text' )
		) {
			extraStyles.color = getColorObjectByAttributeValues(
				colors,
				textColor
			)?.color;
		}
		if (
			backgroundColor &&
			! shouldSkipSerialization( name, COLOR_SUPPORT_KEY, 'background' )
		) {
			extraStyles.backgroundColor = getColorObjectByAttributeValues(
				colors,
				backgroundColor
			)?.color;
		}

		let wrapperProps = props.wrapperProps;
		wrapperProps = {
			...props.wrapperProps,
			style: {
				...extraStyles,
				...props.wrapperProps?.style,
			},
		};

		return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
	}
);

const MIGRATION_PATHS = {
	linkColor: [ [ 'style', 'elements', 'link', 'color', 'text' ] ],
	textColor: [ [ 'textColor' ], [ 'style', 'color', 'text' ] ],
	backgroundColor: [
		[ 'backgroundColor' ],
		[ 'style', 'color', 'background' ],
	],
	gradient: [ [ 'gradient' ], [ 'style', 'color', 'gradient' ] ],
};

export function addTransforms( result, source, index, results ) {
	const destinationBlockType = result.name;
	const activeSupports = {
		linkColor: hasLinkColorSupport( destinationBlockType ),
		textColor: hasTextColorSupport( destinationBlockType ),
		backgroundColor: hasBackgroundColorSupport( destinationBlockType ),
		gradient: hasGradientSupport( destinationBlockType ),
	};
	return transformStyles(
		activeSupports,
		MIGRATION_PATHS,
		result,
		source,
		index,
		results
	);
}

addFilter(
	'blocks.registerBlockType',
	'core/color/addAttribute',
	addAttributes
);

addFilter(
	'blocks.getSaveContent.extraProps',
	'core/color/addSaveProps',
	addSaveProps
);

addFilter(
	'blocks.registerBlockType',
	'core/color/addEditProps',
	addEditProps
);

addFilter(
	'editor.BlockListBlock',
	'core/color/with-color-palette-styles',
	withColorPaletteStyles
);

addFilter(
	'blocks.switchToBlockType.transformedBlock',
	'core/color/addTransforms',
	addTransforms
);
