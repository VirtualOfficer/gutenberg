/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

// Filter operators.
export const OPERATOR_IS = 'is';
export const OPERATOR_IS_NOT = 'isNot';
export const OPERATOR_IS_ANY = 'isAny';
export const OPERATOR_IS_NONE = 'isNone';
export const OPERATOR_IS_ALL = 'isAll';
export const OPERATOR_IS_NOT_ALL = 'isNotAll';

export const ALL_OPERATORS = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	OPERATOR_IS_ALL,
	OPERATOR_IS_NOT_ALL,
];
export const OPERATORS = {
	[ OPERATOR_IS ]: {
		key: 'is-filter',
		label: __( 'Is' ),
	},
	[ OPERATOR_IS_NOT ]: {
		key: 'is-not-filter',
		label: __( 'Is not' ),
	},
	[ OPERATOR_IS_ANY ]: {
		key: 'is-any-filter',
		label: __( 'Is any' ),
	},
	[ OPERATOR_IS_NONE ]: {
		key: 'is-none-filter',
		label: __( 'Is none' ),
	},
	[ OPERATOR_IS_ALL ]: {
		key: 'is-all-filter',
		label: __( 'Is all' ),
	},
	[ OPERATOR_IS_NOT_ALL ]: {
		key: 'is-not-all-filter',
		label: __( 'Is not all' ),
	},
};

// Sorting
export const SORTING_DIRECTIONS = {
	asc: { label: __( 'Sort ascending' ) },
	desc: { label: __( 'Sort descending' ) },
};

// View layouts.
export const LAYOUT_TABLE = 'table';
export const LAYOUT_GRID = 'grid';
export const LAYOUT_LIST = 'list';
