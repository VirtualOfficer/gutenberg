/**
 * WordPress dependencies
 */
import {
	useMergeRefs,
	__experimentalUseFixedWindowList as useFixedWindowList,
} from '@wordpress/compose';
import { __experimentalTreeGrid as TreeGrid } from '@wordpress/components';
import { AsyncModeProvider, useSelect } from '@wordpress/data';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useReducer,
	forwardRef,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ListViewBranch from './branch';
import { ListViewContext } from './context';
import ListViewDropIndicator from './drop-indicator';
import useBlockSelection from './use-block-selection';
import useListViewClientIds from './use-list-view-client-ids';
import useListViewDropZone from './use-list-view-drop-zone';
import useListViewExpandSelectedItem from './use-list-view-expand-selected-item';
import { store as blockEditorStore } from '../../store';
import Inserter from '../inserter';

const expanded = ( state, action ) => {
	if ( Array.isArray( action.clientIds ) ) {
		return {
			...state,
			...action.clientIds.reduce(
				( newState, id ) => ( {
					...newState,
					[ id ]: action.type === 'expand',
				} ),
				{}
			),
		};
	}
	return state;
};

export const BLOCK_LIST_ITEM_HEIGHT = 36;

/**
 * Show a hierarchical list of blocks.
 *
 * @param {Object}  props                     Components props.
 * @param {string}  props.id                  An HTML element id for the root element of ListView.
 * @param {Array}   props.blocks              Custom subset of block client IDs to be used instead of the default hierarchy.
 * @param {boolean} props.showBlockMovers     Flag to enable block movers
 * @param {boolean} props.isExpanded          Flag to determine whether nested levels are expanded by default.
 * @param {boolean} props.selectBlockInCanvas Flag to determine whether the list view should be a block selection mechanism,.
 * @param {string}  props.clientId            Client ID of the root navigation block.
 * @param {Object}  ref                       Forwarded ref
 */
function __ExperimentalOffCanvasEditor(
	{
		id,
		blocks,
		showBlockMovers = false,
		isExpanded = false,
		selectBlockInCanvas = true,
		clientId,
	},
	ref
) {
	const { clientIdsTree, draggedClientIds, selectedClientIds } =
		useListViewClientIds( blocks );

	const { visibleBlockCount, shouldShowInnerBlocks } = useSelect(
		( select ) => {
			const {
				getGlobalBlockCount,
				getClientIdsOfDescendants,
				__unstableGetEditorMode,
			} = select( blockEditorStore );
			const draggedBlockCount =
				draggedClientIds?.length > 0
					? getClientIdsOfDescendants( draggedClientIds ).length + 1
					: 0;
			return {
				visibleBlockCount: getGlobalBlockCount() - draggedBlockCount,
				shouldShowInnerBlocks: __unstableGetEditorMode() !== 'zoom-out',
			};
		},
		[ draggedClientIds ]
	);

	const { updateBlockSelection } = useBlockSelection();

	const [ expandedState, setExpandedState ] = useReducer( expanded, {} );

	const { ref: dropZoneRef, target: blockDropTarget } = useListViewDropZone();
	const elementRef = useRef();
	const treeGridRef = useMergeRefs( [ elementRef, dropZoneRef, ref ] );

	const isMounted = useRef( false );
	const { setSelectedTreeId } = useListViewExpandSelectedItem( {
		firstSelectedBlockClientId: selectedClientIds[ 0 ],
		setExpandedState,
	} );
	const selectEditorBlock = useCallback(
		( event, blockClientId ) => {
			updateBlockSelection( event, blockClientId );
			setSelectedTreeId( blockClientId );
		},
		[ setSelectedTreeId, updateBlockSelection ]
	);
	useEffect( () => {
		isMounted.current = true;
	}, [] );

	// List View renders a fixed number of items and relies on each having a fixed item height of 36px.
	// If this value changes, we should also change the itemHeight value set in useFixedWindowList.
	// See: https://github.com/WordPress/gutenberg/pull/35230 for additional context.
	const [ fixedListWindow ] = useFixedWindowList(
		elementRef,
		BLOCK_LIST_ITEM_HEIGHT,
		visibleBlockCount,
		{
			useWindowing: true,
			windowOverscan: 40,
		}
	);

	const expand = useCallback(
		( blockClientId ) => {
			if ( ! blockClientId ) {
				return;
			}
			setExpandedState( {
				type: 'expand',
				clientIds: [ blockClientId ],
			} );
		},
		[ setExpandedState ]
	);
	const collapse = useCallback(
		( blockClientId ) => {
			if ( ! blockClientId ) {
				return;
			}
			setExpandedState( {
				type: 'collapse',
				clientIds: [ blockClientId ],
			} );
		},
		[ setExpandedState ]
	);
	const expandRow = useCallback(
		( row ) => {
			expand( row?.dataset?.block );
		},
		[ expand ]
	);
	const collapseRow = useCallback(
		( row ) => {
			collapse( row?.dataset?.block );
		},
		[ collapse ]
	);
	const focusRow = useCallback(
		( event, startRow, endRow ) => {
			if ( event.shiftKey ) {
				updateBlockSelection(
					event,
					startRow?.dataset?.block,
					endRow?.dataset?.block
				);
			}
		},
		[ updateBlockSelection ]
	);

	const contextValue = useMemo(
		() => ( {
			isTreeGridMounted: isMounted.current,
			draggedClientIds,
			expandedState,
			expand,
			collapse,
		} ),
		[ isMounted.current, draggedClientIds, expandedState, expand, collapse ]
	);

	return (
		<AsyncModeProvider value={ true }>
			<ListViewDropIndicator
				listViewRef={ elementRef }
				blockDropTarget={ blockDropTarget }
			/>
			<TreeGrid
				id={ id }
				className="block-editor-list-view-tree"
				aria-label={ __( 'Block navigation structure' ) }
				ref={ treeGridRef }
				onCollapseRow={ collapseRow }
				onExpandRow={ expandRow }
				onFocusRow={ focusRow }
				applicationAriaLabel={ __( 'Block navigation structure' ) }
			>
				<ListViewContext.Provider value={ contextValue }>
					<ListViewBranch
						blocks={ clientIdsTree }
						selectBlock={ selectEditorBlock }
						showBlockMovers={ showBlockMovers }
						fixedListWindow={ fixedListWindow }
						selectedClientIds={ selectedClientIds }
						isExpanded={ isExpanded }
						shouldShowInnerBlocks={ shouldShowInnerBlocks }
						selectBlockInCanvas={ selectBlockInCanvas }
					/>
					<tr>
						<td>
							<OffCanvasEditorAppender
								rootClientId={ clientId }
							/>
						</td>
					</tr>
				</ListViewContext.Provider>
			</TreeGrid>
		</AsyncModeProvider>
	);
}

function OffCanvasEditorAppender( { rootClientId } ) {
	const { hideInserter } = useSelect(
		( select ) => {
			const { getTemplateLock, __unstableGetEditorMode } =
				select( blockEditorStore );

			return {
				hideInserter:
					!! getTemplateLock( rootClientId ) ||
					__unstableGetEditorMode() === 'zoom-out',
			};
		},
		[ rootClientId ]
	);

	if ( hideInserter ) {
		return null;
	}

	return (
		<div className="offcanvas-editor__appender">
			<Inserter
				rootClientId={ rootClientId }
				position="bottom right"
				isAppender
				__experimentalIsQuick
			/>
		</div>
	);
}

export default forwardRef( __ExperimentalOffCanvasEditor );
