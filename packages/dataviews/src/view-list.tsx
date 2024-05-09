/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	privateApis as componentsPrivateApis,
	Spinner,
	VisuallyHidden,
} from '@wordpress/components';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { unlock } from './lock-unlock';
import type {
	Data,
	Item,
	NormalizedField,
	ViewList as ViewListType,
} from './types';

import { ActionsDropdownMenuGroup } from './item-actions';

interface Action {
	id: string;
	label: string;
	callback: ( items: Item[] ) => void;
	RenderModal: any;
}

interface ListViewProps {
	actions: Action[];
	data: Data;
	fields: NormalizedField[];
	getItemId: ( item: Item ) => string;
	id: string;
	isLoading: boolean;
	onSelectionChange: ( selection: Item[] ) => void;
	selection: Item[];
	view: ViewListType;
}

interface ListViewItemProps {
	actions: Action[];
	id?: string;
	isSelected: boolean;
	item: Item;
	mediaField?: NormalizedField;
	onSelect: ( item: Item ) => void;
	primaryField?: NormalizedField;
	store: any;
	visibleFields: NormalizedField[];
}

const {
	DropdownMenuV2: DropdownMenu,
	CompositeV2: Composite,
	CompositeItemV2: CompositeItem,
	CompositeRowV2: CompositeRow,
	useCompositeStoreV2: useCompositeStore,
} = unlock( componentsPrivateApis );

function ListItem( {
	actions,
	id,
	item,
	isSelected,
	onSelect,
	mediaField,
	primaryField,
	store,
	visibleFields,
}: ListViewItemProps ) {
	const itemRef = useRef< HTMLElement >( null );
	const labelId = `${ id }-label`;
	const descriptionId = `${ id }-description`;

	useEffect( () => {
		if ( isSelected ) {
			itemRef.current?.scrollIntoView( {
				behavior: 'auto',
				block: 'nearest',
				inline: 'nearest',
			} );
		}
	}, [ isSelected ] );

	return (
		<CompositeRow
			ref={ itemRef }
			render={ <li /> }
			role="row"
			className={ clsx( {
				'is-selected': isSelected,
			} ) }
		>
			<HStack className="dataviews-view-list__item-wrapper">
				<div role="gridcell">
					<CompositeItem
						store={ store }
						render={ <div /> }
						role="button"
						id={ id }
						aria-pressed={ isSelected }
						aria-labelledby={ labelId }
						aria-describedby={ descriptionId }
						className="dataviews-view-list__item"
						onClick={ () => onSelect( item ) }
					>
						<HStack
							spacing={ 3 }
							justify="start"
							alignment="flex-start"
						>
							<div className="dataviews-view-list__media-wrapper">
								{ mediaField?.render( { item } ) || (
									<div className="dataviews-view-list__media-placeholder"></div>
								) }
							</div>
							<VStack spacing={ 1 }>
								<span
									className="dataviews-view-list__primary-field"
									id={ labelId }
								>
									{ primaryField?.render( { item } ) }
								</span>
								<div
									className="dataviews-view-list__fields"
									id={ descriptionId }
								>
									{ visibleFields.map( ( field ) => (
										<div
											key={ field.id }
											className="dataviews-view-list__field"
										>
											<VisuallyHidden
												as="span"
												className="dataviews-view-list__field-label"
											>
												{ field.header }
											</VisuallyHidden>
											<span className="dataviews-view-list__field-value">
												{ field.render( { item } ) }
											</span>
										</div>
									) ) }
								</div>
							</VStack>
						</HStack>
					</CompositeItem>
				</div>
				{ actions && (
					<div role="gridcell">
						<DropdownMenu
							trigger={
								<CompositeItem
									store={ store }
									render={
										<Button
											size="compact"
											icon={ moreVertical }
											label={ __( 'Actions' ) }
											disabled={ ! actions.length }
											className="dataviews-all-actions-button"
										/>
									}
								/>
							}
							placement="bottom-end"
						>
							<ActionsDropdownMenuGroup
								actions={ actions }
								item={ item }
							/>
						</DropdownMenu>
					</div>
				) }
			</HStack>
		</CompositeRow>
	);
}

export default function ViewList( props: ListViewProps ) {
	const {
		actions,
		data,
		fields,
		getItemId,
		isLoading,
		onSelectionChange,
		selection,
		view,
	} = props;
	const baseId = useInstanceId( ViewList, 'view-list' );
	const selectedItem = data?.findLast( ( item ) =>
		selection.includes( item.id )
	);

	const mediaField = fields.find(
		( field ) => field.id === view.layout.mediaField
	);
	const primaryField = fields.find(
		( field ) => field.id === view.layout.primaryField
	);
	const visibleFields = fields.filter(
		( field ) =>
			! view.hiddenFields.includes( field.id ) &&
			! [ view.layout.primaryField, view.layout.mediaField ].includes(
				field.id
			)
	);

	const onSelect = useCallback(
		( item: Item ) => onSelectionChange( [ item ] ),
		[ onSelectionChange ]
	);

	const getItemDomId = useCallback(
		( item?: Item ) =>
			item ? `${ baseId }-${ getItemId( item ) }` : undefined,
		[ baseId, getItemId ]
	);

	const store = useCompositeStore( {
		defaultActiveId: getItemDomId( selectedItem ),
	} );

	const hasData = data?.length;
	if ( ! hasData ) {
		return (
			<div
				className={ clsx( {
					'dataviews-loading': isLoading,
					'dataviews-no-results': ! hasData && ! isLoading,
				} ) }
			>
				{ ! hasData && (
					<p>{ isLoading ? <Spinner /> : __( 'No results' ) }</p>
				) }
			</div>
		);
	}

	return (
		<Composite
			id={ baseId }
			render={ <ul /> }
			className="dataviews-view-list"
			role="grid"
			store={ store }
		>
			{ data.map( ( item ) => {
				const id = getItemDomId( item );
				return (
					<ListItem
						key={ id }
						id={ id }
						actions={ actions }
						item={ item }
						isSelected={ item === selectedItem }
						onSelect={ onSelect }
						mediaField={ mediaField }
						primaryField={ primaryField }
						store={ store }
						visibleFields={ visibleFields }
					/>
				);
			} ) }
		</Composite>
	);
}
