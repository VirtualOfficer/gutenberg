/**
 * External dependencies
 */
import { useWindowDimensions } from 'react-native';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import {
	ALIGNMENT_BREAKPOINTS,
	WIDE_ALIGNMENTS,
	alignmentHelpers,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import styles from './use-editor-wrapper-styles.scss';

const ALIGNMENT_MAX_WIDTH = {
	full: '100%',
	wide: 1054,
	wideMedium: 770,
	wideLandscape: 662,
};

const BLOCK_DEFAULT_MARGIN = 16;

/**
 * Get the styles for the wide width alignment.
 *
 * @param {string}  align       The alignment value.
 * @param {boolean} isLandscape Whether the screen is in landscape mode.
 * @param {number}  width       The width of the screen.
 * @return {Object} An object containing the styles for the wide width alignment.
 */
function getWideWidthStyles( align, isLandscape, width ) {
	if ( align !== WIDE_ALIGNMENTS.alignments.wide ) {
		return {};
	}

	if ( isLandscape && width < ALIGNMENT_BREAKPOINTS.large ) {
		return { maxWidth: ALIGNMENT_MAX_WIDTH.wideLandscape };
	}

	if ( width <= ALIGNMENT_BREAKPOINTS.small ) {
		return { maxWidth: width };
	}

	if (
		width >= ALIGNMENT_BREAKPOINTS.medium &&
		width < ALIGNMENT_BREAKPOINTS.wide
	) {
		return { maxWidth: ALIGNMENT_MAX_WIDTH.wideMedium };
	}

	return { maxWidth: ALIGNMENT_MAX_WIDTH.wide };
}

/**
 * Get the styles for the full width alignment.
 *
 * @param {string}  align           The alignment value.
 * @param {string}  blockName       The name of the block.
 * @param {boolean} hasParents      Whether the block has parents.
 * @param {string}  parentBlockName The name of the parent block.
 * @return {Object} An object containing the styles for the full width alignment.
 */
function getFullWidthStyles( align, blockName, hasParents, parentBlockName ) {
	const { isContainerRelated, isFullWidth } = alignmentHelpers;
	const fullWidthStyles = isFullWidth( align )
		? { maxWidth: ALIGNMENT_MAX_WIDTH.full }
		: {};

	if (
		! align &&
		hasParents &&
		! isContainerRelated( parentBlockName ) &&
		isContainerRelated( blockName )
	) {
		fullWidthStyles.paddingHorizontal = BLOCK_DEFAULT_MARGIN;
	}

	return fullWidthStyles;
}

/**
 * Get the block margin based on various conditions.
 *
 * @param {string}  align                The alignment value.
 * @param {string}  blockName            The name of the block.
 * @param {number}  blockWidth           The width of the block.
 * @param {boolean} hasParents           Whether the block has parents.
 * @param {number}  marginHorizontal     Default horizontal margin.
 * @param {string}  parentBlockAlignment The alignment of the parent block.
 * @param {string}  parentBlockName      The name of the parent block.
 * @param {number}  parentWidth          The width of the parent block.
 * @param {number}  width                The width of the screen.
 * @return {number} The calculated block margin.
 */
function getBlockMargin(
	align,
	blockName,
	blockWidth,
	hasParents,
	marginHorizontal,
	parentBlockAlignment,
	parentBlockName,
	parentWidth,
	width
) {
	const { isContainerRelated, isWider, isWideWidth, isFullWidth } =
		alignmentHelpers;

	if ( isFullWidth( align ) ) {
		if ( ! hasParents ) {
			return 0;
		}
		return marginHorizontal;
	}

	if ( isWideWidth( align ) ) {
		return marginHorizontal;
	}

	if (
		isFullWidth( parentBlockAlignment ) &&
		! isWider( blockWidth, 'medium' )
	) {
		if ( isContainerRelated( blockName ) || isWider( width, 'mobile' ) ) {
			return marginHorizontal;
		}
		return marginHorizontal * 2;
	}

	if (
		isContainerRelated( parentBlockName ) &&
		! isContainerRelated( blockName )
	) {
		const isScreenWidthEqual = parentWidth === width;
		if ( isScreenWidthEqual || isWider( width, 'mobile' ) ) {
			return marginHorizontal;
		}
	}

	return marginHorizontal;
}

/**
 * Custom hook to get the styles and margin for the editor wrapper.
 *
 * @param {Object}  [props]                    The props for the hook.
 * @param {string}  props.align                The alignment value.
 * @param {string}  props.blockName            The name of the block.
 * @param {number}  props.blockWidth           The width of the block.
 * @param {string}  props.contentResizeMode    The content resize mode.
 * @param {boolean} props.hasParents           Whether the block has parents.
 * @param {number}  props.marginHorizontal     Default horizontal margin.
 * @param {string}  props.parentBlockAlignment The alignment of the parent block.
 * @param {string}  props.parentBlockName      The name of the parent block.
 * @param {number}  props.parentWidth          The width of the parent block.
 * @param {boolean} [props.reversed=false]     Whether the flex direction should be reversed.
 * @return {[Array, number]} An array containing the wrapper styles and block margin.
 */
export function useEditorWrapperStyles( {
	align,
	blockName,
	blockWidth,
	contentResizeMode,
	hasParents,
	marginHorizontal,
	parentBlockAlignment,
	parentBlockName,
	parentWidth,
	reversed = false,
} = {} ) {
	const { width, height } = useWindowDimensions();
	const isLandscape = width >= height;

	const blockMargin = useMemo(
		() =>
			getBlockMargin(
				align,
				blockName,
				blockWidth,
				hasParents,
				marginHorizontal,
				parentBlockAlignment,
				parentBlockName,
				parentWidth,
				width
			),
		[
			align,
			blockName,
			blockWidth,
			hasParents,
			marginHorizontal,
			parentBlockAlignment,
			parentBlockName,
			parentWidth,
			width,
		]
	);

	const wrapperStyles = useMemo( () => {
		const stretchStyle = contentResizeMode === 'stretch' && { flex: 1 };
		let canvasStyles = ! reversed
			? styles[ 'use-editor-wrapper-styles' ]
			: styles[ 'use-editor-wrapper-styles--reversed' ];

		// For these cases, no width constraints should be added.
		if ( stretchStyle ) {
			canvasStyles = stretchStyle;
		}

		const alignmentStyles = {
			...getWideWidthStyles( align, isLandscape, width ),
			...getFullWidthStyles(
				align,
				blockName,
				hasParents,
				parentBlockName
			),
		};

		return [ canvasStyles, alignmentStyles ];
	}, [
		align,
		blockName,
		hasParents,
		parentBlockName,
		isLandscape,
		width,
		contentResizeMode,
		reversed,
	] );

	return [ wrapperStyles, blockMargin ];
}
