/**
 * External dependencies
 */
import { I18nManager } from 'react-native';
/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { arrowUp, arrowDown, arrowLeft, arrowRight } from '@wordpress/icons';

const horizontalMover = {
	backwardButtonIcon: arrowLeft,
	forwardButtonIcon: arrowRight,
	backwardButtonHint: __( 'Double tap to move the block to the left' ),
	forwardButtonHint: __( 'Double tap to move the block to the right' ),
	/* translators: %s: block title e.g: "Paragraph" */
	firstBlockTitle: __( 'Move %s Left' ),
	/* translators: %s: block title e.g: "Paragraph" */
	lastBlockTitle: __( 'Move %s Right' ),
	/* translators: accessibility text. %1: current block position (number). %2: next block position (number) */
	backwardButtonTitle: __(
		'Move block left from position %1$s to position %2$s'
	),
	/* translators: accessibility text. %1: current block position (number). %2: next block position (number) */
	forwardButtonTitle: __(
		'Move block right from position %1$s to position %2$s'
	),
};

const verticalMover = {
	backwardButtonIcon: arrowUp,
	forwardButtonIcon: arrowDown,
	backwardButtonHint: __( 'Double tap to move the block up' ),
	forwardButtonHint: __( 'Double tap to move the block down' ),
	/* translators: %s: block title e.g: "Paragraph" */
	firstBlockTitle: __( 'Move %s Up' ),
	/* translators: %s: block title e.g: "Paragraph" */
	lastBlockTitle: __( 'Move %s Down' ),
	/* translators: accessibility text. %1: current block position (number). %2: next block position (number) */
	backwardButtonTitle: __( 'Move block up from row %1$s to row %2$s' ),
	/* translators: accessibility text. %1: current block position (number). %2: next block position (number) */
	forwardButtonTitle: __( 'Move block down from row %1$s to row %2$s' ),
};

const KEYS = [ 'description', 'icon', 'title', 'actionTitle' ];

const SETUP_GETTER = {
	description: getMoverDescription,
	icon: getArrowIcon,
	title: getMoverButtonTitle,
	actionTitle: getMoverActionTitle,
};

export function getMoversSetup(
	isStackedHorizontally,
	{ firstIndex, keys = KEYS, blockTitle }
) {
	return keys.reduce( ( setup, key ) => {
		if ( KEYS.includes( key ) ) {
			Object.assign( setup, {
				[ key ]: getSetup( key, isStackedHorizontally, {
					firstIndex,
					blockTitle,
				} ),
			} );
		}
		return setup;
	}, {} );
}

function switchButtonPropIfRTL(
	isBackwardButton,
	forwardButtonProp,
	backwardButtonProp,
	isStackedHorizontally
) {
	if ( I18nManager.isRTL && isStackedHorizontally ) {
		// for RTL and horizontal direction switch prop between forward and backward button
		if ( isBackwardButton ) {
			return forwardButtonProp; // set forwardButtonProp for backward button
		}
		return backwardButtonProp; // set backwardButtonProp for forward button
	}

	return isBackwardButton ? backwardButtonProp : forwardButtonProp;
}

function getSetup() {
	const [ key, ...args ] = arguments;
	return SETUP_GETTER[ key ].apply( null, [ ...args ] );
}

function applyRTLSetup( isBackwardButton, args ) {
	return switchButtonPropIfRTL.apply( null, [ isBackwardButton, ...args ] );
}

function getMoverDescription( isStackedHorizontally ) {
	return isStackedHorizontally ? horizontalMover : verticalMover;
}

function getArrowIcon( isStackedHorizontally ) {
	const { forwardButtonIcon, backwardButtonIcon } = getMoverDescription(
		isStackedHorizontally
	);

	const args = [
		forwardButtonIcon,
		backwardButtonIcon,
		isStackedHorizontally,
	];

	return {
		backward: applyRTLSetup( true, args ),
		forward: applyRTLSetup( false, args ),
	};
}

function getMoverActionTitle( isStackedHorizontally, { blockTitle } ) {
	const { firstBlockTitle, lastBlockTitle } = getMoverDescription(
		isStackedHorizontally
	);

	const args = [ lastBlockTitle, firstBlockTitle, isStackedHorizontally ];

	const actionTitlePrev = applyRTLSetup( true, args );
	const actionTitleNext = applyRTLSetup( false, args );

	return {
		backward: sprintf( actionTitlePrev, blockTitle ),
		forward: sprintf( actionTitleNext, blockTitle ),
	};
}

function getMoverButtonTitle( isStackedHorizontally, { firstIndex } ) {
	const getIndexes = ( isBackwardButton ) => {
		const fromIndex = firstIndex + 1; // current position based on index
		// for backwardButton decrease index (move left/up) for forwardButton increase index (move right/down)
		const direction = isBackwardButton ? -1 : 1;
		const toIndex = fromIndex + direction; // position after move
		return [ fromIndex, toIndex ];
	};

	const { backwardButtonTitle, forwardButtonTitle } = getMoverDescription(
		isStackedHorizontally
	);

	const args = [
		backwardButtonTitle,
		forwardButtonTitle,
		isStackedHorizontally,
	];

	const buttonTitlePrev = applyRTLSetup( true, args );
	const buttonTitleNext = applyRTLSetup( false, args );

	return {
		backward: sprintf( buttonTitlePrev, ...getIndexes( true ) ),
		forward: sprintf( buttonTitleNext, ...getIndexes( false ) ),
	};
}
