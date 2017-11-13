/**
 * External Dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { ChoiceMenu, withInstanceId } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import { isFeatureActive } from '../../selectors';
import { toggleFeature } from '../../actions';

/**
 * Set of available choices options.
 *
 * @type {Array}
 */
const CHOICES = [
	{
		value: 'top',
		label: __( 'Fix to top' ),
		icon: 'editor-kitchensink',
	},
	{
		value: 'block',
		label: __( 'Fix to block' ),
		icon: 'block-default',
	},
];

function FeatureToggle( { onToggle, active } ) {
	const currentValue = active ? 'block' : 'top';
	const onSelect = ( value ) => {
		if ( currentValue !== value ) {
			onToggle();
		}
	};
	return (
		<ChoiceMenu
			label={ __( 'Toolbar position' ) }
			choices={ CHOICES }
			value={ currentValue }
			onSelect={ onSelect }
		/>
	);
}

export default connect(
	( state ) => ( {
		active: isFeatureActive( state, 'fixedToolbar' ),
	} ),
	( dispatch ) => ( {
		onToggle() {
			dispatch( toggleFeature( 'fixedToolbar' ) );
		},
	} )
)( withInstanceId( FeatureToggle ) );
