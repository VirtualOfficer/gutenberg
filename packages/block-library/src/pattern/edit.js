/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import {
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';

const PatternEdit = ( { attributes, clientId, setAttributes } ) => {
	const { forcedAlignment, slug } = attributes;
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
				replaceInnerBlocks( clientId, selectedPattern.blocks );
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
	return (
		<>
			<div { ...innerBlocksProps } />
			<BlockControls group="other">
				<ToolbarButton
					onClick={ () =>
						setAttributes( { syncStatus: 'unsynced' } )
					}
				>
					Unsync
				</ToolbarButton>
			</BlockControls>
		</>
	);
};

export default PatternEdit;
