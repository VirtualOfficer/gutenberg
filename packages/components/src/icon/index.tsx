/**
 * External dependencies
 */
import type { ComponentType, HTMLProps, SVGProps } from 'react';

/**
 * WordPress dependencies
 */
import {
	cloneElement,
	createElement,
	isValidElement,
} from '@wordpress/element';
import { SVG } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import Dashicon from '../dashicon';
import type { IconKey as DashiconIconKey } from '../dashicon/types';
import { withCurrentColor } from './with-currentcolor';
export { withCurrentColor } from './with-currentcolor';

export type IconType =
	| DashiconIconKey
	| ComponentType< { size?: number } >
	| ( ( props: { size?: number } ) => JSX.Element )
	| JSX.Element;

interface BaseProps {
	/**
	 * The icon to render. Supported values are: Dashicons (specified as
	 * strings), functions, Component instances and `null`.
	 *
	 * @default null
	 */
	icon?: IconType | null;
	/**
	 * The size (width and height) of the icon.
	 *
	 * @default `20` when a Dashicon is rendered, `24` for all other icons.
	 */
	size?: number;
	/**
	 * Whether the icon should be rendered in the CSS `currentColor`.
	 * Only has an effect on SVG elements.
	 *
	 * @default false
	 */
	currentColor?: boolean;
}

type AdditionalProps< T > = T extends ComponentType< infer U >
	? U
	: T extends DashiconIconKey
	? SVGProps< SVGSVGElement >
	: {};

export type Props = BaseProps & AdditionalProps< IconType >;

function Icon( {
	icon = null,
	size = 'string' === typeof icon ? 20 : 24,
	currentColor = false,
	...additionalProps
}: Props ) {
	if ( 'string' === typeof icon ) {
		return (
			<Dashicon
				icon={ icon }
				size={ size }
				{ ...( additionalProps as HTMLProps< HTMLSpanElement > ) }
			/>
		);
	}

	if ( isValidElement( icon ) && Dashicon === icon.type ) {
		return cloneElement( icon, {
			...additionalProps,
		} );
	}

	if ( 'function' === typeof icon ) {
		const element = createElement( icon, {
			size,
			...additionalProps,
		} );
		return currentColor ? withCurrentColor( element ) : element;
	}

	if ( icon && ( icon.type === 'svg' || icon.type === SVG ) ) {
		const appliedProps = {
			...( currentColor ? withCurrentColor( icon ) : icon ).props,
			width: size,
			height: size,
			...additionalProps,
		};

		return <SVG { ...appliedProps } />;
	}

	if ( isValidElement( icon ) ) {
		const element = cloneElement( icon, {
			// @ts-ignore Just forwarding the size prop along
			size,
			...additionalProps,
		} );
		return currentColor ? withCurrentColor( element ) : element;
	}

	return icon;
}

export default Icon;
