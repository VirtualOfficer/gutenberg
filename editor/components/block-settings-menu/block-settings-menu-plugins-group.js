/**
 * External dependencies
 */
import { isEmpty, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

const { Fill: BlockSettingsMenuPluginsGroup, Slot } = createSlotFill( 'BlockSettingsMenuPluginsGroup' );

const BlockSettingsMenuPluginsGroupSlot = ( { fillProps, selectedBlocks } ) => {
	selectedBlocks = map( selectedBlocks, ( block ) => block.name );
	return (
		<Slot fillProps={ { ...fillProps, selectedBlocks } } >
			{ ( fills ) => ! isEmpty( fills ) && (
				<Fragment>
					<div className="editor-block-settings-menu__separator" />
					{ fills }
				</Fragment>
			) }
		</Slot>
	);
};

BlockSettingsMenuPluginsGroup.Slot = withSelect( ( select, { fillProps: { uids } } ) => ( {
	selectedBlocks: select( 'core/editor' ).getBlocksByUID( uids ),
} ) )( BlockSettingsMenuPluginsGroupSlot );

export default BlockSettingsMenuPluginsGroup;
