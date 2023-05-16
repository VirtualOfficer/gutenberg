/**
 * WordPress dependencies
 */
import { sprintf, __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import {
	Button,
	VisuallyHidden,
	__experimentalText as Text,
} from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';
import { privateApis as commandsPrivateApis } from '@wordpress/commands';

/**
 * Internal dependencies
 */
import useEditedEntityRecord from '../../use-edited-entity-record';
import { unlock } from '../../../private-apis';

const { store: commandsStore } = unlock( commandsPrivateApis );

export default function DocumentActions() {
	const { open: openCommandCenter } = useDispatch( commandsStore );
	const { isLoaded, record, getTitle, icon } = useEditedEntityRecord();

	// Return a simple loading indicator until we have information to show.
	if ( ! isLoaded ) {
		return null;
	}

	// Return feedback that the template does not seem to exist.
	if ( ! record ) {
		return (
			<div className="edit-site-document-actions">
				{ __( 'Document not found' ) }
			</div>
		);
	}

	const entityLabel =
		record.type === 'wp_template_part'
			? __( 'template part' )
			: __( 'template' );

	const isMac = /Mac|iPod|iPhone|iPad/.test( window.navigator.platform );

	return (
		<div className="edit-site-document-actions">
			<span className="edit-site-document-actions__left"></span>
			<Text
				size="body"
				as="h1"
				className="edit-site-document-actions__title"
			>
				<Button onClick={ () => openCommandCenter() }>
					<BlockIcon icon={ icon } />
					<VisuallyHidden as="span">
						{ sprintf(
							/* translators: %s: the entity being edited, like "template"*/
							__( 'Editing %s: ' ),
							entityLabel
						) }
					</VisuallyHidden>
					{ getTitle() }
				</Button>
			</Text>
			<Button
				className="edit-site-document-actions__shortcut"
				onClick={ openCommandCenter }
			>
				{ isMac ? '⌘' : 'Ctrl' } K
			</Button>
		</div>
	);
}
