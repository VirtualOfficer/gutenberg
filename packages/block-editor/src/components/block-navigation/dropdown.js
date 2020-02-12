/**
 * WordPress dependencies
 */
import { Button, Dropdown, SVG, Path } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockNavigation from './';

const MenuIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
	>
		<Path d="M18,11.2H6v1.5h12V11.2z M14,5.2H2v1.5h12V5.2z M10,17.2v1.5h12v-1.5H10z" />
	</SVG>
);

function BlockNavigationDropdownToggle( { isEnabled, onToggle, isOpen } ) {
	useShortcut(
		'core/edit-post/toggle-block-navigation',
		useCallback( onToggle, [ onToggle ] ),
		{
			bindGlobal: true,
			isDisabled: ! isEnabled,
		}
	);
	const shortcut = useSelect(
		( select ) =>
			select( 'core/keyboard-shortcuts' ).getShortcutRepresentation(
				'core/edit-post/toggle-block-navigation'
			),
		[]
	);

	return (
		<Button
			icon={ MenuIcon }
			aria-expanded={ isOpen }
			onClick={ isEnabled ? onToggle : undefined }
			label={ __( 'Block navigation' ) }
			className="block-editor-block-navigation"
			shortcut={ shortcut }
			aria-disabled={ ! isEnabled }
		/>
	);
}

function BlockNavigationDropdown( { isDisabled } ) {
	const hasBlocks = useSelect(
		( select ) => !! select( 'core/block-editor' ).getBlockCount(),
		[]
	);
	const isEnabled = hasBlocks && ! isDisabled;

	return (
		<Dropdown
			contentClassName="block-editor-block-navigation__popover"
			renderToggle={ ( toggleProps ) => (
				<BlockNavigationDropdownToggle
					{ ...toggleProps }
					isEnabled={ isEnabled }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<BlockNavigation onSelect={ onClose } />
			) }
		/>
	);
}

export default BlockNavigationDropdown;
