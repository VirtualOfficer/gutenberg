/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Icon, MenuGroup } from '@wordpress/components';
import { PostSavedState, PostPreviewButton } from '@wordpress/editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { cog, external } from '@wordpress/icons';
import { PinnedItems, AdminMenuToggle } from '@wordpress/interface';

/**
 * Internal dependencies
 */
import HeaderToolbar from './header-toolbar';
import MoreMenu from './more-menu';
import PostPublishButtonOrToggle from './post-publish-button-or-toggle';
import { __experimentalPreviewOptions as PreviewOptions } from '@wordpress/block-editor';

function Header( { onToggleInserter, isInserterOpen } ) {
	const {
		shortcut,
		hasActiveMetaboxes,
		isEditorSidebarOpened,
		isPostSaveable,
		isPublishSidebarOpened,
		isSaving,
		getBlockSelectionStart,
		isFullscreenActive,
		deviceType,
	} = useSelect(
		( select ) => ( {
			shortcut: select(
				'core/keyboard-shortcuts'
			).getShortcutRepresentation( 'core/edit-post/toggle-sidebar' ),
			hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
			isEditorSidebarOpened: select(
				'core/edit-post'
			).isEditorSidebarOpened(),
			isPublishSidebarOpened: select(
				'core/edit-post'
			).isPublishSidebarOpened(),
			isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
			getBlockSelectionStart: select( 'core/block-editor' )
				.getBlockSelectionStart,
			isPostSaveable: select( 'core/editor' ).isEditedPostSaveable(),
			isFullscreenActive: select( 'core/edit-post' ).isFeatureActive(
				'fullscreenMode'
			),
			deviceType: select(
				'core/edit-post'
			).__experimentalGetPreviewDeviceType(),
		} ),
		[]
	);
	const {
		openGeneralSidebar,
		closeGeneralSidebar,
		__experimentalSetPreviewDeviceType: setPreviewDeviceType,
	} = useDispatch( 'core/edit-post' );

	const toggleGeneralSidebar = isEditorSidebarOpened
		? closeGeneralSidebar
		: () =>
				openGeneralSidebar(
					getBlockSelectionStart()
						? 'edit-post/block'
						: 'edit-post/document'
				);

	return (
		<div className="edit-post-header">
			{ isFullscreenActive && <AdminMenuToggle /> }
			<div className="edit-post-header__toolbar">
				<HeaderToolbar
					onToggleInserter={ onToggleInserter }
					isInserterOpen={ isInserterOpen }
				/>
			</div>
			<div className="edit-post-header__settings">
				{ ! isPublishSidebarOpened && (
					// This button isn't completely hidden by the publish sidebar.
					// We can't hide the whole toolbar when the publish sidebar is open because
					// we want to prevent mounting/unmounting the PostPublishButtonOrToggle DOM node.
					// We track that DOM node to return focus to the PostPublishButtonOrToggle
					// when the publish sidebar has been closed.
					<PostSavedState
						forceIsDirty={ hasActiveMetaboxes }
						forceIsSaving={ isSaving }
					/>
				) }
				<PreviewOptions
					isEnabled={ isPostSaveable }
					className="edit-post-post-preview-dropdown"
					deviceType={ deviceType }
					setDeviceType={ setPreviewDeviceType }
				>
					<MenuGroup>
						<div className="edit-post-header-preview__grouping-external">
							<PostPreviewButton
								className={
									'edit-post-header-preview__button-external'
								}
								forceIsAutosaveable={ hasActiveMetaboxes }
								forcePreviewLink={ isSaving ? null : undefined }
								textContent={
									<>
										<Icon icon={ external } />
										{ __( 'Preview in new tab' ) }
									</>
								}
							/>
						</div>
					</MenuGroup>
				</PreviewOptions>
				<PostPreviewButton
					forceIsAutosaveable={ hasActiveMetaboxes }
					forcePreviewLink={ isSaving ? null : undefined }
				/>
				<PostPublishButtonOrToggle
					forceIsDirty={ hasActiveMetaboxes }
					forceIsSaving={ isSaving }
				/>
				<Button
					icon={ cog }
					label={ __( 'Settings' ) }
					onClick={ toggleGeneralSidebar }
					isPressed={ isEditorSidebarOpened }
					aria-expanded={ isEditorSidebarOpened }
					shortcut={ shortcut }
				/>
				<PinnedItems.Slot scope="core/edit-post" />
				<MoreMenu />
			</div>
		</div>
	);
}

export default Header;
