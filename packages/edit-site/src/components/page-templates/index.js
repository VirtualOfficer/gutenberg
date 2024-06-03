/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	VisuallyHidden,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useCallback, useEffect } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { parse } from '@wordpress/blocks';
import {
	BlockPreview,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { Async } from '../async';
import Page from '../page';
import { default as Link, useLink } from '../routes/link';
import AddNewTemplate from '../add-new-template';
import { useAddedBy } from './hooks';
import {
	TEMPLATE_POST_TYPE,
	OPERATOR_IS_ANY,
	OPERATOR_IS,
	LAYOUT_GRID,
	LAYOUT_TABLE,
	LAYOUT_LIST,
} from '../../utils/constants';

import usePatternSettings from '../page-patterns/use-pattern-settings';
import { unlock } from '../../lock-unlock';
import { useEditPostAction } from '../dataviews-actions';

const { usePostActions } = unlock( editorPrivateApis );

const { ExperimentalBlockEditorProvider, useGlobalStyle } = unlock(
	blockEditorPrivateApis
);
const { useHistory, useLocation } = unlock( routerPrivateApis );

const EMPTY_ARRAY = [];

const defaultConfigPerViewType = {
	[ LAYOUT_TABLE ]: {
		primaryField: 'title',
	},
	[ LAYOUT_GRID ]: {
		mediaField: 'preview',
		primaryField: 'title',
		columnFields: [ 'description' ],
	},
	[ LAYOUT_LIST ]: {
		primaryField: 'title',
		mediaField: 'preview',
	},
};

const DEFAULT_VIEW = {
	type: LAYOUT_GRID,
	search: '',
	page: 1,
	perPage: 20,
	sort: {
		field: 'title',
		direction: 'asc',
	},
	// All fields are visible by default, so it's
	// better to keep track of the hidden ones.
	hiddenFields: [ 'preview', 'postTypes', 'isCustom' ],
	layout: defaultConfigPerViewType[ LAYOUT_GRID ],
	filters: [],
};

function Title( { item, viewType } ) {
	if ( viewType === LAYOUT_LIST ) {
		return decodeEntities( item.title?.rendered ) || __( '(no title)' );
	}
	const linkProps = {
		params: {
			postId: item.id,
			postType: item.type,
			canvas: 'edit',
		},
	};
	return (
		<Link { ...linkProps }>
			{ decodeEntities( item.title?.rendered ) || __( '(no title)' ) }
		</Link>
	);
}

function AuthorField( { item, viewType } ) {
	const [ isImageLoaded, setIsImageLoaded ] = useState( false );
	const { text, icon, imageUrl } = useAddedBy( item.type, item.id );
	const withIcon = viewType !== LAYOUT_LIST;

	return (
		<HStack alignment="left" spacing={ 1 }>
			{ withIcon && imageUrl && (
				<div
					className={ clsx( 'page-templates-author-field__avatar', {
						'is-loaded': isImageLoaded,
					} ) }
				>
					<img
						onLoad={ () => setIsImageLoaded( true ) }
						alt=""
						src={ imageUrl }
					/>
				</div>
			) }
			{ withIcon && ! imageUrl && (
				<div className="page-templates-author-field__icon">
					<Icon icon={ icon } />
				</div>
			) }
			<span className="page-templates-author-field__name">{ text }</span>
		</HStack>
	);
}

function Preview( { item, viewType } ) {
	const settings = usePatternSettings();
	const [ backgroundColor = 'white' ] = useGlobalStyle( 'color.background' );
	const blocks = useMemo( () => {
		return parse( item.content.raw );
	}, [ item.content.raw ] );
	const { onClick } = useLink( {
		postId: item.id,
		postType: item.type,
		canvas: 'edit',
	} );

	const isEmpty = ! blocks?.length;
	// Wrap everything in a block editor provider to ensure 'styles' that are needed
	// for the previews are synced between the site editor store and the block editor store.
	// Additionally we need to have the `__experimentalBlockPatterns` setting in order to
	// render patterns inside the previews.
	// TODO: Same approach is used in the patterns list and it becomes obvious that some of
	// the block editor settings are needed in context where we don't have the block editor.
	// Explore how we can solve this in a better way.
	return (
		<ExperimentalBlockEditorProvider settings={ settings }>
			<div
				className={ `page-templates-preview-field is-viewtype-${ viewType }` }
				style={ { backgroundColor } }
			>
				{ viewType === LAYOUT_LIST && ! isEmpty && (
					<Async>
						<BlockPreview blocks={ blocks } />
					</Async>
				) }
				{ viewType !== LAYOUT_LIST && (
					<button
						className="page-templates-preview-field__button"
						type="button"
						onClick={ onClick }
						aria-label={ item.title?.rendered || item.title }
					>
						{ isEmpty && __( 'Empty template' ) }
						{ ! isEmpty && (
							<Async>
								<BlockPreview blocks={ blocks } />
							</Async>
						) }
					</button>
				) }
			</div>
		</ExperimentalBlockEditorProvider>
	);
}

// This maps the template slug to the post types it should be available for.
// https://developer.wordpress.org/themes/basics/template-hierarchy/#visual-overview
// It only addresses primary and secondary templates, but not tertiary (aka variable) templates.
const TEMPLATE_TO_POST_TYPE = {
	// 1. Primary templates.
	index: [ 'post', 'page' ],
	singular: [ 'post', 'page' ],
	single: [ 'post' ],
	page: [ 'page' ],
	// 2. Secondary templates.
	'single-post': [ 'post' ],
};

const CUSTOM_TEMPLATE = __( 'Custom' );
const NOT_CUSTOM_TEMPLATE = __( 'Not custom' );

export default function PageTemplates() {
	const { params } = useLocation();
	const { activeView = 'all', layout } = params;
	const defaultView = useMemo( () => {
		const usedType = layout ?? DEFAULT_VIEW.type;
		return {
			...DEFAULT_VIEW,
			type: usedType,
			layout: defaultConfigPerViewType[ usedType ],
			filters:
				activeView !== 'all'
					? [
							{
								field: 'author',
								operator: 'isAny',
								value: [ activeView ],
							},
					  ]
					: [],
		};
	}, [ layout, activeView ] );
	const [ view, setView ] = useState( defaultView );
	useEffect( () => {
		setView( ( currentView ) => ( {
			...currentView,
			filters:
				activeView !== 'all'
					? [
							{
								field: 'author',
								operator: OPERATOR_IS_ANY,
								value: [ activeView ],
							},
					  ]
					: [],
		} ) );
	}, [ activeView ] );

	const { records, isResolving: isLoadingData } = useEntityRecords(
		'postType',
		TEMPLATE_POST_TYPE,
		{
			per_page: -1,
		}
	);
	const { records: types } = useEntityRecords( 'root', 'postType', {
		per_page: -1,
		context: 'edit',
	} );

	const registeredPostTypes = useMemo( () => {
		const result =
			types
				?.filter( ( type ) => type.viewable && type.supports.editor ) // supports.editor is a proxy for supporting templates.
				.map( ( { name, slug } ) => ( { name, slug } ) )
				.reduce( ( acc, current ) => {
					acc[ current.slug ] = current.name;
					return acc;
				}, {} ) || {};
		return result;
	}, [ types ] );

	const history = useHistory();
	const onSelectionChange = useCallback(
		( items ) => {
			if ( view?.type === LAYOUT_LIST ) {
				history.push( {
					...params,
					postId: items.length === 1 ? items[ 0 ].id : undefined,
				} );
			}
		},
		[ history, params, view?.type ]
	);

	const authors = useMemo( () => {
		if ( ! records ) {
			return EMPTY_ARRAY;
		}
		const authorsSet = new Set();
		records.forEach( ( template ) => {
			authorsSet.add( template.author_text );
		} );
		return Array.from( authorsSet ).map( ( author ) => ( {
			value: author,
			label: author,
		} ) );
	}, [ records ] );

	const getPostTypesFromItem = ( item ) => {
		// This logic replicates querying the REST templates endpoint with a post_type parameter.
		// https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-includes/block-template-utils.php#L1077
		//
		// Additionaly, it also maps the the WordPress template hierarchy to known post types.
		//
		// This is how it works:
		//
		// 1. Return the list of post types defined by the item, if any.
		// 2. If a template is custom, add it for any CPT.
		// 3. Consider the template hierarchy and how it maps to post types. E.g.: single, page, etc.
		// 4. If none of the above, default to no post types.

		return (
			item.post_types ||
			( item.is_custom && Object.keys( registeredPostTypes ) ) ||
			TEMPLATE_TO_POST_TYPE[ item.slug ] ||
			[]
		);
	};

	const fields = useMemo(
		() => [
			{
				header: __( 'Preview' ),
				id: 'preview',
				render: ( { item } ) => {
					return <Preview item={ item } viewType={ view.type } />;
				},
				minWidth: 120,
				maxWidth: 120,
				enableSorting: false,
			},
			{
				header: __( 'Template' ),
				id: 'title',
				getValue: ( { item } ) => item.title?.rendered,
				render: ( { item } ) => (
					<Title item={ item } viewType={ view.type } />
				),
				maxWidth: 400,
				enableHiding: false,
				enableGlobalSearch: true,
			},
			{
				header: __( 'Description' ),
				id: 'description',
				render: ( { item } ) => {
					return item.description ? (
						<span className="page-templates-description">
							{ decodeEntities( item.description ) }
						</span>
					) : (
						view.type === LAYOUT_TABLE && (
							<>
								<Text variant="muted" aria-hidden="true">
									&#8212;
								</Text>
								<VisuallyHidden>
									{ __( 'No description.' ) }
								</VisuallyHidden>
							</>
						)
					);
				},
				maxWidth: 400,
				minWidth: 320,
				enableSorting: false,
				enableGlobalSearch: true,
			},
			{
				header: __( 'Author' ),
				id: 'author',
				getValue: ( { item } ) => item.author_text,
				render: ( { item } ) => {
					return <AuthorField viewType={ view.type } item={ item } />;
				},
				elements: authors,
				width: '1%',
			},
			{
				header: __( 'Post types' ),
				id: 'postTypes',
				getValue: ( { item } ) => getPostTypesFromItem( item ),
				render: ( { item } ) => {
					const postTypes = getPostTypesFromItem( item );
					if ( ! postTypes || ! postTypes.length ) {
						return __( 'n/a' );
					}

					if (
						postTypes.length ===
						Object.keys( registeredPostTypes ).length
					) {
						return __( 'Any' );
					}

					return postTypes
						.map(
							( postType ) =>
								registeredPostTypes[ postType ] || postType
						)
						.join( ',' );
				},
				elements: Object.keys( registeredPostTypes ).map( ( key ) => ( {
					value: key,
					label: registeredPostTypes[ key ],
				} ) ),
			},
			{
				header: __( 'Type' ),
				id: 'isCustom',
				getValue: ( { item } ) => !! item.is_custom,
				render: ( { item } ) =>
					!! item.is_custom ? CUSTOM_TEMPLATE : NOT_CUSTOM_TEMPLATE,
				elements: [
					{ value: true, label: CUSTOM_TEMPLATE },
					{ value: false, label: NOT_CUSTOM_TEMPLATE },
				],
				filterBy: {
					operators: [ OPERATOR_IS ],
				},
			},
		],
		[ authors, view.type, registeredPostTypes, getPostTypesFromItem ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( records, view, fields );
	}, [ records, view, fields ] );

	const postTypeActions = usePostActions( TEMPLATE_POST_TYPE );
	const editAction = useEditPostAction();
	const actions = useMemo(
		() => [ editAction, ...postTypeActions ],
		[ postTypeActions, editAction ]
	);

	const onChangeView = useCallback(
		( newView ) => {
			if ( newView.type !== view.type ) {
				newView = {
					...newView,
					layout: {
						...defaultConfigPerViewType[ newView.type ],
					},
				};

				history.push( {
					...params,
					layout: newView.type,
				} );
			}

			setView( newView );
		},
		[ view.type, setView, history, params ]
	);

	return (
		<Page
			className="edit-site-page-templates"
			title={ __( 'Templates' ) }
			actions={ <AddNewTemplate /> }
		>
			<DataViews
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ data }
				isLoading={ isLoadingData }
				view={ view }
				onChangeView={ onChangeView }
				onSelectionChange={ onSelectionChange }
			/>
		</Page>
	);
}
