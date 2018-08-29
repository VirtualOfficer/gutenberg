/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/editor';

export const name = 'core/half-media-content-area';

const ALLOWED_BLOCKS = [ 'core/button', 'core/paragraph', 'core/heading', 'core/list' ];

export const settings = {
	attributes: {},

	title: __( 'Content Area' ),

	parent: [ 'core/half-media' ],

	icon: 'format-image',

	category: 'common',

	supports: {
		hoverMarks: false,
		selectionMarks: false,
		settingsMenu: false,
		inserter: false,
	},

	edit() {
		return (
			<div className="half-media__content">
				<InnerBlocks
					template={ [
						[ 'core/paragraph', { fontSize: 'large', placeholder: 'Content...' } ],
					] }
					allowedBlocks={ ALLOWED_BLOCKS }
					templateLock={ false }
				/>
			</div>
		);
	},

	save() {
		return <div className="half-media__content"><InnerBlocks.Content /></div>;
	},
};
