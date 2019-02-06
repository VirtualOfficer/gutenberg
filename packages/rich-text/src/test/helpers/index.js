export function getSparseArrayLength( array ) {
	return array.reduce( ( i ) => i + 1, 0 );
}

const em = { type: 'em' };
const strong = { type: 'strong' };
const img = { type: 'img', attributes: { src: '' }, object: true };
const a = { type: 'a', attributes: { href: '#' } };
const ul = { type: 'ul' };
const ol = { type: 'ol' };

export const spec = [
	{
		description: 'should create an empty value',
		html: '',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 0,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should replace characters to format HTML with space',
		html: '\n\n\r\n\t',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 1,
			formats: [ , ],
			text: ' ',
		},
	},
	{
		description: 'should preserve non breaking space',
		html: 'test\u00a0 test',
		createRange: ( element ) => ( {
			startOffset: 5,
			startContainer: element.firstChild,
			endOffset: 5,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 5,
			end: 5,
			formats: [ , , , , , , , , , , ],
			text: 'test\u00a0 test',
		},
	},
	{
		description: 'should create an empty value from empty tags',
		html: '<em></em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should create a value without formatting',
		html: 'test',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.firstChild,
			endOffset: 4,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 0,
			end: 4,
			formats: [ , , , , ],
			text: 'test',
		},
	},
	{
		description: 'should preserve emoji',
		html: '🍒',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 2,
			formats: [ , , ],
			text: '🍒',
		},
	},
	{
		description: 'should preserve emoji in formatting',
		html: '<em>🍒</em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 2,
			formats: [ [ em ], [ em ] ],
			text: '🍒',
		},
	},
	{
		description: 'should create a value with formatting',
		html: '<em>test</em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.firstChild,
			endOffset: 1,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 0,
			end: 4,
			formats: [ [ em ], [ em ], [ em ], [ em ] ],
			text: 'test',
		},
	},
	{
		description: 'should create a value with nested formatting',
		html: '<em><strong>test</strong></em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 4,
			formats: [ [ em, strong ], [ em, strong ], [ em, strong ], [ em, strong ] ],
			text: 'test',
		},
	},
	{
		description: 'should create a value with formatting for split tags',
		html: '<em>te</em><em>st</em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.querySelector( 'em' ),
			endOffset: 1,
			endContainer: element.querySelector( 'em' ),
		} ),
		record: {
			start: 0,
			end: 2,
			formats: [ [ em ], [ em ], [ em ], [ em ] ],
			text: 'test',
		},
	},
	{
		description: 'should create a value with formatting with attributes',
		html: '<a href="#">test</a>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 4,
			formats: [ [ a ], [ a ], [ a ], [ a ] ],
			text: 'test',
		},
	},
	{
		description: 'should create a value with image object',
		html: '<img src="">',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [ [ img ] ],
			text: '\ufffc',
		},
	},
	{
		description: 'should create a value with image object and formatting',
		html: '<em><img src=""></em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.querySelector( 'img' ),
			endOffset: 1,
			endContainer: element.querySelector( 'img' ),
		} ),
		record: {
			start: 0,
			end: 1,
			formats: [ [ em, img ] ],
			text: '\ufffc',
		},
	},
	{
		description: 'should create a value with image object and text before',
		html: 'te<em>st<img src=""></em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 2,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 5,
			formats: [ , , [ em ], [ em ], [ em, img ] ],
			text: 'test\ufffc',
		},
	},
	{
		description: 'should create a value with image object and text after',
		html: '<em><img src="">te</em>st',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 2,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 5,
			formats: [ [ em, img ], [ em ], [ em ], , , ],
			text: '\ufffctest',
		},
	},
	{
		description: 'should handle br',
		html: '<br>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [ , ],
			text: '\n',
		},
	},
	{
		description: 'should handle br with text',
		html: 'te<br>st',
		createRange: ( element ) => ( {
			startOffset: 1,
			startContainer: element,
			endOffset: 2,
			endContainer: element,
		} ),
		record: {
			start: 2,
			end: 3,
			formats: [ , , , , , ],
			text: 'te\nst',
		},
	},
	{
		description: 'should handle br with formatting',
		html: '<em><br></em>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 1,
			formats: [ [ em ] ],
			text: '\n',
		},
	},
	{
		description: 'should handle double br',
		html: 'a<br><br>b',
		createRange: ( element ) => ( {
			startOffset: 2,
			startContainer: element,
			endOffset: 3,
			endContainer: element,
		} ),
		record: {
			formats: [ , , , , ],
			text: 'a\n\nb',
			start: 2,
			end: 3,
		},
	},
	{
		description: 'should handle selection before br',
		html: 'a<br><br>b',
		createRange: ( element ) => ( {
			startOffset: 2,
			startContainer: element,
			endOffset: 2,
			endContainer: element,
		} ),
		record: {
			formats: [ , , , , ],
			text: 'a\n\nb',
			start: 2,
			end: 2,
		},
	},
	{
		description: 'should handle empty multiline value',
		multilineTag: 'p',
		html: '<p></p>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.firstChild,
			endOffset: 0,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should handle multiline value',
		multilineTag: 'p',
		html: '<p>one</p><p>two</p>',
		createRange: ( element ) => ( {
			startOffset: 1,
			startContainer: element.querySelector( 'p' ).firstChild,
			endOffset: 0,
			endContainer: element.lastChild,
		} ),
		record: {
			start: 1,
			end: 4,
			formats: [ , , , , , , , ],
			text: 'one\u2028two',
		},
	},
	{
		description: 'should handle multiline list value',
		multilineTag: 'li',
		multilineWrapperTags: [ 'ul', 'ol' ],
		html: '<li>one<ul><li>a</li><li>b<ol><li>1</li><li>2</li></ol></li></ul></li><li>three</li>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element.querySelector( 'ol > li' ).firstChild,
		} ),
		record: {
			start: 0,
			end: 9,
			formats: [ , , , [ ul ], , [ ul ], , [ ul, ol ], , [ ul, ol ], , , , , , , , ],
			text: 'one\u2028a\u2028b\u20281\u20282\u2028three',
		},
	},
	{
		description: 'should handle empty list value',
		multilineTag: 'li',
		multilineWrapperTags: [ 'ul', 'ol' ],
		html: '<li></li>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.firstChild,
			endOffset: 0,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should handle nested empty list value',
		multilineTag: 'li',
		multilineWrapperTags: [ 'ul', 'ol' ],
		html: '<li><ul><li></li></ul></li>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.querySelector( 'ul > li' ),
			endOffset: 0,
			endContainer: element.querySelector( 'ul > li' ),
		} ),
		record: {
			start: 1,
			end: 1,
			formats: [ [ ul ] ],
			text: '\u2028',
		},
	},
	{
		description: 'should handle middle empty list value',
		multilineTag: 'li',
		multilineWrapperTags: [ 'ul', 'ol' ],
		html: '<li></li><li></li><li></li>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.firstChild.nextSibling,
			endOffset: 0,
			endContainer: element.firstChild.nextSibling,
		} ),
		record: {
			start: 1,
			end: 1,
			formats: [ , , ],
			text: '\u2028\u2028',
		},
	},
	{
		description: 'should handle multiline value with empty',
		multilineTag: 'p',
		html: '<p>one</p><p></p>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element.lastChild,
			endOffset: 0,
			endContainer: element.lastChild,
		} ),
		record: {
			start: 4,
			end: 4,
			formats: [ , , , , ],
			text: 'one\u2028',
		},
	},
	{
		description: 'should handle multiline value with element selection',
		multilineTag: 'li',
		multilineWrapperTags: [ 'ul', 'ol' ],
		html: '<li>one</li>',
		createRange: ( element ) => ( {
			startOffset: 1,
			startContainer: element.firstChild,
			endOffset: 1,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 3,
			end: 3,
			formats: [ , , , ],
			text: 'one',
		},
	},
	{
		description: 'should ignore formats at line separator',
		multilineTag: 'p',
		record: {
			formats: [ [ em ], [ em ], [ em ], [ em ], [ em ], [ em ], [ em ] ],
			text: 'one\u2028two',
		},
	},
	{
		description: 'should remove br with settings',
		html: '<br data-rich-text-padding="true">',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should filter format boundary attributes',
		html: '<strong data-rich-text-format-boundary="true">test</strong>',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 4,
			formats: [ [ strong ], [ strong ], [ strong ], [ strong ] ],
			text: 'test',
		},
	},
	{
		description: 'should filter zero width space',
		html: '&#65279;',
		createRange: ( element ) => ( {
			startOffset: 0,
			startContainer: element,
			endOffset: 1,
			endContainer: element,
		} ),
		record: {
			start: 0,
			end: 0,
			formats: [],
			text: '',
		},
	},
	{
		description: 'should filter zero width space at end',
		html: 'test&#65279;',
		createRange: ( element ) => ( {
			startOffset: 4,
			startContainer: element.firstChild,
			endOffset: 4,
			endContainer: element.firstChild,
		} ),
		record: {
			start: 4,
			end: 4,
			formats: [ , , , , ],
			text: 'test',
		},
	},
	{
		description: 'should filter zero width space in format',
		html: '<em>test&#65279;</em>',
		createRange: ( element ) => ( {
			startOffset: 5,
			startContainer: element.querySelector( 'em' ).firstChild,
			endOffset: 5,
			endContainer: element.querySelector( 'em' ).firstChild,
		} ),
		record: {
			start: 4,
			end: 4,
			formats: [ [ em ], [ em ], [ em ], [ em ] ],
			text: 'test',
		},
	},
	{
		description: 'should filter zero width space outside format',
		html: '<em>test</em>&#65279;',
		createRange: ( element ) => ( {
			startOffset: 1,
			startContainer: element.lastChild,
			endOffset: 1,
			endContainer: element.lastChild,
		} ),
		record: {
			start: 4,
			end: 4,
			formats: [ [ em ], [ em ], [ em ], [ em ] ],
			text: 'test',
		},
	},
];

