/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PlainText } from '@wordpress/editor';

export default function CodeEdit( { attributes, setAttributes, className } ) {
	return (
		<div className={ className }>
			<PlainText
				value={ attributes.content }
				onChange={ ( content ) => setAttributes( { content } ) }
				placeholder={ __( 'Add code' ) }
				aria-label={ __( 'Code' ) }
			/>
		</div>
	);
}
