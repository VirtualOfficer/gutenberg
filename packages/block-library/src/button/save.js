/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	getFontSizeClass,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import getColorAndStyleProps from './color-props';

export default function save( { attributes } ) {
	const {
		borderRadius,
		linkTarget,
		rel,
		text,
		title,
		url,
		fontSize,
	} = attributes;
	const colorProps = getColorAndStyleProps( attributes );
	const buttonClasses = classnames(
		'wp-block-button__link',
		colorProps.className,
		getFontSizeClass( fontSize ),
		{
			'no-border-radius': borderRadius === 0,
		}
	);

	const blockProps = useBlockProps.save();
	const { style, ...otherBlockProps } = blockProps;

	const buttonStyle = {
		borderRadius: borderRadius ? borderRadius + 'px' : undefined,
		...colorProps.style,
		...style,
	};

	// The use of a `title` attribute here is soft-deprecated, but still applied
	// if it had already been assigned, for the sake of backward-compatibility.
	// A title will no longer be assigned for new or updated button block links.

	return (
		<div { ...otherBlockProps }>
			<RichText.Content
				tagName="a"
				className={ buttonClasses }
				href={ url }
				title={ title }
				style={ buttonStyle }
				value={ text }
				target={ linkTarget }
				rel={ rel }
			/>
		</div>
	);
}
