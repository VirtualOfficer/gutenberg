/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	BlockToolbar,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { Button, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { next, previous } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';

function CollapsableBlockToolbar( { isCollapsed, onToggle } ) {
	const { blockSelectionStart } = useSelect( ( select ) => {
		return {
			blockSelectionStart:
				select( blockEditorStore ).getBlockSelectionStart(),
		};
	}, [] );

	const hasBlockSelection = !! blockSelectionStart;

	useEffect( () => {
		// If we have a new block selection, show the block tools
		if ( blockSelectionStart ) {
			onToggle( false );
		}
	}, [ blockSelectionStart, onToggle ] );

	return (
		<>
			<div
				className={ clsx( 'editor-collapsible-block-toolbar', {
					'is-collapsed': isCollapsed || ! hasBlockSelection,
				} ) }
			>
				<BlockToolbar hideDragHandle />
			</div>
			<Popover.Slot name="block-toolbar" />

			<Button
				className="editor-collapsible-block-toolbar__toggle"
				icon={ isCollapsed ? next : previous }
				onClick={ () => {
					onToggle( ! isCollapsed );
				} }
				label={
					isCollapsed
						? __( 'Show block tools' )
						: __( 'Hide block tools' )
				}
				size="compact"
			/>
		</>
	);
}

export default CollapsableBlockToolbar;
