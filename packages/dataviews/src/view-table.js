/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useAsyncList } from '@wordpress/compose';
import { unseen, funnel } from '@wordpress/icons';
import {
	Button,
	Icon,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import {
	Children,
	Fragment,
	forwardRef,
	useEffect,
	useId,
	useRef,
	useState,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from './lock-unlock';
import ItemActions from './item-actions';
import { ENUMERATION_TYPE, OPERATORS, SORTING_DIRECTIONS } from './constants';
import { DropdownMenuRadioItemCustom } from './dropdown-menu-helper';

const {
	DropdownMenuV2: DropdownMenu,
	DropdownMenuGroupV2: DropdownMenuGroup,
	DropdownMenuItemV2: DropdownMenuItem,
	DropdownMenuSeparatorV2: DropdownMenuSeparator,
	DropdownMenuItemLabelV2: DropdownMenuItemLabel,
} = unlock( componentsPrivateApis );

const sortArrows = { asc: '↑', desc: '↓' };

const sanitizeOperators = ( field ) => {
	let operators = field.filterBy?.operators;
	if ( ! operators || ! Array.isArray( operators ) ) {
		operators = Object.keys( OPERATORS );
	}
	return operators.filter( ( operator ) =>
		Object.keys( OPERATORS ).includes( operator )
	);
};

const HeaderMenu = forwardRef( function HeaderMenu(
	{ field, view, onChangeView, onHide },
	ref
) {
	const isHidable = field.enableHiding !== false;

	const isSortable = field.enableSorting !== false;
	const isSorted = view.sort?.field === field.id;

	let filter, filterInView, activeElement, activeOperator, otherFilters;
	const operators = sanitizeOperators( field );
	if ( field.type === ENUMERATION_TYPE && operators.length > 0 ) {
		filter = {
			field: field.id,
			operators,
			elements: field.elements || [],
		};
		filterInView = view.filters.find( ( f ) => f.field === filter.field );
		otherFilters = view.filters.filter( ( f ) => f.field !== filter.field );
		activeElement = filter.elements.find(
			( element ) => element.value === filterInView?.value
		);
		activeOperator = filterInView?.operator || filter.operators[ 0 ];
	}
	const isFilterable = !! filter;

	if ( ! isSortable && ! isHidable && ! isFilterable ) {
		return field.header;
	}

	return (
		<DropdownMenu
			align="start"
			trigger={
				<Button
					size="compact"
					className="dataviews-table-header-button"
					style={ { padding: 0 } }
					ref={ ref }
				>
					{ field.header }
					{ isSorted && (
						<span aria-hidden="true">
							{ isSorted && sortArrows[ view.sort.direction ] }
						</span>
					) }
				</Button>
			}
			style={ { minWidth: '240px' } }
		>
			<WithSeparators>
				{ isSortable && (
					<DropdownMenuGroup>
						{ Object.entries( SORTING_DIRECTIONS ).map(
							( [ direction, info ] ) => {
								const isChecked =
									isSorted &&
									view.sort.direction === direction;
								return (
									<DropdownMenuRadioItemCustom
										key={ direction }
										name={ `view-table-sort-${ field.id }` }
										value={ direction }
										checked={ isChecked }
										onChange={ ( e ) => {
											onChangeView( {
												...view,
												sort: {
													field: field.id,
													direction: e.target.value,
												},
											} );
										} }
									>
										<DropdownMenuItemLabel>
											{ info.label }
										</DropdownMenuItemLabel>
									</DropdownMenuRadioItemCustom>
								);
							}
						) }
					</DropdownMenuGroup>
				) }
				{ isHidable && (
					<DropdownMenuItem
						prefix={ <Icon icon={ unseen } /> }
						onClick={ () => {
							onHide( field );
							onChangeView( {
								...view,
								hiddenFields: view.hiddenFields.concat(
									field.id
								),
							} );
						} }
					>
						<DropdownMenuItemLabel>
							{ __( 'Hide' ) }
						</DropdownMenuItemLabel>
					</DropdownMenuItem>
				) }
				{ isFilterable && (
					<DropdownMenuGroup>
						<DropdownMenu
							key={ filter.field }
							trigger={
								<DropdownMenuItem
									prefix={ <Icon icon={ funnel } /> }
									suffix={
										activeElement && (
											<span aria-hidden="true">
												{ activeOperator in OPERATORS &&
													`${ OPERATORS[ activeOperator ].label } ` }
												{ activeElement?.label }
											</span>
										)
									}
								>
									<DropdownMenuItemLabel>
										{ __( 'Filter by' ) }
									</DropdownMenuItemLabel>
								</DropdownMenuItem>
							}
						>
							<WithSeparators>
								<DropdownMenuGroup>
									{ filter.elements.map( ( element ) => {
										const isActive =
											activeElement?.value ===
											element.value;
										return (
											<DropdownMenuRadioItemCustom
												key={ element.value }
												name={ `view-table-${ filter.field.id }` }
												value={ element.value }
												checked={ isActive }
												onClick={ () => {
													onChangeView( {
														...view,
														page: 1,
														filters: [
															...otherFilters,
															{
																field: filter.field,
																operator:
																	activeOperator,
																value: isActive
																	? undefined
																	: element.value,
															},
														],
													} );
												} }
											>
												<DropdownMenuItemLabel>
													{ element.label }
												</DropdownMenuItemLabel>
											</DropdownMenuRadioItemCustom>
										);
									} ) }
								</DropdownMenuGroup>
								{ filter.operators.length > 1 && (
									<DropdownMenu
										trigger={
											<DropdownMenuItem
												suffix={
													<span aria-hidden="true">
														{
															OPERATORS[
																activeOperator
															]?.label
														}
													</span>
												}
											>
												<DropdownMenuItemLabel>
													{ __( 'Conditions' ) }
												</DropdownMenuItemLabel>
											</DropdownMenuItem>
										}
									>
										{ Object.entries( OPERATORS ).map(
											( [
												operator,
												{ label, key },
											] ) => (
												<DropdownMenuRadioItemCustom
													key={ key }
													name={ `view-table-${ filter.name }-conditions` }
													value={ operator }
													checked={
														activeOperator ===
														operator
													}
													onChange={ ( e ) =>
														onChangeView( {
															...view,
															page: 1,
															filters: [
																...otherFilters,
																{
																	field: filter.field,
																	operator:
																		e.target
																			.value,
																	value: filterInView?.value,
																},
															],
														} )
													}
												>
													<DropdownMenuItemLabel>
														{ label }
													</DropdownMenuItemLabel>
												</DropdownMenuRadioItemCustom>
											)
										) }
									</DropdownMenu>
								) }
							</WithSeparators>
						</DropdownMenu>
					</DropdownMenuGroup>
				) }
			</WithSeparators>
		</DropdownMenu>
	);
} );

function WithSeparators( { children } ) {
	return Children.toArray( children )
		.filter( Boolean )
		.map( ( child, i ) => (
			<Fragment key={ i }>
				{ i > 0 && <DropdownMenuSeparator /> }
				{ child }
			</Fragment>
		) );
}

function ViewTable( {
	view,
	onChangeView,
	fields,
	actions,
	data,
	getItemId,
	isLoading = false,
	deferredRendering,
} ) {
	const headerMenuRefs = useRef( new Map() );
	const headerMenuToFocusRef = useRef();
	const [ nextHeaderMenuToFocus, setNextHeaderMenuToFocus ] = useState();

	useEffect( () => {
		if ( headerMenuToFocusRef.current ) {
			headerMenuToFocusRef.current.focus();
			headerMenuToFocusRef.current = undefined;
		}
	} );

	const asyncData = useAsyncList( data );
	const tableNoticeId = useId();

	if ( nextHeaderMenuToFocus ) {
		// If we need to force focus, we short-circuit rendering here
		// to prevent any additional work while we handle that.
		// Clearing out the focus directive is necessary to make sure
		// future renders don't cause unexpected focus jumps.
		headerMenuToFocusRef.current = nextHeaderMenuToFocus;
		setNextHeaderMenuToFocus();
		return;
	}

	const onHide = ( field ) => {
		const hidden = headerMenuRefs.current.get( field.id );
		const fallback = headerMenuRefs.current.get( hidden.fallback );
		setNextHeaderMenuToFocus( fallback?.node );
	};
	const visibleFields = fields.filter(
		( field ) =>
			! view.hiddenFields.includes( field.id ) &&
			! [ view.layout.mediaField, view.layout.primaryField ].includes(
				field.id
			)
	);
	const usedData = deferredRendering ? asyncData : data;
	const hasData = !! usedData?.length;
	const sortValues = { asc: 'ascending', desc: 'descending' };

	return (
		<div className="dataviews-table-view-wrapper">
			<table
				className="dataviews-table-view"
				aria-busy={ isLoading }
				aria-describedby={ tableNoticeId }
			>
				<thead>
					<tr>
						{ visibleFields.map( ( field, index ) => (
							<th
								key={ field.id }
								style={ {
									width: field.width || undefined,
									minWidth: field.minWidth || undefined,
									maxWidth: field.maxWidth || undefined,
								} }
								data-field-id={ field.id }
								aria-sort={
									view.sort?.field === field.id &&
									sortValues[ view.sort.direction ]
								}
								scope="col"
							>
								<HeaderMenu
									ref={ ( node ) => {
										if ( node ) {
											headerMenuRefs.current.set(
												field.id,
												{
													node,
													fallback:
														visibleFields[
															index > 0
																? index - 1
																: 1
														]?.id,
												}
											);
										} else {
											headerMenuRefs.current.delete(
												field.id
											);
										}
									} }
									field={ field }
									view={ view }
									onChangeView={ onChangeView }
									onHide={ onHide }
								/>
							</th>
						) ) }
						{ !! actions?.length && (
							<th data-field-id="actions">{ __( 'Actions' ) }</th>
						) }
					</tr>
				</thead>
				<tbody>
					{ hasData &&
						usedData.map( ( item ) => (
							<tr key={ getItemId( item ) }>
								{ visibleFields.map( ( field ) => (
									<td
										key={ field.id }
										style={ {
											width: field.width || undefined,
											minWidth:
												field.minWidth || undefined,
											maxWidth:
												field.maxWidth || undefined,
										} }
									>
										{ field.render( {
											item,
										} ) }
									</td>
								) ) }
								{ !! actions?.length && (
									<td>
										<ItemActions
											item={ item }
											actions={ actions }
										/>
									</td>
								) }
							</tr>
						) ) }
				</tbody>
			</table>
			<div
				className={ classNames( 'dataviews-table-status', {
					'dataviews-loading': isLoading,
					'dataviews-no-results': ! hasData && ! isLoading,
				} ) }
				id={ tableNoticeId }
			>
				{ ! hasData && (
					<p>{ isLoading ? __( 'Loading…' ) : __( 'No results' ) }</p>
				) }
			</div>
		</div>
	);
}

export default ViewTable;
