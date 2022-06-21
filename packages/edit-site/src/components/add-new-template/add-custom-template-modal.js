/**
 * WordPress dependencies
 */
import { useState, useMemo, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	Flex,
	FlexItem,
	Modal,
	SearchControl,
	TextHighlight,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useDebounce } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { mapToIHasNameAndId } from './utils';

const EMPTY_ARRAY = [];
const BASE_QUERY = {
	order: 'asc',
	_fields: 'id,title,slug,link',
	context: 'view',
};

function SuggestionListItem( {
	suggestion,
	search,
	onSelect,
	entityForSuggestions,
	composite,
} ) {
	const baseCssClass =
		'edit-site-custom-template-modal__suggestions_list__list-item';
	return (
		<CompositeItem
			role="option"
			as={ Button }
			{ ...composite }
			className={ baseCssClass }
			onClick={ () => {
				const title = `${ entityForSuggestions.labels.singular }: ${ suggestion.name }`;
				onSelect( {
					title,
					description: `Template for ${ title }`,
					slug: `single-${ entityForSuggestions.slug }-${ suggestion.slug }`,
				} );
			} }
		>
			<span className={ `${ baseCssClass }__title` }>
				<TextHighlight text={ suggestion.name } highlight={ search } />
			</span>
			{ suggestion.link && (
				<span className={ `${ baseCssClass }__info` }>
					{ suggestion.link }
				</span>
			) }
		</CompositeItem>
	);
}

function SuggestionList( { entityForSuggestions, onSelect } ) {
	const composite = useCompositeState( { orientation: 'vertical' } );
	const [ suggestions, setSuggestions ] = useState( EMPTY_ARRAY );
	// We need to track two values, the search input's value(searchInputValue)
	// and the one we want to debounce(search) and make REST API requests.
	const [ searchInputValue, setSearchInputValue ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const debouncedSearch = useDebounce( setSearch, 250 );
	const { searchResults, searchHasResolved } = useSelect(
		( select ) => {
			const { getEntityRecords, hasFinishedResolution } = select(
				coreStore
			);
			const selectorArgs = [
				entityForSuggestions.type,
				entityForSuggestions.slug,
				{
					...BASE_QUERY,
					search,
					orderby: !! search ? 'relevance' : 'modified',
					exclude: entityForSuggestions.postsToExclude,
					per_page: !! search ? 20 : 10,
				},
			];
			return {
				searchResults: getEntityRecords( ...selectorArgs ),
				searchHasResolved: hasFinishedResolution(
					'getEntityRecords',
					selectorArgs
				),
			};
		},
		[ search ]
	);
	useEffect( () => {
		if ( search !== searchInputValue ) {
			debouncedSearch( searchInputValue );
		}
	}, [ search, searchInputValue ] );
	const entitiesInfo = useMemo( () => {
		if ( ! searchResults?.length ) return EMPTY_ARRAY;
		return mapToIHasNameAndId( searchResults, 'title.rendered' );
	}, [ searchResults ] );
	// Update suggestions only when the query has resolved.
	useEffect( () => {
		if ( ! searchHasResolved ) return;
		setSuggestions( entitiesInfo );
	}, [ entitiesInfo, searchHasResolved ] );
	return (
		<>
			<SearchControl
				onChange={ setSearchInputValue }
				value={ searchInputValue }
				label={ __( 'Search' ) }
				placeholder={ __( 'Search' ) }
			/>
			{ !! suggestions?.length && (
				<Composite
					{ ...composite }
					role="listbox"
					className="edit-site-custom-template-modal__suggestions_list"
				>
					{ suggestions.map( ( suggestion ) => (
						<SuggestionListItem
							key={ suggestion.slug }
							suggestion={ suggestion }
							search={ search }
							onSelect={ onSelect }
							entityForSuggestions={ entityForSuggestions }
							composite={ composite }
						/>
					) ) }
				</Composite>
			) }
			{ !! search && ! suggestions?.length && (
				<p className="edit-site-custom-template-modal__no-results">
					{ __( 'No results were found.' ) }
				</p>
			) }
		</>
	);
}

function AddCustomTemplateModal( { onClose, onSelect, entityForSuggestions } ) {
	const [ showSearchEntities, setShowSearchEntities ] = useState(
		entityForSuggestions.hasGeneralTemplate
	);
	const baseCssClass = 'edit-site-custom-template-modal';
	return (
		<Modal
			title={ sprintf(
				// translators: %s: Name of the post type e.g: "Post".
				__( 'Add %s template' ),
				entityForSuggestions.labels.singular
			) }
			className={ baseCssClass }
			closeLabel={ __( 'Close' ) }
			onRequestClose={ onClose }
		>
			{ ! showSearchEntities && (
				<>
					<p>
						{ __(
							'What type of template would you like to create?'
						) }
					</p>
					<Flex
						className={ `${ baseCssClass }__contents` }
						gap="4"
						align="initial"
					>
						<FlexItem
							isBlock
							onClick={ () =>
								onSelect( {
									slug: entityForSuggestions.template.slug,
									title: entityForSuggestions.template.title,
									description:
										entityForSuggestions.template
											.description,
								} )
							}
						>
							<Heading level={ 5 }>{ __( 'General' ) }</Heading>
							<Text as="span">
								{ sprintf(
									// translators: %s: Name of the post type in plural e.g: "Posts".
									__( 'Design a template for all %s.' ),
									entityForSuggestions.labels.plural
								) }
							</Text>
						</FlexItem>
						<FlexItem
							isBlock
							onClick={ () => {
								setShowSearchEntities( true );
							} }
						>
							<Heading level={ 5 }>{ __( 'Specific' ) }</Heading>
							<Text as="span">
								{ sprintf(
									// translators: %s: Name of the post type e.g: "Post".
									__(
										'Design a template for a specific %s.'
									),
									entityForSuggestions.labels.singular
								) }
							</Text>
						</FlexItem>
					</Flex>
				</>
			) }
			{ showSearchEntities && (
				<>
					<p>
						{ sprintf(
							// translators: %s: Name of the post type e.g: "Post".
							__(
								'Select the %s you would like to design a template for.'
							),
							entityForSuggestions.labels.singular
						) }
					</p>
					<SuggestionList
						entityForSuggestions={ entityForSuggestions }
						onSelect={ onSelect }
					/>
				</>
			) }
		</Modal>
	);
}

export default AddCustomTemplateModal;
