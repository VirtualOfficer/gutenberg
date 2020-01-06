/**
 * External dependencies
 */
import classnames from 'classnames';
import { isArray } from 'lodash';

/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Tooltip from '../tooltip';
import Spinner from '../spinner';
import Icon from '../icon';

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
		isLoading,
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
		...additionalProps
	} = props;

	if ( isDefault ) {
		deprecated( 'Button isDefault prop', {
			alternative: 'isSecondary',
		} );
	}

	const classes = classnames( 'components-button', className, {
		'is-secondary': isDefault || isSecondary,
		'is-primary': isPrimary,
		'is-large': isLarge,
		'is-loading': isLoading,
		'is-small': isSmall,
		'is-tertiary': isTertiary,
		'is-pressed': isPressed,
		'is-busy': isBusy,
		'is-link': isLink,
		'is-destructive': isDestructive,
		'has-text': !! icon && !! children,
		'has-icon': !! icon,
	} );

	const isDisabled = disabled || isLoading;

	const Tag = href !== undefined && ! isDisabled ? 'a' : 'button';
	const tagProps = Tag === 'a' ?
		{ href, target } :
		{ type: 'button', disabled: isDisabled, 'aria-pressed': isPressed };

	// Should show the tooltip if...
	const shouldShowTooltip = ! isDisabled && (
		// an explicit tooltip is passed or...
		( showTooltip && label ) ||
		// there's a shortcut or...
		shortcut ||
		(
			// there's a label and...
			!! label &&
			// the children are empty and...
			( ! children || ( isArray( children ) && ! children.length ) ) &&
			// the tooltip is not explicitly disabled.
			false !== showTooltip
		)
	);

	const element = (
		<Tag
			{ ...tagProps }
			{ ...additionalProps }
			className={ classes }
			aria-busy={ isLoading }
			aria-label={ additionalProps[ 'aria-label' ] || label }
			ref={ ref }
		>
			{ isLoading && <Spinner /> }
			{ icon && <Icon icon={ icon } size={ iconSize } /> }
			<span className="components-button__content">{ children }</span>
		</Tag>
	);

	if ( ! shouldShowTooltip ) {
		return element;
	}

	return (
		<Tooltip text={ label } shortcut={ shortcut } position={ tooltipPosition }>
			{ element }
		</Tooltip>
	);
}

export default forwardRef( Button );
