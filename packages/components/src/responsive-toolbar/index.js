/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, createRef } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import IconButton from '../icon-button';
import Dropdown from '../dropdown';
import Disabled from '../disabled';

/**
 * Module constants
 */
const OFFSET = 60;

class ResponsiveToolbar extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			countHiddenChildren: 0,
		};
		this.container = createRef();
		this.hiddenContainer = createRef();

		this.updateHiddenItems = this.updateHiddenItems.bind( this );
		this.throttledUpdateHiddenItems = this.throttledUpdateHiddenItems.bind( this );
	}

	componentDidMount() {
		this.toggleWindowEvents( true );
		this.updateHiddenItems();

		// If the children change, we need to recompute
		this.observer = new window.MutationObserver( this.updateHiddenItems );
		this.observer.observe( this.hiddenContainer.current, { childList: true } );
	}

	componentWillUnmount() {
		this.toggleWindowEvents( false );
		this.observer.disconnect();
		if ( this.style ) {
			this.style.parentNode.removeChild( this.style );
		}
	}

	toggleWindowEvents( isListening ) {
		const handler = isListening ? 'addEventListener' : 'removeEventListener';

		window.cancelAnimationFrame( this.rafHandle );
		window[ handler ]( 'resize', this.throttledUpdateHiddenItems );
	}

	throttledUpdateHiddenItems() {
		this.rafHandle = window.requestAnimationFrame( () => this.updateHiddenItems() );
	}

	updateHiddenItems() {
		const { instanceId } = this.props;
		const containerRect = this.container.current.getBoundingClientRect();
		let countHiddenChildren = 0;
		const total = this.hiddenContainer.current.childNodes.length;
		this.hiddenContainer.current.childNodes.forEach( ( child ) => {
			const childRect = child.getBoundingClientRect();
			if (
				childRect.left < containerRect.left ||
				childRect.right > containerRect.right - OFFSET
			) {
				countHiddenChildren++;
			}
		} );

		if ( countHiddenChildren !== this.state.countHiddenChildren ) {
			this.setState( {
				countHiddenChildren,
			} );

			if ( this.style ) {
				this.style.parentNode.removeChild( this.style );
			}
			const styleNode = document.createElement( 'style' );
			styleNode.innerHTML = `
				#responsive-toolbar-${ instanceId } > *:nth-child(n+${ total - countHiddenChildren + 2 }):not(.components-responsive-toolbar__dropdown) {
					display: none;
				}

				.components-responsive-toolbar__dropdown-content-${ instanceId } > *:nth-child(-n+${ total - countHiddenChildren }) {
					display: none;
				}
			`;
			document.body.appendChild( styleNode );
			this.style = styleNode;
		}
	}

	render() {
		const defaultRenderToggle = ( { onToggle, isOpen } ) => (
			<IconButton
				icon="arrow-down-alt2"
				onClick={ onToggle }
				aria-expanded={ isOpen }
			/>
		);
		const {
			children,
			instanceId,
			className,
			extraContentClassName,
			renderToggle = defaultRenderToggle,
			...props
		} = this.props;
		const { countHiddenChildren } = this.state;

		return (
			<div
				id={ `responsive-toolbar-${ instanceId }` }
				className={ classnames( className, 'components-responsive-toolbar' ) }
				ref={ this.container }
				{ ...props }
			>
				<Disabled>
					<div className="components-responsive-toolbar__compute-position" ref={ this.hiddenContainer }>
						{ children }
					</div>
				</Disabled>

				{ children }

				{ countHiddenChildren > 0 && (
					<Dropdown
						position="inline"
						className="components-responsive-toolbar__dropdown"
						contentClassName={ classnames(
							extraContentClassName,
							'components-responsive-toolbar__dropdown-content',
							`components-responsive-toolbar__dropdown-content-${ instanceId }` )
						}
						renderToggle={ renderToggle }
						renderContent={ () => children }
					/>
				) }
			</div>
		);
	}
}

export default withInstanceId( ResponsiveToolbar );
