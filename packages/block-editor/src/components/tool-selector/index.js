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
import { forwardRef, useState } from '@wordpress/element';
import { Icon, edit as editIcon, brush as brushIcon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';

const selectIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
	>
		<Path d="M9.4 20.5L5.2 3.8l14.6 9-2 .3c-.2 0-.4.1-.7.1-.9.2-1.6.3-2.2.5-.8.3-1.4.5-1.8.8-.4.3-.8.8-1.3 1.5-.4.5-.8 1.2-1.2 2l-.3.6-.9 1.9zM7.6 7.1l2.4 9.3c.2-.4.5-.8.7-1.1.6-.8 1.1-1.4 1.6-1.8.5-.4 1.3-.8 2.2-1.1l1.2-.3-8.1-5z" />
	</SVG>
);

function ToolSelector( props, ref ) {
	const [ isSimpleMode, setIsSimpleMode ] = useState( false );
	const [ originalTemplateLocks, setOriginalTemplateLocks ] = useState( {} );
	const { mode, blocksWithinMainBlockClientIds, getBlockAttributes } =
		useSelect( ( select ) => {
			const {
				__unstableGetEditorMode,
				getBlockOrder,
				getBlockAttributes: _getBlockAttributes,
			} = select( blockEditorStore );

			const mainBlockClientId = getBlockOrder()[ 1 ];

			return {
				mode: __unstableGetEditorMode(),
				blocksWithinMainBlockClientIds:
					getBlockOrder( mainBlockClientId ),
				getBlockAttributes: _getBlockAttributes,
			};
		}, [] );

	const { __unstableSetEditorMode, updateBlockAttributes } =
		useDispatch( blockEditorStore );

	return (
		<Dropdown
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					// TODO: Switch to `true` (40px size) if possible
					__next40pxDefaultSize={ false }
					{ ...props }
					ref={ ref }
					icon={ mode === 'navigation' ? selectIcon : editIcon }
					aria-expanded={ isOpen }
					aria-haspopup="true"
					onClick={ onToggle }
					/* translators: button label text should, if possible, be under 16 characters. */
					label={ __( 'Tools' ) }
				/>
			) }
			popoverProps={ { placement: 'bottom-start' } }
			renderContent={ () => (
				<>
					<NavigableMenu role="menu" aria-label={ __( 'Tools' ) }>
						<MenuItemsChoice
							value={ isSimpleMode ? 'simple' : mode }
							onSelect={ ( newMode ) => {
								if ( newMode === 'simple' ) {
									const originalLocks = {};
									blocksWithinMainBlockClientIds.forEach(
										( clientId ) => {
											const attributes =
												getBlockAttributes( clientId );
											originalLocks[ clientId ] =
												attributes.templateLock;
										}
									);
									setOriginalTemplateLocks( originalLocks );
									updateBlockAttributes(
										blocksWithinMainBlockClientIds,
										{
											templateLock: 'contentOnly',
										}
									);
									__unstableSetEditorMode( 'edit' );
									setIsSimpleMode( true );
								} else {
									// Restore the original templateLock attributes
									blocksWithinMainBlockClientIds.forEach(
										( clientId ) => {
											updateBlockAttributes( clientId, {
												templateLock:
													originalTemplateLocks[
														clientId
													],
											} );
										}
									);
									__unstableSetEditorMode( newMode );
									setIsSimpleMode( false );
								}
							} }
							choices={ [
								{
									value: 'edit',
									label: (
										<>
											<Icon icon={ editIcon } />
											{ __( 'Edit' ) }
										</>
									),
								},
								{
									value: 'navigation',
									label: (
										<>
											{ selectIcon }
											{ __( 'Select' ) }
										</>
									),
								},
								{
									value: 'simple',
									label: (
										<>
											<Icon icon={ brushIcon } />
											{ __( 'Simple' ) }
										</>
									),
								},
							] }
						/>
					</NavigableMenu>
					<div className="block-editor-tool-selector__help">
						{ __(
							'Tools provide different interactions for selecting, navigating, and editing blocks. Toggle between select and edit by pressing Escape and Enter.'
						) }
					</div>
				</>
			) }
		/>
	);
}

export default forwardRef( ToolSelector );
