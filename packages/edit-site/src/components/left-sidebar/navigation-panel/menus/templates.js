/**
 * WordPress dependencies
 */
import {
	__experimentalNavigationItem as NavigationItem,
	__experimentalNavigationMenu as NavigationMenu,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import TemplatesPagesMenu from './templates-pages';
import TemplateNavigationItems from '../template-navigation-items';
import TemplatePostsMenu from './templates-posts';
import { TEMPLATES_GENERAL } from '../constants';
import { useSelect } from '@wordpress/data';

export default function TemplatesMenu( { onActiveIdChange } ) {
	const templates = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'postType', 'wp_template', {
				status: [ 'publish', 'auto-draft' ],
				per_page: -1,
			} ),
		[]
	);

	const generalTemplates = templates?.filter( ( { slug } ) =>
		TEMPLATES_GENERAL.includes( slug )
	);

	return (
		<NavigationMenu menu="templates" title="Templates" parentMenu="root">
			<NavigationItem navigateToMenu="templates-pages" title="Pages" />
			<NavigationItem navigateToMenu="templates-posts" title="Posts" />

			<TemplateNavigationItems
				templates={ generalTemplates }
				onActivate={ onActiveIdChange }
			/>

			<TemplatePostsMenu
				templates={ templates }
				onActiveIdChange={ onActiveIdChange }
			/>

			<TemplatesPagesMenu
				templates={ templates }
				onActiveIdChange={ onActiveIdChange }
			/>
		</NavigationMenu>
	);
}
