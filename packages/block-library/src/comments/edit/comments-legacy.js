/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	AlignmentControl,
	BlockControls,
	Warning,
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEntityProp, store as coreStore } from '@wordpress/core-data';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Placeholder from './placeholder';

export default function CommentsLegacy( {
	attributes,
	setAttributes,
	context: { postType, postId },
} ) {
	const { textAlign } = attributes;

	const [ commentStatus ] = useEntityProp(
		'postType',
		postType,
		'comment_status',
		postId
	);

	const { defaultCommentStatus } = useSelect(
		( select ) =>
			select( blockEditorStore ).getSettings()
				.__experimentalDiscussionSettings
	);

	const isSiteEditor = postType === undefined || postId === undefined;

	const postTypeSupportsComments = useSelect( ( select ) =>
		postType
			? !! select( coreStore ).getPostType( postType )?.supports.comments
			: false
	);

	let warning = __(
		"Comments block: You're currently using this block in legacy mode. The following is just a placeholder, not a real comment. The final styling may differ because it also depends on the current theme. For better compatibility with the Block Editor, please consider switching the block to its editable mode."
	);
	let showPlacholder = true;

	if ( ! isSiteEditor && 'open' !== commentStatus ) {
		if ( 'closed' === commentStatus ) {
			warning = sprintf(
				/* translators: 1: Post type (i.e. "post", "page") */
				__(
					'Post Comments block: Comments to this %s are not allowed.'
				),
				postType
			);
			showPlacholder = false;
		} else if ( ! postTypeSupportsComments ) {
			warning = sprintf(
				/* translators: 1: Post type (i.e. "post", "page") */
				__(
					'Post Comments block: Comments for this post type (%s) are not enabled.'
				),
				postType
			);
			showPlacholder = false;
		} else if ( 'open' !== defaultCommentStatus ) {
			warning = __( 'Post Comments block: Comments are not enabled.' );
			showPlacholder = false;
		}
	}

	const removeLegacy = () => {
		setAttributes( { legacy: false } );
	};

	const actions = [
		<Button key="convert" onClick={ removeLegacy } variant="primary">
			{ __( 'Switch to editable mode' ) }
		</Button>,
	];

	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	return (
		<>
			<BlockControls group="block">
				<AlignmentControl
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>

			<div { ...blockProps }>
				<Warning actions={ actions }>{ warning }</Warning>

				{ showPlacholder && (
					<Placeholder postId={ postId } postType={ postType } />
				) }
			</div>
		</>
	);
}
