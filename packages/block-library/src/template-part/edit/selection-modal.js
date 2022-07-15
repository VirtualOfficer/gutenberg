/**
 * WordPress dependencies
 */
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';
import { parse } from '@wordpress/blocks';
import { useAsyncList } from '@wordpress/compose';
import {
	__experimentalBlockPatternsList as BlockPatternsList,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	SearchControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	useAlternativeBlockPatterns,
	useAlternativeTemplateParts,
	useCreateTemplatePartFromBlocks,
} from './utils/hooks';
import { createTemplatePartId } from './utils/create-template-part-id';
import { searchItems } from './utils/search';

export default function TemplatePartSelectionModal( {
	setAttributes,
	onClose,
	templatePartId = null,
	area,
	clientId,
} ) {
	const [ searchValue, setSearchValue ] = useState( '' );

	// When the templatePartId is undefined,
	// it means the user is creating a new one from the placeholder.
	const isReplacingTemplatePartContent = !! templatePartId;
	const { templateParts } = useAlternativeTemplateParts(
		area,
		templatePartId
	);
	// We can map template parts to block patters to reuse the BlockPatternsList UI
	const filteredTemplateParts = useMemo( () => {
		const partsAsPatterns = templateParts.map( ( templatePart ) => ( {
			name: createTemplatePartId( templatePart.theme, templatePart.slug ),
			title: templatePart.title.rendered,
			blocks: parse( templatePart.content.raw ),
			templatePart,
		} ) );

		return searchItems( partsAsPatterns, searchValue );
	}, [ templateParts, searchValue ] );
	const shownTemplateParts = useAsyncList( filteredTemplateParts );
	const blockPatterns = useAlternativeBlockPatterns( area, clientId );
	const filteredBlockPatterns = useMemo( () => {
		return searchItems( blockPatterns, searchValue );
	}, [ blockPatterns, searchValue ] );
	const shownBlockPatterns = useAsyncList( filteredBlockPatterns );

	const { createSuccessNotice } = useDispatch( noticesStore );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	const onTemplatePartSelect = useCallback( ( templatePart ) => {
		setAttributes( {
			slug: templatePart.slug,
			theme: templatePart.theme,
			area: undefined,
		} );
		createSuccessNotice(
			sprintf(
				/* translators: %s: template part title. */
				__( 'Template Part "%s" inserted.' ),
				templatePart.title?.rendered || templatePart.slug
			),
			{
				type: 'snackbar',
			}
		);
		onClose();
	}, [] );

	const createFromBlocks = useCreateTemplatePartFromBlocks(
		area,
		setAttributes
	);

	return (
		<div className="block-library-template-part__selection-content">
			<div className="block-library-template-part__selection-search">
				<SearchControl
					onChange={ setSearchValue }
					value={ searchValue }
					label={ __( 'Search for replacements' ) }
					placeholder={ __( 'Search' ) }
				/>
			</div>
			{ !! filteredTemplateParts.length && (
				<div>
					<h2>{ __( 'Existing template parts' ) }</h2>
					<BlockPatternsList
						blockPatterns={ filteredTemplateParts }
						shownPatterns={ shownTemplateParts }
						onClickPattern={ ( pattern ) => {
							onTemplatePartSelect( pattern.templatePart );
						} }
					/>
				</div>
			) }

			{ !! filteredBlockPatterns.length && (
				<div>
					<h2>{ __( 'Patterns' ) }</h2>
					<BlockPatternsList
						blockPatterns={ filteredBlockPatterns }
						shownPatterns={ shownBlockPatterns }
						onClickPattern={ ( pattern, blocks ) => {
							if ( isReplacingTemplatePartContent ) {
								replaceInnerBlocks( clientId, blocks );
							} else {
								createFromBlocks( blocks, pattern.title );
							}

							onClose();
						} }
					/>
				</div>
			) }

			{ ! filteredTemplateParts.length &&
				! filteredBlockPatterns.length && (
					<HStack alignment="center">
						<p>{ __( 'No results found.' ) }</p>
					</HStack>
				) }
		</div>
	);
}
