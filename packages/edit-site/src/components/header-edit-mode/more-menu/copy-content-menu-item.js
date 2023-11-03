/**
 * WordPress dependencies
 */
import { MenuItem } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useCopyToClipboard } from '@wordpress/compose';
import { store as noticesStore } from '@wordpress/notices';
import { store as coreStore } from '@wordpress/core-data';
import { __unstableSerializeAndClean } from '@wordpress/blocks';

export default function CopyContentMenuItem( { postType, postId } ) {
	const { createNotice } = useDispatch( noticesStore );
	const { getEditedEntityRecord } = useSelect( coreStore );

	function getText() {
		const record = getEditedEntityRecord( 'postType', postType, postId );
		if ( ! record ) {
			return '';
		}

		if ( typeof record.content === 'function' ) {
			return record.content( record );
		} else if ( record.blocks ) {
			return __unstableSerializeAndClean( record.blocks );
		} else if ( record.content ) {
			return record.content;
		}
	}

	function onSuccess() {
		createNotice( 'info', __( 'All content copied.' ), {
			isDismissible: true,
			type: 'snackbar',
		} );
	}

	const ref = useCopyToClipboard( getText, onSuccess );

	return <MenuItem ref={ ref }>{ __( 'Copy all blocks' ) }</MenuItem>;
}
