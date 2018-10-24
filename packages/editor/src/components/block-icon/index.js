/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Dashicon, SVG } from '@wordpress/components';
import { createElement, Component } from '@wordpress/element';

function isSVGIcon( icon ) {
	if ( icon && icon.type === 'svg' ) {
		return true;
	} else if ( icon && icon.type.name === 'SVG' ) {
		return true;
	}

	return false;
}

function renderIcon( icon ) {
	if ( 'string' === typeof icon ) {
		return <Dashicon icon={ icon } size={ 20 } />;
	} else if ( 'function' === typeof icon ) {
		if ( icon.prototype instanceof Component ) {
			return createElement( icon );
		}

		return icon();
	} else if ( isSVGIcon( icon ) ) {
		const appliedProps = {
			...icon.props,
			width: icon.props.width || 24,
			height: icon.props.height || 24,
		};
		return <SVG { ...appliedProps } />;
	}

	return icon || null;
}

export default function BlockIcon( { icon, showColors = false, className } ) {
	const renderedIcon = renderIcon( icon && icon.src ? icon.src : icon );
	const style = showColors ? {
		backgroundColor: icon && icon.background,
		color: icon && icon.foreground,
	} : {};

	if ( ! renderedIcon ) {
		return null;
	}

	return (
		<div
			style={ style }
			className={ classnames(
				'editor-block-icon',
				className,
				{ 'has-colors': showColors }
			) }
		>
			{ renderedIcon }
		</div>
	);
}
