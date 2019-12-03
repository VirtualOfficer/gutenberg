/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { PanelBody, RangeControl, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import withDefaults from './withDefaults';
import Markup from './components/markup';
import useRenderTypographyStyles from './useRenderTypographyStyles';

function GlobalTypographyEdit( { attributes, setAttributes, className } ) {
	const otherAttributes = omit( attributes, [ 'align' ] );

	useRenderTypographyStyles( otherAttributes );

	const updateAttribute = ( prop, value ) => {
		setAttributes( { [ prop ]: value } );
	};

	return (
		<div className={ className }>
			<Markup { ...otherAttributes } />
			<InspectorControls>
				<FontSizePanel
					{ ...otherAttributes }
					updateAttribute={ updateAttribute }
				/>
			</InspectorControls>
		</div>
	);
}

function FontSizePanel( {
	fontFamilyBase,
	fontFamilyHeading,
	fontSizeBase,
	lineHeightBase,
	lineHeightHeading,
	typeScale,
	updateAttribute,
} ) {
	const updateProp = ( prop ) => ( value ) => updateAttribute( prop, value );

	return (
		<>
			<PanelBody title="Font">
				<TextControl
					label="Heading Font"
					onChange={ updateProp( 'fontFamilyHeading' ) }
					value={ fontFamilyHeading }
				/>
				<TextControl
					label="Body Font"
					onChange={ updateProp( 'fontFamilyBase' ) }
					value={ fontFamilyBase }
				/>
			</PanelBody>
			<PanelBody title="Sizing">
				<RangeControl
					label="Font Size"
					onChange={ updateProp( 'fontSizeBase' ) }
					value={ fontSizeBase }
					min={ 8 }
					max={ 30 }
					initialPosition={ 16 }
				/>
				<RangeControl
					label="Type Scale"
					onChange={ updateProp( 'typeScale' ) }
					value={ typeScale }
					min={ 1 }
					max={ 1.65 }
					initialPosition={ 1.4 }
					step={ 0.05 }
				/>
			</PanelBody>
			<PanelBody title="Spacing">
				<RangeControl
					label="Heading Line Height"
					onChange={ updateProp( 'lineHeightHeading' ) }
					value={ lineHeightHeading }
					min={ 1 }
					max={ 2 }
					initialPosition={ 1.25 }
					step={ 0.05 }
				/>
				<RangeControl
					label="Line Height"
					onChange={ updateProp( 'lineHeightBase' ) }
					value={ lineHeightBase }
					min={ 1 }
					max={ 2.5 }
					initialPosition={ 1.5 }
					step={ 0.05 }
				/>
			</PanelBody>
		</>
	);
}

export default compose( [ withDefaults ] )( GlobalTypographyEdit );
