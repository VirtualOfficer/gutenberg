/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { Warning } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

function PostTagsDisplay( { context } ) {
	const [ tags ] = useEntityProp(
		'postType',
		context.postType,
		'tags',
		context.postId
	);
	const tagLinks = useSelect(
		( select ) => {
			const { getEntityRecord } = select( 'core' );
			let loaded = true;
			const links = tags.map( ( tagId ) => {
				const tag = getEntityRecord( 'taxonomy', 'post_tag', tagId );
				if ( ! tag ) {
					return ( loaded = false );
				}
				return (
					<a key={ tagId } href={ tag.link }>
						{ tag.name }
					</a>
				);
			} );
			return loaded && links;
		},
		[ tags ]
	);
	return (
		tagLinks &&
		( tagLinks.length === 0
			? __( 'No tags.' )
			: tagLinks.reduce( ( prev, curr ) => [ prev, ' | ', curr ] ) )
	);
}

export default function PostTagsEdit( { context } ) {
	if ( ! context.postType || ! context.postId ) {
		return (
			<Warning>
				{ __( 'Post tags block: No post found for this block.' ) }
			</Warning>
		);

		/**
		 * Do not render the block when viewing a page (as opposed to a post)
		 *
		 * @todo By default, only posts can be grouped by tags. Therefore, without any configuration,
		 * the post tags block will have no tags for pages. Plugins, however, can modify this behavior.
		 * In the future, instead of only evaluating posts, we should check whether the
		 * post_tag taxonomy is registered for the page post type.
		 */
	} else if ( context.postType !== 'post' ) {
		return (
			<Warning>
				{ __(
					'Post tags block: Tags are only available in posts. Please add this block to a post instead.'
				) }
			</Warning>
		);
	}

	return <PostTagsDisplay context={ context } />;
}
