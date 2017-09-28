/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './block.scss';
import { registerBlockType, createBlock } from '../../api';
import InspectorControls from '../../inspector-controls';
import BlockDescription from '../../block-description';

registerBlockType( 'core/separator', {
	title: __( 'Separator' ),

	icon: 'minus',

	category: 'layout',

	transforms: {
		from: [
			{
				type: 'pattern',
				trigger: 'enter',
				regExp: /^-{3,}$/,
				transform: () => createBlock( 'core/separator' ),
			},
		],
	},

	edit( { className, focus } ) {
		return [
			focus && (
				<InspectorControls key="inspector">
					<BlockDescription>
						<p>{ __( 'The separator represents a paragraph-level thematic break, e.g. a scene change in a story, or a transition to another topic within an article.' ) }</p>
					</BlockDescription>
				</InspectorControls>
			),
			<hr key="hr" className={ className } />,
		];
	},

	save() {
		return <hr />;
	},
} );
