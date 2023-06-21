/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { blockTypePromptMessages } from '../utils/block-removal';

const castArray = ( maybeArray ) =>
	Array.isArray( maybeArray ) ? maybeArray : [ maybeArray ];

/**
 * A list of private/experimental block editor settings that
 * should not become a part of the WordPress public API.
 * BlockEditorProvider will remove these settings from the
 * settings object it receives.
 *
 * @see https://github.com/WordPress/gutenberg/pull/46131
 */
const privateSettings = [
	'inserterMediaCategories',
	'blockInspectorAnimation',
];

/**
 * Action that updates the block editor settings and
 * conditionally preserves the experimental ones.
 *
 * @param {Object}  settings                  Updated settings
 * @param {boolean} stripExperimentalSettings Whether to strip experimental settings.
 * @return {Object} Action object
 */
export function __experimentalUpdateSettings(
	settings,
	stripExperimentalSettings = false
) {
	let cleanSettings = settings;
	// There are no plugins in the mobile apps, so there is no
	// need to strip the experimental settings:
	if ( stripExperimentalSettings && Platform.OS === 'web' ) {
		cleanSettings = {};
		for ( const key in settings ) {
			if ( ! privateSettings.includes( key ) ) {
				cleanSettings[ key ] = settings[ key ];
			}
		}
	}
	return {
		type: 'UPDATE_SETTINGS',
		settings: cleanSettings,
	};
}

/**
 * Hides the block interface (eg. toolbar, outline, etc.)
 *
 * @return {Object} Action object.
 */
export function hideBlockInterface() {
	return {
		type: 'HIDE_BLOCK_INTERFACE',
	};
}

/**
 * Shows the block interface (eg. toolbar, outline, etc.)
 *
 * @return {Object} Action object.
 */
export function showBlockInterface() {
	return {
		type: 'SHOW_BLOCK_INTERFACE',
	};
}

/**
 * @typedef {import('../components/block-editing-mode').BlockEditingMode} BlockEditingMode
 */

/**
 * Sets the block editing mode for a given block.
 *
 * @see useBlockEditingMode
 *
 * @param {string}           clientId The block client ID, or `''` for the root container.
 * @param {BlockEditingMode} mode     The block editing mode. One of `'disabled'`,
 *                                    `'contentOnly'`, or `'default'`.
 *
 * @return {Object} Action object.
 */
export function setBlockEditingMode( clientId = '', mode ) {
	return {
		type: 'SET_BLOCK_EDITING_MODE',
		clientId,
		mode,
	};
}

/**
 * Clears the block editing mode for a given block.
 *
 * @see useBlockEditingMode
 *
 * @param {string} clientId The block client ID, or `''` for the root container.
 *
 * @return {Object} Action object.
 */
export function unsetBlockEditingMode( clientId = '' ) {
	return {
		type: 'UNSET_BLOCK_EDITING_MODE',
		clientId,
	};
}

/**
 * Yields action objects used in signalling that the blocks corresponding to
 * the set of specified client IDs are to be removed.
 *
 * @param {string|string[]} clientIds      Client IDs of blocks to remove.
 * @param {boolean}         selectPrevious True if the previous block
 *                                         or the immediate parent
 *                                         (if no previous block exists)
 *                                         should be selected
 *                                         when a block is removed.
 * @param {boolean}         forceRemove    Whether to force the operation,
 *                                         bypassing any checks for certain
 *                                         block types.
 */
export const privateRemoveBlocks =
	( clientIds, selectPrevious = true, forceRemove = false ) =>
	( { select, dispatch } ) => {
		if ( ! clientIds || ! clientIds.length ) {
			return;
		}

		clientIds = castArray( clientIds );
		const rootClientId = select.getBlockRootClientId( clientIds[ 0 ] );
		const canRemoveBlocks = select.canRemoveBlocks(
			clientIds,
			rootClientId
		);

		if ( ! canRemoveBlocks ) {
			return;
		}

		// In certain editing contexts, we'd like to prevent accidental removal
		// of important blocks. For example, in the site editor, the Query Loop
		// block is deemed important. In such cases, we'll ask the user for
		// confirmation that they intended to remove such block(s). However,
		// the editor instance is responsible for presenting those confirmation
		// prompts to the user. Any instance opting into removal prompts must
		// enable `removalPromptExists()`.
		//
		// @see https://github.com/WordPress/gutenberg/pull/51145
		if ( ! forceRemove && select.removalPromptExists() ) {
			const blocksForPrompt = new Set();

			// Given a list of client IDs of blocks that the user intended to
			// remove, perform a tree search (BFS) to find all block names
			// corresponding to "important" blocks, i.e. blocks that require a
			// removal prompt.
			//
			// @see blockTypePromptMessages in ../utils/block-removal
			const queue = [ ...clientIds ];
			while ( queue.length ) {
				const clientId = queue.shift();
				const blockName = select.getBlockName( clientId );
				if ( blockTypePromptMessages[ blockName ] ) {
					blocksForPrompt.add( blockName );
				}
				const innerBlocks = select.getBlockOrder( clientId );
				queue.push( ...innerBlocks );
			}

			// If any such blocks were found, trigger the removal prompt and
			// skip any other steps (thus postponing actual removal).
			if ( blocksForPrompt.size ) {
				dispatch.displayRemovalPrompt( true, {
					removalFunction() {
						dispatch(
							privateRemoveBlocks(
								clientIds,
								selectPrevious,
								/* force */ true
							)
						);
					},
					blocksToPromptFor: Array.from( blocksForPrompt ),
				} );
				return;
			}
		}

		if ( selectPrevious ) {
			dispatch.selectPreviousBlock( clientIds[ 0 ], selectPrevious );
		}

		dispatch( { type: 'REMOVE_BLOCKS', clientIds } );

		// To avoid a focus loss when removing the last block, assure there is
		// always a default block if the last of the blocks have been removed.
		dispatch( ensureDefaultBlock() );
	};

/**
 * Action which will insert a default block insert action if there
 * are no other blocks at the root of the editor. This action should be used
 * in actions which may result in no blocks remaining in the editor (removal,
 * replacement, etc).
 */
export const ensureDefaultBlock =
	() =>
	( { select, dispatch } ) => {
		// To avoid a focus loss when removing the last block, assure there is
		// always a default block if the last of the blocks have been removed.
		const count = select.getBlockCount();
		if ( count > 0 ) {
			return;
		}

		// If there's an custom appender, don't insert default block.
		// We have to remember to manually move the focus elsewhere to
		// prevent it from being lost though.
		const { __unstableHasCustomAppender } = select.getSettings();
		if ( __unstableHasCustomAppender ) {
			return;
		}

		dispatch.insertDefaultBlock();
	};
