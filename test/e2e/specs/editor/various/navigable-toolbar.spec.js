/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.use( {
	navigableToolbar: async ( { page }, use ) => {
		await use( new navigableToolbar( { page } ) );
	},
} );

test.describe( 'Block Toolbar', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.describe( 'Contextual Toolbar', () => {
		test( 'should not scroll page', async ( {
			page,
			pageUtils,
			navigableToolbar,
		} ) => {
			const wp = '';
			while (
				await page.evaluate( () => {
					const scrollable = wp.dom.getScrollContainer(
						document.activeElement
					);
					return ! scrollable || scrollable.scrollTop === 0;
				} )
			) {
				await page.keyboard.press( 'Enter' );
			}

			await page.keyboard.type( 'a' );

			const scrollTopBefore = await page.evaluate(
				() =>
					wp.dom.getScrollContainer( document.activeElement )
						.scrollTop
			);
			await pageUtils.pressKeys( 'alt+F10' );
			expect( await navigableToolbar.isInBlockToolbar() ).toBe( true );

			const scrollTopAfter = await page.evaluate(
				() =>
					wp.dom.getScrollContainer( document.activeElement )
						.scrollTop
			);

			expect( scrollTopBefore ).toBe( scrollTopAfter );
		} );

		test( 'navigates into the toolbar by keyboard (Alt+F10)', async ( {
			page,
			pageUtils,
			navigableToolbar,
		} ) => {
			// Assumes new post focus starts in title. Create first new
			// block by Enter.
			await page.keyboard.press( 'Enter' );

			// [TEMPORARY]: A new paragraph is not technically a block yet
			// until starting to type within it.
			await page.keyboard.type( 'Example' );

			// Upward.
			await pageUtils.pressKeys( 'alt+F10' );

			expect( await navigableToolbar.isInBlockToolbar() ).toBe( true );
		} );
	} );

	test.describe( 'Unified Toolbar', () => {
		test( 'navigates into the toolbar by keyboard (Alt+F10)', async ( {
			page,
			pageUtils,
		} ) => {
			const wp = '';
			await page.evaluate( () => {
				const { select, dispatch } = wp.data;
				const isCurrentlyUnified =
					select( 'core/edit-post' ).isFeatureActive(
						'fixedToolbar'
					);
				if ( ! isCurrentlyUnified ) {
					dispatch( 'core/edit-post' ).toggleFeature(
						'fixedToolbar'
					);
				}
			} );

			// Assumes new post focus starts in title. Create first new
			// block by Enter.
			await page.keyboard.press( 'Enter' );

			// [TEMPORARY]: A new paragraph is not technically a block yet
			// until starting to type within it.
			await page.keyboard.type( 'Example' );

			// Upward.
			await pageUtils.pressKeys( 'alt+F10' );

			await expect(
				page.locator( 'role=toolbar[name="Document tools"i]' )
			).toBeVisible();
		} );
	} );
} );

class navigableToolbar {
	constructor( { page } ) {
		this.page = page;
	}

	async isInBlockToolbar() {
		return await this.page.evaluate( () => {
			return !! document.activeElement.closest(
				'.block-editor-block-toolbar'
			);
		} );
	}
}
