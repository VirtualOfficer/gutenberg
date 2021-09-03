/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const justifyContentMap = {
	left: 'flex-start',
	right: 'flex-end',
	center: 'center',
	'space-between': 'space-between',
};
/**
 * The specific handling by `className` below is needed because `itemsJustification`
 * was introduced in https://github.com/WordPress/gutenberg/pull/28980/files and wasn't
 * declared in block.json.
 *
 * @param {Object} attributes Block's attributes.
 */
const migrateWithLayout = ( attributes ) => {
	if ( !! attributes.layout ) {
		return attributes;
	}
	const { className } = attributes;
	// Matches classes with `items-justified-` prefix.
	const prefix = `items-justified-`;
	const justifiedItemsRegex = new RegExp( `\\b${ prefix }[^ ]*[ ]?\\b`, 'g' );
	const layout = { type: 'flex' };
	/**
	 * Add justifyContent style only if needed for backwards compatibility.
	 * Also due to the missing attribute, it's possible for a block to have
	 * more than one of `justified` classes.
	 */
	const justifyContent = className
		?.match( justifiedItemsRegex )?.[ 0 ]
		?.trim();
	if ( justifyContent ) {
		Object.assign( layout, {
			justifyContent:
				justifyContentMap[ justifyContent.slice( prefix.length ) ],
		} );
	}
	return {
		...attributes,
		className: className?.replace( justifiedItemsRegex, '' ).trim(),
		layout,
	};
};

// Social Links block deprecations.
const deprecated = [
	// Implement `flex` layout.
	{
		attributes: {
			iconColor: {
				type: 'string',
			},
			customIconColor: {
				type: 'string',
			},
			iconColorValue: {
				type: 'string',
			},
			iconBackgroundColor: {
				type: 'string',
			},
			customIconBackgroundColor: {
				type: 'string',
			},
			iconBackgroundColorValue: {
				type: 'string',
			},
			openInNewTab: {
				type: 'boolean',
				default: false,
			},
			size: {
				type: 'string',
			},
		},
		isEligible: ( { layout } ) => ! layout,
		migrate: migrateWithLayout,
		save( props ) {
			const {
				attributes: {
					iconBackgroundColorValue,
					iconColorValue,
					itemsJustification,
					size,
				},
			} = props;

			const className = classNames( size, {
				'has-icon-color': iconColorValue,
				'has-icon-background-color': iconBackgroundColorValue,
				[ `items-justified-${ itemsJustification }` ]: itemsJustification,
			} );

			return (
				<ul { ...useBlockProps.save( { className } ) }>
					<InnerBlocks.Content />
				</ul>
			);
		},
	},
	// V1. Remove CSS variable use for colors.
	{
		attributes: {
			iconColor: {
				type: 'string',
			},
			customIconColor: {
				type: 'string',
			},
			iconColorValue: {
				type: 'string',
			},
			iconBackgroundColor: {
				type: 'string',
			},
			customIconBackgroundColor: {
				type: 'string',
			},
			iconBackgroundColorValue: {
				type: 'string',
			},
			openInNewTab: {
				type: 'boolean',
				default: false,
			},
			size: {
				type: 'string',
			},
		},
		providesContext: {
			openInNewTab: 'openInNewTab',
		},
		supports: {
			align: [ 'left', 'center', 'right' ],
			anchor: true,
		},
		migrate: migrateWithLayout,
		save: ( props ) => {
			const {
				attributes: {
					iconBackgroundColorValue,
					iconColorValue,
					itemsJustification,
					size,
				},
			} = props;

			const className = classNames( size, {
				'has-icon-color': iconColorValue,
				'has-icon-background-color': iconBackgroundColorValue,
				[ `items-justified-${ itemsJustification }` ]: itemsJustification,
			} );

			const style = {
				'--wp--social-links--icon-color': iconColorValue,
				'--wp--social-links--icon-background-color': iconBackgroundColorValue,
			};

			return (
				<ul { ...useBlockProps.save( { className, style } ) }>
					<InnerBlocks.Content />
				</ul>
			);
		},
	},
];

export default deprecated;
