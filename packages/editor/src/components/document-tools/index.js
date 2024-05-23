/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import {
	NavigableToolbar,
	ToolSelector,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, ToolbarItem } from '@wordpress/components';
import { listView, plus } from '@wordpress/icons';
import { useCallback } from '@wordpress/element';
import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
import { store as preferencesStore } from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { store as editorStore } from '../../store';
import EditorHistoryRedo from '../editor-history/redo';
import EditorHistoryUndo from '../editor-history/undo';

const preventDefault = ( event ) => {
	event.preventDefault();
};

function DocumentTools( {
	className,
	disableBlockTools = false,
	// This is a temporary prop until the list view is fully unified between post and site editors.
	listViewLabel = __( 'Document Overview' ),
} ) {
	const { setIsInserterOpened, setIsListViewOpened } =
		useDispatch( editorStore );
	const {
		isDistractionFree,
		isInserterOpened,
		isListViewOpen,
		listViewShortcut,
		inserterSidebarToggleRef,
		listViewToggleRef,
		hasFixedToolbar,
		showIconLabels,
	} = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		const { get } = select( preferencesStore );
		const {
			isListViewOpened,
			getEditorMode,
			getInserterSidebarToggleRef,
			getListViewToggleRef,
		} = unlock( select( editorStore ) );
		const { getShortcutRepresentation } = select( keyboardShortcutsStore );
		const { __unstableGetEditorMode } = select( blockEditorStore );

		return {
			isInserterOpened: select( editorStore ).isInserterOpened(),
			isListViewOpen: isListViewOpened(),
			listViewShortcut: getShortcutRepresentation(
				'core/editor/toggle-list-view'
			),
			inserterSidebarToggleRef: getInserterSidebarToggleRef(),
			listViewToggleRef: getListViewToggleRef(),
			hasFixedToolbar: getSettings().hasFixedToolbar,
			showIconLabels: get( 'core', 'showIconLabels' ),
			isDistractionFree: get( 'core', 'distractionFree' ),
			isVisualMode: getEditorMode() === 'visual',
			isZoomedOutView: __unstableGetEditorMode() === 'zoom-out',
		};
	}, [] );

	const isLargeViewport = useViewportMatch( 'medium' );
	const isWideViewport = useViewportMatch( 'wide' );

	/* translators: accessibility text for the editor toolbar */
	const toolbarAriaLabel = __( 'Document tools' );

	const toggleListView = useCallback(
		() => setIsListViewOpened( ! isListViewOpen ),
		[ setIsListViewOpened, isListViewOpen ]
	);

	const toggleInserter = useCallback(
		() => setIsInserterOpened( ! isInserterOpened ),
		[ isInserterOpened, setIsInserterOpened ]
	);

	/* translators: button label text should, if possible, be under 16 characters. */
	const longLabel = _x(
		'Toggle block inserter',
		'Generic label for block inserter button'
	);
	const shortLabel = ! isInserterOpened ? __( 'Add' ) : __( 'Close' );

	return (
		// Some plugins expect and use the `edit-post-header-toolbar` CSS class to
		// find the toolbar and inject UI elements into it. This is not officially
		// supported, but we're keeping it in the list of class names for backwards
		// compatibility.
		<NavigableToolbar
			className={ clsx(
				'editor-document-tools',
				'edit-post-header-toolbar',
				className
			) }
			aria-label={ toolbarAriaLabel }
			variant="unstyled"
		>
			<div className="editor-document-tools__left">
				{ ! isDistractionFree && (
					<ToolbarItem
						ref={ inserterSidebarToggleRef }
						as={ Button }
						className="editor-document-tools__inserter-toggle"
						variant="primary"
						isPressed={ isInserterOpened }
						onMouseDown={ preventDefault }
						onClick={ toggleInserter }
						disabled={ disableBlockTools }
						icon={ plus }
						label={ showIconLabels ? shortLabel : longLabel }
						showTooltip={ ! showIconLabels }
						aria-expanded={ isInserterOpened }
					/>
				) }
				{ ( isWideViewport || ! showIconLabels ) && (
					<>
						{ isLargeViewport && ! hasFixedToolbar && (
							<ToolbarItem
								as={ ToolSelector }
								showTooltip={ ! showIconLabels }
								variant={
									showIconLabels ? 'tertiary' : undefined
								}
								disabled={ disableBlockTools }
								size="compact"
							/>
						) }
						<ToolbarItem
							as={ EditorHistoryUndo }
							showTooltip={ ! showIconLabels }
							variant={ showIconLabels ? 'tertiary' : undefined }
							size="compact"
						/>
						<ToolbarItem
							as={ EditorHistoryRedo }
							showTooltip={ ! showIconLabels }
							variant={ showIconLabels ? 'tertiary' : undefined }
							size="compact"
						/>
						{ ! isDistractionFree && (
							<ToolbarItem
								as={ Button }
								className="editor-document-tools__document-overview-toggle"
								icon={ listView }
								disabled={ disableBlockTools }
								isPressed={ isListViewOpen }
								/* translators: button label text should, if possible, be under 16 characters. */
								label={ listViewLabel }
								onClick={ toggleListView }
								shortcut={ listViewShortcut }
								showTooltip={ ! showIconLabels }
								variant={
									showIconLabels ? 'tertiary' : undefined
								}
								aria-expanded={ isListViewOpen }
								ref={ listViewToggleRef }
								size="compact"
							/>
						) }
					</>
				) }
			</div>
		</NavigableToolbar>
	);
}

export default DocumentTools;
