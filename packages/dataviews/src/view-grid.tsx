/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Spinner,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ItemActions from './item-actions';
import SingleSelectionCheckbox from './single-selection-checkbox';
import { useHasAPossibleBulkAction } from './bulk-actions';
import type {
	Action,
	AnyItem,
	NormalizedField,
	ViewGrid as ViewGridType,
} from './types';

interface GridItemProps< Item extends AnyItem > {
	selection: string[];
	data: Item[];
	onSelectionChange: ( items: Item[] ) => void;
	getItemId: ( item: Item ) => string;
	item: Item;
	actions: Action< Item >[];
	mediaField?: NormalizedField< Item >;
	primaryField?: NormalizedField< Item >;
	visibleFields: NormalizedField< Item >[];
	badgeFields: NormalizedField< Item >[];
	columnFields: string[];
}

interface ViewGridProps< Item extends AnyItem > {
	actions: Action< Item >[];
	data: Item[];
	fields: NormalizedField< Item >[];
	getItemId: ( item: Item ) => string;
	isLoading: boolean;
	onSelectionChange: ( items: Item[] ) => void;
	selection: string[];
	view: ViewGridType;
}

function GridItem< Item extends AnyItem >( {
	selection,
	data,
	onSelectionChange,
	getItemId,
	item,
	actions,
	mediaField,
	primaryField,
	visibleFields,
	badgeFields,
	columnFields,
}: GridItemProps< Item > ) {
	const hasBulkAction = useHasAPossibleBulkAction( actions, item );
	const id = getItemId( item );
	const isSelected = selection.includes( id );
	return (
		<VStack
			spacing={ 0 }
			key={ id }
			className={ clsx( 'dataviews-view-grid__card', {
				'is-selected': hasBulkAction && isSelected,
			} ) }
			onClickCapture={ ( event ) => {
				if ( event.ctrlKey || event.metaKey ) {
					event.stopPropagation();
					event.preventDefault();
					if ( ! hasBulkAction ) {
						return;
					}
					if ( ! isSelected ) {
						onSelectionChange(
							data.filter( ( _item ) => {
								const itemId = getItemId?.( _item );
								return (
									itemId === id ||
									selection.includes( itemId )
								);
							} )
						);
					} else {
						onSelectionChange(
							data.filter( ( _item ) => {
								const itemId = getItemId?.( _item );
								return (
									itemId !== id &&
									selection.includes( itemId )
								);
							} )
						);
					}
				}
			} }
		>
			<div className="dataviews-view-grid__media">
				{ mediaField?.render( { item } ) }
			</div>
			<HStack
				justify="space-between"
				className="dataviews-view-grid__title-actions"
			>
				<SingleSelectionCheckbox
					item={ item }
					selection={ selection }
					onSelectionChange={ onSelectionChange }
					getItemId={ getItemId }
					data={ data }
					primaryField={ primaryField }
					disabled={ ! hasBulkAction }
				/>
				<HStack className="dataviews-view-grid__primary-field">
					{ primaryField?.render( { item } ) }
				</HStack>
				<ItemActions item={ item } actions={ actions } isCompact />
			</HStack>
			{ !! badgeFields?.length && (
				<HStack
					className="dataviews-view-grid__badge-fields"
					spacing={ 2 }
					wrap
					alignment="top"
					justify="flex-start"
				>
					{ badgeFields.map( ( field ) => {
						const renderedValue = field.render( {
							item,
						} );
						if ( ! renderedValue ) {
							return null;
						}
						return (
							<FlexItem
								key={ field.id }
								className={ 'dataviews-view-grid__field-value' }
							>
								{ renderedValue }
							</FlexItem>
						);
					} ) }
				</HStack>
			) }
			{ !! visibleFields?.length && (
				<VStack className="dataviews-view-grid__fields" spacing={ 3 }>
					{ visibleFields.map( ( field ) => {
						const renderedValue = field.render( {
							item,
						} );
						if ( ! renderedValue ) {
							return null;
						}
						return (
							<Flex
								className={ clsx(
									'dataviews-view-grid__field',
									columnFields?.includes( field.id )
										? 'is-column'
										: 'is-row'
								) }
								key={ field.id }
								gap={ 1 }
								justify="flex-start"
								expanded
								style={ { height: 'auto' } }
								direction={
									columnFields?.includes( field.id )
										? 'column'
										: 'row'
								}
							>
								<>
									<FlexItem className="dataviews-view-grid__field-name">
										{ field.header }
									</FlexItem>
									<FlexItem
										className="dataviews-view-grid__field-value"
										style={ { maxHeight: 'none' } }
									>
										{ renderedValue }
									</FlexItem>
								</>
							</Flex>
						);
					} ) }
				</VStack>
			) }
		</VStack>
	);
}

export default function ViewGrid< Item extends AnyItem >( {
	actions,
	data,
	fields,
	getItemId,
	isLoading,
	onSelectionChange,
	selection,
	view,
}: ViewGridProps< Item > ) {
	const mediaField = fields.find(
		( field ) => field.id === view.layout.mediaField
	);
	const primaryField = fields.find(
		( field ) => field.id === view.layout.primaryField
	);
	const { visibleFields, badgeFields } = fields.reduce(
		( accumulator: Record< string, NormalizedField< Item >[] >, field ) => {
			if (
				view.hiddenFields.includes( field.id ) ||
				[ view.layout.mediaField, view.layout.primaryField ].includes(
					field.id
				)
			) {
				return accumulator;
			}
			// If the field is a badge field, add it to the badgeFields array
			// otherwise add it to the rest visibleFields array.
			const key = view.layout.badgeFields?.includes( field.id )
				? 'badgeFields'
				: 'visibleFields';
			accumulator[ key ].push( field );
			return accumulator;
		},
		{ visibleFields: [], badgeFields: [] }
	);
	const hasData = !! data?.length;
	return (
		<>
			{ hasData && (
				<Grid
					gap={ 6 }
					columns={ 2 }
					alignment="top"
					className="dataviews-view-grid"
					aria-busy={ isLoading }
				>
					{ data.map( ( item ) => {
						return (
							<GridItem
								key={ getItemId( item ) }
								selection={ selection }
								data={ data }
								onSelectionChange={ onSelectionChange }
								getItemId={ getItemId }
								item={ item }
								actions={ actions }
								mediaField={ mediaField }
								primaryField={ primaryField }
								visibleFields={ visibleFields }
								badgeFields={ badgeFields }
								columnFields={ view.layout.columnFields }
							/>
						);
					} ) }
				</Grid>
			) }
			{ ! hasData && (
				<div
					className={ clsx( {
						'dataviews-loading': isLoading,
						'dataviews-no-results': ! isLoading,
					} ) }
				>
					<p>{ isLoading ? <Spinner /> : __( 'No results' ) }</p>
				</div>
			) }
		</>
	);
}
