/**
 * WordPress dependencies
 */
import { getPathAndQueryString } from '@wordpress/url';
import { __experimentalNavigationGroup as NavigationGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NavigationEntityItems from './navigation-entity-items';

const pathKeyExtractor = ( { entity: { link } } ) =>
	getPathAndQueryString( link );

export default function PageSwitcher( { onChangePage } ) {
	const onPageSelect = ( { type, slug, link, id }, item ) => {
		onChangePage(
			{
				type,
				slug,
				path: getPathAndQueryString( link ),
				context: {
					postType: type,
					postId: id,
				},
			},
			item
		);
	};

	return (
		<>
			<NavigationGroup title={ __( 'Pages' ) }>
				<NavigationEntityItems
					kind="postType"
					name="page"
					getKey={ pathKeyExtractor }
					renderItem={ ( { ItemComponent, entity, item, props } ) => (
						<ItemComponent
							{ ...props }
							title={ entity.title.rendered }
							onClick={ () => onPageSelect( entity, item ) }
						/>
					) }
				/>
			</NavigationGroup>

			<NavigationGroup title={ __( 'Categories' ) }>
				<NavigationEntityItems
					kind="taxonomy"
					name="category"
					getKey={ pathKeyExtractor }
					renderItem={ ( { ItemComponent, entity, item, props } ) => (
						<ItemComponent
							{ ...props }
							title={ entity.name }
							onClick={ () => onPageSelect( entity, item ) }
						/>
					) }
				/>
			</NavigationGroup>

			<NavigationGroup title={ __( 'Posts' ) }>
				<NavigationEntityItems
					kind="postType"
					name="post"
					getKey={ pathKeyExtractor }
					renderItem={ ( { ItemComponent, entity, item, props } ) => (
						<ItemComponent
							{ ...props }
							title={ entity.title.rendered }
							onClick={ () => onPageSelect( entity, item ) }
						/>
					) }
				/>
			</NavigationGroup>
		</>
	);
}
