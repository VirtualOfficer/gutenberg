/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEntityRecords, store as coreStore } from '@wordpress/core-data';
import { __experimentalTruncate as Truncate } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { useState, useMemo, useCallback, useEffect } from '@wordpress/element';
import { dateI18n, getDate, getSettings } from '@wordpress/date';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useSelect, useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Page from '../page';
import { default as Link, useLink } from '../routes/link';
import {
	DEFAULT_VIEWS,
	DEFAULT_CONFIG_PER_VIEW_TYPE,
} from '../sidebar-dataviews/default-views';
import {
	LAYOUT_GRID,
	LAYOUT_LIST,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
} from '../../utils/constants';

// import AddNewPageModal from '../add-new-page';
import Media from '../media';
import { unlock } from '../../lock-unlock';

const { usePostActions } = unlock( editorPrivateApis );

const { useLocation, useHistory } = unlock( routerPrivateApis );

const EMPTY_ARRAY = [];

function getMediaTypeFromMimeType( mimeType ) {
	// @todo this needs to be abstracted and the
	//  media types formalized somewhere.
	if ( mimeType.startsWith( 'image/' ) ) {
		return 'image';
	}

	if ( mimeType.startsWith( 'video/' ) ) {
		return 'video';
	}

	if ( mimeType.startsWith( 'audio/' ) ) {
		return 'audio';
	}

	return 'application';
}

function useView( postType ) {
	const { params } = useLocation();
	const { activeView = 'all', isCustom = 'false', layout } = params;
	const history = useHistory();
	const selectedDefaultView = useMemo( () => {
		const defaultView =
			isCustom === 'false' &&
			DEFAULT_VIEWS[ postType ].find(
				( { slug } ) => slug === activeView
			)?.view;
		if ( isCustom === 'false' && layout ) {
			return {
				...defaultView,
				type: layout,
				layout: {
					...( DEFAULT_CONFIG_PER_VIEW_TYPE[ layout ] || {} ),
				},
			};
		}
		return defaultView;
	}, [ isCustom, activeView, layout, postType ] );
	const [ view, setView ] = useState( selectedDefaultView );

	useEffect( () => {
		if ( selectedDefaultView ) {
			setView( selectedDefaultView );
		}
	}, [ selectedDefaultView ] );
	const editedViewRecord = useSelect(
		( select ) => {
			if ( isCustom !== 'true' ) {
				return;
			}
			const { getEditedEntityRecord } = select( coreStore );
			const dataviewRecord = getEditedEntityRecord(
				'postType',
				'wp_dataviews',
				Number( activeView )
			);
			return dataviewRecord;
		},
		[ activeView, isCustom ]
	);
	const { editEntityRecord } = useDispatch( coreStore );

	const customView = useMemo( () => {
		const storedView =
			editedViewRecord?.content &&
			JSON.parse( editedViewRecord?.content );
		if ( ! storedView ) {
			return storedView;
		}

		return {
			...storedView,
			layout: {
				...( DEFAULT_CONFIG_PER_VIEW_TYPE[ storedView?.type ] || {} ),
			},
		};
	}, [ editedViewRecord?.content ] );

	const setCustomView = useCallback(
		( viewToSet ) => {
			editEntityRecord(
				'postType',
				'wp_dataviews',
				editedViewRecord?.id,
				{
					content: JSON.stringify( viewToSet ),
				}
			);
		},
		[ editEntityRecord, editedViewRecord?.id ]
	);

	const setDefaultViewAndUpdateUrl = useCallback(
		( viewToSet ) => {
			if ( viewToSet.type !== view?.type ) {
				history.push( {
					...params,
					layout: viewToSet.type,
				} );
			}
			setView( viewToSet );
		},
		[ params, view?.type, history ]
	);

	if ( isCustom === 'false' ) {
		return [ view, setDefaultViewAndUpdateUrl ];
	} else if ( isCustom === 'true' && customView ) {
		return [ customView, setCustomView ];
	}
	// Loading state where no the view was not found on custom views or default views.
	return [ DEFAULT_VIEWS[ postType ][ 0 ].view, setDefaultViewAndUpdateUrl ];
}

