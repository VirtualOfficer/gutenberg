/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useDisabled, useMergeRefs } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { memo, useMemo } from '@wordpress/element';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import BlockEditorProvider from '../provider';
import AutoHeightBlockPreview from './auto';
import { store as blockEditorStore } from '../../store';
import { BlockListItems } from '../block-list';

export function BlockPreview( {
	blocks,
	viewportWidth = 1200,
	minHeight,
	additionalStyles = [],
	// Deprecated props:
	__experimentalMinHeight,
	__experimentalStyles,
	__experimentalPadding,
} ) {
	if ( __experimentalMinHeight ) {
		minHeight = __experimentalMinHeight;
		deprecated( 'The __experimentalMinHeight prop', {
			since: '6.2',
			alternative: 'minHeight',
		} );
	}
	if ( __experimentalStyles ) {
		additionalStyles = __experimentalStyles;
		deprecated( 'The __experimentalStyles prop of BlockPreview', {
			plugin: 'Gutenberg',
			since: '15.0',
			version: '15.2',
			alternative: 'additionalStyles',
		} );
	}
	if ( __experimentalPadding ) {
		additionalStyles = [
			...additionalStyles,
			{ css: `body { padding: ${ __experimentalPadding }px; }` },
		];
		deprecated( 'The __experimentalPadding prop of BlockPreview', {
			since: '6.2',
			alternative: 'additionalStyles',
		} );
	}

	const originalSettings = useSelect(
		( select ) => select( blockEditorStore ).getSettings(),
		[]
	);
	const settings = useMemo(
		() => ( { ...originalSettings, __unstableIsPreviewMode: true } ),
		[ originalSettings ]
	);
	const renderedBlocks = useMemo(
		() => ( Array.isArray( blocks ) ? blocks : [ blocks ] ),
		[ blocks ]
	);

	if ( ! blocks || blocks.length === 0 ) {
		return null;
	}

	return (
		<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
			<AutoHeightBlockPreview
				viewportWidth={ viewportWidth }
				minHeight={ minHeight }
				additionalStyles={ additionalStyles }
			/>
		</BlockEditorProvider>
	);
}

/**
 * BlockPreview renders a preview of a block or array of blocks.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/block-editor/src/components/block-preview/README.md
 *
 * @param {Object}       preview               options for how the preview should be shown
 * @param {Array|Object} preview.blocks        A block instance (object) or an array of blocks to be previewed.
 * @param {number}       preview.viewportWidth Width of the preview container in pixels. Controls at what size the blocks will be rendered inside the preview. Default: 700.
 *
 * @return {WPComponent} The component to be rendered.
 */
export default memo( BlockPreview );

/**
 * This hook is used to lightly mark an element as a block preview wrapper
 * element. Call this hook and pass the returned props to the element to mark as
 * a block preview wrapper, automatically rendering inner blocks as children. If
 * you define a ref for the element, it is important to pass the ref to this
 * hook, which the hook in turn will pass to the component through the props it
 * returns. Optionally, you can also pass any other props through this hook, and
 * they will be merged and returned.
 *
 * @param {Object}    options                      Preview options.
 * @param {WPBlock[]} options.blocks               Block objects.
 * @param {Object}    options.props                Optional. Props to pass to the element. Must contain
 *                                                 the ref if one is defined.
 * @param {Object}    options.__experimentalLayout Layout settings to be used in the preview.
 *
 */
export function useBlockPreview( {
	blocks,
	props = {},
	__experimentalLayout,
} ) {
	const originalSettings = useSelect(
		( select ) => select( blockEditorStore ).getSettings(),
		[]
	);
	const settings = useMemo(
		() => ( { ...originalSettings, __unstableIsPreviewMode: true } ),
		[ originalSettings ]
	);
	const disabledRef = useDisabled();
	const ref = useMergeRefs( [ props.ref, disabledRef ] );
	const renderedBlocks = useMemo(
		() => ( Array.isArray( blocks ) ? blocks : [ blocks ] ),
		[ blocks ]
	);

	const children = (
		<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
			<BlockListItems
				renderAppender={ false }
				__experimentalLayout={ __experimentalLayout }
			/>
		</BlockEditorProvider>
	);

	return {
		...props,
		ref,
		className: classnames(
			props.className,
			'block-editor-block-preview__live-content',
			'components-disabled'
		),
		children: blocks?.length ? children : null,
	};
}
