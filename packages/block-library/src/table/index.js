/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { getPhrasingContentSchema } from '@wordpress/blocks';
import { RichText, getColorClassName } from '@wordpress/editor';
import { G, Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';

const tableContentPasteSchema = {
	tr: {
		children: {
			th: {
				children: getPhrasingContentSchema(),
			},
			td: {
				children: getPhrasingContentSchema(),
			},
		},
	},
};

const tablePasteSchema = {
	table: {
		children: {
			thead: {
				children: tableContentPasteSchema,
			},
			tfoot: {
				children: tableContentPasteSchema,
			},
			tbody: {
				children: tableContentPasteSchema,
			},
		},
	},
};

function getTableSectionAttributeSchema( section ) {
	return {
		type: 'array',
		default: [],
		source: 'query',
		selector: `t${ section } tr`,
		query: {
			cells: {
				type: 'array',
				default: [],
				source: 'query',
				selector: 'td,th',
				query: {
					content: {
						type: 'string',
						source: 'html',
					},
					tag: {
						type: 'string',
						default: 'td',
						source: 'tag',
					},
				},
			},
		},
	};
}

export const name = 'core/table';

export const settings = {
	title: __( 'Table' ),
	description: __( 'Insert a table — perfect for sharing charts and data.' ),
	icon: <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><Path fill="none" d="M0 0h24v24H0V0z" /><G><Path d="M20 3H5L3 5v14l2 2h15l2-2V5l-2-2zm0 2v3H5V5h15zm-5 14h-5v-9h5v9zM5 10h3v9H5v-9zm12 9v-9h3v9h-3z" /></G></SVG>,
	category: 'formatting',

	attributes: {
		hasFixedLayout: {
			type: 'boolean',
			default: false,
		},
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
		borderColor: {
			type: 'string',
		},
		customBorderColor: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
		customTextColor: {
			type: 'string',
		},
		head: getTableSectionAttributeSchema( 'head' ),
		body: getTableSectionAttributeSchema( 'body' ),
		foot: getTableSectionAttributeSchema( 'foot' ),
	},

	styles: [
		{ name: 'regular', label: _x( 'Regular', 'block style' ), isDefault: true },
		{ name: 'stripes', label: __( 'Stripes' ) },
	],

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'raw',
				selector: 'table',
				schema: tablePasteSchema,
			},
		],
	},

	edit,

	save( { attributes } ) {
		const {
			className,
			hasFixedLayout,
			head,
			body,
			foot,
			backgroundColor,
			customBackgroundColor,
			textColor,
			customTextColor,
		} = attributes;
		const isEmpty = ! head.length && ! body.length && ! foot.length;

		if ( isEmpty ) {
			return null;
		}

		const tableClasses = classnames( {
			'has-fixed-layout': hasFixedLayout,
		} );

		const isStriped = !! className && className.indexOf( 'is-style-stripes' ) > -1;
		const backgroundClass = getColorClassName( 'background-color', backgroundColor );
		const textClass = getColorClassName( 'color', textColor );

		const Section = ( { type, rows } ) => {
			if ( ! rows.length ) {
				return null;
			}

			const Tag = `t${ type }`;

			return (
				<Tag>
					{ rows.map( ( { cells }, rowIndex ) => {
						const hasColors = isStriped ? rowIndex % 2 === 0 : true;

						const rowClasses = classnames( {
							'has-background-color': hasColors && backgroundClass,
							[ backgroundClass ]: hasColors ? backgroundClass : undefined,
							[ textClass ]: textClass,
						} );

						const rowStyles = {
							backgroundColor: hasColors && ! backgroundClass ? customBackgroundColor : undefined,
							color: ! textClass ? customTextColor : undefined,
						};

						return (
							<tr key={ rowIndex } className={ rowClasses || undefined } style={ rowStyles }>
								{ cells.map( ( { content, tag }, cellIndex ) =>
									<RichText.Content
										tagName={ tag }
										value={ content }
										key={ cellIndex }
									/>
								) }
							</tr>
						);
					} ) }
				</Tag>
			);
		};

		return (
			<table className={ tableClasses }>
				<Section type="head" rows={ head } />
				<Section type="body" rows={ body } />
				<Section type="foot" rows={ foot } />
			</table>
		);
	},
};
