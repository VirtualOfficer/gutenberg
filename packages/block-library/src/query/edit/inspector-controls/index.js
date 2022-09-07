/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	PanelBody,
	TextControl,
	SelectControl,
	RangeControl,
	ToggleControl,
	Notice,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as blocksStore } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import OrderControl from './order-control';
import AuthorControl from './author-control';
import ParentControl from './parent-control';
import { TaxonomyControls, useTaxonomiesInfo } from './taxonomy-controls';
import StickyControl from './sticky-control';
import { usePostTypes } from '../../utils';
import { name as queryLoopName } from '../../block.json';

const EMPTY_ARRAY = [];

function useIsPostTypeHierarchical( postType ) {
	return useSelect(
		( select ) => {
			const type = select( coreStore ).getPostType( postType );
			return type?.viewable && type?.hierarchical;
		},
		[ postType ]
	);
}

function useAllowedControls( attributes ) {
	return useSelect(
		( select ) =>
			select( blocksStore ).getActiveBlockVariation(
				queryLoopName,
				attributes
			)?.allowControls || EMPTY_ARRAY,

		[ attributes ]
	);
}

function isControllAllowed( allowedControls, key ) {
	// Every controls is allowed if the list is empty or not defined.
	if ( ! allowedControls?.length ) {
		return true;
	}
	return allowedControls.includes( key );
}

export default function QueryInspectorControls( {
	attributes,
	setQuery,
	setDisplayLayout,
} ) {
	const { query, displayLayout } = attributes;
	const {
		order,
		orderBy,
		author: authorIds,
		postType,
		sticky,
		inherit,
		taxQuery,
		parents,
	} = query;
	const allowedControls = useAllowedControls( attributes );
	const [ showSticky, setShowSticky ] = useState( postType === 'post' );
	const { postTypesTaxonomiesMap, postTypesSelectOptions } = usePostTypes();
	const taxonomiesInfo = useTaxonomiesInfo( postType );
	const isPostTypeHierarchical = useIsPostTypeHierarchical( postType );
	useEffect( () => {
		setShowSticky( postType === 'post' );
	}, [ postType ] );
	const onPostTypeChange = ( newValue ) => {
		const updateQuery = { postType: newValue };
		// We need to dynamically update the `taxQuery` property,
		// by removing any not supported taxonomy from the query.
		const supportedTaxonomies = postTypesTaxonomiesMap[ newValue ];
		const updatedTaxQuery = Object.entries( taxQuery || {} ).reduce(
			( accumulator, [ taxonomySlug, terms ] ) => {
				if ( supportedTaxonomies.includes( taxonomySlug ) ) {
					accumulator[ taxonomySlug ] = terms;
				}
				return accumulator;
			},
			{}
		);
		updateQuery.taxQuery = !! Object.keys( updatedTaxQuery ).length
			? updatedTaxQuery
			: undefined;

		if ( newValue !== 'post' ) {
			updateQuery.sticky = '';
		}
		// We need to reset `parents` because they are tied to each post type.
		updateQuery.parents = [];
		setQuery( updateQuery );
	};
	const [ querySearch, setQuerySearch ] = useState( query.search );
	const onChangeDebounced = useCallback(
		debounce( () => {
			if ( query.search !== querySearch ) {
				setQuery( { search: querySearch } );
			}
		}, 250 ),
		[ querySearch, query.search ]
	);
	useEffect( () => {
		onChangeDebounced();
		return onChangeDebounced.cancel;
	}, [ querySearch, onChangeDebounced ] );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<ToggleControl
						label={ __( 'Inherit query from template' ) }
						help={ __(
							'Toggle to use the global query context that is set with the current template, such as an archive or search. Disable to customize the settings independently.'
						) }
						checked={ !! inherit }
						onChange={ ( value ) =>
							setQuery( { inherit: !! value } )
						}
					/>
					{ ! inherit &&
						isControllAllowed( allowedControls, 'postType' ) && (
							<SelectControl
								options={ postTypesSelectOptions }
								value={ postType }
								label={ __( 'Post type' ) }
								onChange={ onPostTypeChange }
								help={ __(
									'WordPress contains different types of content and they are divided into collections called "Post types". By default there are a few different ones such as blog posts and pages, but plugins could add more.'
								) }
							/>
						) }
					{ displayLayout?.type === 'flex' && (
						<>
							<RangeControl
								label={ __( 'Columns' ) }
								value={ displayLayout.columns }
								onChange={ ( value ) =>
									setDisplayLayout( { columns: value } )
								}
								min={ 2 }
								max={ Math.max( 6, displayLayout.columns ) }
							/>
							{ displayLayout.columns > 6 && (
								<Notice
									status="warning"
									isDismissible={ false }
								>
									{ __(
										'This column count exceeds the recommended amount and may cause visual breakage.'
									) }
								</Notice>
							) }
						</>
					) }
					{ ! inherit &&
						isControllAllowed( allowedControls, 'order' ) && (
							<OrderControl
								{ ...{ order, orderBy } }
								onChange={ setQuery }
							/>
						) }
					{ ! inherit &&
						showSticky &&
						isControllAllowed( allowedControls, 'sticky' ) && (
							<StickyControl
								value={ sticky }
								onChange={ ( value ) =>
									setQuery( { sticky: value } )
								}
							/>
						) }
				</PanelBody>
			</InspectorControls>
			{ ! inherit && (
				<InspectorControls>
					<ToolsPanel
						className="block-library-query-toolspanel__filters"
						label={ __( 'Filters' ) }
						resetAll={ () => {
							setQuery( {
								author: '',
								parents: [],
								search: '',
								taxQuery: null,
							} );
							setQuerySearch( '' );
						} }
					>
						{ !! taxonomiesInfo?.length &&
							isControllAllowed(
								allowedControls,
								'taxQuery'
							) && (
								<ToolsPanelItem
									label={ __( 'Taxonomies' ) }
									hasValue={ () =>
										Object.values( taxQuery || {} ).some(
											( terms ) => !! terms.length
										)
									}
									onDeselect={ () =>
										setQuery( { taxQuery: null } )
									}
								>
									<TaxonomyControls
										onChange={ setQuery }
										query={ query }
									/>
								</ToolsPanelItem>
							) }
						{ isControllAllowed( allowedControls, 'author' ) && (
							<ToolsPanelItem
								hasValue={ () => !! authorIds }
								label={ __( 'Authors' ) }
								onDeselect={ () => setQuery( { author: '' } ) }
							>
								<AuthorControl
									value={ authorIds }
									onChange={ setQuery }
								/>
							</ToolsPanelItem>
						) }
						{ isControllAllowed( allowedControls, 'search' ) && (
							<ToolsPanelItem
								hasValue={ () => !! querySearch }
								label={ __( 'Keyword' ) }
								onDeselect={ () => setQuerySearch( '' ) }
							>
								<TextControl
									label={ __( 'Keyword' ) }
									value={ querySearch }
									onChange={ setQuerySearch }
								/>
							</ToolsPanelItem>
						) }
						{ isPostTypeHierarchical &&
							! isControllAllowed(
								allowedControls,
								'parents'
							) && (
								<ToolsPanelItem
									hasValue={ () => !! parents?.length }
									label={ __( 'Parents' ) }
									onDeselect={ () =>
										setQuery( { parents: [] } )
									}
								>
									<ParentControl
										parents={ parents }
										postType={ postType }
										onChange={ setQuery }
									/>
								</ToolsPanelItem>
							) }
					</ToolsPanel>
				</InspectorControls>
			) }
		</>
	);
}
