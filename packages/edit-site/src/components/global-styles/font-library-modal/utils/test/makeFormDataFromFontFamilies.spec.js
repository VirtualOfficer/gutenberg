/**
 * Internal dependencies
 */
import { makeFormDataFromFontFamily } from '../index';

/* global File */

describe( 'makeFormDataFromFontFamily', () => {
	it( 'should process fontFamilies and return FormData', () => {
		const mockFontFamily = {
			slug: 'bebas',
			name: 'Bebas',
			fontFamily: 'Bebas',
			fontFace: [
				{
					file: new File( [ 'content' ], 'test-font1.woff2' ),
					fontWeight: '500',
					fontStyle: 'normal',
				},
				{
					file: new File( [ 'content' ], 'test-font2.woff2' ),
					fontWeight: '400',
					fontStyle: 'normal',
				},
			],
		};

		const formData = makeFormDataFromFontFamily( mockFontFamily );

		expect( formData instanceof FormData ).toBeTruthy();

		// Check if files are added correctly
		expect( formData.get( 'file-0' ).name ).toBe( 'test-font1.woff2' );
		expect( formData.get( 'file-1' ).name ).toBe( 'test-font2.woff2' );

		// Check if 'fontFamilies' key in FormData is correct
		const expectedFontFaces = [
			{
				fontWeight: '500',
				fontStyle: 'normal',
				uploadedFile: 'file-0',
			},
			{
				fontWeight: '400',
				fontStyle: 'normal',
				uploadedFile: 'file-1',
			},
		];
		expect( formData.get( 'slug' ) ).toBe( 'bebas' );
		expect( formData.get( 'name' ) ).toBe( 'Bebas' );
		expect( formData.get( 'fontFamily' ) ).toBe( 'Bebas' );
		expect( JSON.parse( formData.get( 'fontFace' ) ) ).toEqual(
			expectedFontFaces
		);
	} );
} );
