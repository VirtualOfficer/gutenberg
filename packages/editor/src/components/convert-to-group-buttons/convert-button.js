/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { MenuItem } from '@wordpress/components';
import { _x } from '@wordpress/i18n';
import { switchToBlockType } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { displayShortcut } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { Group, UnGroup } from './icons';

export function ConvertToGroupButton( {
	onConvertToGroup,
	onConvertFromGroup,
	isGroupable = false,
	isUnGroupable = false,
} ) {
	return (
		<Fragment>
			{ isGroupable && (
				<MenuItem
					className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
					icon={ Group }
					onClick={ onConvertToGroup }
					shortcut={ displayShortcut.primaryAlt( 'g' ) }
				>
					{ _x( 'Group', 'Grouping a selection of blocks together within the Editor' ) }
				</MenuItem>
			) }
			{ isUnGroupable && (
				<MenuItem
					className="editor-block-settings-menu__control block-editor-block-settings-menu__control"
					icon={ UnGroup }
					onClick={ onConvertFromGroup }
					shortcut={ displayShortcut.secondary( 'g' ) }
				>
					{ _x( 'Ungroup', 'Ungrouping blocks from within a Group block back into individual blocks within the Editor ' ) }
				</MenuItem>
			) }
		</Fragment>
	);
}

export default compose( [
	withSelect( ( select, { clientIds } ) => {
		const {
			getBlocksByClientId,
			canInsertBlockType,
		} = select( 'core/block-editor' );

		const containerBlockAvailable = canInsertBlockType( 'core/group' );

		const blocksSelection = getBlocksByClientId( clientIds );

		const isSingleContainerBlock = blocksSelection.length === 1 && blocksSelection[ 0 ] && blocksSelection[ 0 ].name === 'core/group';

		// Do we have
		// 1. Container block available to be inserted?
		// 2. One or more blocks selected
		// (we allow single Blocks to become groups unless
		// they are a soltiary group block themselves)
		const isGroupable = (
			containerBlockAvailable &&
			blocksSelection.length &&
			! isSingleContainerBlock
		);

		// Do we have a single Group Block selected?
		const isUnGroupable = isSingleContainerBlock;

		return {
			isGroupable,
			isUnGroupable,
			blocksSelection,
		};
	} ),
	withDispatch( ( dispatch, { clientIds, onToggle = noop, blocksSelection = [] } ) => {
		const {
			replaceBlocks,
		} = dispatch( 'core/block-editor' );

		return {
			onConvertToGroup() {
				if ( ! blocksSelection.length ) {
					return;
				}

				// Activate the `transform` on `core/group` which does the conversion
				const newBlocks = switchToBlockType( blocksSelection, 'core/group' );

				if ( newBlocks ) {
					replaceBlocks(
						clientIds,
						newBlocks
					);
				}

				onToggle();
			},
			onConvertFromGroup() {
				if ( ! blocksSelection.length ) {
					return;
				}

				const innerBlocks = blocksSelection[ 0 ].innerBlocks;

				if ( ! innerBlocks.length ) {
					return;
				}

				replaceBlocks(
					clientIds,
					innerBlocks
				);

				onToggle();
			},
		};
	} ),
] )( ConvertToGroupButton );
