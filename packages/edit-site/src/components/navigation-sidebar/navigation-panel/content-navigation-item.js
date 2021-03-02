/**
 * WordPress dependencies
 */
import { __experimentalNavigationItem as NavigationItem } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getPathAndQueryString } from '@wordpress/url';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { NavigationPanelPreviewFill } from '..';
import TemplatePreview from './template-preview';
import { store as editSiteStore } from '../../../store';

const getTitle = ( entity ) =>
	entity.taxonomy ? entity.name : entity?.title?.rendered;

export default function ContentNavigationItem( { item } ) {
	const [ isPreviewVisible, setIsPreviewVisible ] = useState( false );
	const previewContent = useSelect(
		( select ) => {
			if ( ! isPreviewVisible ) {
				return null;
			}

			const template = select(
				coreStore
			).__experimentalGetTemplateForLink( item.link );
			return template?.content?.raw;
		},
		[ isPreviewVisible ]
	);
	const { setPage, setIsNavigationPanelOpened } = useDispatch(
		editSiteStore
	);

	const onActivateItem = useCallback( () => {
		const { type, slug, link, id } = item;
		setPage( {
			type,
			slug,
			path: getPathAndQueryString( link ),
			context: {
				postType: type,
				postId: id,
			},
		} );
		setIsNavigationPanelOpened( false );
	}, [ setPage, item, setIsNavigationPanelOpened ] );

	if ( ! item ) {
		return null;
	}

	return (
		<>
			<NavigationItem
				className="edit-site-navigation-panel__content-item"
				item={ `${ item.taxonomy || item.type }-${ item.id }` }
				title={ getTitle( item ) || __( '(no title)' ) }
				onClick={ onActivateItem }
				onMouseEnter={ () => setIsPreviewVisible( true ) }
				onMouseLeave={ () => setIsPreviewVisible( false ) }
			/>

			{ isPreviewVisible && previewContent && (
				<NavigationPanelPreviewFill>
					<TemplatePreview
						rawContent={ previewContent }
						blockContext={ {
							postType: item.type,
							postId: item.id,
						} }
					/>
				</NavigationPanelPreviewFill>
			) }
		</>
	);
}
