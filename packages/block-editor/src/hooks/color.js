/**
 * External dependencies
 */
import classnames from 'classnames';
import { isObject, setWith, clone } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { getBlockSupport } from '@wordpress/blocks';
import { __, isRTL } from '@wordpress/i18n';
import { useRef, useEffect, useMemo, Platform } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalUseNavigator as useNavigator,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalView as View,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	__experimentalHeading as Heading,
	FlexItem,
	ColorIndicator,
	PanelBody,
} from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	getColorClassName,
	getColorObjectByColorValue,
	getColorObjectByAttributeValues,
} from '../components/colors';
import {
	__experimentalGetGradientClass,
	getGradientValueBySlug,
	getGradientSlugByValue,
} from '../components/gradients';
import { cleanEmptyObject } from './utils';
import ColorPanel from './color-panel';
import InspectorControls from '../components/inspector-controls';
import useSetting from '../components/use-setting';

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

const shouldSkipSerialization = ( blockType ) => {
	const colorSupport = getBlockSupport( blockType, COLOR_SUPPORT_KEY );

	return colorSupport?.__experimentalSkipSerialization;
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

	// allow blocks to specify their own attribute definition with default values if needed.
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
		shouldSkipSerialization( blockType )
	) {
		return props;
	}

	const hasGradient = hasGradientSupport( blockType );

	// I'd have prefered to avoid the "style" attribute usage here
	const { backgroundColor, textColor, gradient, style } = attributes;

	const backgroundClass = getColorClassName(
		'background-color',
		backgroundColor
	);
	const gradientClass = __experimentalGetGradientClass( gradient );
	const textClass = getColorClassName( 'color', textColor );
	const newClassName = classnames(
		props.className,
		textClass,
		gradientClass,
		{
			// Don't apply the background class if there's a custom gradient
			[ backgroundClass ]:
				( ! hasGradient || ! style?.color?.gradient ) &&
				!! backgroundClass,
			'has-text-color': textColor || style?.color?.text,
			'has-background':
				backgroundColor ||
				style?.color?.background ||
				( hasGradient && ( gradient || style?.color?.gradient ) ),
			'has-link-color': style?.elements?.link?.color,
		}
	);
	props.className = newClassName ? newClassName : undefined;

	return props;
}

/**
 * Filters registered block settings to extand the block edit wrapper
 * to apply the desired styles and classnames properly.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addEditProps( settings ) {
	if (
		! hasColorSupport( settings ) ||
		shouldSkipSerialization( settings )
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

function immutableSet( object, path, value ) {
	return setWith( object ? clone( object ) : {}, path, value, clone );
}

function NavigationButton( {
	path,
	icon,
	children,
	isBack = false,
	...props
} ) {
	const navigator = useNavigator();
	return (
		<Item onClick={ () => navigator.push( path, { isBack } ) } { ...props }>
			{ icon && (
				<HStack justify="flex-start">
					<FlexItem>
						<Icon icon={ icon } size={ 24 } />
					</FlexItem>
					<FlexItem>{ children }</FlexItem>
				</HStack>
			) }
			{ ! icon && children }
		</Item>
	);
}

function ScreenHeader( { back, title } ) {
	return (
		<VStack spacing={ 2 }>
			<HStack spacing={ 2 }>
				<View>
					<NavigationButton
						path={ back }
						icon={
							<Icon
								icon={ isRTL() ? chevronRight : chevronLeft }
								variant="muted"
							/>
						}
						size="small"
						isBack
						aria-label={ __( 'Navigate to the previous view' ) }
					/>
				</View>
				<Spacer>
					<Heading level={ 5 }>{ title }</Heading>
				</Spacer>
			</HStack>
		</VStack>
	);
}

/**
 * Inspector control panel containing the color related configuration
 *
 * @param {Object} props
 *
 * @return {WPElement} Color edit element.
 */
