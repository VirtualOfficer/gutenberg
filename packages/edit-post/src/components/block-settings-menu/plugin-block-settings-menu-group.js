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

const { Fill: PluginBlockSettingsMenuGroup, Slot } = createSlotFill( 'PluginBlockSettingsMenuGroup' );

const PluginBlockSettingsMenuGroupSlot = ( { fillProps, selectedBlocks } ) => {
	if ( !! selectedBlocks ) {
		return null;
	}
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

PluginBlockSettingsMenuGroup.Slot = withSelect( ( select, { fillProps: { clientIds } } ) => ( {
	selectedBlocks: select( 'core/editor' ).getBlocksByClientId( clientIds ),
} ) )( PluginBlockSettingsMenuGroupSlot );

export default PluginBlockSettingsMenuGroup;
