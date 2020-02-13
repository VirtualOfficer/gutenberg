/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

function GroupEdit( { attributes, className, clientId } ) {
	const hasInnerBlocks = useSelect(
		( select ) => {
			const { getBlock } = select( 'core/block-editor' );
			const block = getBlock( clientId );
			return !! ( block && block.innerBlocks.length );
		},
		[ clientId ]
	);
	const Tag = Block[ attributes.tagName ];

	return (
		<Tag className={ className }>
			<div className="wp-block-group__inner-container">
				<InnerBlocks
					renderAppender={
						hasInnerBlocks
							? undefined
							: () => <InnerBlocks.ButtonBlockAppender />
					}
				/>
			</div>
		</Tag>
	);
}

export default GroupEdit;
