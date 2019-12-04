/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import {
	PostPreviewButton,
	PostSavedState,
} from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import FullscreenModeClose from './fullscreen-mode-close';
import HeaderToolbar from './header-toolbar';
import MoreMenu from './more-menu';
import PinnedPlugins from './pinned-plugins';
import PostPublishButtonOrToggle from './post-publish-button-or-toggle';
import shortcuts from '../../keyboard-shortcuts';

function Header( {
	closeGeneralSidebar,
	hasActiveMetaboxes,
	isEditorSidebarOpened,
	isPublishSidebarOpened,
	isSaving,
	openGeneralSidebar,
} ) {
	const toggleGeneralSidebar = isEditorSidebarOpened ? closeGeneralSidebar : openGeneralSidebar;

	return (
		<div className="edit-post-header">
			<div className="edit-post-header__toolbar">
				<FullscreenModeClose />
				<HeaderToolbar />
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
				<PostPreviewButton
					forceIsAutosaveable={ hasActiveMetaboxes }
					forcePreviewLink={ isSaving ? null : undefined }
				/>
				<PostPublishButtonOrToggle
					forceIsDirty={ hasActiveMetaboxes }
					forceIsSaving={ isSaving }
				/>
				<IconButton
					icon="admin-generic"
					label={ __( 'Settings' ) }
					onClick={ toggleGeneralSidebar }
					isToggled={ isEditorSidebarOpened }
					aria-expanded={ isEditorSidebarOpened }
					shortcut={ shortcuts.toggleSidebar }
				/>
				<PinnedPlugins.Slot />
				<MoreMenu />
			</div>
		</div>
	);
}

export default compose(
	withSelect( ( select ) => ( {
		hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
		isEditorSidebarOpened: select( 'core/edit-post' ).isEditorSidebarOpened(),
		isPublishSidebarOpened: select( 'core/edit-post' ).isPublishSidebarOpened(),
		isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
	} ) ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const { getBlockSelectionStart } = select( 'core/block-editor' );
		const { openGeneralSidebar, closeGeneralSidebar } = dispatch( 'core/edit-post' );

		return {
			openGeneralSidebar: () => openGeneralSidebar( getBlockSelectionStart() ? 'edit-post/block' : 'edit-post/document' ),
			closeGeneralSidebar,
		};
	} ),
)( Header );
