/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	RichText,
	getColorClassName,
	useBlockProps,
	__experimentalGetGradientClass,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import migrateFontFamily from '../utils/migrate-font-family';

const migrateBorderRadius = ( attributes ) => {
	const { borderRadius, ...newAttributes } = attributes;
	// We have to check old property `borderRadius` and if
	// `styles.border.radius` is a `number`
	const oldBorderRadius = [
		borderRadius,
		newAttributes.style?.border?.radius,
	].find( ( possibleBorderRadius ) => {
		return (
			typeof possibleBorderRadius === 'number' &&
			possibleBorderRadius !== 0
		);
	} );
	if ( ! oldBorderRadius ) {
		return newAttributes;
	}

	return {
		...newAttributes,
		style: {
			...newAttributes.style,
			border: {
				...newAttributes.style?.border,
				radius: `${ oldBorderRadius }px`,
			},
		},
	};
};

function migrateAlign( attributes ) {
	if ( ! attributes.align ) {
		return attributes;
	}
	const { align, ...otherAttributes } = attributes;
	return {
		...otherAttributes,
		className: clsx(
			otherAttributes.className,
			`align${ attributes.align }`
		),
	};
}

const migrateCustomColorsAndGradients = ( attributes ) => {
	if (
		! attributes.customTextColor &&
		! attributes.customBackgroundColor &&
		! attributes.customGradient
	) {
		return attributes;
	}
	const style = { color: {} };
	if ( attributes.customTextColor ) {
		style.color.text = attributes.customTextColor;
	}
	if ( attributes.customBackgroundColor ) {
		style.color.background = attributes.customBackgroundColor;
	}
	if ( attributes.customGradient ) {
		style.color.gradient = attributes.customGradient;
	}

	const {
		customTextColor,
		customBackgroundColor,
		customGradient,
		...restAttributes
	} = attributes;

	return {
		...restAttributes,
		style,
	};
};

function migrateAttributeNames( attributes ) {
	// `url` has changed name to `href`.
	if ( attributes.url ) {
		attributes.href = attributes.url;
		delete attributes.url;
	}

	// `text` has changed name to `content`.
	if ( attributes.text ) {
		attributes.content = attributes.text;
		delete attributes.text;
	}

	return attributes;
}

const oldColorsMigration = ( attributes ) => {
	const { color, textColor, ...restAttributes } = {
		...attributes,
		customTextColor:
			attributes.textColor && '#' === attributes.textColor[ 0 ]
				? attributes.textColor
				: undefined,
		customBackgroundColor:
			attributes.color && '#' === attributes.color[ 0 ]
				? attributes.color
				: undefined,
	};
	return migrateCustomColorsAndGradients( restAttributes );
};