export function ColorEdit( props ) {
	const { name: blockName, attributes } = props;
	const {
		palette: solidsPerOrigin,
		gradients: gradientsPerOrigin,
		customGradient: areCustomGradientsEnabled,
		custom: areCustomSolidsEnabled,
		text: isTextEnabled,
		background: isBackgroundEnabled,
		link: isLinkEnabled,
	} = useSetting( 'color' ) || {};

	const solidsEnabled =
		areCustomSolidsEnabled ||
		! solidsPerOrigin?.theme ||
		solidsPerOrigin?.theme?.length > 0;

	const gradientsEnabled =
		areCustomGradientsEnabled ||
		! gradientsPerOrigin?.theme ||
		gradientsPerOrigin?.theme?.length > 0;

	const allSolids = useMemo(
		() => [
			...( solidsPerOrigin?.custom || [] ),
			...( solidsPerOrigin?.theme || [] ),
			...( solidsPerOrigin?.default || [] ),
		],
		[ solidsPerOrigin ]
	);

	const allGradients = useMemo(
		() => [
			...( gradientsPerOrigin?.custom || [] ),
			...( gradientsPerOrigin?.theme || [] ),
			...( gradientsPerOrigin?.default || [] ),
		],
		[ gradientsPerOrigin ]
	);

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
	const backgroundValue = hasBackgroundColor
		? getColorObjectByAttributeValues(
				allSolids,
				backgroundColor,
				style?.color?.background
		  ).color
		: undefined;
	const textColorValue = getColorObjectByAttributeValues(
		allSolids,
		textColor,
		style?.color?.text
	).color;
	const linkColorValue = hasLinkColor
		? getLinkColorFromAttributeValue(
				allSolids,
				style?.elements?.link?.color?.text
		  )
		: undefined;

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

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Colors' ) }
				className="block-editor__hooks-colors-panel"
			>
				<NavigatorProvider initialPath="/">
					<NavigatorScreen path="/">
						<ItemGroup isBordered isSeparated>
							{ ( hasBackgroundColor || hasGradientColor ) && (
								<NavigationButton path="/background">
									<HStack justify="flex-start">
										<FlexItem>
											<ColorIndicator
												colorValue={
													gradientValue ??
													backgroundValue
												}
											/>
										</FlexItem>
										<FlexItem>
											{ __( 'Background' ) }
										</FlexItem>
									</HStack>
								</NavigationButton>
							) }
							{ hasTextColor && (
								<NavigationButton path="/text">
									<HStack justify="flex-start">
										<FlexItem>
											<ColorIndicator
												colorValue={ textColorValue }
											/>
										</FlexItem>
										<FlexItem>{ __( 'Text' ) }</FlexItem>
									</HStack>
								</NavigationButton>
							) }
							{ hasLinkColor && (
								<NavigationButton path="/link">
									<HStack justify="flex-start">
										<FlexItem>
											<ColorIndicator
												colorValue={ linkColorValue }
											/>
										</FlexItem>
										<FlexItem>{ __( 'Links' ) }</FlexItem>
									</HStack>
								</NavigationButton>
							) }
						</ItemGroup>
					</NavigatorScreen>

					{ ( hasBackgroundColor || hasGradientColor ) && (
						<NavigatorScreen path="/background">
							<ScreenHeader
								back="/"
								title={ __( 'Background' ) }
							/>
							<ColorPanel
								enableContrastChecking={
									// Turn on contrast checker for web only since it's not supported on mobile yet.
									Platform.OS === 'web' &&
									! gradient &&
									! style?.color?.gradient
								}
								clientId={ props.clientId }
								settings={ [
									{
										label: __( 'Background color' ),
										onColorChange: hasBackgroundColor
											? onChangeColor( 'background' )
											: undefined,
										colorValue: backgroundValue,
										gradientValue,
										onGradientChange: hasGradientColor
											? onChangeGradient
											: undefined,
									},
								] }
							/>
						</NavigatorScreen>
					) }

					{ hasTextColor && (
						<NavigatorScreen path="/text">
							<ScreenHeader back="/" title={ __( 'Text' ) } />
							<ColorPanel
								enableContrastChecking={
									// Turn on contrast checker for web only since it's not supported on mobile yet.
									Platform.OS === 'web' &&
									! gradient &&
									! style?.color?.gradient
								}
								clientId={ props.clientId }
								settings={ [
									{
										label: __( 'Text color' ),
										onColorChange: onChangeColor( 'text' ),
										colorValue: textColorValue,
									},
								] }
							/>
						</NavigatorScreen>
					) }

					{ hasLinkColor && (
						<NavigatorScreen path="/link">
							<ScreenHeader back="/" title={ __( 'Link' ) } />
							<ColorPanel
								enableContrastChecking={
									// Turn on contrast checker for web only since it's not supported on mobile yet.
									Platform.OS === 'web' &&
									! gradient &&
									! style?.color?.gradient
								}
								clientId={ props.clientId }
								settings={ [
									{
										label: __( 'Link Color' ),
										onColorChange: onChangeLinkColor,
										colorValue: getLinkColorFromAttributeValue(
											allSolids,
											style?.elements?.link?.color?.text
										),
										clearable: !! style?.elements?.link
											?.color?.text,
									},
								] }
							/>
						</NavigatorScreen>
					) }
				</NavigatorProvider>
			</PanelBody>
		</InspectorControls>
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
		const { palette: solidsPerOrigin } = useSetting( 'color' ) || {};
		const colors = useMemo(
			() => [
				...( solidsPerOrigin?.custom || [] ),
				...( solidsPerOrigin?.theme || [] ),
				...( solidsPerOrigin?.default || [] ),
			],
			[ solidsPerOrigin ]
		);
		if ( ! hasColorSupport( name ) || shouldSkipSerialization( name ) ) {
			return <BlockListBlock { ...props } />;
		}

		const extraStyles = {
			color: textColor
				? getColorObjectByAttributeValues( colors, textColor )?.color
				: undefined,
			backgroundColor: backgroundColor
				? getColorObjectByAttributeValues( colors, backgroundColor )
						?.color
				: undefined,
		};

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
