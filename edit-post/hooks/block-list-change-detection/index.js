/**
 * External dependencies
 */
import { cloneDeep, differenceBy, camelCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { doAction, addAction } from '@wordpress/hooks';
import { subscribe, select, dispatch } from '@wordpress/data';

console.log( select( 'core/editor' ) );

/**
 * A compare helper for lodash's difference by
 */
const compareBlocks = ( block ) => { return block.uid };

/**
 * A change listener for blocks
 *
 * The subscribe on the 'core/editor' getBlocks() function fires on any change,
 * not just additions/removals. Therefore we actually compare the array with a
 * previous state and look for changes in length or uid.
 */
const onBlocksChangeListener = ( selector, listener ) => {
	let previousBlocks = selector();
	return () => {
		const selectedBlocks = selector();

		// For performance reasons we first check the cheap length change,
		// before we actuallly do a deep object comparison
		if( selectedBlocks.length !== previousBlocks.length ) {
			// The block list length has changed, so there is obviously a change event happening
			listener( selectedBlocks, previousBlocks );
			previousBlocks = selectedBlocks;
		} else if ( differenceBy( selectedBlocks, previousBlocks, compareBlocks ).length ) {
			// A deep inspection has shown, that the list has changed
			listener( selectedBlocks, previousBlocks, differenceBy( selectedBlocks, previousBlocks, compareBlocks ) );
			previousBlocks = selectedBlocks;
		}
	}
}


/**
 * Subscribe to block data
 *
 * This function subscribes to block data, compares old and new states upon
 * change and fires actions accordingly.
 */
const blockListChangeListener = subscribe( onBlocksChangeListener( select( 'core/editor' ).getBlocks, ( blocks, oldBlocks, difference = null ) => {
	let addedBlocks = differenceBy( blocks, oldBlocks, compareBlocks );
	let deletedBlocks = differenceBy( oldBlocks, blocks, compareBlocks );

	// When the length is equal, but a change hapened, we have a transformation
	if ( oldBlocks.length == blocks.length && difference ) {

		// A block has been deleted
		for ( var i in deletedBlocks ) {
			const block = deletedBlocks[i];
			const actionName = 'blocks.transformed.from.' + camelCase( block.name );
			console.log(actionName);
			doAction(actionName, block);
		}

		// A block has been added
		for ( var i in addedBlocks ) {
			const block = addedBlocks[i];
			const actionName = 'blocks.transformed.to.' + camelCase( block.name );
			console.log(actionName);
			doAction(actionName, block);
		}
	}

	// A block has been added
	for ( var i in addedBlocks ) {
		const block = addedBlocks[i];
		const actionName = 'blocks.added.' + camelCase( block.name );
		console.log(actionName);
		doAction(actionName, block);
	}

	// A block has been deleted
	for ( var i in deletedBlocks ) {
		const block = deletedBlocks[i];
		const actionName = 'blocks.removed.' + camelCase( block.name );
			console.log(actionName);
		doAction(actionName, block);
	}
} ) );
