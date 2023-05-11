/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies
 */
import { RichTextToolbarButton } from '@wordpress/block-editor';
import {
	TextControl,
	SelectControl,
	Button,
	Popover,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { applyFormat, removeFormat, useAnchor } from '@wordpress/rich-text';
import { translation } from '@wordpress/icons';

const name = 'core/language';
const title = __( 'Language' );

const LangAttributeButton = ( props ) => {
	const { contentRef, isActive, onChange, value } = props;
	const anchorRef = useAnchor( {
		editableContentElement: contentRef.current,
		language,
	} );

	const [ lang, setLang ] = useState( '' );
	const [ dir, setDir ] = useState( 'ltr' );

	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const togglePopover = () => {
		setIsPopoverVisible( ( state ) => ! state );
		setLang( '' );
		setDir( 'ltr' );
	};

	return (
		<>
			<RichTextToolbarButton
				icon={ translation }
				label={ __( 'Lang attribute' ) }
				title={ __( 'Lang attribute' ) }
				onClick={ () => {
					if ( isActive ) {
						onChange( removeFormat( value, name ) );
					} else {
						togglePopover();
					}
				} }
				isActive={ isActive }
			/>

			{ isPopoverVisible && (
				<Popover
					className="components-lang-attribute-popover"
					anchor={ anchorRef }
					position="bottom center"
				>
					<TextControl
						label={ __( 'Lang attribute' ) }
						value={ lang }
						onChange={ ( val ) => setLang( val ) }
					/>
					<p className="lang-attribute-info">
						<em>
							{ __(
								'Should be a valid lang attribute, like "en" or "fr".'
							) }
						</em>
					</p>

					<SelectControl
						label={ __( 'Text direction' ) }
						value={ dir }
						options={ [
							{
								label: __( 'Left to right' ),
								value: 'ltr',
							},
							{
								label: __( 'Right to left' ),
								value: 'rtl',
							},
						] }
						onChange={ ( val ) => setDir( val ) }
					/>
					<Button
						isPrimary
						text={ __( 'Apply' ) }
						onClick={ () => {
							onChange(
								applyFormat( value, {
									type: name,
									attributes: {
										lang,
										dir,
									},
								} )
							);
							togglePopover();
						} }
					/>
				</Popover>
			) }
		</>
	);
};

export const language = {
	name,
	tagName: 'span',
	className: 'lang-attribute',
	edit: LangAttributeButton,
	icon: 'translation',
	title,
};