// See https://github.com/WordPress/gutenberg/issues/55886
// We do not support custom statutes at the moment.
// Additionally, media supports fewer statuses than posts.
const STATUSES = [
	{ value: 'private', label: __( 'Private' ) },
	{ value: 'trash', label: __( 'Trash' ) },
];

function FeaturedImage( { item, viewType } ) {
	const isDisabled = item.status === 'trash';
	const { onClick } = useLink( {
		postId: item.id,
		postType: item.type,
		canvas: 'edit',
	} );
	const hasMedia = !! item.id && item.media_type === 'image';
	const hasPoster = !! item.poster;
	const size =
		viewType === LAYOUT_GRID
			? [ 'large', 'full', 'medium', 'thumbnail' ]
			: [ 'thumbnail', 'medium', 'large', 'full' ];
	let media = hasMedia ? (
		<Media
			className="edit-site-page-pages__featured-image"
			id={ item.id }
			size={ size }
		/>
	) : null;

	if ( hasPoster ) {
		media = (
			<img
				// TODO: Provide a more meaningful alt text.
				alt={ __( 'Poster image' ) }
				className="edit-site-page-pages__featured-image"
				src={ item.poster }
			/>
		);
	}

	// const renderButton = viewType !== LAYOUT_LIST && ! isDisabled;
	// TODO: Add onClick behaviour back in once there's a place to go to.
	const renderButton = false || isDisabled;
	return (
		<div
			className={ `edit-site-page-pages__featured-image-wrapper is-layout-${ viewType }` }
		>
			{ renderButton ? (
				<button
					className="page-pages-preview-field__button"
					type="button"
					onClick={ onClick }
					aria-label={ item.title?.rendered || __( '(no title)' ) }
				>
					{ media }
				</button>
			) : (
				media
			) }
		</div>
	);
}

let PAGE_ACTIONS = [
	'edit-post',
	'view-post',
	'restore',
	'permanently-delete',
	'view-post-revisions',
	'rename-post',
	'move-to-trash',
];

if ( process.env.IS_GUTENBERG_PLUGIN ) {
	PAGE_ACTIONS = [
		'edit-post',
		'view-post',
		'restore',
		'permanently-delete',
		'view-post-revisions',
		'duplicate-post',
		'rename-post',
		'move-to-trash',
	];
}

