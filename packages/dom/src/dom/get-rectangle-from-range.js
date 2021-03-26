/**
 * Internal dependencies
 */
import { assertIsDefined } from '../utils/assert-is-defined';

/**
 * Get the rectangle of a given Range.
 *
 * @param {Range} range The range.
 *
 * @return {DOMRect} The rectangle.
 */
export default function getRectangleFromRange( range ) {
	// For uncollapsed ranges, get the rectangle that bounds the contents of the
	// range; this a rectangle enclosing the union of the bounding rectangles
	// for all the elements in the range.
	if ( ! range.collapsed ) {
		return range.getBoundingClientRect();
	}

	const { startContainer } = range;
	const { ownerDocument } = startContainer;

	// Correct invalid "BR" ranges. The cannot contain any children.
	if ( startContainer.nodeName === 'BR' ) {
		const { parentNode } = startContainer;
		assertIsDefined( parentNode );
		const index = /** @type {Node[]} */ ( Array.from(
			parentNode.childNodes
		) ).indexOf( startContainer );

		assertIsDefined( ownerDocument );
		range = ownerDocument.createRange();
		range.setStart( parentNode, index );
		range.setEnd( parentNode, index );
	}

	let rect = range.getClientRects()[ 0 ];

	// If the collapsed range starts (and therefore ends) at an element node,
	// `getClientRects` can be empty in some browsers. This can be resolved
	// by adding a temporary text node with zero-width space to the range.
	//
	// See: https://stackoverflow.com/a/6847328/995445
	if ( ! rect ) {
		assertIsDefined( ownerDocument );
		const padNode = ownerDocument.createTextNode( '\u200b' );
		assertIsDefined( padNode.parentNode );
		// Do not modify the live range.
		range = range.cloneRange();
		range.insertNode( padNode );
		rect = range.getClientRects()[ 0 ];
		padNode.parentNode.removeChild( padNode );
	}

	return rect;
}
