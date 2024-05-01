/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	getBlockType,
	getUnregisteredTypeHandlerName,
	store as blocksStore,
} from '@wordpress/blocks';
import {
	PanelBody,
	__unstableMotion as motion,
	__experimentalUseSlotFills as useSlotFills,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import SkipToSelectedBlock from '../skip-to-selected-block';
import BlockCard from '../block-card';
import MultiSelectionInspector, {
	MultiSelectionControls,
} from '../multi-selection-inspector';
import BlockVariationTransforms from '../block-variation-transforms';
import useBlockDisplayInformation from '../use-block-display-information';
import { store as blockEditorStore } from '../../store';
import BlockStyles from '../block-styles';
import { default as InspectorControls } from '../inspector-controls';
import { default as InspectorControlsTabs } from '../inspector-controls-tabs';
import useInspectorControlsTabs from '../inspector-controls-tabs/use-inspector-controls-tabs';
import AdvancedControls from '../inspector-controls-tabs/advanced-controls-panel';
import PositionControls from '../inspector-controls-tabs/position-controls-panel';
import useBlockInspectorAnimationSettings from './useBlockInspectorAnimationSettings';
import BlockInfo from '../block-info-slot-fill';
import BlockQuickNavigation from '../block-quick-navigation';
import { useBorderPanelLabel } from '../../hooks/border';

function BlockInspectorContentLockedUI( {
	clientId,
	contentLockingParent,
	isContentLockedChild,
	isContentLockedParent,
} ) {
	const contentOnlyFills = useSlotFills( 'InspectorControlsContentOnly' );
	const isChildWithoutContentControls =
		isContentLockedChild && ! contentOnlyFills?.length;

	if ( isChildWithoutContentControls || isContentLockedParent ) {
		const parentClientId = isContentLockedParent
			? clientId
			: contentLockingParent;

		return (
			<BlockInspectorContentLockedParent clientId={ parentClientId } />
		);
	}

	return <BlockInspectorContentLockedChild clientId={ clientId } />;
}

function BlockInspectorContentLockedParent( { clientId } ) {
	const contentClientIds = useSelect(
		( select ) => {
			const {
				getClientIdsOfDescendants,
				getBlockName,
				getBlockEditingMode,
			} = select( blockEditorStore );
			return getClientIdsOfDescendants( clientId ).filter(
				( innerClientId ) =>
					getBlockName( innerClientId ) !== 'core/list-item' &&
					getBlockEditingMode( innerClientId ) === 'contentOnly'
			);
		},
		[ clientId ]
	);
	const blockInformation = useBlockDisplayInformation( clientId );
	const contentClientIdsWithControls = useSelect(
		( select ) =>
			unlock( select( blockEditorStore ) ).getContentOnlyControlsBlocks(),
		[]
	);
	return (
		<div className="block-editor-block-inspector">
			<BlockCard
				{ ...blockInformation }
				className={ blockInformation.isSynced && 'is-synced' }
			/>
			<BlockVariationTransforms blockClientId={ clientId } />
			<BlockInfo.Slot />
			{ contentClientIds.length > 0 && (
				<PanelBody title={ __( 'Content' ) }>
					<BlockQuickNavigation
						clientIds={ contentClientIds }
						clientIdsWithControls={ contentClientIdsWithControls }
					/>
				</PanelBody>
			) }
		</div>
	);
}

function BlockInspectorContentLockedChild( { clientId } ) {
	const blockInformation = useBlockDisplayInformation( clientId );
	return (
		<div className="block-editor-block-inspector">
			<BlockCard
				{ ...blockInformation }
				className={ blockInformation.isSynced && 'is-synced' }
			/>
			<BlockVariationTransforms blockClientId={ clientId } />
			<BlockInfo.Slot />
			<InspectorControls.Slot group="contentOnly" />
		</div>
	);
}

const BlockInspector = ( { showNoBlockSelectedMessage = true } ) => {
	const {
		count,
		selectedBlockName,
		selectedBlockClientId,
		blockType,
		isContentLockedParent,
		isContentLockedChild,
		contentLockingParent,
	} = useSelect( ( select ) => {
		const {
			getSelectedBlockClientIds,
			getSelectedBlockCount,
			getBlockName,
			getTemplateLock,
			getContentLockingParent,
		} = unlock( select( blockEditorStore ) );

		const _selectedBlockClientId = getSelectedBlockClientIds()?.[ 0 ];
		const _selectedBlockName =
			_selectedBlockClientId && getBlockName( _selectedBlockClientId );
		const _blockType =
			_selectedBlockName && getBlockType( _selectedBlockName );
		const _contentLockingParent = getContentLockingParent(
			_selectedBlockClientId
		);

		return {
			count: getSelectedBlockCount(),
			selectedBlockClientId: _selectedBlockClientId,
			selectedBlockName: _selectedBlockName,
			blockType: _blockType,
			isContentLockedParent:
				getTemplateLock( _selectedBlockClientId ) === 'contentOnly' ||
				_selectedBlockName === 'core/block',
			isContentLockedChild: !! _contentLockingParent,
			contentLockingParent: _contentLockingParent,
		};
	}, [] );

	// The block inspector animation settings will be completely
	// removed in the future to create an API which allows the block
	// inspector to transition between what it
	// displays based on the relationship between the selected block
	// and its parent, and only enable it if the parent is controlling
	// its children blocks.
	const blockInspectorAnimationSettings = useBlockInspectorAnimationSettings(
		blockType,
		selectedBlockClientId
	);

	if ( count > 1 ) {
		return (
			<div className="block-editor-block-inspector">
				<MultiSelectionInspector />
				{ ! isContentLockedChild && (
					<MultiSelectionControls
						blockType={ blockType }
						blockName={ selectedBlockName }
					/>
				) }
			</div>
		);
	}

	const isSelectedBlockUnregistered =
		selectedBlockName === getUnregisteredTypeHandlerName();

	/*
	 * If the selected block is of an unregistered type, avoid showing it as an actual selection
	 * because we want the user to focus on the unregistered block warning, not block settings.
	 */
	if (
		! blockType ||
		! selectedBlockClientId ||
		isSelectedBlockUnregistered
	) {
		if ( showNoBlockSelectedMessage ) {
			return (
				<span className="block-editor-block-inspector__no-blocks">
					{ __( 'No block selected.' ) }
				</span>
			);
		}
		return null;
	}

	if ( isContentLockedChild || isContentLockedParent ) {
		return (
			<BlockInspectorContentLockedUI
				clientId={ selectedBlockClientId }
				contentLockingParent={ contentLockingParent }
				isContentLockedParent={ isContentLockedParent }
				isContentLockedChild={ isContentLockedChild }
			/>
		);
	}

	return (
		<BlockInspectorSingleBlockWrapper
			animate={ blockInspectorAnimationSettings }
			wrapper={ ( children ) => (
				<AnimatedContainer
					blockInspectorAnimationSettings={
						blockInspectorAnimationSettings
					}
					selectedBlockClientId={ selectedBlockClientId }
				>
					{ children }
				</AnimatedContainer>
			) }
		>
			<BlockInspectorSingleBlock
				clientId={ selectedBlockClientId }
				blockName={ blockType.name }
			/>
		</BlockInspectorSingleBlockWrapper>
	);
};

const BlockInspectorSingleBlockWrapper = ( { animate, wrapper, children } ) => {
	return animate ? wrapper( children ) : children;
};

const AnimatedContainer = ( {
	blockInspectorAnimationSettings,
	selectedBlockClientId,
	children,
} ) => {
	const animationOrigin =
		blockInspectorAnimationSettings &&
		blockInspectorAnimationSettings.enterDirection === 'leftToRight'
			? -50
			: 50;

	return (
		<motion.div
			animate={ {
				x: 0,
				opacity: 1,
				transition: {
					ease: 'easeInOut',
					duration: 0.14,
				},
			} }
			initial={ {
				x: animationOrigin,
				opacity: 0,
			} }
			key={ selectedBlockClientId }
		>
			{ children }
		</motion.div>
	);
};

const BlockInspectorSingleBlock = ( { clientId, blockName } ) => {
	const availableTabs = useInspectorControlsTabs( blockName );
	const showTabs = availableTabs?.length > 1;

	const hasBlockStyles = useSelect(
		( select ) => {
			const { getBlockStyles } = select( blocksStore );
			const blockStyles = getBlockStyles( blockName );
			return blockStyles && blockStyles.length > 0;
		},
		[ blockName ]
	);
	const blockInformation = useBlockDisplayInformation( clientId );
	const borderPanelLabel = useBorderPanelLabel( { blockName } );

	return (
		<div className="block-editor-block-inspector">
			<BlockCard
				{ ...blockInformation }
				className={ blockInformation.isSynced && 'is-synced' }
			/>
			<BlockVariationTransforms blockClientId={ clientId } />
			<BlockInfo.Slot />
			{ showTabs && (
				<InspectorControlsTabs
					hasBlockStyles={ hasBlockStyles }
					clientId={ clientId }
					blockName={ blockName }
					tabs={ availableTabs }
				/>
			) }
			{ ! showTabs && (
				<>
					{ hasBlockStyles && (
						<div>
							<PanelBody title={ __( 'Styles' ) }>
								<BlockStyles clientId={ clientId } />
							</PanelBody>
						</div>
					) }
					<InspectorControls.Slot />
					<InspectorControls.Slot group="list" />
					<InspectorControls.Slot
						group="color"
						label={ __( 'Color' ) }
						className="color-block-support-panel__inner-wrapper"
					/>
					<InspectorControls.Slot
						group="typography"
						label={ __( 'Typography' ) }
					/>
					<InspectorControls.Slot
						group="dimensions"
						label={ __( 'Dimensions' ) }
					/>
					<InspectorControls.Slot
						group="border"
						label={ borderPanelLabel }
					/>
					<InspectorControls.Slot group="styles" />
					<InspectorControls.Slot
						group="background"
						label={ __( 'Background image' ) }
					/>
					<PositionControls />
					<div>
						<AdvancedControls />
					</div>
				</>
			) }
			<SkipToSelectedBlock key="back" />
		</div>
	);
};

/**
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-inspector/README.md
 */
export default BlockInspector;
