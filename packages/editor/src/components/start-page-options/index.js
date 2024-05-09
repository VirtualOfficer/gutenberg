/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';
import { TEMPLATE_POST_TYPE } from '../../store/constants';

function StartPageOptionsModal() {
	const { setIsInserterOpened } = useDispatch( editorStore );
	useEffect( () => {
		setIsInserterOpened( { tab: 'patterns', category: 'core/content' } );
	}, [ setIsInserterOpened ] );
	return null;
}

export default function StartPageOptions() {
	const [ isClosed, setIsClosed ] = useState( false );
	const { shouldEnableModal, postType, postId } = useSelect( ( select ) => {
		const {
			isEditedPostDirty,
			isEditedPostEmpty,
			getCurrentPostType,
			getCurrentPostId,
		} = select( editorStore );
		const _postType = getCurrentPostType();

		return {
			shouldEnableModal:
				! isEditedPostDirty() &&
				isEditedPostEmpty() &&
				TEMPLATE_POST_TYPE !== _postType,
			postType: _postType,
			postId: getCurrentPostId(),
		};
	}, [] );

	useEffect( () => {
		// Should reset the modal state when navigating to a new page/post.
		setIsClosed( false );
	}, [ postType, postId ] );

	if ( ! shouldEnableModal || isClosed ) {
		return null;
	}

	return <StartPageOptionsModal onClose={ () => setIsClosed( true ) } />;
}
