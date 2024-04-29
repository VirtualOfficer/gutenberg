/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { forwardRef, useState, useCallback, useMemo } from '@wordpress/element';
import { VisuallyHidden, SearchControl, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useDebouncedInput, useRefEffect } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import Tips from './tips';
import InserterPreviewPanel from './preview-panel';
import BlockTypesTab from './block-types-tab';
import BlockPatternsTab from './block-patterns-tab';
import { PatternCategoryPreviewPanel } from './block-patterns-tab/pattern-category-preview-panel';
import { MediaTab, MediaCategoryPanel, useMediaCategories } from './media-tab';
import InserterSearchResults from './search-results';
import useInsertionPoint from './hooks/use-insertion-point';
import InserterTabs from './tabs';
import { store as blockEditorStore } from '../../store';
import { useZoomOut } from '../../hooks/use-zoom-out';

const NOOP = () => {};

function InserterMenu(
	{
		rootClientId,
		clientId,
		isAppender,
		__experimentalInsertionIndex,
		onSelect,
		showInserterHelpPanel,
		showMostUsedBlocks,
		__experimentalFilterValue = '',
		shouldFocusBlock = true,
		__experimentalOnPatternCategorySelection = NOOP,
	},
	ref
) {
	const [ filterValue, setFilterValue, delayedFilterValue ] =
		useDebouncedInput( __experimentalFilterValue );
	const [ hoveredItem, setHoveredItem ] = useState( null );
	const [ selectedPatternCategory, setSelectedPatternCategory ] =
		useState( null );
	const [ patternFilter, setPatternFilter ] = useState( 'all' );
	const [ selectedMediaCategory, setSelectedMediaCategory ] =
		useState( null );
	const [ selectedTab, setSelectedTab ] = useState( null );

	const [ destinationRootClientId, onInsertBlocks, onToggleInsertionPoint ] =
		useInsertionPoint( {
			rootClientId,
			clientId,
			isAppender,
			insertionIndex: __experimentalInsertionIndex,
			shouldFocusBlock,
		} );
	const { showPatterns } = useSelect(
		( select ) => {
			const { hasAllowedPatterns } = unlock( select( blockEditorStore ) );
			return {
				showPatterns: hasAllowedPatterns( destinationRootClientId ),
			};
		},
		[ destinationRootClientId ]
	);

	const mediaCategories = useMediaCategories( destinationRootClientId );
	const showMedia = mediaCategories.length > 0;

	const onInsert = useCallback(
		( blocks, meta, shouldForceFocusBlock ) => {
			onInsertBlocks( blocks, meta, shouldForceFocusBlock );
			onSelect();
		},
		[ onInsertBlocks, onSelect ]
	);

	const onInsertPattern = useCallback(
		( blocks, patternName ) => {
			onInsertBlocks( blocks, { patternName } );
			onSelect();
		},
		[ onInsertBlocks, onSelect ]
	);

	const onHover = useCallback(
		( item ) => {
			onToggleInsertionPoint( !! item );
			setHoveredItem( item );
		},
		[ onToggleInsertionPoint, setHoveredItem ]
	);

	const onHoverPattern = useCallback(
		( item ) => {
			onToggleInsertionPoint( !! item );
		},
		[ onToggleInsertionPoint ]
	);

	const isZoomedOutViewExperimentEnabled =
		window?.__experimentalEnableZoomedOutView;
	const onClickPatternCategory = useCallback(
		( patternCategory, filter ) => {
			setSelectedPatternCategory( patternCategory );
			setPatternFilter( filter );
			if ( isZoomedOutViewExperimentEnabled ) {
				__experimentalOnPatternCategorySelection();
			}
		},
		[
			setSelectedPatternCategory,
			__experimentalOnPatternCategorySelection,
			isZoomedOutViewExperimentEnabled,
		]
	);

	const showPatternPanel =
		selectedTab === 'patterns' &&
		! delayedFilterValue &&
		selectedPatternCategory;

	const showMediaPanel = selectedTab === 'media' && selectedMediaCategory;

	const showAsTabs = showPatterns || showMedia;

	const blocksTab = useMemo(
		() => (
			<>
				<div className="block-editor-inserter__block-list">
					<BlockTypesTab
						rootClientId={ destinationRootClientId }
						onInsert={ onInsert }
						onHover={ onHover }
						showMostUsedBlocks={ showMostUsedBlocks }
					/>
				</div>
				{ showInserterHelpPanel && (
					<div className="block-editor-inserter__tips">
						<VisuallyHidden as="h2">
							{ __( 'A tip for using the block editor' ) }
						</VisuallyHidden>
						<Tips />
					</div>
				) }
			</>
		),
		[
			destinationRootClientId,
			onInsert,
			onHover,
			showMostUsedBlocks,
			showInserterHelpPanel,
		]
	);

	const patternsTab = useMemo(
		() => (
			<BlockPatternsTab
				rootClientId={ destinationRootClientId }
				onInsert={ onInsertPattern }
				onSelectCategory={ onClickPatternCategory }
				selectedCategory={ selectedPatternCategory }
			>
				{ showPatternPanel && (
					<PatternCategoryPreviewPanel
						rootClientId={ destinationRootClientId }
						onInsert={ onInsertPattern }
						onHover={ onHoverPattern }
						category={ selectedPatternCategory }
						patternFilter={ patternFilter }
						showTitlesAsTooltip
					/>
				) }
			</BlockPatternsTab>
		),
		[
			destinationRootClientId,
			onHoverPattern,
			onInsertPattern,
			onClickPatternCategory,
			patternFilter,
			selectedPatternCategory,
			showPatternPanel,
		]
	);

	const mediaTab = useMemo(
		() => (
			<MediaTab
				rootClientId={ destinationRootClientId }
				selectedCategory={ selectedMediaCategory }
				onSelectCategory={ setSelectedMediaCategory }
				onInsert={ onInsert }
			>
				{ showMediaPanel && (
					<MediaCategoryPanel
						rootClientId={ destinationRootClientId }
						onInsert={ onInsert }
						category={ selectedMediaCategory }
					/>
				) }
			</MediaTab>
		),
		[
			destinationRootClientId,
			onInsert,
			selectedMediaCategory,
			setSelectedMediaCategory,
			showMediaPanel,
		]
	);

	// When the pattern panel is showing, we want to use zoom out mode
	useZoomOut( showPatternPanel );

	const handleSetSelectedTab = ( value ) => {
		// If no longer on patterns tab remove the category setting.
		if ( value !== 'patterns' ) {
			setSelectedPatternCategory( null );
		}
		setSelectedTab( value );
	};

	const searchRef = useRefEffect( ( element ) => {
		if ( element ) {
			element.focus();
		}
	} );

	const inserterSearch = useMemo( () => {
		if ( selectedTab === 'media' ) {
			return null;
		}

		return (
			<>
				<SearchControl
					__nextHasNoMarginBottom
					className="block-editor-inserter__search"
					onChange={ ( value ) => {
						if ( hoveredItem ) setHoveredItem( null );
						setFilterValue( value );
					} }
					value={ filterValue }
					label={ __( 'Search for blocks and patterns' ) }
					placeholder={ __( 'Search' ) }
					ref={ searchRef }
				/>
				{ !! delayedFilterValue && (
					<InserterSearchResults
						filterValue={ delayedFilterValue }
						onSelect={ onSelect }
						onHover={ onHover }
						onHoverPattern={ onHoverPattern }
						rootClientId={ rootClientId }
						clientId={ clientId }
						isAppender={ isAppender }
						__experimentalInsertionIndex={
							__experimentalInsertionIndex
						}
						showBlockDirectory
						shouldFocusBlock={ shouldFocusBlock }
						prioritizePatterns={ selectedTab === 'patterns' }
					/>
				) }
			</>
		);
	}, [
		selectedTab,
		hoveredItem,
		setHoveredItem,
		setFilterValue,
		filterValue,
		delayedFilterValue,
		onSelect,
		onHover,
		onHoverPattern,
		shouldFocusBlock,
		clientId,
		rootClientId,
		__experimentalInsertionIndex,
		isAppender,
		searchRef,
	] );

	return (
		<div
			className={ classnames( 'block-editor-inserter__menu', {
				'show-panel': showPatternPanel || showMediaPanel,
			} ) }
			ref={ ref }
		>
			<div
				className={ classnames( 'block-editor-inserter__main-area', {
					'show-as-tabs': showAsTabs,
				} ) }
			>
				{ showAsTabs && (
					<InserterTabs
						showPatterns={ showPatterns }
						showMedia={ showMedia }
						onSelect={ handleSetSelectedTab }
					>
						{ ( selectedTab === 'blocks' ||
							selectedTab === 'patterns' ) &&
							inserterSearch }
						{ selectedTab === 'blocks' &&
							! delayedFilterValue &&
							blocksTab }
						{ selectedTab === 'patterns' &&
							! delayedFilterValue &&
							patternsTab }
						{ selectedTab === 'media' && mediaTab }
					</InserterTabs>
				) }
				{ ! showAsTabs && (
					<div className="block-editor-inserter__no-tab-container">
						{ inserterSearch }
						{ ! delayedFilterValue && blocksTab }
					</div>
				) }
			</div>
			{ showInserterHelpPanel && hoveredItem && (
				<Popover
					className="block-editor-inserter__preview-container__popover"
					placement="right-start"
					offset={ 16 }
					focusOnMount={ false }
					animate={ false }
				>
					<InserterPreviewPanel item={ hoveredItem } />
				</Popover>
			) }
		</div>
	);
}

export default forwardRef( InserterMenu );
