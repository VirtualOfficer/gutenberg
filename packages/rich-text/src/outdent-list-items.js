/**
 * Internal dependencies
 */

import { LINE_SEPARATOR } from './special-characters';
import { normaliseFormats } from './normalise-formats';
import { getLineIndex } from './get-line-index';
import { getParentLineIndex } from './get-parent-line-index';
import { getLastChildIndex } from './get-last-child-index';

/**
 * Outdents any selected list items if possible.
 *
 * @param {Object} value Value to change.
 *
 * @return {Object} The changed value.
 */
export function outdentListItems( value ) {
	const { text, lineFormats, start, end } = value;
	const startingLineIndex = getLineIndex( value, start );

	// Return early if the starting line index cannot be further outdented.
	if ( lineFormats[ startingLineIndex ] === undefined ) {
		return value;
	}

	const newFormats = lineFormats.slice( 0 );
	const parentFormats = lineFormats[ getParentLineIndex( value, startingLineIndex ) ] || [];
	const endingLineIndex = getLineIndex( value, end );
	const lastChildIndex = getLastChildIndex( value, endingLineIndex );

	// Outdent all list items from the starting line index until the last child
	// index of the ending list. All children of the ending list need to be
	// outdented, otherwise they'll be orphaned.
	for ( let index = startingLineIndex; index <= lastChildIndex; index++ ) {
		// Skip indices that are not line separators.
		if ( text[ index ] !== LINE_SEPARATOR ) {
			continue;
		}

		// In the case of level 0, the formats at the index are undefined.
		const currentFormats = newFormats[ index ] || [];

		// Omit the indentation level where the selection starts.
		newFormats[ index ] = parentFormats.concat(
			currentFormats.slice( parentFormats.length + 1 )
		);

		if ( newFormats[ index ].length === 0 ) {
			delete newFormats[ index ];
		}
	}

	return normaliseFormats( {
		...value,
		lineFormats: newFormats,
	} );
}
