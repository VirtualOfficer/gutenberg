/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';

function TemplateTitle() {
	const { template, isEditing } = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( editorStore );
		const { __experimentalGetTemplateForLink } = select( coreStore );
		const { isEditingTemplate } = select( editPostStore );
		const link = getEditedPostAttribute( 'link' );
		return {
			template: link ? __experimentalGetTemplateForLink( link ) : null,
			isEditing: isEditingTemplate(),
		};
	}, [] );

	if ( ! isEditing || ! template ) {
		return null;
	}

	return (
		<span className="edit-post-template-title">
			{
				/* translators: 1: Template name. */
				sprintf( __( 'Editing template: %s' ), template.post_title )
			}
		</span>
	);
}

export default TemplateTitle;
