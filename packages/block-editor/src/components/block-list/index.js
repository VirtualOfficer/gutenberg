/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	AsyncModeProvider,
	useSelect,
	useDispatch,
	useRegistry,
} from '@wordpress/data';
import {
	useViewportMatch,
	useMergeRefs,
	useDebounce,
} from '@wordpress/compose';
import {
	createContext,
	useMemo,
	useCallback,
	useEffect,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockListBlock from './block';
import BlockListAppender from '../block-list-appender';
import { useInBetweenInserter } from './use-in-between-inserter';
import { store as blockEditorStore } from '../../store';
import { LayoutProvider, defaultLayout } from './layout';
import { useBlockSelectionClearer } from '../block-selection-clearer';
import { useInnerBlocksProps } from '../inner-blocks';
import {
	BlockEditContextProvider,
	DEFAULT_BLOCK_EDIT_CONTEXT,
} from '../block-edit/context';
import { useTypingObserver } from '../observe-typing';
import { unlock } from '../../lock-unlock';

export const IntersectionObserver = createContext();
const pendingBlockVisibilityUpdatesPerRegistry = new WeakMap();

function Root( { className, ...settings } ) {
	const isLargeViewport = useViewportMatch( 'medium' );
	const { isOutlineMode, isFocusMode, editorMode } = useSelect(
		( select ) => {
			const { getSettings, __unstableGetEditorMode } =
				select( blockEditorStore );
			const { outlineMode, focusMode } = getSettings();
			return {
				isOutlineMode: outlineMode,
				isFocusMode: focusMode,
				editorMode: __unstableGetEditorMode(),
			};
		},
		[]
	);
	const registry = useRegistry();
	const { setBlockVisibility } = useDispatch( blockEditorStore );

	const delayedBlockVisibilityUpdates = useDebounce(
		useCallback( () => {
			const updates = {};
			pendingBlockVisibilityUpdatesPerRegistry
				.get( registry )
				.forEach( ( [ id, isIntersecting ] ) => {
					updates[ id ] = isIntersecting;
				} );
			setBlockVisibility( updates );
		}, [ registry ] ),
		300,
		{
			trailing: true,
		}
	);
	const intersectionObserver = useMemo( () => {
		const { IntersectionObserver: Observer } = window;

		if ( ! Observer ) {
			return;
		}

		return new Observer( ( entries ) => {
			if ( ! pendingBlockVisibilityUpdatesPerRegistry.get( registry ) ) {
				pendingBlockVisibilityUpdatesPerRegistry.set( registry, [] );
			}
			for ( const entry of entries ) {
				const clientId = entry.target.getAttribute( 'data-block' );
				pendingBlockVisibilityUpdatesPerRegistry
					.get( registry )
					.push( [ clientId, entry.isIntersecting ] );
			}
			delayedBlockVisibilityUpdates();
		} );
	}, [] );
	const innerBlocksProps = useInnerBlocksProps(
		{
			ref: useMergeRefs( [
				useBlockSelectionClearer(),
				useInBetweenInserter(),
				useTypingObserver(),
			] ),
			className: classnames( 'is-root-container', className, {
				'is-outline-mode': isOutlineMode,
				'is-focus-mode': isFocusMode && isLargeViewport,
				'is-navigate-mode': editorMode === 'navigation',
			} ),
		},
		settings
	);
	return (
		<IntersectionObserver.Provider value={ intersectionObserver }>
			<div { ...innerBlocksProps } />
		</IntersectionObserver.Provider>
	);
}

function StopEditingAsBlocksOnOutsideSelect( { clientId } ) {
	const { stopEditingAsBlocks } = unlock( useDispatch( blockEditorStore ) );
	const isBlockOrDescendantSelected = useSelect(
		( select ) => {
			const { isBlockSelected, hasSelectedInnerBlock } =
				select( blockEditorStore );
			return (
				isBlockSelected( clientId ) ||
				hasSelectedInnerBlock( clientId, true )
			);
		},
		[ clientId ]
	);
	useEffect( () => {
		if ( ! isBlockOrDescendantSelected ) {
			stopEditingAsBlocks( clientId );
		}
	}, [ isBlockOrDescendantSelected, clientId, stopEditingAsBlocks ] );
	return null;
}

export default function BlockList( settings ) {
	return (
		<BlockEditContextProvider value={ DEFAULT_BLOCK_EDIT_CONTEXT }>
			<Root { ...settings } />
		</BlockEditContextProvider>
	);
}

function Items( {
	placeholder,
	rootClientId,
	renderAppender,
	__experimentalAppenderTagName,
	layout = defaultLayout,
} ) {
	const selected = useSelect(
		( select ) => {
			const {
				getBlockOrder,
				getSelectedBlockClientIds,
				__unstableGetVisibleBlocks,
				__unstableGetTemporarilyEditingAsBlocks,
			} = select( blockEditorStore );
			const order = getBlockOrder( rootClientId );
			const selectedBlocks = getSelectedBlockClientIds();
			const visibleBlocks = __unstableGetVisibleBlocks();
			let hasVisibleBlocks = false;
			let hasSelectedBlocks = false;
			for ( const clientId of selectedBlocks ) {
				if ( visibleBlocks.has( clientId ) ) {
					hasVisibleBlocks = true;
				}
				if ( selectedBlocks.includes( clientId ) ) {
					hasSelectedBlocks = true;
				}
			}
			return {
				order,
				// Only pass selectedBlocks and visibleBlocks if they are
				// relevant to the root block. Otherwise changes in visible
				// blocks or selected blocks cause all block lists to re-render.
				selectedBlocks: hasSelectedBlocks ? selectedBlocks : null,
				visibleBlocks: hasVisibleBlocks ? visibleBlocks : null,
				temporarilyEditingAsBlocks:
					__unstableGetTemporarilyEditingAsBlocks(),
			};
		},
		[ rootClientId ]
	);
	const { order, selectedBlocks, visibleBlocks, temporarilyEditingAsBlocks } =
		selected;

	return (
		<LayoutProvider value={ layout }>
			{ order.map( ( clientId ) => (
				<AsyncModeProvider
					key={ clientId }
					value={
						// Only provide data asynchronously if the block is
						// not visible and not selected.
						! visibleBlocks?.has( clientId ) &&
						! selectedBlocks?.includes( clientId )
					}
				>
					<BlockListBlock
						rootClientId={ rootClientId }
						clientId={ clientId }
					/>
				</AsyncModeProvider>
			) ) }
			{ order.length < 1 && placeholder }
			{ !! temporarilyEditingAsBlocks && (
				<StopEditingAsBlocksOnOutsideSelect
					clientId={ temporarilyEditingAsBlocks }
				/>
			) }
			<BlockListAppender
				tagName={ __experimentalAppenderTagName }
				rootClientId={ rootClientId }
				renderAppender={ renderAppender }
			/>
		</LayoutProvider>
	);
}

export function BlockListItems( props ) {
	// This component needs to always be synchronous as it's the one changing
	// the async mode depending on the block selection.
	return (
		<AsyncModeProvider value={ false }>
			<Items { ...props } />
		</AsyncModeProvider>
	);
}
