/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef, Platform } from '@wordpress/element';
import {
	InspectorControls,
	JustifyToolbar,
	BlockControls,
	useBlockProps,
	__experimentalUseNoRecursiveRenders as useNoRecursiveRenders,
	store as blockEditorStore,
	withColors,
	PanelColorSettings,
	ContrastChecker,
	getColorClassName,
	Warning,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	PanelBody,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	ToolbarGroup,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useBlockNavigator from '../use-block-navigator';
import useTemplatePartEntity from '../use-template-part';
import Placeholder from './placeholder';
import ResponsiveWrapper from './responsive-wrapper';

// TODO - refactor these to somewhere common?
import { createTemplatePartId } from '../../template-part/edit/utils/create-template-part-id';
import NavigationInnerBlocks from './inner-blocks';

function getComputedStyle( node ) {
	return node.ownerDocument.defaultView.getComputedStyle( node );
}

function detectColors( colorsDetectionElement, setColor, setBackground ) {
	if ( ! colorsDetectionElement ) {
		return;
	}
	setColor( getComputedStyle( colorsDetectionElement ).color );

	let backgroundColorNode = colorsDetectionElement;
	let backgroundColor = getComputedStyle( backgroundColorNode )
		.backgroundColor;
	while (
		backgroundColor === 'rgba(0, 0, 0, 0)' &&
		backgroundColorNode.parentNode &&
		backgroundColorNode.parentNode.nodeType ===
			backgroundColorNode.parentNode.ELEMENT_NODE
	) {
		backgroundColorNode = backgroundColorNode.parentNode;
		backgroundColor = getComputedStyle( backgroundColorNode )
			.backgroundColor;
	}

	setBackground( backgroundColor );
}

function Navigation( {
	attributes,
	setAttributes,
	clientId,
	className,
	backgroundColor,
	setBackgroundColor,
	textColor,
	setTextColor,
	overlayBackgroundColor,
	setOverlayBackgroundColor,
	overlayTextColor,
	setOverlayTextColor,

	// These props are used by the navigation editor to override specific
	// navigation block settings.
	hasSubmenuIndicatorSetting = true,
	hasItemJustificationControls = true,
	hasColorSettings = true,
	customPlaceholder: CustomPlaceholder = null,
	customAppender: CustomAppender = null,
} ) {
	const {
		slug,
		theme,
		area: blockArea,
		itemsJustification,
		openSubmenusOnClick,
		orientation,
		overlayMenu,
	} = attributes;

	// Replicates `createTemplatePartId` in the template part block.
	const templatePartId = createTemplatePartId( theme, slug );
	const [ hasAlreadyRendered, RecursionProvider ] = useNoRecursiveRenders(
		templatePartId
	);

	const innerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);
	const hasExistingNavItems = !! innerBlocks.length;
	const { selectBlock } = useDispatch( blockEditorStore );

	const [ isPlaceholderShown, setIsPlaceholderShown ] = useState(
		! hasExistingNavItems
	);

	const [ isResponsiveMenuOpen, setResponsiveMenuVisibility ] = useState(
		false
	);

	const {
		isResolved,
		isMissing,
		area,
		enableSelection,
		hasResolvedReplacements,
	} = useTemplatePartEntity( templatePartId, blockArea );

	const navRef = useRef();

	const { navigatorToolbarButton, navigatorModal } = useBlockNavigator(
		clientId
	);

	const isEntityAvailable = ! isMissing && isResolved;

	const blockProps = useBlockProps( {
		ref: navRef,
		className: classnames( className, {
			[ `items-justified-${ attributes.itemsJustification }` ]: itemsJustification,
			'is-vertical': orientation === 'vertical',
			'is-responsive': 'never' !== overlayMenu,
			'has-text-color': !! textColor.color || !! textColor?.class,
			[ getColorClassName(
				'color',
				textColor?.slug
			) ]: !! textColor?.slug,
			'has-background': !! backgroundColor.color || backgroundColor.class,
			[ getColorClassName(
				'background-color',
				backgroundColor?.slug
			) ]: !! backgroundColor?.slug,
		} ),
		style: {
			color: ! textColor?.slug && textColor?.color,
			backgroundColor: ! backgroundColor?.slug && backgroundColor?.color,
		},
	} );

	// Turn on contrast checker for web only since it's not supported on mobile yet.
	const enableContrastChecking = Platform.OS === 'web';

	const [ detectedBackgroundColor, setDetectedBackgroundColor ] = useState();
	const [ detectedColor, setDetectedColor ] = useState();
	const [
		detectedOverlayBackgroundColor,
		setDetectedOverlayBackgroundColor,
	] = useState();
	const [ detectedOverlayColor, setDetectedOverlayColor ] = useState();

	useEffect( () => {
		if ( ! enableContrastChecking ) {
			return;
		}
		detectColors(
			navRef.current,
			setDetectedColor,
			setDetectedBackgroundColor
		);
		const subMenuElement = navRef.current.querySelector(
			'[data-type="core/navigation-link"] [data-type="core/navigation-link"]'
		);
		if ( subMenuElement ) {
			detectColors(
				subMenuElement,
				setDetectedOverlayColor,
				setDetectedOverlayBackgroundColor
			);
		}
	} );

	// We don't want to render a missing state if we have any inner blocks.
	// A new template part is automatically created if we have any inner blocks but no entity.
	if (
		innerBlocks.length === 0 &&
		( ( slug && ! theme ) || ( slug && isMissing ) )
	) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ sprintf(
						/* translators: %s: Template part slug */
						__(
							'Navigation block has been deleted or is unavailable: %s'
						),
						slug
					) }
				</Warning>
			</div>
		);
	}

	if ( isEntityAvailable && hasAlreadyRendered ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __( 'Block cannot be rendered inside itself.' ) }
				</Warning>
			</div>
		);
	}

	const PlaceholderComponent = CustomPlaceholder
		? CustomPlaceholder
		: Placeholder;

	const justifyAllowedControls =
		orientation === 'vertical'
			? [ 'left', 'center', 'right' ]
			: [ 'left', 'center', 'right', 'space-between' ];

	return (
		<RecursionProvider>
			<BlockControls>
				{ hasItemJustificationControls && (
					<JustifyToolbar
						value={ itemsJustification }
						allowedControls={ justifyAllowedControls }
						onChange={ ( value ) =>
							setAttributes( { itemsJustification: value } )
						}
						popoverProps={ {
							position: 'bottom right',
							isAlternate: true,
						} }
					/>
				) }
				<ToolbarGroup>{ navigatorToolbarButton }</ToolbarGroup>
			</BlockControls>
			{ navigatorModal }
			<InspectorControls>
				{ hasSubmenuIndicatorSetting && (
					<PanelBody title={ __( 'Display' ) }>
						<h3>{ __( 'Overlay Menu' ) }</h3>
						<ToggleGroupControl
							label={ __( 'Configure overlay menu' ) }
							value={ overlayMenu }
							help={ __(
								'Collapses the navigation options in a menu icon opening an overlay.'
							) }
							onChange={ ( value ) =>
								setAttributes( { overlayMenu: value } )
							}
							isBlock
							hideLabelFromVision
						>
							<ToggleGroupControlOption
								value="never"
								label={ __( 'Off' ) }
							/>
							<ToggleGroupControlOption
								value="mobile"
								label={ __( 'Mobile' ) }
							/>
							<ToggleGroupControlOption
								value="always"
								label={ __( 'Always' ) }
							/>
						</ToggleGroupControl>
						<h3>{ __( 'Submenus' ) }</h3>
						<ToggleControl
							checked={ openSubmenusOnClick }
							onChange={ ( value ) => {
								setAttributes( {
									openSubmenusOnClick: value,
								} );
							} }
							label={ __( 'Open on click' ) }
						/>
						{ ! attributes.openSubmenusOnClick && (
							<ToggleControl
								checked={ attributes.showSubmenuIcon }
								onChange={ ( value ) => {
									setAttributes( {
										showSubmenuIcon: value,
									} );
								} }
								label={ __( 'Show icons' ) }
							/>
						) }
					</PanelBody>
				) }
				{ hasColorSettings && (
					<PanelColorSettings
						title={ __( 'Color' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: textColor.color,
								onChange: setTextColor,
								label: __( 'Text' ),
							},
							{
								value: backgroundColor.color,
								onChange: setBackgroundColor,
								label: __( 'Background' ),
							},
							{
								value: overlayTextColor.color,
								onChange: setOverlayTextColor,
								label: __( 'Submenu & overlay text' ),
							},
							{
								value: overlayBackgroundColor.color,
								onChange: setOverlayBackgroundColor,
								label: __( 'Submenu & overlay background' ),
							},
						] }
					>
						{ enableContrastChecking && (
							<>
								<ContrastChecker
									backgroundColor={ detectedBackgroundColor }
									textColor={ detectedColor }
								/>
								<ContrastChecker
									backgroundColor={
										detectedOverlayBackgroundColor
									}
									textColor={ detectedOverlayColor }
								/>
							</>
						) }
					</PanelColorSettings>
				) }
			</InspectorControls>
			<nav { ...blockProps }>
				{ ! isEntityAvailable && isPlaceholderShown && (
					<PlaceholderComponent
						onFinish={ ( newAttributes ) => {
							setIsPlaceholderShown( false );
							setAttributes( newAttributes );
							selectBlock( clientId );
						} }
						area={ area }
						enableSelection={ enableSelection }
						hasResolvedReplacements={ hasResolvedReplacements }
					/>
				) }
				<ResponsiveWrapper
					id={ clientId }
					onToggle={ setResponsiveMenuVisibility }
					isOpen={ isResponsiveMenuOpen }
					isResponsive={ 'never' !== overlayMenu }
					isHiddenByDefault={ 'always' === overlayMenu }
				>
					{ isEntityAvailable && (
						<NavigationInnerBlocks
							isVisible={
								hasExistingNavItems || ! isPlaceholderShown
							}
							templatePartId={ templatePartId }
							clientId={ clientId }
							appender={ CustomAppender }
							hasCustomPlaceholder={ !! CustomPlaceholder }
							orientation={ orientation }
						/>
					) }
				</ResponsiveWrapper>
			</nav>
		</RecursionProvider>
	);
}

export default withColors(
	{ textColor: 'color' },
	{ backgroundColor: 'color' },
	{ overlayBackgroundColor: 'color' },
	{ overlayTextColor: 'color' }
)( Navigation );
