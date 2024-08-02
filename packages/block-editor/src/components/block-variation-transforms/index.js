/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItemsChoice,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	BaseControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';
import { store as blockEditorStore } from '../../store';

function VariationsButtons( {
	className,
	onSelectVariation,
	selectedValue,
	variations,
} ) {
	return (
		<div className={ className }>
			<fieldset>
				<legend>
					<BaseControl.VisualLabel>
						{ __( 'Transform to variation' ) }
					</BaseControl.VisualLabel>
				</legend>
				{ variations.map( ( variation ) => (
					<Button
						key={ variation.name }
						icon={
							<BlockIcon icon={ variation.icon } showColors />
						}
						isPressed={ selectedValue === variation.name }
						label={ variation.title }
						onClick={ () => onSelectVariation( variation.name ) }
					/>
				) ) }
			</fieldset>
		</div>
	);
}

function VariationsDropdown( {
	className,
	onSelectVariation,
	selectedValue,
	variations,
} ) {
	const selectOptions = variations.map(
		( { name, title, description } ) => ( {
			value: name,
			label: title,
			info: description,
		} )
	);

	return (
		<div className={ className }>
			<DropdownMenu
				text={ __( 'Transform to variation' ) }
				popoverProps={ {
					position: 'bottom center',
					className: `${ className }__popover`,
				} }
				icon={ chevronDown }
				toggleProps={ { iconPosition: 'right' } }
			>
				{ () => (
					<div className={ `${ className }__container` }>
						<MenuGroup>
							<MenuItemsChoice
								choices={ selectOptions }
								value={ selectedValue }
								onSelect={ onSelectVariation }
							/>
						</MenuGroup>
					</div>
				) }
			</DropdownMenu>
		</div>
	);
}

function VariationsToggleGroupControl( {
	className,
	onSelectVariation,
	selectedValue,
	variations,
} ) {
	return (
		<div className={ className }>
			<ToggleGroupControl
				label={ __( 'Transform to variation' ) }
				value={ selectedValue }
				onChange={ onSelectVariation }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			>
				{ variations.map( ( variation ) => (
					<ToggleGroupControlOptionIcon
						key={ variation.name }
						icon={
							<BlockIcon icon={ variation.icon } showColors />
						}
						value={ variation.name }
						label={ variation.title }
					/>
				) ) }
			</ToggleGroupControl>
		</div>
	);
}

function __experimentalBlockVariationTransforms( { blockClientId } ) {
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const { activeBlockVariation, variations } = useSelect(
		( select ) => {
			const { getActiveBlockVariation, getBlockVariations } =
				select( blocksStore );
			const { getBlockName, getBlockAttributes } =
				select( blockEditorStore );
			const name = blockClientId && getBlockName( blockClientId );
			return {
				activeBlockVariation: getActiveBlockVariation(
					name,
					getBlockAttributes( blockClientId )
				),
				variations: name && getBlockVariations( name, 'transform' ),
			};
		},
		[ blockClientId ]
	);

	const selectedValue = activeBlockVariation?.name;

	// Check if each variation has a unique icon.
	const hasUniqueIcons = useMemo( () => {
		const variationIcons = new Set();
		if ( ! variations ) {
			return false;
		}
		variations.forEach( ( variation ) => {
			if ( variation.icon ) {
				variationIcons.add( variation.icon?.src || variation.icon );
			}
		} );
		return variationIcons.size === variations.length;
	}, [ variations ] );

	const onSelectVariation = ( variationName ) => {
		updateBlockAttributes( blockClientId, {
			...variations.find( ( { name } ) => name === variationName )
				.attributes,
		} );
	};

	// Skip rendering if there are no variations
	if ( ! variations?.length ) {
		return null;
	}

	const baseClass = 'block-editor-block-variation-transforms';

	// Show buttons if there are more than 6 variations because the ToggleGroupControl does not wrap
	const showButtons = variations.length > 6;

	const ButtonComponent = showButtons
		? VariationsButtons
		: VariationsToggleGroupControl;

	const Component = hasUniqueIcons ? ButtonComponent : VariationsDropdown;

	return (
		<Component
			className={ baseClass }
			onSelectVariation={ onSelectVariation }
			selectedValue={ selectedValue }
			variations={ variations }
		/>
	);
}

export default __experimentalBlockVariationTransforms;
