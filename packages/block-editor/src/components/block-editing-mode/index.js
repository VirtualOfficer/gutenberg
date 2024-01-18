/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { PrivateBlockContext } from '../block-list/private-block-context';

/**
 * @typedef {'disabled'|'contentOnly'|'default'} BlockEditingMode
 */

/**
 * Allows a block to restrict the user interface that is displayed for editing
 * that block and its inner blocks.
 *
 * @example
 * ```js
 * function MyBlock( { attributes, setAttributes } ) {
 *     useBlockEditingMode( 'disabled' );
 *     return <div { ...useBlockProps() }></div>;
 * }
 * ```
 *
 * `mode` can be one of three options:
 *
 * - `'disabled'`: Prevents editing the block entirely, i.e. it cannot be
 *   selected.
 * - `'contentOnly'`: Hides all non-content UI, e.g. auxiliary controls in the
 *   toolbar, the block movers, block settings.
 * - `'default'`: Allows editing the block as normal.
 *
 * The mode is inherited by all of the block's inner blocks, unless they have
 * their own mode.
 *
 * If called outside of a block context, the mode is applied to all blocks.
 *
 * @param {?BlockEditingMode} mode The editing mode to apply. If undefined, the
 *                                 current editing mode is not changed.
 *
 * @return {BlockEditingMode} The current editing mode.
 */
export function useBlockEditingMode( mode ) {
	const { clientId = '', blockEditingMode } =
		useContext( PrivateBlockContext );
	const { setBlockEditingMode, unsetBlockEditingMode } =
		useDispatch( blockEditorStore );
	useEffect( () => {
		if ( mode ) {
			setBlockEditingMode( clientId, mode );
		}
		return () => {
			if ( mode ) {
				unsetBlockEditingMode( clientId );
			}
		};
	}, [ clientId, mode, setBlockEditingMode, unsetBlockEditingMode ] );
	return blockEditingMode;
}
