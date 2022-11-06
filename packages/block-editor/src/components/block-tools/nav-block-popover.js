/**
 * External dependencies
 */
import { find } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/**
 * WordPress dependencies
 */
import { useRef, useEffect } from '@wordpress/element';
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import {
	useMergeRefs,
	useRefEffect,
	useViewportMatch,
} from '@wordpress/compose';

/**
 * Internal dependencies
 */
/**
 * Internal dependencies
 */
import BlockSelectionButton from './block-selection-button';
import { store as blockEditorStore } from '../../store';
import BlockPopover from '../block-popover';
import useBlockToolbarPopoverProps from './use-block-toolbar-popover-props';

function selector( select ) {
	const {
		__unstableGetEditorMode,
		isMultiSelecting,
		hasMultiSelection,
		isTyping,
		getSettings,
		getLastMultiSelectedBlockClientId,
	} = select( blockEditorStore );
	return {
		editorMode: __unstableGetEditorMode(),
		isMultiSelecting: isMultiSelecting(),
		isTyping: isTyping(),
		hasFixedToolbar: getSettings().hasFixedToolbar,
		isDistractionFree: getSettings().isDistractionFree,
		lastClientId: hasMultiSelection()
			? getLastMultiSelectedBlockClientId()
			: null,
	};
}

function SelectedBlockPopover( {
	clientId,
	rootClientId,
	isEmptyDefaultBlock,
	capturingClientId,
	__unstablePopoverSlot,
	__unstableContentRef,
} ) {
	const {
		editorMode,
		isMultiSelecting,
		isTyping,
		hasFixedToolbar,
		isDistractionFree,
		lastClientId,
	} = useSelect( selector, [] );
	const isInsertionPointVisible = useSelect(
		( select ) => {
			const {
				isBlockInsertionPointVisible,
				getBlockInsertionPoint,
				getBlockOrder,
			} = select( blockEditorStore );

			if ( ! isBlockInsertionPointVisible() ) {
				return false;
			}

			const insertionPoint = getBlockInsertionPoint();
			const order = getBlockOrder( insertionPoint.rootClientId );
			return order[ insertionPoint.index ] === clientId;
		},
		[ clientId ]
	);
	const isLargeViewport = useViewportMatch( 'medium' );
	const isToolbarForced = useRef( false );
	const { stopTyping, setNavigationMode } = useDispatch( blockEditorStore );

	const showEmptyBlockSideInserter =
		! isTyping && editorMode === 'edit' && isEmptyDefaultBlock;
	const shouldShowBreadcrumb =
		editorMode === 'navigation' || editorMode === 'zoom-out';
	const shouldShowContextualToolbar =
		editorMode === 'edit' &&
		! hasFixedToolbar &&
		isLargeViewport &&
		! isMultiSelecting &&
		! showEmptyBlockSideInserter &&
		! isTyping;
	const canFocusHiddenToolbar =
		editorMode === 'edit' &&
		! shouldShowContextualToolbar &&
		! hasFixedToolbar &&
		! isDistractionFree &&
		! isEmptyDefaultBlock;

	useShortcut(
		'core/block-editor/focus-toolbar',
		() => {
			isToolbarForced.current = true;
			stopTyping( true );
		},
		{
			isDisabled: ! canFocusHiddenToolbar,
		}
	);

	useEffect( () => {
		isToolbarForced.current = false;
	} );

	const popoverProps = useBlockToolbarPopoverProps( {
		contentElement: __unstableContentRef?.current,
		clientId,
	} );

	// onFocus doesn't work on Popover. Should be fixed.
	const ref = useMergeRefs( [
		popoverProps.ref,
		useRefEffect( ( node ) => {
			function onFocus() {
				setNavigationMode( true );
			}
			node.addEventListener( 'focus', onFocus );
			return () => {
				node.removeEventListener( 'focus', onFocus );
			};
		}, [] ),
	] );

	if ( ! shouldShowBreadcrumb && ! shouldShowContextualToolbar ) {
		return null;
	}

	return (
		<BlockPopover
			clientId={ capturingClientId || clientId }
			bottomClientId={ lastClientId }
			className={ classnames( 'block-editor-block-list__block-popover', {
				'is-insertion-point-visible': isInsertionPointVisible,
			} ) }
			__unstablePopoverSlot={ __unstablePopoverSlot }
			__unstableContentRef={ __unstableContentRef }
			resize={ false }
			{ ...popoverProps }
			ref={ ref }
			role="region"
			tabIndex="-1"
		>
			{ shouldShowBreadcrumb && (
				<BlockSelectionButton
					clientId={ clientId }
					rootClientId={ rootClientId }
				/>
			) }
		</BlockPopover>
	);
}

function wrapperSelector( select ) {
	const {
		getSelectedBlockClientId,
		getFirstMultiSelectedBlockClientId,
		getBlockRootClientId,
		getBlock,
		getBlockParents,
		getSettings,
		isNavigationMode: _isNavigationMode,
		__experimentalGetBlockListSettingsForBlocks,
	} = select( blockEditorStore );

	const clientId =
		getSelectedBlockClientId() || getFirstMultiSelectedBlockClientId();

	if ( ! clientId ) {
		return;
	}

	const { name, attributes = {} } = getBlock( clientId ) || {};
	const blockParentsClientIds = getBlockParents( clientId );

	// Get Block List Settings for all ancestors of the current Block clientId.
	const parentBlockListSettings = __experimentalGetBlockListSettingsForBlocks(
		blockParentsClientIds
	);

	// Get the clientId of the topmost parent with the capture toolbars setting.
	const capturingClientId = find(
		blockParentsClientIds,
		( parentClientId ) =>
			parentBlockListSettings[ parentClientId ]
				?.__experimentalCaptureToolbars
	);

	const settings = getSettings();

	return {
		clientId,
		rootClientId: getBlockRootClientId( clientId ),
		name,
		isDistractionFree: settings.isDistractionFree,
		isNavigationMode: _isNavigationMode(),
		isEmptyDefaultBlock:
			name && isUnmodifiedDefaultBlock( { name, attributes } ),
		capturingClientId,
	};
}

export default function WrappedBlockPopover( {
	__unstablePopoverSlot,
	__unstableContentRef,
} ) {
	const selected = useSelect( wrapperSelector, [] );

	if ( ! selected ) {
		return null;
	}

	const {
		clientId,
		rootClientId,
		name,
		isEmptyDefaultBlock,
		capturingClientId,
		isDistractionFree,
		isNavigationMode,
	} = selected;

	if ( ! name ) {
		return null;
	}

	return (
		<SelectedBlockPopover
			clientId={ clientId }
			rootClientId={ rootClientId }
			isEmptyDefaultBlock={ isEmptyDefaultBlock }
			showContents={ ! isDistractionFree || isNavigationMode }
			capturingClientId={ capturingClientId }
			__unstablePopoverSlot={ __unstablePopoverSlot }
			__unstableContentRef={ __unstableContentRef }
		/>
	);
}
