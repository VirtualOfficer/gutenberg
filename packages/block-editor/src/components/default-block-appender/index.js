/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { getDefaultBlockName } from '@wordpress/blocks';
import { decodeEntities } from '@wordpress/html-entities';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Inserter from '../inserter';
import { store as blockEditorStore } from '../../store';

export function DefaultBlockAppender( {
	isLocked,
	isVisible,
	onAppend,
	showPrompt,
	placeholder,
	rootClientId,
} ) {
	if ( isLocked || ! isVisible ) {
		return null;
	}

	const value =
		decodeEntities( placeholder ) || __( 'Type / to choose a block' );

	// The appender "button" is in-fact a text field so as to support
	// transitions by WritingFlow occurring by arrow key press. WritingFlow
	// only supports tab transitions into text fields and to the block focus
	// boundary.
	//
	// See: https://github.com/WordPress/gutenberg/issues/4829#issuecomment-374213658
	//
	// If it were ever to be made to be a proper `button` element, it is
	// important to note that `onFocus` alone would not be sufficient to
	// capture click events, notably in Firefox.
	//
	// See: https://gist.github.com/cvrebert/68659d0333a578d75372

	// The wp-block className is important for editor styles.

	return (
		<div
			data-root-client-id={ rootClientId || '' }
			className="block-editor-default-block-appender"
		>
			<p
				contentEditable
				suppressContentEditableWarning
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
				role="button"
				aria-label={ __( 'Add block' ) }
				className="wp-block block-editor-default-block-appender__content"
				onFocus={ onAppend }
			>
				{ showPrompt ? value : '' }
			</p>
			<Inserter
				rootClientId={ rootClientId }
				position="bottom right"
				isAppender
				__experimentalIsQuick
			/>
		</div>
	);
}

export default compose(
	withSelect( ( select, ownProps ) => {
		const {
			getBlockCount,
			getBlockName,
			isBlockValid,
			getSettings,
			getTemplateLock,
		} = select( blockEditorStore );

		const isEmpty = ! getBlockCount( ownProps.rootClientId );
		const isLastBlockDefault =
			getBlockName( ownProps.lastBlockClientId ) ===
			getDefaultBlockName();
		const isLastBlockValid = isBlockValid( ownProps.lastBlockClientId );
		const { bodyPlaceholder } = getSettings();

		return {
			isVisible: isEmpty || ! isLastBlockDefault || ! isLastBlockValid,
			showPrompt: isEmpty,
			isLocked: !! getTemplateLock( ownProps.rootClientId ),
			placeholder: bodyPlaceholder,
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { insertDefaultBlock, startTyping } = dispatch(
			blockEditorStore
		);

		return {
			onAppend() {
				const { rootClientId } = ownProps;

				insertDefaultBlock( undefined, rootClientId );
				startTyping();
			},
		};
	} )
)( DefaultBlockAppender );
