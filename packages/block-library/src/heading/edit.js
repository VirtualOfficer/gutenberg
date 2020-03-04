/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import HeadingToolbar from './heading-toolbar';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, Text } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import {
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	RichText,
	__experimentalUseColors,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { Platform, useRef } from '@wordpress/element';

function HeadingEdit( {
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	className,
	style,
} ) {
	const ref = useRef();
	const { TextColor, InspectorControlsColorPanel } = __experimentalUseColors(
		[ { name: 'textColor', property: 'color' } ],
		Platform.OS === 'web' ? {
			contrastCheckers: { backgroundColor: true, textColor: true },
			colorDetector: { targetRef: ref },
		} : undefined,
		[]
	);

	const { align, content, level, placeholder } = attributes;
	const tagName = 'h' + level;

	return (
		<>
			<BlockControls>
				<HeadingToolbar
					minLevel={ 2 }
					maxLevel={ Platform.OS === 'web' ? 5 : 7 }
					selectedLevel={ level }
					onChange={ ( newLevel ) =>
						setAttributes( { level: newLevel } )
					}
					isCollapsed={ Platform.OS === 'web' }
				/>
				<AlignmentToolbar
					value={ align }
					onChange={ ( nextAlign ) => {
						setAttributes( { align: nextAlign } );
					} }
				/>
			</BlockControls>
			{ Platform.OS === 'web' ?
				<InspectorControls>
					<PanelBody title={ __( 'Heading settings' ) }>
						<Text>{ __( 'Level' ) }</Text>
						<HeadingToolbar
							isCollapsed={ false }
							minLevel={ 1 }
							maxLevel={ 7 }
							selectedLevel={ level }
							onChange={ ( newLevel ) =>
								setAttributes( { level: newLevel } )
							}
						/>
					</PanelBody>
				</InspectorControls> : null }
			{ Platform.OS === 'web' ? InspectorControlsColorPanel : null }
			<TextColor>
				<RichText
					ref={ ref }
					identifier="content"
					tagName={ Platform.OS === 'web' ? Block[ tagName ] : tagName }
					value={ content }
					onChange={ ( value ) =>
						setAttributes( { content: value } )
					}
					onMerge={ mergeBlocks }
					onSplit={ ( value ) => {
						if ( ! value ) {
							return createBlock( 'core/paragraph' );
						}

						return createBlock( 'core/heading', {
							...attributes,
							content: value,
						} );
					} }
					onReplace={ onReplace }
					onRemove={ () => onReplace( [] ) }
					className={ classnames( className, {
						[ `has-text-align-${ align }` ]: align,
					} ) }
					style={ style }
					placeholder={ placeholder || __( 'Write heading…' ) }
					textAlign={ align }
				/>
			</TextColor>
		</>
	);
}

export default HeadingEdit;
