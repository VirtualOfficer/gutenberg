/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Font Library', () => {
	test.describe( 'When a blank theme is active', () => {
		test.beforeAll( async ( { requestUtils } ) => {
			await requestUtils.activateTheme( 'emptytheme' );
		} );

		test.beforeEach( async ( { admin, editor } ) => {
			await admin.visitSiteEditor();
			await editor.canvas.locator( 'body' ).click();
		} );

		test( 'should display the "Manage Fonts" icon', async ( { page } ) => {
			await page.getByRole( 'button', { name: 'Styles' } ).click();
			await page
				.getByRole( 'button', { name: 'Typography Styles' } )
				.click();
			const manageFontsIcon = page.getByRole( 'button', {
				name: 'Manage Fonts',
			} );
			await expect( manageFontsIcon ).toBeVisible();
		} );

		test( 'should allow user to upload a local font', async ( {
			page,
		} ) => {
			await page.getByRole( 'button', { name: 'Styles' } ).click();
			await page
				.getByRole( 'button', { name: 'Typography Styles' } )
				.click();
			await page
				.getByRole( 'button', {
					name: 'Manage Fonts',
				} )
				.click();

			// Delete test font (Exo 2) if it exists
			if (
				await page
					.getByRole( 'button', { name: 'Exo 2' } )
					.isVisible( { timeout: 40000 } )
			) {
				await page.getByRole( 'button', { name: 'Exo 2' } ).click();
				await page.getByRole( 'button', { name: 'Delete' } ).click();
				await page.getByRole( 'button', { name: 'Delete' } ).click();
			}

			// Upload a local font
			await page
				.getByRole( 'tab', { name: 'Upload' } )
				.click( { timeout: 40000 } );
			const fileChooserPromise = page.waitForEvent( 'filechooser' );
			await page.getByRole( 'button', { name: 'Upload Font' } ).click();
			const fileChooser = await fileChooserPromise;
			await fileChooser.setFiles( './test/e2e/assets/Exo2-Regular.woff' );

			// Check font was installed
			await expect(
				page
					.getByLabel( 'Upload' )
					.getByText( 'Fonts were installed successfully.' )
			).toBeVisible( { timeout: 40000 } );
			await page.getByRole( 'tab', { name: 'Library' } ).click();
			await expect(
				page.getByRole( 'button', { name: 'Exo 2' } )
			).toBeVisible();
		} );
	} );

	test.describe( 'When a theme with bundled fonts is active', () => {
		test.beforeAll( async ( { requestUtils } ) => {
			await requestUtils.activateTheme( 'twentytwentythree' );
		} );

		test.beforeEach( async ( { admin, editor } ) => {
			await admin.visitSiteEditor();
			await editor.canvas.locator( 'body' ).click();
		} );

		test( 'should display the "Manage Fonts" icon', async ( { page } ) => {
			await page.getByRole( 'button', { name: 'Styles' } ).click();
			await page
				.getByRole( 'button', { name: 'Typography Styles' } )
				.click();
			const manageFontsIcon = page.getByRole( 'button', {
				name: 'Manage Fonts',
			} );
			await expect( manageFontsIcon ).toBeVisible();
		} );

		test( 'should open the "Manage Fonts" modal when clicking the "Manage Fonts" icon', async ( {
			page,
		} ) => {
			await page.getByRole( 'button', { name: 'Styles' } ).click();
			await page
				.getByRole( 'button', { name: 'Typography Styles' } )
				.click();
			await page
				.getByRole( 'button', {
					name: 'Manage Fonts',
				} )
				.click();
			await expect( page.getByRole( 'dialog' ) ).toBeVisible();
			await expect(
				page.getByRole( 'heading', { name: 'Fonts' } )
			).toBeVisible();
		} );

		test( 'should show font variant panel when clicking on a font family', async ( {
			page,
		} ) => {
			await page.getByRole( 'button', { name: 'Styles' } ).click();
			await page
				.getByRole( 'button', { name: 'Typography Styles' } )
				.click();
			await page
				.getByRole( 'button', {
					name: 'Manage Fonts',
				} )
				.click();
			await page.getByRole( 'button', { name: 'System Font' } ).click();
			await expect(
				page.getByRole( 'heading', { name: 'System Font' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'checkbox', { name: 'System Font Normal' } )
			).toBeVisible();
		} );
	} );
} );