export default function PageMedia() {
	const postType = 'media';
	const [ view, setView ] = useView( postType );
	const history = useHistory();
	const { params } = useLocation();
	const { isCustom = 'false' } = params;

	const onSelectionChange = useCallback(
		( items ) => {
			if ( isCustom === 'false' && view?.type === LAYOUT_LIST ) {
				history.push( {
					...params,
					postId: items.length === 1 ? items[ 0 ].id : undefined,
				} );
			}
		},
		[ history, params, view?.type, isCustom ]
	);

	const queryArgs = useMemo( () => {
		const filters = {};
		view.filters.forEach( ( filter ) => {
			if (
				filter.field === 'status' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.status = filter.value;
			}
			if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.author = filter.value;
			} else if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_NONE
			) {
				filters.author_exclude = filter.value;
			}
		} );
		// We want to provide a different default item for the status filter
		// than the REST API provides.
		// if ( ! filters.status || filters.status === '' ) {
		// 	filters.status = DEFAULT_STATUSES;
		// }

		return {
			per_page: view.perPage,
			page: view.page,
			// _embed: 'author',
			_embed: 'wp:featuredmedia',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			...filters,
		};
	}, [ view ] );

	const {
		records: mediaItems,
		isResolving: isLoadingMedia,
		totalItems,
		totalPages,
	} = useEntityRecords( 'root', 'media', queryArgs );

	const { records: authors, isResolving: isLoadingAuthors } =
		useEntityRecords( 'root', 'user', { per_page: -1 } );

	const paginationInfo = useMemo(
		() => ( {
			totalItems,
			totalPages,
		} ),
		[ totalItems, totalPages ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'featured-image',
				header: __( 'Featured Image' ),
				getValue: ( { item } ) => item.id,
				render: ( { item } ) => (
					<FeaturedImage item={ item } viewType={ view.type } />
				),
				enableSorting: false,
				width: '1%',
			},
			{
				header: __( 'Title' ),
				id: 'title',
				getValue: ( { item } ) => item.title?.rendered,
				render: ( { item } ) => {
					// const addLink =
					// 	[ LAYOUT_TABLE, LAYOUT_GRID ].includes( view.type ) &&
					// 	item.status !== 'trash';
					// TODO: Add link behaviour back in once there's a place to go to.
					const addLink = false;
					return addLink ? (
						<Link
							params={ {
								postId: item.id,
								postType: item.type,
								canvas: 'edit',
							} }
						>
							<Truncate numberOfLines={ 1 }>
								{ decodeEntities( item.title?.rendered ) ||
									__( '(no title)' ) }
							</Truncate>
						</Link>
					) : (
						<Truncate numberOfLines={ 1 }>
							{ decodeEntities( item.title?.rendered ) ||
								__( '(no title)' ) }
						</Truncate>
					);
				},
				maxWidth: 300,
				enableHiding: false,
			},
			{
				header: __( 'Author' ),
				id: 'author',
				getValue: ( { item } ) => item._embedded?.author[ 0 ]?.name,
				elements:
					authors?.map( ( { id, name } ) => ( {
						value: id,
						label: name,
					} ) ) || [],
			},
			{
				header: __( 'Status' ),
				id: 'status',
				getValue: ( { item } ) =>
					STATUSES.find( ( { value } ) => value === item.status )
						?.label ?? item.status,
				elements: STATUSES,
				enableSorting: false,
				filterBy: {
					operators: [ OPERATOR_IS_ANY ],
				},
			},
			{
				header: __( 'Date' ),
				id: 'date',
				render: ( { item } ) => {
					const formattedDate = dateI18n(
						getSettings().formats.datetimeAbbreviated,
						getDate( item.date )
					);
					return <time>{ formattedDate }</time>;
				},
			},
			{
				header: __( 'File size' ),
				id: 'filesize',
				render: ( { item } ) =>
					item?.media_details?.filesize
						? `${ Math.round(
								item?.media_details.filesize / 1000
						  ) } kb`
						: undefined,
			},
			{
				header: __( 'Type' ),
				id: 'type',
				getValue: ( { item } ) =>
					getMediaTypeFromMimeType( item.mime_type ),
			},
		],
		[ authors, view.type ]
	);
	const onActionPerformed = useCallback(
		( actionId, items ) => {
			if ( actionId === 'edit-post' ) {
				const post = items[ 0 ];
				history.push( {
					postId: post.id,
					postType: post.type,
					canvas: 'edit',
				} );
			}
		},
		[ history ]
	);
	const actions = usePostActions( onActionPerformed, PAGE_ACTIONS );
	const onChangeView = useCallback(
		( newView ) => {
			if ( newView.type !== view.type ) {
				newView = {
					...newView,
					layout: {
						...DEFAULT_CONFIG_PER_VIEW_TYPE[ newView.type ],
					},
				};
			}

			setView( newView );
		},
		[ view.type, setView ]
	);

	// TODO: Add action of adding / uploading media.
	// const [ showAddPageModal, setShowAddPageModal ] = useState( false );

	// const openModal = () => setShowAddPageModal( true );
	// const closeModal = () => setShowAddPageModal( false );
	// const handleNewPage = ( { type, id } ) => {
	// 	history.push( {
	// 		postId: id,
	// 		postType: type,
	// 		canvas: 'edit',
	// 	} );
	// 	closeModal();
	// };

	// TODO: we need to handle properly `data={ data || EMPTY_ARRAY }` for when `isLoading`.
	return (
		<Page
			title={ __( 'Media' ) }
			// actions={
			// 	<>
			// 		<Button variant="primary" onClick={ openModal }>
			// 			{ __( 'Add new page' ) }
			// 		</Button>
			// 		{ showAddPageModal && (
			// 			<AddNewPageModal
			// 				onSave={ handleNewPage }
			// 				onClose={ closeModal }
			// 			/>
			// 		) }
			// 	</>
			// }
		>
			<DataViews
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ mediaItems || EMPTY_ARRAY }
				isLoading={ isLoadingMedia || isLoadingAuthors }
				view={ view }
				onChangeView={ onChangeView }
				onSelectionChange={ onSelectionChange }
			/>
		</Page>
	);
}
