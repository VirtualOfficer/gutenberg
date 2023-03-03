/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import {
	__experimentalUseNavigator as useNavigator,
	ExternalLink,
} from '@wordpress/components';
import { useEntityRecord } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';
import { pencil } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import { unlock } from '../../private-apis';
import { store as editSiteStore } from '../../store';
import SidebarButton from '../sidebar-button';

export default function SidebarNavigationScreenNavigationItem() {
	const { setCanvasMode } = unlock( useDispatch( editSiteStore ) );
	const {
		params: { postType, postId },
	} = useNavigator();
	const { record } = useEntityRecord( 'postType', postType, postId );

	return (
		<SidebarNavigationScreen
			title={ record ? decodeEntities( record?.title?.rendered ) : null }
			actions={
				<SidebarButton
					onClick={ () => setCanvasMode( 'edit' ) }
					label={ __( 'Edit' ) }
					icon={ pencil }
				/>
			}
			description={
				postType === 'page'
					? __( 'This is a static page.' )
					: __( 'This is your posts page' )
			}
			content={
				<>
					{ record?.link ? (
						<ExternalLink
							className="edit-site-sidebar-navigation-screen__page-link"
							href={ record.link }
						>
							{ record.link }
						</ExternalLink>
					) : null }
					{ record
						? decodeEntities( record?.description?.rendered )
						: null }
				</>
			}
		/>
	);
}
