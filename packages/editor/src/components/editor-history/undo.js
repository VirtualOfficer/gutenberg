/**
 * WordPress dependencies
 */
import { __, isRTL } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { displayShortcut } from '@wordpress/keycodes';
import { undo as undoIcon, redo as redoIcon } from '@wordpress/icons';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

/** @typedef {import('react').Ref<HTMLElement>} Ref */

/**
 * Component to Renders the undo button for the editor history.
 *
 * @param {Object} props - Props.
 * @param {Ref}    ref   - Reference with the element.
 *
 * @return {Element} The component to be rendered.
 */
function EditorHistoryUndo( props, ref ) {
	const hasUndo = useSelect(
		( select ) => select( editorStore ).hasEditorUndo(),
		[]
	);
	const { undo } = useDispatch( editorStore );
	return (
		<Button
			{ ...props }
			ref={ ref }
			icon={ ! isRTL() ? undoIcon : redoIcon }
			/* translators: button label text should, if possible, be under 16 characters. */
			label={ __( 'Undo' ) }
			shortcut={ displayShortcut.primary( 'z' ) }
			// If there are no undo levels we don't want to actually disable this
			// button, because it will remove focus for keyboard users.
			// See: https://github.com/WordPress/gutenberg/issues/3486
			aria-disabled={ ! hasUndo }
			onClick={ hasUndo ? undo : undefined }
			className="editor-history__undo"
		/>
	);
}

export default forwardRef( EditorHistoryUndo );
