/**
 * Internal dependencies
 */
import filter from '../html-formatting-remover';
import { deepFilterHTML } from '../utils';

describe( 'HTMLFormattingRemover', () => {
	it( 'should remove formatting space', () => {
		const input = `
			<div>
				a
				b
			</div>
		`;
		const output = '<div>a b</div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should remove nested formatting space', () => {
		const input = `
			<div>
				<strong>
					a
					b
				</strong>
			</div>
		`;
		const output = '<div><strong>a b</strong></div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should not remove leading or trailing space if previous or next element has no space', () => {
		const input = `
			<div>
				a
				<strong>b</strong>
				c
			</div>
		`;
		const output = '<div>a <strong>b</strong> c</div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should remove formatting space (empty)', () => {
		const input = `
			<div>
			</div>
		`;
		const output = '<div></div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should remove block level formatting space', () => {
		const input = `
			<div>
				<div>
					a
				</div>
				<div>
					b
				</div>
			</div>
		`;
		const output = '<div><div>a</div><div>b</div></div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should remove formatting space around br', () => {
		const input = `
			<div>
				a
				<br>
				b
			</div>
		`;
		const output = '<div>a<br>b</div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should remove formatting space around phasing content elements', () => {
		const input = `
			<div>
				<strong>
					a
				</strong>
				<strong>
					b
				</strong>
			</div>
		`;
		const output = '<div><strong>a</strong><strong> b</strong></div>';
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( output );
	} );

	it( 'should ignore pre', () => {
		const input = `<pre> a\n b\n</pre>`;
		expect( deepFilterHTML( input, [ filter ] ) ).toEqual( input );
	} );
} );
