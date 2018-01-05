/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress Dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { withFocusReturn, Panel, PanelBody } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import './style.scss';
import PostSettings from './post-settings';
import BlockInspectorPanel from './block-inspector-panel';
import Header from './header';
import { getSidebar } from '../../api/sidebar';

import { getActivePanel } from '../../store/selectors';

/**
 * Returns the panel that should be rendered in the sidebar.
 *
 * @param {string} panel The currently active panel.
 *
 * @returns {Object} The React element to render as a panel.
 */
function getPanel( panel ) {
	switch ( panel ) {
		case 'document':
			return PostSettings;

		case 'block':
			return BlockInspectorPanel;

		default:
			return PostSettings;
	}
}

/**
 * Renders a sidebar with the relevant panel.
 *
 * @param {string} panel The currently active panel.
 *
 * @returns {Object} The rendered sidebar.
 */
const Sidebar = ( { panel } ) => {
	const ActivePanel = getPanel( panel );

	const props = {
		panel,
	};

	return (
		<div
			className="editor-sidebar"
			role="region"
			aria-label={ __( 'Editor advanced settings' ) }
			tabIndex="-1"
		>
			<Header />
			<ActivePanel { ...props } />
		</div>
	);
};

export default connect(
	( state ) => {
		return {
			panel: getActivePanel( state ),
		};
	}
)( withFocusReturn( Sidebar ) );