// v12: Some attributes were renamed.
// - `url` attribute was renamed to `href`.
// - `title` attribute was renamed to `content`.
const v12 = {
	migrate: migrateAttributeNames,
	attributes: {
		tagName: {
			type: 'string',
			enum: [ 'a', 'button' ],
			default: 'a',
		},
		type: {
			type: 'string',
			default: 'button',
		},
		textAlign: {
			type: 'string',
		},
		href: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'href',
			__experimentalRole: 'content',
		},
		title: {
			type: 'string',
			source: 'attribute',
			selector: 'a,button',
			attribute: 'title',
			__experimentalRole: 'content',
		},
		content: {
			type: 'rich-text',
			source: 'rich-text',
			selector: 'a,button',
			__experimentalRole: 'content',
		},
		linkTarget: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'target',
			__experimentalRole: 'content',
		},
		rel: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'rel',
			__experimentalRole: 'content',
		},
		placeholder: {
			type: 'string',
		},
		backgroundColor: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
		gradient: {
			type: 'string',
		},
		width: {
			type: 'number',
		},
	},
	supports: {
		anchor: true,
		splitting: true,
		align: false,
		alignWide: false,
		color: {
			__experimentalSkipSerialization: true,
			gradients: true,
			__experimentalDefaultControls: {
				background: true,
				text: true,
			},
		},
		typography: {
			fontSize: true,
			lineHeight: true,
			__experimentalFontFamily: true,
			__experimentalFontWeight: true,
			__experimentalFontStyle: true,
			__experimentalTextTransform: true,
			__experimentalTextDecoration: true,
			__experimentalLetterSpacing: true,
			__experimentalDefaultControls: {
				fontSize: true,
			},
		},
		reusable: false,
		shadow: {
			__experimentalSkipSerialization: true,
		},
		spacing: {
			__experimentalSkipSerialization: true,
			padding: [ 'horizontal', 'vertical' ],
			__experimentalDefaultControls: {
				padding: true,
			},
		},
		__experimentalBorder: {
			color: true,
			radius: true,
			style: true,
			width: true,
			__experimentalSkipSerialization: true,
			__experimentalDefaultControls: {
				color: true,
				radius: true,
				style: true,
				width: true,
			},
		},
		__experimentalSelector: '.wp-block-button .wp-block-button__link',
		interactivity: {
			clientNavigation: true,
		},
	},

	save( { attributes, className } ) {
		const {
			tagName,
			type,
			textAlign,
			fontSize,
			linkTarget,
			rel,
			style,
			text,
			title,
			url,
			width,
		} = attributes;

		const TagName = tagName || 'a';
		const isButtonTag = 'button' === TagName;
		const buttonType = type || 'button';
		const borderProps = getBorderClassesAndStyles( attributes );
		const colorProps = getColorClassesAndStyles( attributes );
		const spacingProps = getSpacingClassesAndStyles( attributes );
		const shadowProps = getShadowClassesAndStyles( attributes );
		const buttonClasses = clsx(
			'wp-block-button__link',
			colorProps.className,
			borderProps.className,
			{
				[ `has-text-align-${ textAlign }` ]: textAlign,
				// For backwards compatibility add style that isn't provided via
				// block support.
				'no-border-radius': style?.border?.radius === 0,
			},
			__experimentalGetElementClassName( 'button' )
		);
		const buttonStyle = {
			...borderProps.style,
			...colorProps.style,
			...spacingProps.style,
			...shadowProps.style,
		};

		// The use of a `title` attribute here is soft-deprecated, but still applied
		// if it had already been assigned, for the sake of backward-compatibility.
		// A title will no longer be assigned for new or updated button block links.

		const wrapperClasses = clsx( className, {
			[ `has-custom-width wp-block-button__width-${ width }` ]: width,
			[ `has-custom-font-size` ]: fontSize || style?.typography?.fontSize,
		} );

		return (
			<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
				<RichText.Content
					tagName={ TagName }
					type={ isButtonTag ? buttonType : null }
					className={ buttonClasses }
					href={ isButtonTag ? null : url }
					title={ title }
					style={ buttonStyle }
					value={ text }
					target={ isButtonTag ? null : linkTarget }
					rel={ isButtonTag ? null : rel }
				/>
			</div>
		);
	},
};

