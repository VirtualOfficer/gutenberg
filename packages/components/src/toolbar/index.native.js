/**
 * External dependencies
 */
import classnames from 'classnames';
import { flatMap } from 'lodash';
import { View } from 'react-native';

/**
 * Internal dependencies
 */
import IconButton from '../icon-button';

/**
 * Renders a toolbar with controls.
 *
 * The `controls` prop accepts an array of sets. A set is an array of controls.
 * Controls have the following shape:
 *
 * ```
 * {
 *   icon: string,
 *   title: string,
 *   subscript: string,
 *   onClick: Function,
 *   isActive: boolean,
 *   isDisabled: boolean
 * }
 * ```
 *
 * For convenience it is also possible to pass only an array of controls. It is
 * then assumed this is the only set.
 *
 * Either `controls` or `children` is required, otherwise this components
 * renders nothing.
 *
 * @param {?Array}        controls  The controls to render in this toolbar.
 * @param {?ReactElement} children  Any other things to render inside the
 *                                  toolbar besides the controls.
 * @param {?string}       className Class to set on the container div.
 *
 * @return {ReactElement} The rendered toolbar.
 */
// eslint-disable-next-line no-unused-vars
function Toolbar( { controls = [], children, className } ) {
	if (
		( ! controls || ! controls.length ) &&
		! children
	) {
		return null;
	}

	// Normalize controls to nested array of objects (sets of controls)
	let controlSets = controls;
	if ( ! Array.isArray( controlSets[ 0 ] ) ) {
		controlSets = [ controlSets ];
	}

	return (
		<View style={ { flex: 1, flexDirection: 'row' } }>
			{ flatMap( controlSets, ( controlSet, indexOfSet ) => (
				controlSet.map( ( control, indexOfControl ) => (
					<View
						key={ [ indexOfSet, indexOfControl ].join() }
						style={ indexOfSet > 0 && indexOfControl === 0 ? 'has-left-divider' : null }
					>
						<IconButton
							icon={ control.icon }
							label={ control.title }
							shortcut={ control.shortcut }
							data-subscript={ control.subscript }
							onClick={ ( event ) => {
								event.stopPropagation();
								control.onClick();
							} }
							className={ classnames( 'components-toolbar__control', {
								'is-active': control.isActive,
							} ) }
							aria-pressed={ control.isActive }
							disabled={ control.isDisabled }
						/>
						{ control.children }
					</View>
				) )
			) ) }
			{ children }
		</View>
	);
}

export default Toolbar;
