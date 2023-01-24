/**
 * Returns true if the the block interface should be hidden, or false otherwise.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether the block toolbar is hidden.
 */
export function __experimentalIsBlockInterfaceHidden( state ) {
	return state.isBlockInterfaceHidden;
}