const v11 = {
	migrate: migrateAttributeNames,
	attributes: {
		url: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'href',
		},
		title: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'title',
		},
		text: {
			type: 'string',
			source: 'html',
			selector: 'a',
		},
		linkTarget: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'target',
		},
		rel: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'rel',
		},
		placeholder: {
			type: 'string',
		},
		backgroundColor: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
		gradient: {
			type: 'string',
		},
		width: {
			type: 'number',
		},
	},
	supports: {
		anchor: true,
		align: true,
		alignWide: false,
		color: {
			__experimentalSkipSerialization: true,
			gradients: true,
			__experimentalDefaultControls: {
				background: true,
				text: true,
			},
		},
		typography: {
			fontSize: true,
			__experimentalFontFamily: true,
			__experimentalDefaultControls: {
				fontSize: true,
			},
		},
		reusable: false,
		spacing: {
			__experimentalSkipSerialization: true,
			padding: [ 'horizontal', 'vertical' ],
			__experimentalDefaultControls: {
				padding: true,
			},
		},
		__experimentalBorder: {
			radius: true,
			__experimentalSkipSerialization: true,
			__experimentalDefaultControls: {
				radius: true,
			},
		},
		__experimentalSelector: '.wp-block-button__link',
	},
	save( { attributes, className } ) {
		const { fontSize, linkTarget, rel, style, text, title, url, width } =
			attributes;

		if ( ! text ) {
			return null;
		}

		const borderProps = getBorderClassesAndStyles( attributes );
		const colorProps = getColorClassesAndStyles( attributes );
		const spacingProps = getSpacingClassesAndStyles( attributes );
		const buttonClasses = clsx(
			'wp-block-button__link',
			colorProps.className,
			borderProps.className,
			{
				// For backwards compatibility add style that isn't provided via
				// block support.
				'no-border-radius': style?.border?.radius === 0,
			}
		);
		const buttonStyle = {
			...borderProps.style,
			...colorProps.style,
			...spacingProps.style,
		};

		// The use of a `title` attribute here is soft-deprecated, but still applied
		// if it had already been assigned, for the sake of backward-compatibility.
		// A title will no longer be assigned for new or updated button block links.

		const wrapperClasses = clsx( className, {
			[ `has-custom-width wp-block-button__width-${ width }` ]: width,
			[ `has-custom-font-size` ]: fontSize || style?.typography?.fontSize,
		} );

		return (
			<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
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
	},
};

const v10 = {
	attributes: {
		url: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'href',
		},
		title: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'title',
		},
		text: {
			type: 'string',
			source: 'html',
			selector: 'a',
		},
		linkTarget: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'target',
		},
		rel: {
			type: 'string',
			source: 'attribute',
			selector: 'a',
			attribute: 'rel',
		},
		placeholder: {
			type: 'string',
		},
		backgroundColor: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
		gradient: {
			type: 'string',
		},
		width: {
			type: 'number',
		},
	},
	supports: {
		anchor: true,
		align: true,
		alignWide: false,
		color: {
			__experimentalSkipSerialization: true,
			gradients: true,
		},
		typography: {
			fontSize: true,
			__experimentalFontFamily: true,
		},
		reusable: false,
		spacing: {
			__experimentalSkipSerialization: true,
			padding: [ 'horizontal', 'vertical' ],
			__experimentalDefaultControls: {
				padding: true,
			},
		},
		__experimentalBorder: {
			radius: true,
			__experimentalSkipSerialization: true,
		},
		__experimentalSelector: '.wp-block-button__link',
	},
	save( { attributes, className } ) {
		const { fontSize, linkTarget, rel, style, text, title, url, width } =
			attributes;

		if ( ! text ) {
			return null;
		}

		const borderProps = getBorderClassesAndStyles( attributes );
		const colorProps = getColorClassesAndStyles( attributes );
		const spacingProps = getSpacingClassesAndStyles( attributes );
		const buttonClasses = clsx(
			'wp-block-button__link',
			colorProps.className,
			borderProps.className,
			{
				// For backwards compatibility add style that isn't provided via
				// block support.
				'no-border-radius': style?.border?.radius === 0,
			}
		);
		const buttonStyle = {
			...borderProps.style,
			...colorProps.style,
			...spacingProps.style,
		};

		// The use of a `title` attribute here is soft-deprecated, but still applied
		// if it had already been assigned, for the sake of backward-compatibility.
		// A title will no longer be assigned for new or updated button block links.

		const wrapperClasses = clsx( className, {
			[ `has-custom-width wp-block-button__width-${ width }` ]: width,
			[ `has-custom-font-size` ]: fontSize || style?.typography?.fontSize,
		} );

		return (
			<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
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
	},
	migrate: compose( migrateFontFamily, migrateAttributeNames ),
	isEligible( { style } ) {
		return style?.typography?.fontFamily;
	},
};

