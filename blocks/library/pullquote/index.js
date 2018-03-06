/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withState } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import RichText from '../../rich-text';

const toRichTextValue = value => map( value, ( subValue => subValue.children ) );
const fromRichTextValue = value => map( value, ( subValue ) => ( {
	children: subValue,
} ) );
const blockAttributes = {
	value: {
		type: 'array',
		source: 'query',
		selector: 'blockquote > p',
		query: {
			children: {
				source: 'node',
			},
		},
	},
	citation: {
		type: 'array',
		source: 'children',
		selector: 'cite',
	},
};

export const name = 'core/pullquote';

export const settings = {

	title: __( 'Pullquote' ),

	description: __( 'A pullquote is a brief, attention-catching quotation taken from the main text of an article and used as a subheading or graphic feature.' ),

	icon: 'format-quote',

	category: 'formatting',

	attributes: blockAttributes,

	supports: {
		align: true,
	},

	edit: withState( {
		editable: 'content',
	} )( ( { attributes, setAttributes, isSelected, className, editable, setState } ) => {
		const { value, citation } = attributes;
		const onSetActiveEditable = ( newEditable ) => () => setState( { editable: newEditable } );

		return (
			<blockquote className={ className }>
				<RichText
					multiline="p"
					value={ toRichTextValue( value ) }
					onChange={
						( nextValue ) => setAttributes( {
							value: fromRichTextValue( nextValue ),
						} )
					}
					placeholder={ __( 'Write quote…' ) }
					wrapperClassName="blocks-pullquote__content"
					isSelected={ isSelected && editable === 'content' }
					onFocus={ onSetActiveEditable( 'content' ) }
				/>
				{ ( citation || isSelected ) && (
					<RichText
						tagName="cite"
						value={ citation }
						placeholder={ __( 'Write caption…' ) }
						onChange={
							( nextCitation ) => setAttributes( {
								citation: nextCitation,
							} )
						}
						isSelected={ isSelected && editable === 'cite' }
						onFocus={ onSetActiveEditable( 'cite' ) }
					/>
				) }
			</blockquote>
		);
	} ),

	save( { attributes } ) {
		const { value, citation } = attributes;

		return (
			<blockquote>
				{ value && value.map( ( paragraph, i ) =>
					<p key={ i }>{ paragraph.children && paragraph.children.props.children }</p>
				) }
				{ citation && citation.length > 0 && (
					<cite>{ citation }</cite>
				) }
			</blockquote>
		);
	},

	deprecated: [ {
		attributes: {
			...blockAttributes,
			align: {
				type: 'string',
				default: 'none',
			},
			citation: {
				type: 'array',
				source: 'children',
				selector: 'footer',
			},
		},

		save( { attributes } ) {
			const { value, citation, align } = attributes;

			return (
				<blockquote className={ `align${ align }` }>
					{ value && value.map( ( paragraph, i ) =>
						<p key={ i }>{ paragraph.children && paragraph.children.props.children }</p>
					) }
					{ citation && citation.length > 0 && (
						<footer>{ citation }</footer>
					) }
				</blockquote>
			);
		},
	} ],
};
