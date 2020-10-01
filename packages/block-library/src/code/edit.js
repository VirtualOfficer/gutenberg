/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, useBlockWrapperProps } from '@wordpress/block-editor';

export default function CodeEdit( { attributes, setAttributes } ) {
	const blockWrapperProps = useBlockWrapperProps();
	return (
		<pre { ...blockWrapperProps }>
			<RichText
				tagName="code"
				value={ attributes.content }
				onChange={ ( content ) => setAttributes( { content } ) }
				placeholder={ __( 'Write code…' ) }
				aria-label={ __( 'Code' ) }
			/>
		</pre>
	);
}
