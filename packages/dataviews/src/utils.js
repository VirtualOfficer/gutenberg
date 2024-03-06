/**
 * WordPress dependencies
 */
import { Children, Fragment } from '@wordpress/element';
import { privateApis as componentsPrivateApis } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ALL_OPERATORS, OPERATOR_IN, OPERATOR_NOT_IN } from './constants';
import { unlock } from './lock-unlock';

const { DropdownMenuSeparatorV2: DropdownMenuSeparator } = unlock(
	componentsPrivateApis
);

/**
 * Helper util to sort data by text fields, when sorting is done client side.
 *
 * @param {Object}   params            Function params.
 * @param {Object[]} params.data       Data to sort.
 * @param {Object}   params.view       Current view object.
 * @param {Object[]} params.fields     Array of available fields.
 * @param {string[]} params.textFields Array of the field ids to sort.
 *
 * @return {Object[]} Sorted data.
 */
export const sortByTextFields = ( { data, view, fields, textFields } ) => {
	const sortedData = [ ...data ];
	const fieldId = view.sort.field;
	if ( textFields.includes( fieldId ) ) {
		const fieldToSort = fields.find( ( field ) => {
			return field.id === fieldId;
		} );
		sortedData.sort( ( a, b ) => {
			const valueA = fieldToSort.getValue( { item: a } ) ?? '';
			const valueB = fieldToSort.getValue( { item: b } ) ?? '';
			return view.sort.direction === 'asc'
				? valueA.localeCompare( valueB )
				: valueB.localeCompare( valueA );
		} );
	}
	return sortedData;
};

/**
 * Helper util to get the paginated data and the paginateInfo needed,
 * when pagination is done client side.
 *
 * @param {Object}   params      Function params.
 * @param {Object[]} params.data Available data.
 * @param {Object}   params.view Current view object.
 *
 * @return {Object} Paginated data and paginationInfo.
 */
export function getPaginationResults( { data, view } ) {
	const start = ( view.page - 1 ) * view.perPage;
	const totalItems = data?.length || 0;
	data = data?.slice( start, start + view.perPage );
	return {
		data,
		paginationInfo: {
			totalItems,
			totalPages: Math.ceil( totalItems / view.perPage ),
		},
	};
}

export const sanitizeOperators = ( field ) => {
	let operators = field.filterBy?.operators;

	// Assign default values.
	if ( ! operators || ! Array.isArray( operators ) ) {
		operators = [ OPERATOR_IN, OPERATOR_NOT_IN ];
	}

	// Make sure only valid operators are used.
	operators = operators.filter( ( operator ) =>
		ALL_OPERATORS.includes( operator )
	);

	// Do not allow mixing single & multiselection operators.
	if (
		operators.includes( OPERATOR_IN ) ||
		operators.includes( OPERATOR_NOT_IN )
	) {
		operators = operators.filter( ( operator ) =>
			[ OPERATOR_IN, OPERATOR_NOT_IN ].includes( operator )
		);
	}

	return operators;
};

export function WithDropDownMenuSeparators( { children } ) {
	return Children.toArray( children )
		.filter( Boolean )
		.map( ( child, i ) => (
			<Fragment key={ i }>
				{ i > 0 && <DropdownMenuSeparator /> }
				{ child }
			</Fragment>
		) );
}
