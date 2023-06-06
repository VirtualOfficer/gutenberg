/**
 * Internal dependencies
 */
import isURLLike from '../is-url-like';

describe( 'isURLLike', () => {
	it.each( [ 'https://wordpress.org', 'http://wordpress.org' ] )(
		'returns true for a string that starts with an http(s) protocol',
		( testString ) => {
			expect( isURLLike( testString ) ).toBe( true );
		}
	);

	it.each( [
		'hello world',
		'https://   has spaces even though starts with protocol',
		'www. wordpress . org',
	] )(
		'returns false for any string with spaces (e.g. "%s")',
		( testString ) => {
			expect( isURLLike( testString ) ).toBe( false );
		}
	);

	it( 'returns false for a string without a protocol or a TLD', () => {
		expect( isURLLike( 'somedirectentryhere' ) ).toBe( false );
	} );

	it( 'returns true for a string beginning with www.', () => {
		expect( isURLLike( 'www.wordpress.org' ) ).toBe( true );
	} );

	it.each( [ 'mailto:test@wordpress.org', 'tel:123456' ] )(
		'returns true for common protocols',
		( testString ) => {
			expect( isURLLike( testString ) ).toBe( true );
		}
	);

	it( 'returns true for internal anchor ("hash") links.', () => {
		expect( isURLLike( '#someinternallink' ) ).toBe( true );
	} );
} );
