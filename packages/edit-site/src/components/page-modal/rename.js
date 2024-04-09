/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	store as editorStore,
	privateApis as editorPrivateApis,
} from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { store as interfaceStore } from '@wordpress/interface';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { PAGE_MODALS } from './';
import useEditedEntityRecord from '../use-edited-entity-record';

const { RenamePostModalContent } = unlock( editorPrivateApis );

export default function PageRenameModal() {
	const { postId, postType } = useSelect( ( select ) => {
		const { getCurrentPostType, getCurrentPostId } = select( editorStore );

		return {
			postId: getCurrentPostId(),
			postType: getCurrentPostType(),
		};
	}, [] );

	const { record: page } = useEditedEntityRecord( postType, postId );
	const { closeModal } = useDispatch( interfaceStore );
	const isActive = useSelect( ( select ) =>
		select( interfaceStore ).isModalActive( PAGE_MODALS.rename )
	);

	if ( ! isActive ) {
		return null;
	}

	return (
		<Modal
			closeModal={ closeModal }
			focusOnMount="firstContentElement"
			onRequestClose={ closeModal }
			page={ page }
			title={ __( 'Rename' ) }
		>
			<RenamePostModalContent
				items={ [ page ] }
				closeModal={ closeModal }
			/>
		</Modal>
	);
}
