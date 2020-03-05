/**
 * WordPress dependencies
 */
import { BlockInspector } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import SettingsHeader from '../settings-header';
import PostStatus from '../post-status';
import LastRevision from '../last-revision';
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import PostExcerpt from '../post-excerpt';
import PostLink from '../post-link';
import DiscussionPanel from '../discussion-panel';
import PageAttributes from '../page-attributes';
import MetaBoxes from '../../meta-boxes';
import PluginDocumentSettingPanel from '../plugin-document-setting-panel';
import PluginSidebarEditPost from '../../sidebar/plugin-sidebar';
import { __ } from '@wordpress/i18n';

const SettingsSidebar = () => {
	const additionalProps = {
		closeLabel: __( 'Close Settings' ),
		headerClassName: 'edit-post-sidebar__panel-tabs',
	};
	return (
		<>
			<PluginSidebarEditPost
				complementaryAreaName="edit-post/document"
				header={ <SettingsHeader sidebarName="edit-post/document" /> }
				{ ...{ ...additionalProps } }
			>
				<PostStatus />
				<PluginDocumentSettingPanel.Slot />
				<LastRevision />
				<PostLink />
				<PostTaxonomies />
				<FeaturedImage />
				<PostExcerpt />
				<DiscussionPanel />
				<PageAttributes />
				<MetaBoxes location="side" />
			</PluginSidebarEditPost>
			<PluginSidebarEditPost
				complementaryAreaName="edit-post/block"
				header={ <SettingsHeader sidebarName="edit-post/block" /> }
				{ ...additionalProps }
			>
				<BlockInspector />
			</PluginSidebarEditPost>
		</>
	);
};

export default SettingsSidebar;
