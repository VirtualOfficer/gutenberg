/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { useIsSiteEditorLoading } from './hooks';
import Editor from '../editor';
import PagePages from '../page-pages';
import PagePatterns from '../page-patterns';
import PageTemplates from '../page-templates';
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import SidebarNavigationScreenGlobalStyles from '../sidebar-navigation-screen-global-styles';
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import SidebarNavigationScreenNavigationMenus from '../sidebar-navigation-screen-navigation-menus';
import SidebarNavigationScreenPage from '../sidebar-navigation-screen-page';
import SidebarNavigationScreenTemplatesBrowse from '../sidebar-navigation-screen-templates-browse';
import SidebarNavigationScreenTemplate from '../sidebar-navigation-screen-template';
import SidebarNavigationScreenPattern from '../sidebar-navigation-screen-pattern';
import SidebarNavigationScreenPatterns from '../sidebar-navigation-screen-patterns';
import SidebarNavigationScreenNavigationMenu from '../sidebar-navigation-screen-navigation-menu';
import DataViewsSidebarContent from '../sidebar-dataviews';

const { useLocation, useHistory } = unlock( routerPrivateApis );

export default function useLayoutAreas() {
	const isSiteEditorLoading = useIsSiteEditorLoading();
	const history = useHistory();
	const { params } = useLocation();
	const { postType, postId, path, layout, isCustom, canvas } = params;

	useEffect( () => {
		// `/wp_template_part/all` path is no longer used and redirects to
		// Patterns page for backward compatibility.
		if ( path === '/wp_template_part/all' ) {
			history.replace( { path: '/patterns' } );
		}
	}, [ history, path ] );

	// Note: Since "sidebar" is not yet supported here,
	// returning undefined from "mobile" means show the sidebar.

	// Page list
	if ( path === '/page' ) {
		const isListLayout = layout === 'list' || ! layout;
		return {
			key: 'pages-list',
			areas: {
				sidebar: (
					<SidebarNavigationScreen
						title={ __( 'Manage pages' ) }
						backPath={ {} }
						content={ <DataViewsSidebarContent /> }
					/>
				),
				content: <PagePages />,
				preview: isListLayout && (
					<Editor
						isLoading={ isSiteEditorLoading }
						onClick={ () =>
							history.push( {
								postType: 'page',
								postId,
								canvas: 'edit',
							} )
						}
					/>
				),
				mobile:
					canvas === 'edit' ? (
						<Editor isLoading={ isSiteEditorLoading } />
					) : (
						<PagePages />
					),
			},
			widths: {
				content: isListLayout ? 380 : undefined,
			},
		};
	}

	// Regular other post types
	if ( postType && postId ) {
		let sidebar;
		if ( postType === 'wp_template_part' || postType === 'wp_block' ) {
			sidebar = (
				<SidebarNavigationScreenPattern
					backPath={ {
						path: '/patterns',
						categoryId: params.categoryId,
						categoryType: params.categoryType,
					} }
				/>
			);
		} else if ( postType === 'wp_template' ) {
			sidebar = (
				<SidebarNavigationScreenTemplate
					backPath={ { path: '/wp_template' } }
				/>
			);
		} else if ( postType === 'page' ) {
			sidebar = (
				<SidebarNavigationScreenPage
					backPath={ { path: '/page', postId } }
				/>
			);
		} else {
			sidebar = (
				<SidebarNavigationScreenNavigationMenu
					backPath={ { path: '/navigation' } }
				/>
			);
		}
		return {
			key: 'page',
			areas: {
				sidebar,
				preview: <Editor isLoading={ isSiteEditorLoading } />,
				mobile: canvas === 'edit' && (
					<Editor isLoading={ isSiteEditorLoading } />
				),
			},
		};
	}

	// Templates
	if ( path === '/wp_template' ) {
		const isListLayout = isCustom !== 'true' && layout === 'list';
		return {
			key: 'templates-list',
			areas: {
				sidebar: (
					<SidebarNavigationScreenTemplatesBrowse backPath={ {} } />
				),
				content: <PageTemplates />,
				preview: isListLayout && (
					<Editor isLoading={ isSiteEditorLoading } />
				),
				mobile: <PageTemplates />,
			},
			widths: {
				content: isListLayout ? 380 : undefined,
			},
		};
	}

	// Patterns
	// `/wp_template_part/all` path is no longer used and redirects to
	// Patterns page for backward compatibility.
	if ( path === '/patterns' || path === '/wp_template_part/all' ) {
		return {
			key: 'patterns',
			areas: {
				sidebar: <SidebarNavigationScreenPatterns backPath={ {} } />,
				content: <PagePatterns />,
				mobile: <PagePatterns />,
			},
		};
	}

	// Styles
	if ( path === '/wp_global_styles' ) {
		return {
			key: 'styles',
			areas: {
				sidebar: (
					<SidebarNavigationScreenGlobalStyles backPath={ {} } />
				),
				preview: <Editor isLoading={ isSiteEditorLoading } />,
				mobile: canvas === 'edit' && (
					<Editor isLoading={ isSiteEditorLoading } />
				),
			},
		};
	}

	// Navigation
	if ( path === '/navigation' ) {
		if ( postId ) {
			return {
				key: 'navigation',
				areas: {
					sidebar: (
						<SidebarNavigationScreenNavigationMenu
							backPath={ { path: '/navigation' } }
						/>
					),
					preview: <Editor isLoading={ isSiteEditorLoading } />,
					mobile: canvas === 'edit' && (
						<Editor isLoading={ isSiteEditorLoading } />
					),
				},
			};
		}
		return {
			key: 'navigation',
			areas: {
				sidebar: (
					<SidebarNavigationScreenNavigationMenus backPath={ {} } />
				),
				preview: <Editor isLoading={ isSiteEditorLoading } />,
				mobile: canvas === 'edit' && (
					<Editor isLoading={ isSiteEditorLoading } />
				),
			},
		};
	}

	// Fallback shows the home page preview
	return {
		key: 'default',
		areas: {
			sidebar: <SidebarNavigationScreenMain />,
			preview: <Editor isLoading={ isSiteEditorLoading } />,
			mobile: canvas === 'edit' && (
				<Editor isLoading={ isSiteEditorLoading } />
			),
		},
	};
}
