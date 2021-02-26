/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';
import {
	__experimentalToolbarContext as ToolbarContext,
	createSlotFill,
	ToolbarGroup,
	__experimentalUseSlot as useSlot,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import useDisplayBlockControls from '../use-display-block-controls';

const BlockControlsDefault = createSlotFill( 'BlockControls' );
const BlockControlsBlock = createSlotFill( 'BlockControlsBlock' );
const BlockControlsInline = createSlotFill( 'BlockFormatControls' );
const BlockControlsOther = createSlotFill( 'BlockControlsOther' );

const groups = {
	default: BlockControlsDefault,
	block: BlockControlsBlock,
	inline: BlockControlsInline,
	other: BlockControlsOther,
};

const slotNames = {
	default: 'BlockControls',
	block: 'BlockControlsBlock',
	inline: 'BlockFormatControls',
	other: 'BlockControlsOther',
};

function BlockControlsSlot( { group = 'default', ...props } ) {
	const accessibleToolbarState = useContext( ToolbarContext );
	const Slot = groups[ group ].Slot;
	const slot = useSlot( slotNames[ group ] );
	const hasFills = Boolean( slot.fills && slot.fills.length );

	if ( ! hasFills ) {
		return null;
	}

	if ( group === 'default' ) {
		return (
			<Slot
				{ ...props }
				bubblesVirtually
				fillProps={ accessibleToolbarState }
			/>
		);
	}

	return (
		<ToolbarGroup>
			<Slot
				{ ...props }
				bubblesVirtually
				fillProps={ accessibleToolbarState }
			/>
		</ToolbarGroup>
	);
}

function BlockControlsFill( { group = 'default', controls, children } ) {
	if ( ! useDisplayBlockControls() ) {
		return null;
	}
	const Fill = groups[ group ].Fill;

	return (
		<Fill>
			{ ( fillProps ) => {
				// Children passed to BlockControlsFill will not have access to any
				// React Context whose Provider is part of the BlockControlsSlot tree.
				// So we re-create the Provider in this subtree.
				const value = ! isEmpty( fillProps ) ? fillProps : null;
				return (
					<ToolbarContext.Provider value={ value }>
						{ group === 'default' && (
							<ToolbarGroup controls={ controls } />
						) }
						{ children }
					</ToolbarContext.Provider>
				);
			} }
		</Fill>
	);
}

const BlockControls = BlockControlsFill;

BlockControls.Slot = BlockControlsSlot;

// This is just here for backward compatibility
export const BlockFormatControls = ( props ) => {
	return <BlockControlsFill group="inline" { ...props } />;
};
BlockFormatControls.Slot = ( props ) => {
	return <BlockControlsSlot group="inline" { ...props } />;
};

export default BlockControls;
