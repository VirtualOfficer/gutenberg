/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	InspectorControls,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

function ColumnEdit( {
	attributes: { verticalAlignment, width },
	setAttributes,
	clientId,
} ) {
	const classes = classnames( 'block-core-columns', {
		[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );

	const { hasChildBlocks, rootClientId } = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockRootClientId } = select(
				'core/block-editor'
			);

			return {
				hasChildBlocks: getBlockOrder( clientId ).length > 0,
				rootClientId: getBlockRootClientId( clientId ),
			};
		},
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const updateAlignment = ( value ) => {
		// Update own alignment.
		setAttributes( { verticalAlignment: value } );
		// Reset parent Columns block.
		updateBlockAttributes( rootClientId, {
			verticalAlignment: null,
		} );
	};

	const hasWidth = ( isNaN( width ) && width ) || Number.isFinite( width );

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={ updateAlignment }
					value={ verticalAlignment }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Column settings' ) }>
					<TextControl
						label={ __( 'Width' ) }
						value={ width || '' }
						onChange={ ( nextWidth ) => {
							setAttributes( { width: nextWidth } );
						} }
						placeholder={
							width === undefined ? __( 'Auto' ) : undefined
						}
					/>
				</PanelBody>
			</InspectorControls>
			<InnerBlocks
				templateLock={ false }
				renderAppender={
					hasChildBlocks
						? undefined
						: () => <InnerBlocks.ButtonBlockAppender />
				}
				__experimentalTagName={ Block.div }
				__experimentalPassedProps={ {
					className: classes,
					style: hasWidth ? { flexBasis: width } : undefined,
				} }
			/>
		</>
	);
}

export default ColumnEdit;
