/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, forwardRef } from '@wordpress/element';
import { chevronUp, chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../button';
import Icon from '../icon';

export class PanelBody extends Component {
	constructor( props ) {
		super( ...arguments );
		this.state = {
			opened: props.initialOpen === undefined ? true : props.initialOpen,
		};
		this.toggle = this.toggle.bind( this );
	}

	toggle( event ) {
		event.preventDefault();
		if ( this.props.opened === undefined ) {
			this.setState( ( state ) => ( {
				opened: ! state.opened,
			} ) );
		}

		if ( this.props.onToggle ) {
			this.props.onToggle();
		}
	}

	render() {
		const {
			title,
			children,
			opened,
			className,
			icon,
			forwardedRef,
		} = this.props;
		const isOpened = opened === undefined ? this.state.opened : opened;
		const canUserToggle = undefined === opened; // Opened state is controlled externally.
		const classes = classnames( 'components-panel__body', className, {
			'is-opened': isOpened,
			'has-toggle': canUserToggle,
		} );

		return (
			<div className={ classes } ref={ forwardedRef }>
				{ !! title && (
					<h2 className="components-panel__body-title">
						{ canUserToggle ? (
							<Button
								className="components-panel__body-toggle"
								onClick={ this.toggle }
								aria-expanded={ isOpened }
							>
								{ /*
									Firefox + NVDA don't announce aria-expanded because the browser
									repaints the whole element, so this wrapping span hides that.
									*/ }
								<span aria-hidden="true">
									<Icon
										className="components-panel__arrow"
										icon={
											isOpened ? chevronUp : chevronDown
										}
									/>
								</span>
								{ title }
								{ icon && (
									<Icon
										icon={ icon }
										className="components-panel__icon"
										size={ 20 }
									/>
								) }
							</Button>
						) : (
							<span className="components-panel__body-text-title">
								{ title }
							</span>
						) }
					</h2>
				) }
				{ isOpened && children }
			</div>
		);
	}
}

const forwardedPanelBody = ( props, ref ) => {
	return <PanelBody { ...props } forwardedRef={ ref } />;
};
forwardedPanelBody.displayName = 'PanelBody';

export default forwardRef( forwardedPanelBody );
