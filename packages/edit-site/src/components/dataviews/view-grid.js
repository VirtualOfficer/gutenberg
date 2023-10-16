/**
 * WordPress dependencies
 */
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	FlexBlock,
	Placeholder,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import FieldActions from './field-actions';

export function ViewGrid( { data, fields, view, actions } ) {
	const mediaField = fields.find(
		( field ) => field.id === view.layoutConfig.mediaField
	);
	const visibleFields = fields.filter(
		( field ) =>
			! view.hiddenFields.includes( field.id ) &&
			field.id !== view.layoutConfig.mediaField
	);
	return (
		<Grid gap={ 6 } columns={ 2 }>
			{ data.map( ( item, index ) => {
				return (
					<VStack key={ index }>
						<div className="dataviews-view-grid__media">
							{ ( mediaField &&
								mediaField.render( { item } ) ) || (
								<Placeholder
									withIllustration
									style={ {
										width: '100%',
										minHeight: '200px',
									} }
								/>
							) }
						</div>

						<HStack justify="space-between" alignment="top">
							<FlexBlock>
								<VStack>
									{ visibleFields.map( ( field ) => (
										<div key={ field.id }>
											{ field.render
												? field.render( { item } )
												: field.accessorFn( item ) }
										</div>
									) ) }
								</VStack>
							</FlexBlock>
							<FieldActions item={ item } actions={ actions } />
						</HStack>
					</VStack>
				);
			} ) }
		</Grid>
	);
}
