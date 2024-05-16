/**
 * External dependencies
 */
import type { ReactElement, ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

/**
 * Generic option type.
 */
interface Option< Value extends any = any > {
	value: Value;
	label: string;
}

interface FilterByConfig {
	/**
	 * The list of operators supported by the field.
	 */
	operators?: Operator[];

	/**
	 * Whether it is a primary filter.
	 *
	 * A primary filter is always visible and is not listed in the "Add filter" component,
	 * except for the list layout where it behaves like a secondary filter.
	 */
	isPrimary?: boolean;
}

type Operator = 'is' | 'isNot' | 'isAny' | 'isNone' | 'isAll' | 'isNotAll';

export type AnyItem = Record< string, any >;

/**
 * A dataview field for a specific property of a data type.
 */
export interface Field< Item extends AnyItem > {
	/**
	 * The unique identifier of the field.
	 */
	id: string;

	/**
	 * The label of the field. Defaults to the id.
	 */
	header?: string;

	/**
	 * Callback used to retrieve the value of the field from the item.
	 * Defaults to `item[ field.id ]`.
	 */
	getValue?: ( args: { item: Item } ) => any;

	/**
	 * Callback used to render the field. Defaults to `field.getValue`.
	 */
	render?: ( args: { item: Item } ) => ReactNode;

	/**
	 * The width of the field column.
	 */
	width?: string | number;

	/**
	 * The minimum width of the field column.
	 */
	maxWidth?: string | number;

	/**
	 * The maximum width of the field column.
	 */
	minWidth?: string | number;

	/**
	 * Whether the field is sortable.
	 */
	enableSorting?: boolean;

	/**
	 * Whether the field is searchable.
	 */
	enableGlobalSearch?: boolean;

	/**
	 * Whether the field is filterable.
	 */
	enableHiding?: boolean;

	/**
	 * The list of options to pick from when using the field as a filter.
	 */
	elements?: Option[];

	/**
	 * Filter config for the field.
	 */
	filterBy?: FilterByConfig | undefined;
}

export type NormalizedField< Item extends AnyItem > = Field< Item > &
	Required< Pick< Field< Item >, 'header' | 'getValue' | 'render' > >;

/**
 * A collection of dataview fields for a data type.
 */
export type Fields< Item extends AnyItem > = Field< Item >[];

export type Data< Item extends AnyItem > = Item[];

/**
 * The filters applied to the dataset.
 */
export interface Filter {
	/**
	 * The field to filter by.
	 */
	field: string;

	/**
	 * The operator to use.
	 */
	operator: Operator;

	/**
	 * The value to filter by.
	 */
	value: any;
}

interface ViewBase {
	/**
	 * The layout of the view.
	 */
	type: string;

	/**
	 * The global search term.
	 */
	search?: string;

	/**
	 * The filters to apply.
	 */
	filters: Filter[];

	/**
	 * The sorting configuration.
	 */
	sort?: {
		/**
		 * The field to sort by.
		 */
		field: string;

		/**
		 * The direction to sort by.
		 */
		direction: SortDirection;
	};

	/**
	 * The active page
	 */
	page?: number;

	/**
	 * The number of items per page
	 */
	perPage?: number;

	/**
	 * The hidden fields.
	 */
	hiddenFields: string[];
}

export interface ViewList extends ViewBase {
	type: 'list';

	layout: {
		/**
		 * The field to use as the primary field.
		 */
		primaryField: string;

		/**
		 * The field to use as the media field.
		 */
		mediaField: string;
	};
}

export interface ViewGrid extends ViewBase {
	type: 'grid';

	layout: {
		/**
		 * The field to use as the primary field.
		 */
		primaryField: string;

		/**
		 * The field to use as the media field.
		 */
		mediaField: string;

		/**
		 * The fields to use as columns.
		 */
		columnFields: string[];

		/**
		 * The fields to use as badge fields.
		 */
		badgeFields: string[];
	};
}

export type View = ViewList | ViewGrid | ViewBase;

interface ActionBase< Item extends AnyItem > {
	/**
	 * The unique identifier of the action.
	 */
	id: string;

	/**
	 * The label of the action.
	 */
	label: string;

	/**
	 * The icon of the action. (Either a string or an SVG element)
	 * This should be IconType from the components package
	 * but that import is breaking typescript build for the moment.
	 */
	icon?: any;

	/**
	 * Whether the action is disabled.
	 */
	disabled?: boolean;

	/**
	 * Whether the action is destructive.
	 */
	isDestructive?: boolean;

	/**
	 * Whether the action is a primary action.
	 */
	isPrimary?: boolean;

	/**
	 * Whether the item passed as an argument supports the current action.
	 */
	isEligible?: ( item: Item ) => boolean;

	/**
	 * Whether the action can be used as a bulk action.
	 */
	supportsBulk?: boolean;
}

export interface ActionModal< Item extends AnyItem >
	extends ActionBase< Item > {
	/**
	 * The callback to execute when the action has finished.
	 */
	onActionPerformed: ( ( items: Item[] ) => void ) | undefined;

	/**
	 * The callback to execute when the action is triggered.
	 */
	onActionStart: ( ( items: Item[] ) => void ) | undefined;

	/**
	 * Modal to render when the action is triggered.
	 */
	RenderModal: ( {
		items,
		closeModal,
		onActionStart,
		onActionPerformed,
	}: {
		items: Item[];
		closeModal?: () => void;
		onActionStart?: ( items: Item[] ) => void;
		onActionPerformed?: ( items: Item[] ) => void;
	} ) => ReactElement;

	/**
	 * Whether to hide the modal header.
	 */
	hideModalHeader?: boolean;

	/**
	 * The header of the modal.
	 */
	modalHeader?: string;
}

export interface ActionButton< Item extends AnyItem >
	extends ActionBase< AnyItem > {
	/**
	 * The callback to execute when the action is triggered.
	 */
	callback: ( items: Item[] ) => void;
}

export type Action< Item extends AnyItem > =
	| ActionModal< Item >
	| ActionButton< Item >;
