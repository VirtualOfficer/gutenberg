/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { BlockQuotation } from '@wordpress/components';
import { useDispatch, useSelect, useRegistry } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { Platform, useEffect } from '@wordpress/element';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import { migrateToQuoteV2 } from './deprecated';

const isWebPlatform = Platform.OS === 'web';
const TEMPLATE = [ [ 'core/paragraph', {} ] ];

/**
 * At the moment, deprecations don't handle create blocks from attributes
 * (like when using CPT templates). For this reason, this hook is necessary
 * to avoid breaking templates using the old quote block format.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} clientId   Block client ID.
 */
const useMigrateOnLoad = ( attributes, clientId ) => {
	const registry = useRegistry();
	const { updateBlockAttributes, replaceInnerBlocks } = useDispatch(
		blockEditorStore
	);
	useEffect( () => {
		// As soon as the block is loaded, migrate it to the new version.

		if ( ! attributes.value ) {
			// No need to migrate if it doesn't have the value attribute.
			return;
		}

		const [ newAttributes, newInnerBlocks ] = migrateToQuoteV2(
			attributes
		);

		deprecated( 'Value attribute on the quote block', {
			since: '6.0', // WP version
			version: '6.5',
			alternative: 'inner blocks',
		} );

		registry.batch( () => {
			updateBlockAttributes( clientId, newAttributes );
			replaceInnerBlocks( clientId, newInnerBlocks );
		} );
	}, [ attributes.value ] );
};

export default function QuoteEdit( {
	attributes,
	setAttributes,
	isSelected,
	insertBlocksAfter,
	clientId,
} ) {
	const { citation } = attributes;

	useMigrateOnLoad( attributes, clientId );

	const isAncestorOfSelectedBlock = useSelect( ( select ) =>
		select( blockEditorStore ).hasSelectedInnerBlock( clientId )
	);
	const hasSelection = isSelected || isAncestorOfSelectedBlock;

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateInsertUpdatesSelection: true,
	} );

	return (
		<>
			<BlockQuotation { ...innerBlocksProps }>
				{ innerBlocksProps.children }
				{ ( ! RichText.isEmpty( citation ) || hasSelection ) && (
					<RichText
						identifier="citation"
						tagName={ isWebPlatform ? 'cite' : undefined }
						style={ { display: 'block' } }
						value={ citation }
						onChange={ ( nextCitation ) => {
							setAttributes( {
								citation: nextCitation,
							} );
						} }
						__unstableMobileNoFocusOnMount
						aria-label={ __( 'Quote citation' ) }
						placeholder={
							// translators: placeholder text used for the
							// citation
							__( 'Add citation' )
						}
						className="wp-block-quote__citation"
						__unstableOnSplitAtEnd={ () =>
							insertBlocksAfter( createBlock( 'core/paragraph' ) )
						}
					/>
				) }
			</BlockQuotation>
		</>
	);
}
