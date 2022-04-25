/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes: { tagName: Tag } } ) {
	return (
		<Tag { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</Tag>
	);
}
