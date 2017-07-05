/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Panel } from 'components';

/**
 * Internal Dependencies
 */
import './style.scss';
import PostStatus from '../post-status';
import PostExcerpt from '../post-excerpt';
import PostTaxonomies from '../post-taxonomies';
import FeaturedImage from '../featured-image';
import DiscussionPanel from '../discussion-panel';
import LastRevision from '../last-revision';
import TableOfContents from '../table-of-contents';
import CollaborationPanel from '../collaboration';

const PostSettings = () => {
	return (
		<Panel>
			<PostStatus />
			<LastRevision />
			<PostTaxonomies />
			<FeaturedImage />
			<PostExcerpt />
			<DiscussionPanel />
			<TableOfContents />
			<CollaborationPanel />
		</Panel>
	);
};

export default connect(
	undefined,
	( dispatch ) => ( {
		toggleSidebar: () => dispatch( { type: 'TOGGLE_SIDEBAR' } ),
	} )
)( PostSettings );
