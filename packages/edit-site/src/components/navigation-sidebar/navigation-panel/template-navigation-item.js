/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalNavigationItem as NavigationItem,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplatePreview from './template-preview';
import { NavigationPanelPreviewFill } from '../index';
import { getTemplateInfo } from '../../../utils';

export default function TemplateNavigationItem( { itemId, itemType } ) {
	const item = useSelect( ( select ) =>
		select( 'core' ).getEntityRecord( 'postType', itemType, itemId )
	);
	const { setTemplate, setTemplatePart } = useDispatch( 'core/edit-site' );
	const [ isPreviewVisible, setIsPreviewVisible ] = useState( false );

	const { title, description } = getTemplateInfo( item );

	const onActivateItem = () =>
		'wp_template' === itemType
			? setTemplate( itemId )
			: setTemplatePart( itemId );

	return (
		<NavigationItem
			className="edit-site-navigation-panel__template-item"
			item={ `${ itemType }-${ itemId }` }
			title={ title }
		>
			<Button
				onClick={ onActivateItem }
				onMouseEnter={ () => setIsPreviewVisible( true ) }
				onMouseLeave={ () => setIsPreviewVisible( false ) }
			>
				{ title }
				{ description && (
					<div className="edit-site-navigation-panel__template-item-description">
						{ description }
					</div>
				) }
			</Button>

			{ isPreviewVisible && (
				<NavigationPanelPreviewFill>
					<TemplatePreview rawContent={ item.content.raw } />
				</NavigationPanelPreviewFill>
			) }
		</NavigationItem>
	);
}
