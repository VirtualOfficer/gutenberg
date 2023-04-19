/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Focus toolbar shortcut (alt + F10)', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.describe( 'In default view options in edit mode:', () => {
		test( 'should focus the top level toolbar when no block is selected', async ( {
			page,
			pageUtils,
		} ) => {
			await page.type(
				'.editor-post-title__input',
				'Focus toolbar shortcut (alt + F10)'
			);
			// Focus the top level toolbar.
			await pageUtils.pressKeys( 'alt+F10' );

			// The first top level toolbar button should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Toggle block inserter' } )
			).toBeFocused();
		} );

		test( 'should focus the top level toolbar when on an empty block', async ( {
			page,
			pageUtils,
		} ) => {
			// Move from title into an empty block
			await page.keyboard.press( 'Enter' );
			// Focus the top level toolbar.
			await pageUtils.pressKeys( 'alt+F10' );

			// The first top level toolbar button should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Toggle block inserter' } )
			).toBeFocused();
		} );

		test( 'should focus the block toolbar when a block is selected', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await editor.insertBlock( { name: 'core/paragraph' } );
			await page.keyboard.type( 'Paragraph' );
			// Focus the block toolbar.
			await pageUtils.pressKeys( 'alt+F10' );
			// The paragraph block toolbar button should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Paragraph' } )
			).toBeFocused();
		} );

		test( 'should focus the block toolbar when a block is selected and the toolbar is visible', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await editor.insertBlock( { name: 'core/paragraph' } );
			await page.keyboard.type( 'Paragraph' );
			// We need to force the toolbar to show. Otherwise, the bug from
			// https://github.com/WordPress/gutenberg/pull/49644 won't surface in the e2e tests.
			await editor.showBlockToolbar();

			// Focus the block toolbar.
			await pageUtils.pressKeys( 'alt+F10' );
			// The block toolbar should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Paragraph' } )
			).toBeFocused();

			// The document toolbar popup should not be visible
			await expect(
				page.locator( 'text=Toggle block inserter' )
			).not.toBeVisible();
		} );
	} );

	test.describe( 'In default view options in select mode:', () => {
		test( 'should focus the top level toolbar from paragraph block', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			await editor.insertBlock( { name: 'core/paragraph' } );
			await page.keyboard.type( 'Paragraph' );
			// We need to force the toolbar to show. Otherwise, the bug from
			// https://github.com/WordPress/gutenberg/pull/49644 won't surface in the e2e tests.
			await editor.showBlockToolbar();
			// Use select mode
			await page.keyboard.press( 'Escape' );

			// Focus the block toolbar.
			await pageUtils.pressKeys( 'alt+F10' );

			// The first top level toolbar button should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Toggle block inserter' } )
			).toBeFocused();
		} );

		test( 'should focus the top level toolbar from title', async ( {
			page,
			pageUtils,
		} ) => {
			// Use select mode
			await page.keyboard.press( 'Escape' );

			// Focus the block toolbar.
			await pageUtils.pressKeys( 'alt+F10' );

			// The first top level toolbar button should be focused.
			await expect(
				page.getByRole( 'button', { name: 'Toggle block inserter' } )
			).toBeFocused();
		} );
	} );

	test.describe( 'In Top Toolbar option:', () => {
		test.beforeEach( async ( { page } ) => {
			// Ensure the fixed toolbar option is on
			await page.evaluate( async () => {
				const isFixedToolbarActive = window.wp.data
					.select( 'core/edit-post' )
					.isFeatureActive( 'fixedToolbar' );

				if ( ! isFixedToolbarActive ) {
					window.wp.data
						.dispatch( 'core/edit-post' )
						.toggleFeature( 'fixedToolbar' );
				}
			} );
		} );

		test.describe( 'In edit mode:', () => {
			test( 'should focus the block toolbar from paragraph block', async ( {
				page,
				pageUtils,
			} ) => {
				await page.keyboard.press( 'Enter' );
				await page.keyboard.type( 'Paragraph' );
				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The block toolbar should be focused.
				await expect(
					page.getByRole( 'button', { name: 'Paragraph' } )
				).toBeFocused();

				// The document toolbar popup should not be visible
				await expect(
					page.locator( 'text=Toggle block inserter' )
				).not.toBeVisible();
			} );

			test( 'should focus the block toolbar from empty block', async ( {
				page,
				pageUtils,
			} ) => {
				// Go to empty paragraph block
				await page.keyboard.press( 'Enter' );
				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The block toolbar should be focused.
				await expect(
					page.getByRole( 'button', { name: 'Paragraph' } )
				).toBeFocused();

				// The document toolbar popup should not be visible
				await expect(
					page.locator( 'text=Toggle block inserter' )
				).not.toBeVisible();
			} );

			test( 'should focus the document toolbar from title', async ( {
				page,
				pageUtils,
			} ) => {
				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The first top level toolbar button should be focused.
				await expect(
					page.getByRole( 'button', {
						name: 'Toggle block inserter',
					} )
				).toBeFocused();
			} );
		} );

		test.describe( 'In select mode:', () => {
			test( 'should focus the block toolbar from paragraph block', async ( {
				editor,
				page,
				pageUtils,
			} ) => {
				await editor.insertBlock( { name: 'core/paragraph' } );
				await page.keyboard.type( 'Paragraph' );
				// Use select mode
				await page.keyboard.press( 'Escape' );

				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The block toolbar should be focused.
				await expect(
					page.getByRole( 'button', {
						name: 'Paragraph',
						exact: true,
					} )
				).toBeFocused();

				// The document toolbar popup should not be visible
				await expect(
					page.locator( 'text=Toggle block inserter' )
				).not.toBeVisible();
			} );

			test( 'should focus the block toolbar from empty block', async ( {
				page,
				pageUtils,
			} ) => {
				// Move to empty paragrph block
				await page.keyboard.press( 'Enter' );
				// Use select mode
				await page.keyboard.press( 'Escape' );

				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The block toolbar should be focused.
				await expect(
					page.getByRole( 'button', {
						name: 'Paragraph',
						exact: true,
					} )
				).toBeFocused();

				// The document toolbar popup should not be visible
				await expect(
					page.locator( 'text=Toggle block inserter' )
				).not.toBeVisible();
			} );

			test( 'should focus the top level toolbar from title', async ( {
				page,
				pageUtils,
			} ) => {
				// Use select mode
				await page.keyboard.press( 'Escape' );

				// Focus the block toolbar.
				await pageUtils.pressKeys( 'alt+F10' );

				// The first top level toolbar button should be focused.
				await expect(
					page.getByRole( 'button', {
						name: 'Toggle block inserter',
					} )
				).toBeFocused();
			} );
		} );
	} );
} );
