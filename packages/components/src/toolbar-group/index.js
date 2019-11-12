/**
 * External dependencies
 */
import classnames from 'classnames';
import { flatMap } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ToolbarButton from '../toolbar-button';
import DropdownMenu from '../dropdown-menu';
import ToolbarContainer from './toolbar-group-container';
import ToolbarContext from '../toolbar-context';

/**
 * Renders a collapsible group of controls.
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
 * @param {Object}    						props								Component props.
 * @param {Array}     						[props.controls]  	The controls to render in this toolbar.
 * @param {WPElement} 						[props.children]  	Any other things to render inside the toolbar besides the controls.
 * @param {string}    						[props.className] 	Class to set on the container div.
 * @param {boolean}								[props.isCollapsed]	Turns ToolbarGroup into a dropdown menu.
 * @param {WPBlockTypeIconRender} [props.icon] 				The [Dashicon](https://developer.wordpress.org/resource/dashicons/) icon slug string, or an SVG WP element.
 * @param {string} 								[props.label] 			The menu item text.
 *
 * @return {WPComponent} The rendered component.
 */
function ToolbarGroup( { controls = [], children, className, isCollapsed, icon, label, ...otherProps } ) {
	// It'll contain state if `ToolbarGroup` is being used within
	// `<Toolbar accessibilityLabel="label" />`
	const accessibleToolbarState = useContext( ToolbarContext );

	if (
		( ! controls || ! controls.length ) &&
		! children
	) {
		return null;
	}

	const finalClassName = classnames(
		// Unfortunately, there's legacy code referencing to `.components-toolbar`
		// So we can't get rid of it
		accessibleToolbarState ? 'components-toolbar-group' : 'components-toolbar',
		className
	);

	// Normalize controls to nested array of objects (sets of controls)
	let controlSets = controls;
	if ( ! Array.isArray( controlSets[ 0 ] ) ) {
		controlSets = [ controlSets ];
	}

	if ( isCollapsed ) {
		return (
			<DropdownMenu
				hasArrowIndicator
				icon={ icon }
				label={ label }
				controls={ controlSets }
				className={ finalClassName }
				{ ...otherProps }
			/>
		);
	}

	return (
		<ToolbarContainer className={ finalClassName } { ...otherProps }>
			{ flatMap( controlSets, ( controlSet, indexOfSet ) => (
				controlSet.map( ( control, indexOfControl ) => (
					<ToolbarButton
						key={ [ indexOfSet, indexOfControl ].join() }
						containerClassName={ indexOfSet > 0 && indexOfControl === 0 ? 'has-left-divider' : null }
						{ ...control }
					/>
				) )
			) ) }
			{ children }
		</ToolbarContainer>
	);
}

export default ToolbarGroup;
