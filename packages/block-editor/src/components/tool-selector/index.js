/**
 * WordPress dependencies
 */
import {
	Dropdown,
	Button,
	MenuItemsChoice,
	SVG,
	Path,
	NavigableMenu,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';

const editIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
	>
		<Path d="M4,21.8h8v-1.5H4V21.8z M20.1,6.1l-3.2-3.1L6.2,13.7l-1.3,4.4l4.5-1.3L20.1,6.1z" />
	</SVG>
);

const selectIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
	>
		<Path d="M6.5 1v21.5l6-6.5H21L6.5 1zm5.1 13l-3.1 3.4V5.9l7.8 8.1h-4.7z" />
	</SVG>
);

function ToolSelector() {
	const isNavigationTool = useSelect(
		( select ) => select( 'core/block-editor' ).isNavigationMode(),
		[]
	);
	const { setNavigationMode } = useDispatch( 'core/block-editor' );
	const isMediumViewport = useViewportMatch( 'medium' );
	if ( ! isMediumViewport ) {
		return null;
	}

	const onSwitchMode = ( mode ) => {
		setNavigationMode( mode === 'edit' ? false : true );
	};

	return (
		<Dropdown
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ isNavigationTool ? selectIcon : editIcon }
					aria-expanded={ isOpen }
					onClick={ onToggle }
					label={ __( 'Tools' ) }
				/>
			) }
			renderContent={ () => (
				<>
					<NavigableMenu role="menu" aria-label={ __( 'Tools' ) }>
						<MenuItemsChoice
							value={ isNavigationTool ? 'select' : 'edit' }
							onSelect={ onSwitchMode }
							choices={ [
								{
									value: 'edit',
									label: (
										<>
											{ editIcon }
											{ __( 'Edit' ) }
										</>
									),
								},
								{
									value: 'select',
									label: (
										<>
											{ selectIcon }
											{ __( 'Select' ) }
										</>
									),
								},
							] }
						/>
					</NavigableMenu>
					<div className="block-editor-tool-selector__help">
						{ __(
							'Tools offer different interactions for block selection & editing. To select, press Escape, to go back to editing, press Enter.'
						) }
					</div>
				</>
			) }
		/>
	);
}

export default ToolSelector;
