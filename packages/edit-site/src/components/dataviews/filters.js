/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { default as InFilter, OPERATOR_IN } from './in-filter';
import AddFilter from './add-filter';
import ResetFilters from './reset-filters';

const ENUMERATION_TYPE = 'enumeration';

export default function Filters( { fields, view, onChangeView } ) {
	const filters = [];
	fields.forEach( ( field ) => {
		if ( ! field.type ) {
			return;
		}

		switch ( field.type ) {
			case ENUMERATION_TYPE:
				filters.push( {
					field: field.id,
					operator: OPERATOR_IN,
					name: field.header,
					type: field.type,
					elements: [
						{
							value: '',
							label: __( 'All' ),
						},
						...( field.elements || [] ),
					],
					isVisible: view.filters.some(
						( f ) => f.field === field.id && f.operator === filter
					),
				} );
		}
	} );

	const filterComponents = filters?.map( ( filter ) => {
		if ( ! filter.isVisible ) {
			return null;
		}

		if ( OPERATOR_IN === filter.operator ) {
			return (
				<InFilter
					key={ filter.field + '.' + filter.operator }
					filter={ filter }
					view={ view }
					onChangeView={ onChangeView }
				/>
			);
		}

		return null;
	} );

	filterComponents.push(
		<AddFilter
			key="add-filter"
			fields={ fields }
			view={ view }
			onChangeView={ onChangeView }
		/>
	);

	if ( filterComponents.length > 1 ) {
		filterComponents.push(
			<ResetFilters
				key="reset-filters"
				view={ view }
				onChangeView={ onChangeView }
			/>
		);
	}

	return filterComponents;
}
