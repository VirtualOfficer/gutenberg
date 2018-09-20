/**
 * Internal dependencies
 */

import { create } from './create';

/**
 * Combine an array of Rich Text values into one, optionally separated by
 * `separator`, which can be a Rich Text value, HTML string, or plain text
 * string. This is similar to `Array.prototype.join`.
 *
 * @param {Array}         values    An array of values to join.
 * @param {string|Object} separator Separator string or value.
 *
 * @return {Object} A new combined value.
 */
export function join( values, separator = '' ) {
	if ( typeof separator === 'string' ) {
		separator = create( separator );
	}

	return values.reduce( ( accumlator, { formats, text } ) => {
		return {
			text: accumlator.text + separator.text + text,
			formats: accumlator.formats.concat( separator.formats, formats ),
		};
	} );
}
