// @ts-nocheck
/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Tooltip } from './styles/range-control-styles';

const TOOLTIP_OFFSET_HEIGHT = 32;

export default function SimpleTooltip( {
	className,
	inputRef,
	position: positionProp = 'auto',
	show = false,
	style = {},
	value = 0,
	renderTooltipContent = ( v ) => v,
	zIndex = 100,
	...restProps
} ) {
	const position = useTooltipPosition( { inputRef, position: positionProp } );
	const classes = classnames( 'components-simple-tooltip', className );
	const styles = {
		...style,
		zIndex,
	};

	return (
		<Tooltip
			{ ...restProps }
			aria-hidden={ show }
			className={ classes }
			position={ position }
			show={ show }
			role="tooltip"
			style={ styles }
		>
			{ renderTooltipContent( value ) }
		</Tooltip>
	);
}

function useTooltipPosition( { inputRef, position: positionProp } ) {
	const [ position, setPosition ] = useState( 'bottom' );

	const calculatePosition = useCallback( () => {
		if ( inputRef && inputRef.current ) {
			let nextPosition = positionProp;

			if ( positionProp === 'auto' ) {
				const { bottom } = inputRef.current.getBoundingClientRect();
				const isOffscreenBottom = bottom - TOOLTIP_OFFSET_HEIGHT < 0;

				nextPosition = isOffscreenBottom ? 'top' : 'bottom';
			}

			setPosition( nextPosition );
		}
	}, [ positionProp ] );

	useEffect( () => {
		calculatePosition();
	}, [ calculatePosition ] );

	useEffect( () => {
		window.addEventListener( 'resize', calculatePosition );

		return () => {
			window.removeEventListener( 'resize', calculatePosition );
		};
	} );

	return position;
}
