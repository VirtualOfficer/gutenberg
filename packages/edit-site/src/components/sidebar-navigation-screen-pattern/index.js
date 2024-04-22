/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { pencil } from '@wordpress/icons';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import SidebarButton from '../sidebar-button';
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import useInitEditedEntityFromURL from '../sync-state-with-url/use-init-edited-entity-from-url';
import usePatternDetails from './use-pattern-details';
import { store as editSiteStore } from '../../store';
import { unlock } from '../../lock-unlock';
import TemplateActions from '../template-actions';

const { useLocation, useHistory } = unlock( routerPrivateApis );

export default function SidebarNavigationScreenPattern() {
	const history = useHistory();
	const location = useLocation();
	const {
		params: { postType, postId },
	} = location;
	const { setCanvasMode } = unlock( useDispatch( editSiteStore ) );

	useInitEditedEntityFromURL();

	const patternDetails = usePatternDetails( postType, postId );
	const isBlockBasedTheme = useSelect(
		( select ) => select( coreStore ).getCurrentTheme()?.is_block_theme,
		[]
	);
	const backPath =
		! isBlockBasedTheme && postType === 'wp_template_part'
			? { path: '/wp_template_part/all' }
			: { path: '/patterns' };

	return (
		<SidebarNavigationScreen
			actions={
				<>
					<TemplateActions
						postType={ postType }
						postId={ postId }
						toggleProps={ { as: SidebarButton } }
						onRemove={ () => {
							history.push( backPath );
						} }
					/>
					<SidebarButton
						onClick={ () => setCanvasMode( 'edit' ) }
						label={ __( 'Edit' ) }
						icon={ pencil }
					/>
				</>
			}
			backPath={ backPath }
			{ ...patternDetails }
		/>
	);
}
