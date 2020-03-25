/**
 * External dependencies
 */
import classnames from 'classnames';
import { isArray } from 'lodash';

/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { forwardRef, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { RadioContext } from '../button-group';
import Tooltip from '../tooltip';
import Icon from '../icon';

const disabledEventsOnDisabledButton = [ 'onMouseDown', 'onClick' ];

export function Button( props, ref ) {
	const {
		href,
		target,
		isPrimary,
		isLarge,
		isSmall,
		isTertiary,
		isPressed,
		isBusy,
		isDefault,
		isSecondary,
		isLink,
		isDestructive,
		className,
		disabled,
		icon,
		iconSize,
		showTooltip,
		tooltipPosition,
		shortcut,
		label,
		children,
		value,
		__experimentalIsFocusable: isFocusable,
		...additionalProps
	} = props;

	if ( isDefault ) {
		deprecated( 'Button isDefault prop', {
			alternative: 'isSecondary',
		} );
	}

	const context = useContext( RadioContext );
	const radioProps = context[ value ] || {};

	const classes = classnames( 'components-button', className, {
		'is-secondary':
			isDefault || isSecondary || radioProps[ 'aria-checked' ] === false,
		'is-primary': isPrimary || radioProps[ 'aria-checked' ] === true,
		'is-large': isLarge,
		'is-small': isSmall,
		'is-tertiary': isTertiary,
		'is-pressed': isPressed,
		'is-busy': isBusy,
		'is-link': isLink,
		'is-destructive': isDestructive,
		'has-text': !! icon && !! children,
		'has-icon': !! icon,
	} );

	const trulyDisabled = disabled && ! isFocusable;
	const Tag = href !== undefined && ! trulyDisabled ? 'a' : 'button';
	const tagProps =
		Tag === 'a'
			? { href, target }
			: {
					type: 'button',
					disabled: trulyDisabled,
					'aria-pressed': isPressed,
			  };

	if ( disabled && isFocusable ) {
		// In this case, the button will be disabled, but still focusable and
		// perceivable by screen reader users.
		tagProps[ 'aria-disabled' ] = true;

		for ( const disabledEvent of disabledEventsOnDisabledButton ) {
			additionalProps[ disabledEvent ] = ( event ) => {
				event.stopPropagation();
				event.preventDefault();
			};
		}
	}

	// Should show the tooltip if...
	const shouldShowTooltip =
		! trulyDisabled &&
		// an explicit tooltip is passed or...
		( ( showTooltip && label ) ||
			// there's a shortcut or...
			shortcut ||
			// there's a label and...
			( !! label &&
				// the children are empty and...
				( ! children ||
					( isArray( children ) && ! children.length ) ) &&
				// the tooltip is not explicitly disabled.
				false !== showTooltip ) );

	const element = (
		<Tag
			ref={ ref }
			{ ...tagProps }
			{ ...radioProps }
			{ ...additionalProps }
			className={ classes }
			aria-label={ additionalProps[ 'aria-label' ] || label }
		>
			{ icon && <Icon icon={ icon } size={ iconSize } /> }
			{ children }
		</Tag>
	);

	if ( ! shouldShowTooltip ) {
		return element;
	}

	return (
		<Tooltip
			text={ label }
			shortcut={ shortcut }
			position={ tooltipPosition }
		>
			{ element }
		</Tooltip>
	);
}

export default forwardRef( Button );
