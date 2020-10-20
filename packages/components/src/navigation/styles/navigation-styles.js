/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { G2, UI } from '../../utils/colors-values';
import Button from '../../button';
import Text from '../../text';
import { reduceMotion } from '../../utils';

export const NavigationUI = styled.div`
	width: 100%;
	background-color: ${ G2.darkGray.primary };
	color: #f0f0f0;
	padding: 0 8px;
	overflow: hidden;
`;

export const MenuUI = styled.div`
	margin-top: 24px;
	margin-bottom: 24px;
	display: flex;
	flex-direction: column;
	ul {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.components-navigation__back-button {
		margin-bottom: 24px;
	}
`;

export const MenuBackButtonUI = styled( Button )`
	&.is-tertiary {
		color: ${ G2.lightGray.ui };

		&:hover:not( :disabled ) {
			color: #ddd;
			box-shadow: none;
		}

		&:active:not( :disabled ) {
			background: transparent;
			color: #ddd;
		}
	}
`;

export const MenuTitleUI = styled.div`
	overflow: hidden;
	width: 100%;
`;

export const MenuTitleHeadingUI = styled( Text )`
	align-items: center;
	color: ${ G2.gray[ 100 ] };
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
	padding: 4px 0 4px 16px;

	.components-button.is-small {
		color: ${ G2.lightGray.ui };
		margin-right: 2px;
		padding: 0;

		&:active:not( :disabled ) {
			background: none;
			color: ${ G2.gray[ 200 ] };
		}
		&:hover:not( :disabled ) {
			box-shadow: none;
			color: ${ G2.gray[ 200 ] };
		}
	}
`;

export const MenuTitleSearchUI = styled.div`
	margin-bottom: 2px;
	padding: 0;
	position: relative;

	input {
		height: 36px;
		margin-bottom: 6px;
		padding-left: 30px;
		padding-right: 30px;

		&::-webkit-search-decoration,
		&::-webkit-search-cancel-button,
		&::-webkit-search-results-button,
		&::-webkit-search-results-decoration {
			-webkit-appearance: none;
		}
	}

	> svg {
		left: 6px;
		position: absolute;
		top: 6px;
	}

	.components-button.is-small {
		height: 30px;
		padding: 0;
		position: absolute;
		right: 4px;
		top: 3px;

		&:active:not( :disabled ) {
			background: none;
		}
		&:hover:not( :disabled ) {
			box-shadow: none;
		}
	}
`;

export const GroupTitleUI = styled( Text )`
	margin-top: 8px;
	padding: 4px 0 4px 16px;
	text-transform: uppercase;
	color: ${ G2.gray[ 100 ] };
`;

export const ItemUI = styled.li`
	border-radius: 2px;
	color: ${ G2.lightGray.ui };

	button,
	a {
		margin: 0;
		font-weight: 400;
		font-size: 14px;
		line-height: 20px;
		padding-left: 16px;
		padding-right: 16px;
		width: 100%;
		color: ${ G2.lightGray.ui };

		&:hover,
		&:focus:not( [aria-disabled='true'] ):active,
		&:active:not( [aria-disabled='true'] ):active {
			color: #ddd;
		}
	}

	&.is-active {
		background-color: ${ UI.theme };
		color: ${ UI.textDark };

		button,
		a {
			color: ${ UI.textDark };
		}
	}

	svg path {
		color: ${ G2.lightGray.ui };
	}
`;

export const ItemBadgeUI = styled.span`
	margin-left: 8px;
	display: inline-flex;
	padding: 4px 12px;
	border-radius: 2px;
	animation: fade-in 250ms ease-out;

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	${ reduceMotion( 'animation' ) };
`;

export const ItemTitleUI = styled( Text )`
	margin-right: auto;
	text-align: left;
`;
