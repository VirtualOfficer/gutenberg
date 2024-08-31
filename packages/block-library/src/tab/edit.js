/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { cleanForSlug } from '@wordpress/url';

/**
 * Generates a slug from a tab's text label.
 *
 * @param {string} label    Tab label RichText value.
 * @param {number} tabIndex Tab index value.
 *
 * @return {string} The generated slug with HTML stripped out.
 */
function slugFromLabel( label, tabIndex ) {
	// Get just the text content, filtering out any HTML tags from the RichText value.
	const htmlDocument = new window.DOMParser().parseFromString(
		label,
		'text/html'
	);
	if ( htmlDocument.body?.textContent ) {
		return cleanForSlug( htmlDocument.body.textContent );
	}

	// Fall back to using the tab index if the label is empty.
	return 'tab-panel-' + tabIndex;
}

export default function Edit( { attributes, clientId, setAttributes } ) {
	const { anchor, isActive, label, slug, tabIndex } = attributes;
	// Use a custom anchor, if set. Otherwise fall back to the slug generated from the label text.
	const tabPanelId = anchor || slug;
	const tabLabelId = tabPanelId + '--tab';
	const hasChildBlocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockOrder( clientId ).length > 0,
		[ clientId ]
	);

	useEffect( () => {
		if ( label ) {
			setAttributes( { slug: slugFromLabel( label, tabIndex ) } );
		}
	}, [ label, setAttributes, tabIndex ] );

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		renderAppender: hasChildBlocks
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	} );
	return (
		<div
			{ ...innerBlocksProps }
			aria-labelledby={ tabLabelId }
			hidden={ ! isActive }
			id={ tabPanelId }
			role="tabpanel"
		/>
	);
}
