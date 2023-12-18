/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	BlockToolbar,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PostSavedState,
	PostPreviewButton,
	store as editorStore,
	DocumentBar,
	privateApis as editorPrivateApis,
	POST_TYPE_EDITOR_INTERFACE,
} from '@wordpress/editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { next, previous } from '@wordpress/icons';
import { PinnedItems } from '@wordpress/interface';
import { useViewportMatch } from '@wordpress/compose';
import {
	Button,
	__unstableMotion as motion,
	Popover,
} from '@wordpress/components';
import { store as preferencesStore } from '@wordpress/preferences';
import { getQueryArg } from '@wordpress/url';

/**
 * Internal dependencies
 */
import FullscreenModeClose from './fullscreen-mode-close';
import MoreMenu from './more-menu';
import PostPublishButtonOrToggle from './post-publish-button-or-toggle';
import MainDashboardButton from './main-dashboard-button';
import { store as editPostStore } from '../../store';
import { unlock } from '../../lock-unlock';

const { DocumentTools, PostViewLink, PreviewDropdown } =
	unlock( editorPrivateApis );

const slideY = {
	hidden: { y: '-50px' },
	distractionFreeInactive: { y: 0 },
	hover: { y: 0, transition: { type: 'tween', delay: 0.2 } },
};

const slideX = {
	hidden: { x: '-100%' },
	distractionFreeInactive: { x: 0 },
	hover: { x: 0, transition: { type: 'tween', delay: 0.2 } },
};

function Header( { setEntitiesSavedStatesCallback } ) {
	const isWideViewport = useViewportMatch( 'large' );
	const isLargeViewport = useViewportMatch( 'medium' );
	const blockToolbarRef = useRef();
	const {
		isTextEditor,
		hasBlockSelection,
		hasActiveMetaboxes,
		hasFixedToolbar,
		isEditingTemplate,
		isPublishSidebarOpened,
		showIconLabels,
		postType,
	} = useSelect( ( select ) => {
		const { get: getPreference } = select( preferencesStore );
		const { getEditorMode } = select( editPostStore );

		return {
			isTextEditor: getEditorMode() === 'text',
			hasBlockSelection:
				!! select( blockEditorStore ).getBlockSelectionStart(),
			hasActiveMetaboxes: select( editPostStore ).hasMetaBoxes(),
			postType: select( editorStore ).getEditedPostAttribute( 'type' ),
			isEditingTemplate:
				select( editorStore ).getRenderingMode() === 'template-only',
			isPublishSidebarOpened:
				select( editPostStore ).isPublishSidebarOpened(),
			hasFixedToolbar: getPreference( 'core/edit-post', 'fixedToolbar' ),
			showIconLabels:
				select( editPostStore ).isFeatureActive( 'showIconLabels' ),
		};
	}, [] );

	const hasDocumentBar =
		POST_TYPE_EDITOR_INTERFACE[ postType ]?.hasDocumentBar &&
		getQueryArg( window.location.href, 'editMode' ) === 'focused';
	const [ isBlockToolsCollapsed, setIsBlockToolsCollapsed ] =
		useState( true );

	useEffect( () => {
		// If we have a new block selection, show the block tools
		if ( hasBlockSelection ) {
			setIsBlockToolsCollapsed( false );
		}
	}, [ hasBlockSelection ] );

	return (
		<div className="edit-post-header">
			<MainDashboardButton.Slot>
				<motion.div
					variants={ slideX }
					transition={ { type: 'tween', delay: 0.8 } }
				>
					<FullscreenModeClose showTooltip />
				</motion.div>
			</MainDashboardButton.Slot>
			<motion.div
				variants={ slideY }
				transition={ { type: 'tween', delay: 0.8 } }
				className="edit-post-header__toolbar"
			>
				<DocumentTools
					disableBlockTools={ isTextEditor }
					showIconLabels={ showIconLabels }
				/>
				{ hasFixedToolbar && isLargeViewport && (
					<>
						<div
							className={ classnames(
								'selected-block-tools-wrapper',
								{
									'is-collapsed':
										isEditingTemplate &&
										isBlockToolsCollapsed,
								}
							) }
						>
							<BlockToolbar hideDragHandle />
						</div>
						<Popover.Slot
							ref={ blockToolbarRef }
							name="block-toolbar"
						/>
						{ isEditingTemplate && hasBlockSelection && (
							<Button
								className="edit-post-header__block-tools-toggle"
								icon={ isBlockToolsCollapsed ? next : previous }
								onClick={ () => {
									setIsBlockToolsCollapsed(
										( collapsed ) => ! collapsed
									);
								} }
								label={
									isBlockToolsCollapsed
										? __( 'Show block tools' )
										: __( 'Hide block tools' )
								}
							/>
						) }
					</>
				) }
				<div
					className={ classnames( 'edit-post-header__center', {
						'is-collapsed':
							isEditingTemplate &&
							hasBlockSelection &&
							! isBlockToolsCollapsed &&
							hasFixedToolbar &&
							isLargeViewport,
					} ) }
				>
					{ ( isEditingTemplate || hasDocumentBar ) && (
						<DocumentBar />
					) }
				</div>
			</motion.div>
			<motion.div
				variants={ slideY }
				transition={ { type: 'tween', delay: 0.8 } }
				className="edit-post-header__settings"
			>
				{ ! isPublishSidebarOpened && (
					// This button isn't completely hidden by the publish sidebar.
					// We can't hide the whole toolbar when the publish sidebar is open because
					// we want to prevent mounting/unmounting the PostPublishButtonOrToggle DOM node.
					// We track that DOM node to return focus to the PostPublishButtonOrToggle
					// when the publish sidebar has been closed.
					<PostSavedState
						forceIsDirty={ hasActiveMetaboxes }
						showIconLabels={ showIconLabels }
					/>
				) }
				<PreviewDropdown
					showIconLabels={ showIconLabels }
					forceIsAutosaveable={ hasActiveMetaboxes }
				/>
				<PostPreviewButton
					className="edit-post-header__post-preview-button"
					forceIsAutosaveable={ hasActiveMetaboxes }
				/>
				<PostViewLink showIconLabels={ showIconLabels } />
				<PostPublishButtonOrToggle
					forceIsDirty={ hasActiveMetaboxes }
					setEntitiesSavedStatesCallback={
						setEntitiesSavedStatesCallback
					}
				/>
				{ ( isWideViewport || ! showIconLabels ) && (
					<>
						<PinnedItems.Slot scope="core/edit-post" />
						<MoreMenu showIconLabels={ showIconLabels } />
					</>
				) }
				{ showIconLabels && ! isWideViewport && (
					<MoreMenu showIconLabels={ showIconLabels } />
				) }
			</motion.div>
		</div>
	);
}

export default Header;
