/**
 * WordPress dependencies
 */
import { checkSmall, reset, moreVertical } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DropdownMenu from '../../dropdown-menu';
import MenuGroup from '../../menu-group';
import MenuItem from '../../menu-item';
import { useToolsPanelHeader } from './hook';
import { contextConnect } from '../../ui/context';

const DefaultControlsGroup = ( { items, onClose, toggleItem } ) => {
	if ( ! items.length ) {
		return null;
	}

	return (
		<MenuGroup>
			{ items.map( ( [ label, hasValue ] ) => {
				const icon = hasValue ? reset : checkSmall;
				const itemLabel = hasValue
					? sprintf(
							// translators: %s: The name of the control being reset e.g. "Padding".
							__( 'Reset %s' ),
							label
					  )
					: undefined;

				return (
					<MenuItem
						key={ label }
						icon={ icon }
						isSelected={ true }
						disabled={ ! hasValue }
						label={ itemLabel }
						onClick={ () => {
							toggleItem( label );
							onClose();
						} }
						role="menuitemcheckbox"
					>
						{ label }
					</MenuItem>
				);
			} ) }
		</MenuGroup>
	);
};

const OptionalControlsGroup = ( { items, onClose, toggleItem } ) => {
	if ( ! items.length ) {
		return null;
	}

	return (
		<MenuGroup>
			{ items.map( ( [ label, isSelected ] ) => {
				const itemLabel = isSelected
					? sprintf(
							// translators: %s: The name of the control being hidden and reset e.g. "Padding".
							__( 'Hide and reset %s' ),
							label
					  )
					: sprintf(
							// translators: %s: The name of the control to display e.g. "Padding".
							__( 'Show %s' ),
							label
					  );

				return (
					<MenuItem
						key={ label }
						icon={ isSelected && checkSmall }
						isSelected={ isSelected }
						label={ itemLabel }
						onClick={ () => {
							toggleItem( label );
							onClose();
						} }
						role="menuitemcheckbox"
					>
						{ label }
					</MenuItem>
				);
			} ) }
		</MenuGroup>
	);
};

const ToolsPanelHeader = ( props, forwardedRef ) => {
	const {
		dropdownMenuClassName,
		hasMenuItems,
		label: labelText,
		menuItems,
		resetAll,
		toggleItem,
		...headerProps
	} = useToolsPanelHeader( props );

	if ( ! labelText ) {
		return null;
	}

	const defaultItems = Object.entries( menuItems?.default || {} );
	const optionalItems = Object.entries( menuItems?.optional || {} );

	return (
		<h2 { ...headerProps } ref={ forwardedRef }>
			{ labelText }
			{ hasMenuItems && (
				<DropdownMenu
					icon={ moreVertical }
					label={ labelText }
					menuProps={ { className: dropdownMenuClassName } }
				>
					{ ( { onClose } ) => (
						<>
							<DefaultControlsGroup
								items={ defaultItems }
								onClose={ onClose }
								toggleItem={ toggleItem }
							/>
							<OptionalControlsGroup
								items={ optionalItems }
								onClose={ onClose }
								toggleItem={ toggleItem }
							/>
							<MenuGroup>
								<MenuItem
									variant={ 'tertiary' }
									onClick={ () => {
										resetAll();
										onClose();
									} }
								>
									{ __( 'Reset all' ) }
								</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
			) }
		</h2>
	);
};

const ConnectedToolsPanelHeader = contextConnect(
	ToolsPanelHeader,
	'ToolsPanelHeader'
);

export default ConnectedToolsPanelHeader;
