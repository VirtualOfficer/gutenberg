/**
 * External Dependencies
 */
import { omit, noop } from 'lodash';

/**
 * WordPress Dependencies
 */
import { Component } from '@wordpress/element';
import { focus, keycodes } from '@wordpress/utils';

/**
 * Module Constants
 */
const { UP, DOWN, LEFT, RIGHT } = keycodes;

class NavigableMenu extends Component {
	constructor() {
		super( ...arguments );
		this.bindContainer = this.bindContainer.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	onKeyDown( event ) {
		const { orientation = 'vertical', onNavigate = noop } = this.props;
		if (
			( orientation === 'vertical' && [ UP, DOWN ].indexOf( event.keyCode ) === -1 ) ||
			( orientation === 'horizontal' && [ RIGHT, LEFT ].indexOf( event.keyCode ) === -1 )
		) {
			return;
		}

		const tabbables = focus.tabbable
			.find( this.container )
			.filter( ( node ) => node.parentElement === this.container );
		const indexOfTabbable = tabbables.indexOf( document.activeElement );
		const offset = [ UP, LEFT ].indexOf( event.keyCode ) === -1 ? 1 : -1;
		const nextTabbable = tabbables[ indexOfTabbable + offset ];
		if ( indexOfTabbable !== -1 ) {
			event.stopPropagation();
			if ( nextTabbable ) {
				nextTabbable.focus();
				onNavigate( indexOfTabbable + offset );
			}
		}
	}

	render() {
		const { children, ...props } = this.props;

		return (
			<div ref={ this.bindContainer } { ...omit( props, [ 'orientation', 'onNavigate' ] ) } onKeyDown={ this.onKeyDown }>
				{ children }
			</div>
		);
	}
}

export default NavigableMenu;
