/**
 * WordPress dependencies
 */
import {
	PanelBody,
	TextControl,
	SelectControl,
	RangeControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Notice,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { debounce } from '@wordpress/compose';
import { useEffect, useState, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import OrderControl from './order-control';
import AuthorControl from './author-control';
import ParentControl from './parent-control';
import { TaxonomyControls } from './taxonomy-controls';
import StickyControl from './sticky-control';
import EnhancedPaginationControl from './enhanced-pagination-control';
import CreateNewPostLink from './create-new-post-link';
import { unlock } from '../../../lock-unlock';
import {
	usePostTypes,
	useIsPostTypeHierarchical,
	useAllowedControls,
	isControlAllowed,
	useTaxonomies,
} from '../../utils';
import { useToolsPanelDropdownMenuProps } from '../../../utils/hooks';

const { BlockInfo } = unlock( blockEditorPrivateApis );

export default function QueryInspectorControls( props ) {
	const { attributes, setQuery, setDisplayLayout, setAttributes, clientId } =
		props;
	const { query, displayLayout, enhancedPagination } = attributes;
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
	const taxonomies = useTaxonomies( postType );
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
	const showInheritControl = isControlAllowed( allowedControls, 'inherit' );
	const showPostTypeControl =
		! inherit && isControlAllowed( allowedControls, 'postType' );
	const postTypeControlLabel = __( 'Content type' );
	const postTypeControlHelp = __(
		'WordPress contains different types of content you can filter by. Posts and pages are the default types, but plugins could add more.'
	);
	const showColumnsControl = false;
	const showOrderControl =
		! inherit && isControlAllowed( allowedControls, 'order' );
	const showStickyControl =
		! inherit &&
		showSticky &&
		isControlAllowed( allowedControls, 'sticky' );
	const showSettingsPanel =
		showInheritControl ||
		showPostTypeControl ||
		showColumnsControl ||
		showOrderControl ||
		showStickyControl;
	const showTaxControl =
		!! taxonomies?.length &&
		isControlAllowed( allowedControls, 'taxQuery' );
	const showAuthorControl = isControlAllowed( allowedControls, 'author' );
	const showSearchControl = isControlAllowed( allowedControls, 'search' );
	const showParentControl =
		isControlAllowed( allowedControls, 'parents' ) &&
		isPostTypeHierarchical;

	const showFiltersPanel =
		showTaxControl ||
		showAuthorControl ||
		showSearchControl ||
		showParentControl;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	return (
		<>
			{ !! postType && (
				<BlockInfo>
					<CreateNewPostLink postType={ postType } />
				</BlockInfo>
			) }
			{ showSettingsPanel && (
				<PanelBody title={ __( 'Settings' ) }>
					{ showInheritControl && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Inherit query from template' ) }
							help={ __(
								'Enable to use the global query context that is set with the current template, such as an archive or search. Disable to customize the settings independently.'
							) }
							checked={ !! inherit }
							onChange={ ( value ) =>
								setQuery( { inherit: !! value } )
							}
						/>
					) }
					{ showPostTypeControl &&
						( postTypesSelectOptions.length > 2 ? (
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								options={ postTypesSelectOptions }
								value={ postType }
								label={ postTypeControlLabel }
								onChange={ onPostTypeChange }
								help={ postTypeControlHelp }
							/>
						) : (
							<ToggleGroupControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								isBlock
								value={ postType }
								label={ postTypeControlLabel }
								onChange={ onPostTypeChange }
								help={ postTypeControlHelp }
							>
								{ postTypesSelectOptions.map( ( option ) => (
									<ToggleGroupControlOption
										key={ option.value }
										value={ option.value }
										label={ option.label }
									/>
								) ) }
							</ToggleGroupControl>
						) ) }

					{ showColumnsControl && (
						<>
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Columns' ) }
								value={ displayLayout.columns }
								onChange={ ( value ) =>
									setDisplayLayout( {
										columns: value,
									} )
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
					{ showOrderControl && (
						<OrderControl
							{ ...{ order, orderBy } }
							onChange={ setQuery }
						/>
					) }
					{ showStickyControl && (
						<StickyControl
							value={ sticky }
							onChange={ ( value ) =>
								setQuery( { sticky: value } )
							}
						/>
					) }
					<EnhancedPaginationControl
						enhancedPagination={ enhancedPagination }
						setAttributes={ setAttributes }
						clientId={ clientId }
					/>
				</PanelBody>
			) }
			{ ! inherit && showFiltersPanel && (
				<ToolsPanel
					className="block-library-query-toolspanel__filters" // unused but kept for backward compatibility
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
					dropdownMenuProps={ dropdownMenuProps }
				>
					{ showTaxControl && (
						<ToolsPanelItem
							label={ __( 'Taxonomies' ) }
							hasValue={ () =>
								Object.values( taxQuery || {} ).some(
									( terms ) => !! terms.length
								)
							}
							onDeselect={ () => setQuery( { taxQuery: null } ) }
						>
							<TaxonomyControls
								onChange={ setQuery }
								query={ query }
							/>
						</ToolsPanelItem>
					) }
					{ showAuthorControl && (
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
					{ showSearchControl && (
						<ToolsPanelItem
							hasValue={ () => !! querySearch }
							label={ __( 'Keyword' ) }
							onDeselect={ () => setQuerySearch( '' ) }
						>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Keyword' ) }
								value={ querySearch }
								onChange={ setQuerySearch }
							/>
						</ToolsPanelItem>
					) }
					{ showParentControl && (
						<ToolsPanelItem
							hasValue={ () => !! parents?.length }
							label={ __( 'Parents' ) }
							onDeselect={ () => setQuery( { parents: [] } ) }
						>
							<ParentControl
								parents={ parents }
								postType={ postType }
								onChange={ setQuery }
							/>
						</ToolsPanelItem>
					) }
				</ToolsPanel>
			) }
		</>
	);
}
