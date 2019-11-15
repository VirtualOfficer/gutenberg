/**
 * External dependencies
 */
import { createElement, Fragment } from 'react';

let indoc,
	offset,
	output,
	stack;

/**
 * Matches tags in the localized string
 *
 * This is used for extracting the tag pattern groups for parsing the localized
 * string and along with the map converting it to a react element.
 *
 * There are four references extracted using this tokenizer:
 *
 * match: Full match of the tag (i.e. <strong>, </strong>, <br/>)
 * isClosing: The closing slash, it it exists.
 * name: The name portion of the tag (strong, br) (if )
 * isSelfClosed: The slash on a self closing tag, if it exists.
 *
 * @type RegExp
 */
const tokenizer = /<(\/)?(\w+)\s*(\/)?>/g;

/**
 * This receives the value for a map element which consists of an element and
 * it's props and returns a element creator function.
 *
 * @private
 * @param {string} name	              The name of the element (which becomes the
 *                                    key).
 * @param {Array}  [ element, props ] The first item in the array is expected to
 *                                    be a string or a react component. The
 *                                    second item is expected to be either
 *                                    undefined or an object.
 */
const elementCreator = ( name, [ element, props = {} ] ) => ( children ) => {
	if ( typeof element !== 'string' && typeof element !== 'function' ) {
		throw new Error( `Not a valid element (${ element })` );
	}
	props.key = name;
	return createElement( element, props, children );
};

/**
 * An object describing a component to be created.
 *
 * This is used by the string iterator to track children that get added to an
 * element when it is created. This allows for collecting nested elements in
 * the string before creating the parent.
 *
 * @private
 * @param   {Function}  creator An element creator that will be invoked for
 *                              actually creating the react element with the
 *                              provided children.
 * @param   {Array}  children   Array of children to be provided to the element
 *                              creator when invoked.
 *
 * @return  {Component}         An object returning the creator and children.
 */
function Component( creator, children = [] ) {
	return {
		creator,
		children,
	};
}

/**
 * Tracks recursive-descent parse state.
 *
 * This is a Stack element holding parent elements until all children have been
 * parsed.
 *
 * @private
 * @param {Component} component        A parent element which may still have
 *                                     nested children not yet parsed.
 * @param {number}    tokenStart       Offset at which parent element first
 *                                     appears.
 * @param {number}    tokenLength      Length of string marking start of parent
 *                                     element.
 * @param {number}    prevOffset       Running offset at which parsing should
 *                                     continue.
 * @param {number}    leadingTextStart Offset at which last closing element
 *                                     finished, used for finding text between
 *                                     elements
 *
 * @return {Frame} The stack frame tracking parse progress.
 */
function Frame(
	component,
	tokenStart,
	tokenLength,
	prevOffset,
	leadingTextStart
) {
	return {
		component,
		tokenStart,
		tokenLength,
		prevOffset: prevOffset || tokenStart + tokenLength,
		leadingTextStart,
	};
}

/**
 * This function creates an interpolated element from a passed in string with
 * specific tags matching how the string should be converted to an element via
 * the conversion map value.
 *
 * @example
 * For example, for the given string:
 *
 * "This is a <span>string</span> with <a>a link</a> and a self-closing
 * <CustomComponentB/> tag"
 *
 * You would have something like this as the conversionMap value:
 *
 * ```js
 * {
 *     span: ['span'],
 *     a: ['a', { href: 'https://github.com' }],
 *     CustomComponentB: [ CustomComponentB ],
 * }
 * ```
 *
 * @param {string}  interpolatedString  The interpolation string to be parsed.
 * @param {Object}  conversionMap       The map used to convert the string to
 *                                      a react element.
 *
 * @return {Element}  A react element.
 */
const createInterpolateElement = ( interpolatedString, conversionMap ) => {
	indoc = interpolatedString;
	offset = 0;
	output = [];
	stack = [];
	tokenizer.lastIndex = 0;

	if ( ! isValidConversionMap( conversionMap ) ) {
		return interpolatedString;
	}

	do {
		// twiddle our thumbs
	} while ( proceed( conversionMap ) );

	output = output.every( ( a ) => 'string' === typeof a ) ?
		output.join( '' ) :
		output.filter( ( a ) => '' !== a );
	return typeof output === 'string' ?
		output :
		createElement( Fragment, {}, output );
};

/**
 * Validate conversion map.
 *
 * A map is considered valid if it's an object and does not have length.
 *
 * @private
 * @param {Object} conversionMap  The map being validated.
 *
 * @return {boolean}  True means the map is valid.
 */
const isValidConversionMap = ( conversionMap ) => {
	return typeof conversionMap === 'object' &&
		typeof conversionMap.length === 'undefined';
};

