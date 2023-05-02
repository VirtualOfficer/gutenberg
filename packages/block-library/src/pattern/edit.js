/**
 * WordPress dependencies
 */
import { cloneBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

const PatternEdit = ( { attributes, clientId, setAttributes } ) => {
	const { forcedAlignment, slug, syncStatus } = attributes;
	const [ syncNoticeDisplayed, setSyncNoticeDisplayed ] = useState( false );

	const { createSuccessNotice } = useDispatch( noticesStore );
	const { selectedPattern, innerBlocks } = useSelect(
		( select ) => {
			return {
				selectedPattern:
					select( blockEditorStore ).__experimentalGetParsedPattern(
						slug
					),
				innerBlocks:
					select( blockEditorStore ).getBlock( clientId )
						?.innerBlocks,
			};
		},
		[ slug, clientId ]
	);

	const innerBlocksUpdated = useSelect(
		( select ) => {
			return select( blockEditorStore ).getBlock( clientId );
		},
		[ clientId ]
	);

	useEffect( () => {
		if ( syncStatus === 'synced' && ! syncNoticeDisplayed ) {
			createSuccessNotice(
				__(
					'You need to Desync this pattern for your changes to be saved.'
				),
				{ id: 'pattern-desync-notice', type: 'snackbar' }
			);
			setSyncNoticeDisplayed( true );
		}
	}, [
		createSuccessNotice,
		innerBlocksUpdated,
		syncNoticeDisplayed,
		syncStatus,
	] );

	const { replaceInnerBlocks, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );

	// Run this effect when the component loads.
	// This adds the Pattern's contents to the post.
	// This change won't be saved.
	// It will continue to pull from the pattern file unless changes are made to its respective template part.
	useEffect( () => {
		if ( selectedPattern?.blocks && ! innerBlocks?.length ) {
			// We batch updates to block list settings to avoid triggering cascading renders
			// for each container block included in a tree and optimize initial render.
			// Since the above uses microtasks, we need to use a microtask here as well,
			// because nested pattern blocks cannot be inserted if the parent block supports
			// inner blocks but doesn't have blockSettings in the state.
			window.queueMicrotask( () => {
				__unstableMarkNextChangeAsNotPersistent();
				replaceInnerBlocks(
					clientId,
					selectedPattern.blocks.map( ( block ) =>
						cloneBlock( block )
					)
				);
			} );
		}
	}, [
		clientId,
		selectedPattern?.blocks,
		replaceInnerBlocks,
		__unstableMarkNextChangeAsNotPersistent,
		innerBlocks,
	] );

	const blockProps = useBlockProps( {
		className: forcedAlignment && `align${ forcedAlignment }`,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {} );

	const handleSync = () => {
		if ( syncStatus === 'synced' ) {
			setAttributes( { syncStatus: 'unsynced' } );
		} else {
			setAttributes( { syncStatus: 'synced' } );
			replaceInnerBlocks(
				clientId,
				selectedPattern.blocks.map( ( block ) => cloneBlock( block ) )
			);
		}
	};

	return (
		<>
			<div { ...innerBlocksProps } data-pattern-slug={ slug } />
			<BlockControls group="other">
				<ToolbarButton onClick={ handleSync }>
					{ syncStatus === 'unsynced'
						? __( 'Sync' )
						: __( 'Desync' ) }
				</ToolbarButton>
			</BlockControls>
		</>
	);
};

export default PatternEdit;
