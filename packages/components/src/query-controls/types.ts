/**
 * Internal dependencies
 */
import type { FormTokenFieldProps } from '../form-token-field/types';
import type { TreeSelectProps } from '../tree-select/types';

export type Author = {
	id: number;
	name: string;
};

export type Category = {
	id: number;
	name: string;
	parent: number;
};

export type TermWithParentAndChildren = {
	id: string;
	name: string;
	parent: number | null;
	children: TermWithParentAndChildren[];
};

export type TermsByParent = Record< string, TermWithParentAndChildren[] >;

export type CategorySelectProps = Pick<
	TreeSelectProps,
	'label' | 'noOptionLabel'
> & {
	categoriesList: Category[];
	onChange: ( newCategory: string ) => void;
	selectedCategoryId?: Category[ 'id' ];
};

export type AuthorSelectProps = Pick<
	TreeSelectProps,
	'label' | 'noOptionLabel'
> & {
	authorList?: Author[];
	onChange: ( newAuthor: string ) => void;
	selectedAuthorId?: Author[ 'id' ];
};

type Order = 'asc' | 'desc';
type OrderBy = 'date' | 'title';

type BaseQueryControlsProps = {
	/**
	 * An array of the authors to select from.
	 */
	authorList?: AuthorSelectProps[ 'authorList' ];
	/**
	 * The maximum number of items.
	 *
	 * @default 100
	 */
	maxItems?: number;
	/**
	 * The minimum number of items.
	 *
	 * @default 1
	 */
	minItems?: number;
	/**
	 * The selected number of items to retrieve via the query.
	 */
	numberOfItems?: number;
	/**
	 * A function that receives the new author value.
	 * If this prop is not specified, the author controls are not included.
	 */
	onAuthorChange?: AuthorSelectProps[ 'onChange' ];
	/**
	 * A function that receives the new number of items value.
	 * If this prop is not specified, then the number of items
	 * range control is not included.
	 */
	onNumberOfItemsChange?: ( newNumber?: number ) => void;
	/**
	 * A function that receives the new order value.
	 * If this prop or the `onOrderByChange` prop are not specified,
	 * then the order controls are not included.
	 */
	onOrderChange?: ( newOrder: Order ) => void;
	/**
	 * A function that receives the new orderby value.
	 * If this prop or the `onOrderChange` prop are not specified,
	 * then the order controls are not included.
	 */
	onOrderByChange?: ( newOrderBy: OrderBy ) => void;
	/**
	 * The order in which to retrieve posts.
	 */
	order?: Order;
	/**
	 * The meta key by which to order posts.
	 */
	orderBy?: OrderBy;
	/**
	 * The selected author ID.
	 */
	selectedAuthorId?: AuthorSelectProps[ 'selectedAuthorId' ];
};

export type QueryControlsWithSingleCategorySelectionProps =
	BaseQueryControlsProps & {
		/**
		 * An array of categories, renders UI that allows selecting one category at
		 * a time when passed in conjunction with the `onCategoryChange` prop.
		 */
		categoriesList?: CategorySelectProps[ 'categoriesList' ];
		/**
		 * The selected category for the `categoriesList` prop.
		 */
		selectedCategoryId?: CategorySelectProps[ 'selectedCategoryId' ];
		/**
		 * A function that receives the new category value.
		 * If this prop is not specified, the category controls are not included.
		 */
		onCategoryChange?: CategorySelectProps[ 'onChange' ];
	};

export type QueryControlsWithMultipleCategorySelectionProps =
	BaseQueryControlsProps & {
		/**
		 * An array of category names, renders UI that enables multiple selection
		 * when passed in conjunction with the `onCategoryChange` prop.
		 */
		categorySuggestions?: Record< Category[ 'name' ], Category >;
		/**
		 * The selected categories for the `categorySuggestions` prop.
		 */
		selectedCategories?: Category[];
		/**
		 * A function that receives the new category value.
		 * If this is not specified, the category controls are not included.
		 */
		onCategoryChange?: FormTokenFieldProps[ 'onChange' ];
	};

export type QueryControlsProps =
	| QueryControlsWithSingleCategorySelectionProps
	| QueryControlsWithMultipleCategorySelectionProps;
