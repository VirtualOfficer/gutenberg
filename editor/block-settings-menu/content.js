/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { isEditorSidebarOpened, getBlockMode } from '../selectors';
import { selectBlock, removeBlock, toggleSidebar, setActivePanel, toggleBlockMode } from '../actions';

function BlockSettingsMenuContent( { onDelete, onSelect, isSidebarOpened, mode, onToggleSidebar, onShowInspector, onToggleMode } ) {
	const toggleInspector = () => {
		onSelect();
		onShowInspector();
		if ( ! isSidebarOpened ) {
			onToggleSidebar();
		}
	};

	return (
		<div className="editor-block-settings-menu__content">
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ toggleInspector }
				icon="admin-generic"
				label={ __( 'Show inspector' ) }
			/>
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ onDelete }
				icon="trash"
				label={ __( 'Delete the block' ) }
			/>
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ onToggleMode }
				icon={ mode === 'html' ? 'edit' : 'html' }
				label={ __( 'Delete the block' ) }
			/>
		</div>
	);
}

export default connect(
	( state, ownProps ) => ( {
		isSidebarOpened: isEditorSidebarOpened( state ),
		mode: getBlockMode( state, ownProps.uid ),
	} ),
	( dispatch, ownProps ) => ( {
		onDelete() {
			dispatch( removeBlock( ownProps.uid ) );
		},
		onSelect() {
			dispatch( selectBlock( ownProps.uid ) );
		},
		onShowInspector() {
			dispatch( setActivePanel( 'block' ) );
		},
		onToggleSidebar() {
			dispatch( toggleSidebar() );
		},
		onToggleMode() {
			dispatch( toggleBlockMode( ownProps.uid ) );
		},
	} )
)( BlockSettingsMenuContent );