/**
 * This is the iterator over the matches in the string.
 *
 * @private
 * @param {Object} conversionMap The conversion map for the string.
 *
 * @return {boolean} true for continuing to iterate, false for finished.
 */
function proceed( conversionMap ) {
	const next = nextToken();
	const [ tokenType, name, startOffset, tokenLength ] = next;
	const stackDepth = stack.length;
	const leadingTextStart = startOffset > offset ? offset : null;
	if ( ! conversionMap[ name ] ) {
		if ( stackDepth !== 0 ) {
			const { stackLeadingText, tokenStart } = stack.pop();
			output.push( indoc.substr( stackLeadingText, tokenStart ) );
		}
		addText();
		return false;
	}
	switch ( tokenType ) {
		case 'no-more-tokens':
			if ( stackDepth !== 0 ) {
				const { stackLeadingText, tokenStart } = stack.pop();
				output.push( indoc.substr( stackLeadingText, tokenStart ) );
			}
			addText();
			return false;

		case 'self-closed':
			if ( 0 === stackDepth ) {
				if ( null !== leadingTextStart ) {
					output.push(
						indoc.substr( leadingTextStart, startOffset - leadingTextStart )
					);
				}
				output.push( elementCreator( name, conversionMap[ name ] )() );
				offset = startOffset + tokenLength;
				return true;
			}

			// otherwise we found an inner element
			addChild(
				new Component( elementCreator( name, conversionMap[ name ] ), [] ),
				startOffset,
				tokenLength
			);
			offset = startOffset + tokenLength;
			return true;

		case 'opener':
			stack.push(
				Frame(
					new Component( elementCreator( name, conversionMap[ name ] ), [] ),
					startOffset,
					tokenLength,
					startOffset + tokenLength,
					leadingTextStart
				)
			);
			offset = startOffset + tokenLength;
			return true;

		case 'closer':
			// if we're not nesting then this is easy - close the block
			if ( 1 === stackDepth ) {
				addComponentFromStack( startOffset );
				offset = startOffset + tokenLength;
				return true;
			}

			// otherwise we're nested and we have to close out the current
			// block and add it as a innerBlock to the parent
			const stackTop = stack.pop();
			const text = indoc.substr(
				stackTop.prevOffset,
				startOffset - stackTop.prevOffset
			);
			stackTop.component.children.push( text );
			stackTop.prevOffset = startOffset + tokenLength;

			addChild(
				stackTop.component,
				stackTop.tokenStart,
				stackTop.tokenLength,
				startOffset + tokenLength
			);
			offset = startOffset + tokenLength;
			return true;

		default:
			addText();
			return false;
	}
}

/**
 * Grabs the next token match in the string and returns it's details.
 *
 * @private
 *
 * @return  {Array}  An array of details for the token matched.
 */
function nextToken() {
	const matches = tokenizer.exec( indoc );
	// we have no more tokens
	if ( null === matches ) {
		return [ 'no-more-tokens' ];
	}
	const startedAt = matches.index;
	const [ match, isClosing, name, isSelfClosed ] = matches;
	const length = match.length;
	if ( isSelfClosed ) {
		return [ 'self-closed', name, startedAt, length ];
	}
	if ( isClosing ) {
		return [ 'closer', name, startedAt, length ];
	}
	return [ 'opener', name, startedAt, length ];
}

/**
 * Pushes text extracted from the indoc string to the output stack given the
 * current rawLength value and offset (if rawLength is provided ) or the
 * indoc.length and offset.
 *
 * @param   {number}  rawLength  If provided will be used as the length of chars
 *                               to extract.
 */
function addText( rawLength ) {
	const length = rawLength ? rawLength : indoc.length - offset;
	if ( 0 === length ) {
		return output.push( '' );
	}
	output.push( indoc.substr( offset, length ) );
}

function addChild( component, tokenStart, tokenLength, lastOffset ) {
	const parent = stack[ stack.length - 1 ];
	const text = indoc.substr( parent.prevOffset, tokenStart - parent.prevOffset );

	if ( text ) {
		parent.component.children.push( text );
	}

	parent.component.children.push( component.creator( component.children ) );
	parent.prevOffset = lastOffset ? lastOffset : tokenStart + tokenLength;
}

function addComponentFromStack( endOffset ) {
	const { component, leadingTextStart, prevOffset, tokenStart } = stack.pop();

	const text = endOffset ?
		indoc.substr( prevOffset, endOffset - prevOffset ) :
		indoc.substr( prevOffset );

	if ( text ) {
		component.children.push( text );
	}

	if ( null !== leadingTextStart ) {
		output.push( indoc.substr( leadingTextStart, tokenStart - leadingTextStart ) );
	}

	output.push( component.creator( component.children ) );
}

export default createInterpolateElement;
