/**
 * External dependencies
 */
import classnames from 'classnames';
import { isFunction } from 'lodash';
/**
 * Internal dependencies
 */
import './style.scss';
import IconButton from '../icon-button';

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
		<ul className={ classnames( 'components-toolbar', className ) }>
			{ controlSets.reduce( ( result, controlSet, setIndex ) => [
				...result,
				...controlSet.map( ( control, controlIndex ) => {
					const isActive = isFunction( control.isActive ) ? control.isActive() : control.isActive;
					return (
						<li
							key={ [ setIndex, controlIndex ].join() }
							className={ setIndex > 0 && controlIndex === 0 ? 'has-left-divider' : null }
						>
							<IconButton
								icon={ control.icon }
								label={ control.title }
								data-subscript={ control.subscript }
								onClick={ ( event ) => {
									event.stopPropagation();
									control.onClick();
								} }
								className={ classnames( 'components-toolbar__control', {
									'is-active': isActive,
								} ) }
								aria-pressed={ isActive }
								disabled={ control.isDisabled }
							/>
							{ control.children }
						</li> );
				} ),
			], [] ) }
			{ children }
		</ul>
	);
}

export default Toolbar;