export const specWithRegistration = [
	{
		description: 'should create format by matching the class',
		formatName: 'my-plugin/link',
		formatType: {
			title: 'Custom Link',
			tagName: 'a',
			className: 'custom-format',
			edit() {},
		},
		html: '<a class="custom-format">a</a>',
		value: {
			formats: [ [ {
				type: 'my-plugin/link',
				attributes: {},
				unregisteredAttributes: {},
			} ] ],
			text: 'a',
		},
	},
	{
		description: 'should retain class names',
		formatName: 'my-plugin/link',
		formatType: {
			title: 'Custom Link',
			tagName: 'a',
			className: 'custom-format',
			edit() {},
		},
		html: '<a class="custom-format test">a</a>',
		value: {
			formats: [ [ {
				type: 'my-plugin/link',
				attributes: {},
				unregisteredAttributes: {
					class: 'test',
				},
			} ] ],
			text: 'a',
		},
	},
	{
		description: 'should create base format',
		formatName: 'core/link',
		formatType: {
			title: 'Link',
			tagName: 'a',
			className: null,
			edit() {},
		},
		html: '<a class="custom-format">a</a>',
		value: {
			formats: [ [ {
				type: 'core/link',
				attributes: {},
				unregisteredAttributes: {
					class: 'custom-format',
				},
			} ] ],
			text: 'a',
		},
	},
	{
		description: 'should create fallback format',
		html: '<a class="custom-format">a</a>',
		value: {
			formats: [ [ {
				type: 'a',
				attributes: {
					class: 'custom-format',
				},
			} ] ],
			text: 'a',
		},
	},
];
