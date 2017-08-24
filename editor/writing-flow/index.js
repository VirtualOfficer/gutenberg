/**
 * WordPress dependencies
 */
import { Component } from 'element';
import { keycodes } from '@wordpress/utils';

const { UP, DOWN, LEFT, RIGHT } = keycodes;

class WritingFlow extends Component {
	constructor() {
		super( ...arguments );
		this.zones = [];
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.bindContainer = this.bindContainer.bind( this );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	moveFocusInContainer( target, direction = 'UP' ) {
		const selectors = [
			'*[contenteditable="true"]',
			'*[tabindex]',
			'textarea',
			'input',
		].join( ',' );

		const isVisible = ( elem ) => elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;

		const focusableNodes = Array.from( this.container.querySelectorAll( selectors ) ).filter( isVisible );
		if ( direction === 'UP' ) {
			focusableNodes.reverse();
		}

		const targetNode = focusableNodes
			.slice( focusableNodes.indexOf( target ) )
			.reduce( ( result, node ) => {
				return result || ( node.contains( target ) ? null : node );
			}, null );

		if ( targetNode ) {
			targetNode.focus();
		}
	}

	isSameRanges( range1, range2 ) {
		return ( ! range1 && ! range2 ) || (
			!! range1 &&
			!! range2 &&
			range1.startContainer === range2.startContainer &&
			range1.startOffset === range2.startOffset &&
			range1.endContainer === range2.endContainer &&
			range1.endOffset === range2.endOffset
		);
	}

	onKeyDown( event ) {
		const { keyCode } = event;
		if ( [ UP, LEFT, DOWN, RIGHT ].indexOf( keyCode ) !== -1 ) {
			const selection = window.getSelection();
			this.lastRange = selection.rangeCount ? selection.getRangeAt( 0 ) : null;
		}
	}

	onKeyUp( event ) {
		const { keyCode, target } = event;
		const moveUp = ( keyCode === UP || keyCode === LEFT );
		const moveDown = ( keyCode === DOWN || keyCode === RIGHT );

		if ( moveUp || moveDown ) {
			const selection = window.getSelection();
			const range = selection.rangeCount ? selection.getRangeAt( 0 ) : null;

			// If there's no movement, so we're either at the end of start, or
			// no text input at all.
			if ( ! this.isSameRanges( range, this.lastRange ) ) {
				return;
			}

			this.moveFocusInContainer( target, moveUp ? 'UP' : 'DOWN' );
		}

		delete this.lastRange;
	}

	render() {
		const { children } = this.props;

		return (
			<div
				ref={ this.bindContainer }
				onKeyDown={ this.onKeyDown }
				onKeyUp={ this.onKeyUp }
			>
				{ children }
			</div>
		);
	}
}

export default WritingFlow;
