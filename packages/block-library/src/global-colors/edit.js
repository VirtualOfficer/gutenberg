/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose, withInstanceId } from '@wordpress/compose';
import { PanelBody } from '@wordpress/components';
import { InspectorControls, withColorContext } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import withColorOverrides from './withColorOverrides';
import useRenderColorStyles from './useRenderColorStyles';
import ColorControl from './components/color-control';
import Markup from './components/markup';

function GlobalColorEdit( props ) {
	const { attributes, className, colors, setAttributes } = props;
	const { title } = attributes;

	useRenderColorStyles( colors );

	const setColorAttribute = ( { color, slug } ) => {
		const nextColors = colors.map( ( item ) => {
			if ( item.slug !== slug ) {
				return item;
			}
			return {
				...item,
				color,
			};
		} );
		setAttributes( { globalColors: nextColors } );
	};

	const handleOnUpdateColor = ( { color, slug } ) => {
		setColorAttribute( { color, slug } );
	};

	return (
		<div className={ className } title={ title }>
			<Markup colors={ colors } />
			<InspectorControls>
				<PanelBody title={ __( 'Color Palette' ) }>
					{ colors.map( ( color, index ) => (
						<ColorControl
							{ ...color }
							onUpdateColor={ handleOnUpdateColor }
							key={ index }
						/>
					) ) }
				</PanelBody>
			</InspectorControls>
		</div>
	);
}

export default compose( [ withInstanceId, withColorContext, withColorOverrides ] )( GlobalColorEdit );
