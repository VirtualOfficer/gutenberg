/**
 * Internal dependencies
 */
import { registerBlock, query } from 'api';
import Editable from 'components/editable';

const { html, prop } = query;

registerBlock( 'core/heading', {
	title: wp.i18n.__( 'Heading' ),

	icon: 'heading',

	category: 'common',

	attributes: {
		content: html( 'h1,h2,h3,h4,h5,h6' ),
		tag: prop( 'h1,h2,h3,h4,h5,h6', 'nodeName' ),
		align: prop( 'h1,h2,h3,h4,h5,h6', 'style.textAlign' )
	},

	controls: [
		...'123456'.split( '' ).map( ( level ) => ( {
			icon: 'heading',
			title: wp.i18n.sprintf( wp.i18n.__( 'Heading %s' ), level ),
			isActive: ( { tag } ) => 'H' + level === tag,
			onClick( attributes, setAttributes ) {
				setAttributes( { tag: 'H' + level } );
			},
			level
		} ) )
	],

	edit( { attributes, setAttributes } ) {
		const { content, tag, align } = attributes;

		return (
			<Editable
				tagName={ tag }
				value={ content }
				onChange={ ( value ) => setAttributes( { content: value } ) }
				style={ align ? { textAlign: align } : null }
			/>
		);
	},

	save( { attributes } ) {
		const { align, tag: Tag, content } = attributes;

		return (
			<Tag
				style={ align ? { textAlign: align } : null }
				dangerouslySetInnerHTML={ { __html: content } } />
		);
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { content, align } ) => {
					if ( Array.isArray( content ) ) {
						// TODO this appears to always be true?
						// TODO reject the switch if more than one paragraph
						content = content[ 0 ];
					}
					return {
						tag: 'H2',
						content,
						align
					};
				}
			}
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { content, align } ) => {
					return {
						content: [ content ],
						align
					};
				}
			}
		]
	}
} );
