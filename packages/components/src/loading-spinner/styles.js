/**
 * External dependencies
 */
import { css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';
/**
 * Internal dependencies
 */
import { SVG, Circle } from '../primitives/svg';
import { color as getColor } from '../utils/colors';

export const defaultSpinnerColor = getColor( 'darkGrey.500' );

const spinnerSize = ( { size = 16 } ) => {
	return css( {
		height: size,
		width: size,
	} );
};

const spinnerOpacity = ( { opacity = 1 } ) => {
	return css( { opacity } );
};

const spinnerAnimationKeyframes = keyframes`
	100% {
		transform: rotate(360deg);
	}
`;

const spinnerAnimation = ( { speed = 1400 } ) => {
	return css( {
		animation: `${ spinnerAnimationKeyframes } ${ speed }ms linear infinite`,
	} );
};

const circleAnimationKeyframes = keyframes`
	0% {
		stroke-dasharray: 1px, 200px;
		stroke-dashoffset: 0px;
		opacity: 0;
	}
	0.1% {
		opacity: 1;
	}
	50% {
		stroke-dasharray: 100px, 200px;
		stroke-dashoffset: -15px;
	}
	100% {
		stroke-dasharray: 100px, 200px;
		stroke-dashoffset: -125px;
	}
`;

const circleAnimation = ( { speed = 1400 } ) => {
	return css( {
		animation: `${ circleAnimationKeyframes } ${ speed }ms ease-in-out infinite`,
	} );
};

const circleColor = ( { color = defaultSpinnerColor } ) => {
	return css( { stroke: color } );
};

export const SpinnerWrapper = styled.div`
	box-sizing: border-box;
	display: block;
	pointer-events: none;
	${ spinnerOpacity };
	${ spinnerSize };
`;

export const SpinnerSVG = styled( SVG )`
	box-sizing: border-box;
	display: block;
	x: 0px;
	y: 0px;
	will-change: transform;

	${ spinnerAnimation };
	${ spinnerSize };
`;

export const SpinnerCircle = styled( Circle )`
	box-sizing: border-box;
	display: block;
	fill: transparent;
	stroke-width: 3.6;
	stroke-linecap: round;
	stroke-dasharray: 80px, 200px;
	stroke-dashoffset: 0px;
	will-change: transform, stroke-dashoffset;

	${ circleAnimation };
	${ circleColor };
`;
