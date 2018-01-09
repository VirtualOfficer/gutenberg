/**
 * External dependencies
 */
import { connect } from 'react-redux';
import 'element-closest';

/**
 * Internal dependencies
 */
import './style.scss';
import { BlockList, PostTitle, WritingFlow, DefaultBlockAppender, EditorGlobalKeyboardShortcuts } from '../../../components';
import VisualEditorInserter from './inserter';
import { hasFixedToolbar } from '../../../store/selectors';
import { clearSelectedBlock } from '../../../store/actions';

/**
 * Detects whether a block deselect attempt should be prevented. There are
 * several cases in which focus transitions outside the DOM space of a block,
 * but is not truly outside, e.g. managing toolbar or inspector controls.
 *
 * @param {Event} event DOM event
 */
function preventChromeDeselect( event ) {
	// Since we're only concerned with the focus deselect, ensure that other
	// types of deselect are unhandled.
	if ( ! event || event.type !== 'deselect' ) {
		return;
	}

	const { target } = event;
	const isOutside = target && ! target.closest( [
		'.editor-header',
		'.editor-sidebar',
	].join( ',' ) );

	if ( ! isOutside ) {
		event.preventDefault();
	}
}

function VisualEditor( { isFixedToolbar } ) {
	return (
		<div className="editor-visual-editor">
			<EditorGlobalKeyboardShortcuts />
			<WritingFlow>
				<PostTitle />
				<BlockList
					showContextualToolbar={ ! isFixedToolbar }
					onDeselectBlock={ preventChromeDeselect } />
				<DefaultBlockAppender />
			</WritingFlow>
			<VisualEditorInserter />
		</div>
	);
}

export default connect(
	( state ) => {
		return {
			isFixedToolbar: hasFixedToolbar( state ),
		};
	},
	{
		clearSelectedBlock,
	}
)( VisualEditor );
