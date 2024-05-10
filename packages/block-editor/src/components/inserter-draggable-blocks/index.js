/**
 * WordPress dependencies
 */
import { Draggable } from '@wordpress/components';
import {
	createBlock,
	serialize,
	store as blocksStore,
} from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockDraggableChip from '../block-draggable/draggable-chip';
import { INSERTER_PATTERN_TYPES } from '../inserter/block-patterns-tab/utils';
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

const InserterDraggableBlocks = ( {
	isEnabled,
	blocks,
	icon,
	children,
	pattern,
} ) => {
	const transferData = {
		type: 'inserter',
		blocks,
	};

	const blockTypeIcon = useSelect(
		( select ) => {
			const { getBlockType } = select( blocksStore );
			return (
				blocks.length === 1 && getBlockType( blocks[ 0 ].name )?.icon
			);
		},
		[ blocks ]
	);

	const { startDragging, stopDragging } = unlock(
		useDispatch( blockEditorStore )
	);

	return (
		<Draggable
			__experimentalTransferDataType="wp-blocks"
			transferData={ transferData }
			onDragStart={ ( event ) => {
				startDragging();
				const parsedBlocks =
					pattern?.type === INSERTER_PATTERN_TYPES.user &&
					pattern?.syncStatus !== 'unsynced'
						? [ createBlock( 'core/block', { ref: pattern.id } ) ]
						: blocks;
				event.dataTransfer.setData(
					'text/html',
					serialize( parsedBlocks )
				);
			} }
			onDragEnd={ () => {
				stopDragging();
			} }
			__experimentalDragComponent={
				pattern ? (
					false // Setting dragComponent explicitly to false, so that the browser handles the drag image.
				) : (
					<BlockDraggableChip
						count={ blocks.length }
						icon={ icon || ( ! pattern && blockTypeIcon ) }
						isPattern={ !! pattern }
					/>
				)
			}
		>
			{ ( { onDraggableStart, onDraggableEnd } ) => {
				return children( {
					draggable: isEnabled,
					onDragStart: isEnabled ? onDraggableStart : undefined,
					onDragEnd: isEnabled ? onDraggableEnd : undefined,
				} );
			} }
		</Draggable>
	);
};

export default InserterDraggableBlocks;
