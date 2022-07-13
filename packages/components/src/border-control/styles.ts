/**
 * External dependencies
 */
import { css } from '@emotion/react';
import type { CSSProperties } from 'react';

/**
 * Internal dependencies
 */
import { COLORS, CONFIG, rtl } from '../utils';
import { space } from '../ui/utils/space';
import {
	StyledField,
	StyledLabel,
} from '../base-control/styles/base-control-styles';
import {
	Root as UnitControlWrapper,
	UnitSelect,
} from '../unit-control/styles/unit-control-styles';

import type { Border } from './types';

const labelStyles = css`
	font-weight: 500;
`;

const focusBoxShadow = css`
	box-shadow: inset 0 0 0 ${ CONFIG.borderWidth } ${ COLORS.ui.borderFocus };
`;

export const borderControl = css`
	border: 0;
	padding: 0;
	margin: 0;
`;

export const innerWrapper = () => css`
	&& ${ UnitSelect } {
		/* Prevent unit select forcing min height larger than its UnitControl */
		min-height: 0;
	}
`;

export const wrapperWidth = ( width: CSSProperties[ 'width' ] ) => {
	return css`
		${ UnitControlWrapper } {
			width: ${ width };
			flex: 0 0 auto;
		}
	`;
};

/*
 * When default control height is 36px the following should be removed.
 * See: InputControl and __next36pxDefaultSize.
 */
export const wrapperHeight = ( __next36pxDefaultSize?: boolean ) => {
	return css`
		height: ${ __next36pxDefaultSize ? '36px' : '30px' };
	`;
};

export const borderControlDropdown = () => css`
	background: #fff;

	&& > button {
		/*
		 * Override button component height and padding to fit within
		 * BorderControl regardless of size.
		 */
		height: 100%;
		padding: ${ space( 0.75 ) };
		${ rtl(
			{ borderRadius: `2px 0 0 2px` },
			{ borderRadius: `0 2px 2px 0` }
		)() }
		border: ${ CONFIG.borderWidth } solid ${ COLORS.ui.border };

		&:focus,
		&:hover:not( :disabled ) {
			${ focusBoxShadow }
			border-color: ${ COLORS.ui.borderFocus };
			z-index: 1;
			position: relative;
		}
	}
`;

export const colorIndicatorBorder = ( border?: Border ) => {
	const { color, style } = border || {};

	const fallbackColor =
		!! style && style !== 'none' ? COLORS.gray[ 300 ] : undefined;

	return css`
		border-style: ${ style === 'none' ? 'solid' : style };
		border-color: ${ color || fallbackColor };
	`;
};

export const colorIndicatorWrapper = (
	border?: Border,
	__next36pxDefaultSize?: boolean
) => {
	const { style } = border || {};

	return css`
		border-radius: 9999px;
		border: 2px solid transparent;
		${ style ? colorIndicatorBorder( border ) : undefined }
		width: ${ __next36pxDefaultSize ? '28px' : '22px' };
		height: ${ __next36pxDefaultSize ? '28px' : '22px' };
		padding: ${ __next36pxDefaultSize ? '2px' : '1px' };

		/*
		 * ColorIndicator
		 *
		 * The transparent colors used here ensure visibility of the indicator
		 * over the active state of the border control dropdown's toggle button.
		 */
		& > span {
			${ ! __next36pxDefaultSize
				? css`
						/* Dimensions fit in 30px overall control height. */
						height: 16px;
						width: 16px;
				  `
				: '' }
			background: linear-gradient(
				-45deg,
				transparent 48%,
				rgb( 0 0 0 / 20% ) 48%,
				rgb( 0 0 0 / 20% ) 52%,
				transparent 52%
			);
		}
	`;
};

export const borderControlPopover = css`
	/* Remove padding from content, this will be re-added via inner elements*/
	&& .components-popover__content {
		padding: 0;
		width: 264px;
	}
`;

export const borderControlPopoverControls = css`
	padding: ${ space( 2 ) };

	> div:first-of-type > ${ StyledLabel } {
		margin-bottom: 0;
		${ labelStyles }
	}

	&& ${ StyledLabel } + button:not( .has-text ) {
		min-width: 24px;
		padding: 0;
	}
`;

export const borderControlPopoverContent = css``;
export const borderColorIndicator = css``;

export const resetButton = css`
	justify-content: center;
	width: 100%;

	/* Override button component styling */
	&& {
		border-top: ${ CONFIG.borderWidth } solid ${ COLORS.gray[ 200 ] };
		height: 46px;
	}
`;

export const borderControlStylePicker = css`
	${ StyledLabel } {
		${ labelStyles }
	}
`;

export const borderStyleButton = css`
	&&&&& {
		min-width: 30px;
		width: 30px;
		height: 30px;
		padding: 3px;
	}
`;

export const borderSlider = () => css`
	flex: 1 1 60%;
	${ rtl( { marginRight: space( 3 ) } )() }

	${ StyledField } {
		margin-bottom: 0;
		font-size: 0;
		display: flex;
	}
`;
