/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import './style.scss';
import Dashicon from '../../../components/dashicon';

/**
 * Set of available mode options.
 *
 * @type {Array}
 */
const MODES = [
	{
		value: 'visual',
		label: wp.i18n.__( 'Visual' )
	},
	{
		value: 'text',
		label: wp.i18n._x( 'Text', 'Name for the Text editor tab (formerly HTML)' )
	}
];

function ModeSwitcher( { mode, onSwitch } ) {
	// Disable reason: Toggling between modes should take effect immediately,
	// arguably even with keyboard navigation. `onBlur` only would require
	// another action to remove focus from the select (tabbing or clicking
	// outside the field), which is unexpected when submit button is omitted.

	/* eslint-disable jsx-a11y/no-onchange */
	return (
		<div className="editor-mode-switcher">
			<select
				value={ mode }
				onChange={ ( event ) => onSwitch( event.target.value ) }
				className="editor-mode-switcher__input"
			>
				{ MODES.map( ( { value, label } ) =>
					<option key={ value } value={ value }>
						{ label }
					</option>
				) }
			</select>
			<Dashicon icon="arrow-down" />
		</div>
	);
	/* eslint-enable jsx-a11y/no-onchange */
}

export default connect(
	( state ) => ( {
		mode: state.mode
	} ),
	( dispatch ) => ( {
		onSwitch( mode ) {
			dispatch( {
				type: 'SWITCH_MODE',
				mode: mode
			} );
		}
	} )
)( ModeSwitcher );