const deprecated = [
	v12,
	v11,
	v10,
	{
		supports: {
			anchor: true,
			align: true,
			alignWide: false,
			color: {
				__experimentalSkipSerialization: true,
				gradients: true,
			},
			typography: {
				fontSize: true,
				__experimentalFontFamily: true,
			},
			reusable: false,
			__experimentalSelector: '.wp-block-button__link',
		},
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			gradient: {
				type: 'string',
			},
			width: {
				type: 'number',
			},
		},
		isEligible( { style } ) {
			return typeof style?.border?.radius === 'number';
		},
		save( { attributes, className } ) {
			const {
				fontSize,
				linkTarget,
				rel,
				style,
				text,
				title,
				url,
				width,
			} = attributes;

			if ( ! text ) {
				return null;
			}

			const borderRadius = style?.border?.radius;
			const colorProps = getColorClassesAndStyles( attributes );
			const buttonClasses = clsx(
				'wp-block-button__link',
				colorProps.className,
				{
					'no-border-radius': style?.border?.radius === 0,
				}
			);
			const buttonStyle = {
				borderRadius: borderRadius ? borderRadius : undefined,
				...colorProps.style,
			};

			// The use of a `title` attribute here is soft-deprecated, but still applied
			// if it had already been assigned, for the sake of backward-compatibility.
			// A title will no longer be assigned for new or updated button block links.

			const wrapperClasses = clsx( className, {
				[ `has-custom-width wp-block-button__width-${ width }` ]: width,
				[ `has-custom-font-size` ]:
					fontSize || style?.typography?.fontSize,
			} );

			return (
				<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
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
		},
		migrate: compose(
			migrateFontFamily,
			migrateBorderRadius,
			migrateAttributeNames
		),
	},
	{
		supports: {
			anchor: true,
			align: true,
			alignWide: false,
			color: {
				__experimentalSkipSerialization: true,
			},
			reusable: false,
			__experimentalSelector: '.wp-block-button__link',
		},
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
			borderRadius: {
				type: 'number',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			gradient: {
				type: 'string',
			},
			style: {
				type: 'object',
			},
			width: {
				type: 'number',
			},
		},
		save( { attributes, className } ) {
			const { borderRadius, linkTarget, rel, text, title, url, width } =
				attributes;
			const colorProps = getColorClassesAndStyles( attributes );
			const buttonClasses = clsx(
				'wp-block-button__link',
				colorProps.className,
				{
					'no-border-radius': borderRadius === 0,
				}
			);
			const buttonStyle = {
				borderRadius: borderRadius ? borderRadius + 'px' : undefined,
				...colorProps.style,
			};

			// The use of a `title` attribute here is soft-deprecated, but still applied
			// if it had already been assigned, for the sake of backward-compatibility.
			// A title will no longer be assigned for new or updated button block links.

			const wrapperClasses = clsx( className, {
				[ `has-custom-width wp-block-button__width-${ width }` ]: width,
			} );

			return (
				<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
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
		},
		migrate: compose(
			migrateFontFamily,
			migrateBorderRadius,
			migrateAttributeNames
		),
	},
	{
		supports: {
			anchor: true,
			align: true,
			alignWide: false,
			color: {
				__experimentalSkipSerialization: true,
			},
			reusable: false,
			__experimentalSelector: '.wp-block-button__link',
		},
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
			borderRadius: {
				type: 'number',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			gradient: {
				type: 'string',
			},
			style: {
				type: 'object',
			},
			width: {
				type: 'number',
			},
		},
		save( { attributes, className } ) {
			const { borderRadius, linkTarget, rel, text, title, url, width } =
				attributes;
			const colorProps = getColorClassesAndStyles( attributes );
			const buttonClasses = clsx(
				'wp-block-button__link',
				colorProps.className,
				{
					'no-border-radius': borderRadius === 0,
				}
			);
			const buttonStyle = {
				borderRadius: borderRadius ? borderRadius + 'px' : undefined,
				...colorProps.style,
			};

			// The use of a `title` attribute here is soft-deprecated, but still applied
			// if it had already been assigned, for the sake of backward-compatibility.
			// A title will no longer be assigned for new or updated button block links.

			const wrapperClasses = clsx( className, {
				[ `has-custom-width wp-block-button__width-${ width }` ]: width,
			} );

			return (
				<div { ...useBlockProps.save( { className: wrapperClasses } ) }>
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
		},
		migrate: compose(
			migrateFontFamily,
			migrateBorderRadius,
			migrateAttributeNames
		),
	},
	{
		supports: {
			align: true,
			alignWide: false,
			color: { gradients: true },
		},
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
			borderRadius: {
				type: 'number',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			gradient: {
				type: 'string',
			},
			style: {
				type: 'object',
			},
		},
		save( { attributes } ) {
			const { borderRadius, linkTarget, rel, text, title, url } =
				attributes;
			const buttonClasses = clsx( 'wp-block-button__link', {
				'no-border-radius': borderRadius === 0,
			} );
			const buttonStyle = {
				borderRadius: borderRadius ? borderRadius + 'px' : undefined,
			};

			return (
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
			);
		},
		migrate: compose( migrateBorderRadius, migrateAttributeNames ),
	},
	{
		supports: {
			align: true,
			alignWide: false,
		},
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
			borderRadius: {
				type: 'number',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			customBackgroundColor: {
				type: 'string',
			},
			customTextColor: {
				type: 'string',
			},
			customGradient: {
				type: 'string',
			},
			gradient: {
				type: 'string',
			},
		},
		isEligible: ( attributes ) =>
			!! attributes.customTextColor ||
			!! attributes.customBackgroundColor ||
			!! attributes.customGradient ||
			!! attributes.align,
		migrate: compose(
			migrateBorderRadius,
			migrateCustomColorsAndGradients,
			migrateAlign,
			migrateAttributeNames
		),
		save( { attributes } ) {
			const {
				backgroundColor,
				borderRadius,
				customBackgroundColor,
				customTextColor,
				customGradient,
				linkTarget,
				gradient,
				rel,
				text,
				textColor,
				title,
				url,
			} = attributes;

			const textClass = getColorClassName( 'color', textColor );
			const backgroundClass =
				! customGradient &&
				getColorClassName( 'background-color', backgroundColor );
			const gradientClass = __experimentalGetGradientClass( gradient );

			const buttonClasses = clsx( 'wp-block-button__link', {
				'has-text-color': textColor || customTextColor,
				[ textClass ]: textClass,
				'has-background':
					backgroundColor ||
					customBackgroundColor ||
					customGradient ||
					gradient,
				[ backgroundClass ]: backgroundClass,
				'no-border-radius': borderRadius === 0,
				[ gradientClass ]: gradientClass,
			} );

			const buttonStyle = {
				background: customGradient ? customGradient : undefined,
				backgroundColor:
					backgroundClass || customGradient || gradient
						? undefined
						: customBackgroundColor,
				color: textClass ? undefined : customTextColor,
				borderRadius: borderRadius ? borderRadius + 'px' : undefined,
			};

			// The use of a `title` attribute here is soft-deprecated, but still applied
			// if it had already been assigned, for the sake of backward-compatibility.
			// A title will no longer be assigned for new or updated button block links.

			return (
				<div>
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
		},
	},
	{
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			align: {
				type: 'string',
				default: 'none',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			customBackgroundColor: {
				type: 'string',
			},
			customTextColor: {
				type: 'string',
			},
			linkTarget: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'target',
			},
			rel: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'rel',
			},
			placeholder: {
				type: 'string',
			},
		},
		isEligible( attribute ) {
			return (
				attribute.className &&
				attribute.className.includes( 'is-style-squared' )
			);
		},
		migrate( attributes ) {
			let newClassName = attributes.className;
			if ( newClassName ) {
				newClassName = newClassName
					.replace( /is-style-squared[\s]?/, '' )
					.trim();
			}
			return compose(
				migrateBorderRadius,
				migrateCustomColorsAndGradients,
				migrateAttributeNames
			)( {
				...attributes,
				className: newClassName ? newClassName : undefined,
				borderRadius: 0,
			} );
		},
		save( { attributes } ) {
			const {
				backgroundColor,
				customBackgroundColor,
				customTextColor,
				linkTarget,
				rel,
				text,
				textColor,
				title,
				url,
			} = attributes;

			const textClass = getColorClassName( 'color', textColor );
			const backgroundClass = getColorClassName(
				'background-color',
				backgroundColor
			);

			const buttonClasses = clsx( 'wp-block-button__link', {
				'has-text-color': textColor || customTextColor,
				[ textClass ]: textClass,
				'has-background': backgroundColor || customBackgroundColor,
				[ backgroundClass ]: backgroundClass,
			} );

			const buttonStyle = {
				backgroundColor: backgroundClass
					? undefined
					: customBackgroundColor,
				color: textClass ? undefined : customTextColor,
			};

			return (
				<div>
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
		},
	},
	{
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			align: {
				type: 'string',
				default: 'none',
			},
			backgroundColor: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			customBackgroundColor: {
				type: 'string',
			},
			customTextColor: {
				type: 'string',
			},
		},
		migrate: compose( oldColorsMigration, migrateAttributeNames ),
		save( { attributes } ) {
			const {
				url,
				text,
				title,
				backgroundColor,
				textColor,
				customBackgroundColor,
				customTextColor,
			} = attributes;

			const textClass = getColorClassName( 'color', textColor );
			const backgroundClass = getColorClassName(
				'background-color',
				backgroundColor
			);

			const buttonClasses = clsx( 'wp-block-button__link', {
				'has-text-color': textColor || customTextColor,
				[ textClass ]: textClass,
				'has-background': backgroundColor || customBackgroundColor,
				[ backgroundClass ]: backgroundClass,
			} );

			const buttonStyle = {
				backgroundColor: backgroundClass
					? undefined
					: customBackgroundColor,
				color: textClass ? undefined : customTextColor,
			};

			return (
				<div>
					<RichText.Content
						tagName="a"
						className={ buttonClasses }
						href={ url }
						title={ title }
						style={ buttonStyle }
						value={ text }
					/>
				</div>
			);
		},
	},
	{
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			color: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			align: {
				type: 'string',
				default: 'none',
			},
		},
		save( { attributes } ) {
			const { url, text, title, align, color, textColor } = attributes;

			const buttonStyle = {
				backgroundColor: color,
				color: textColor,
			};

			const linkClass = 'wp-block-button__link';

			return (
				<div className={ `align${ align }` }>
					<RichText.Content
						tagName="a"
						className={ linkClass }
						href={ url }
						title={ title }
						style={ buttonStyle }
						value={ text }
					/>
				</div>
			);
		},
		migrate: compose( oldColorsMigration, migrateAttributeNames ),
	},
	{
		attributes: {
			url: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'href',
			},
			title: {
				type: 'string',
				source: 'attribute',
				selector: 'a',
				attribute: 'title',
			},
			text: {
				type: 'string',
				source: 'html',
				selector: 'a',
			},
			color: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
			align: {
				type: 'string',
				default: 'none',
			},
		},
		save( { attributes } ) {
			const { url, text, title, align, color, textColor } = attributes;

			return (
				<div
					className={ `align${ align }` }
					style={ { backgroundColor: color } }
				>
					<RichText.Content
						tagName="a"
						href={ url }
						title={ title }
						style={ { color: textColor } }
						value={ text }
					/>
				</div>
			);
		},
		migrate: compose( oldColorsMigration, migrateAttributeNames ),
	},
];

export default deprecated;
