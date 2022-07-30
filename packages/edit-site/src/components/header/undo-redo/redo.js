/**
 * WordPress dependencies
 */
import { __, sprintf, isRTL } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { redo as redoIcon, undo as undoIcon } from '@wordpress/icons';
import { displayShortcut, isAppleOS } from '@wordpress/keycodes';
import { store as coreStore } from '@wordpress/core-data';
import { forwardRef } from '@wordpress/element';

function RedoButton( props, ref ) {
	const shortcut = isAppleOS()
		? displayShortcut.primaryShift( 'z' )
		: sprintf(
				// translators: %1$s: Shortcut text. %2$s: Shortcut text.
				'%1$s or %2$s',
				displayShortcut.primaryShift( 'z' ),
				displayShortcut.primary( 'y' )
		  );

	const hasRedo = useSelect(
		( select ) => select( coreStore ).hasRedo(),
		[]
	);
	const { redo } = useDispatch( coreStore );
	return (
		<Button
			{ ...props }
			ref={ ref }
			icon={ ! isRTL() ? redoIcon : undoIcon }
			label={ __( 'Redo' ) }
			shortcut={ shortcut }
			// If there are no undo levels we don't want to actually disable this
			// button, because it will remove focus for keyboard users.
			// See: https://github.com/WordPress/gutenberg/issues/3486
			aria-disabled={ ! hasRedo }
			onClick={ hasRedo ? redo : undefined }
		/>
	);
}

export default forwardRef( RedoButton );
