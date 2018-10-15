/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect, withDispatch } from '@wordpress/data';
import { MenuItem, MenuGroup } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';

function BlockHierarchyList( { blocks, selectedBlockClientId, selectBlock } ) {
	return (
		<ul className="editor-block-hierarchy__list">
			{ map( blocks, ( block ) => {
				const blockType = getBlockType( block.name );
				return (
					<li key={ block.clientId }>
						<MenuItem
							className="editor-block-hierarchy__item"
							onClick={ () => selectBlock( block.clientId ) }
						>
							<BlockIcon icon={ blockType.icon } showColors />
							{ block.name }
						</MenuItem>
						{ !! block.innerBlocks && !! block.innerBlocks.length && (
							<BlockHierarchyList
								blocks={ block.innerBlocks }
								selectedBlockClientId={ selectedBlockClientId }
								selectBlock={ selectBlock }
							/>
						) }
					</li>
				);
			} ) }
		</ul>
	);
}

function BlockHierarchy( { rootBlock, selectedBlockClientId, selectBlock } ) {
	if ( ! rootBlock ) {
		return null;
	}
	return (
		<MenuGroup>
			<BlockHierarchyList
				blocks={ [ rootBlock ] }
				selectedBlockClientId={ selectedBlockClientId }
				selectBlock={ selectBlock }
			/>
		</MenuGroup>
	);
}

export default compose(
	withSelect( ( select ) => {
		const {
			getSelectedBlockClientId,
			getBlockHierarchyRootClientId,
			getBlock,
		} = select( 'core/editor' );
		const selectedBlockClientId = getSelectedBlockClientId();
		return {
			rootBlock: selectedBlockClientId ? getBlock( getBlockHierarchyRootClientId( selectedBlockClientId ) ) : null,
			selectedBlockClientId,
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			selectBlock: dispatch( 'core/editor' ).selectBlock,
		};
	} )
)( BlockHierarchy );
