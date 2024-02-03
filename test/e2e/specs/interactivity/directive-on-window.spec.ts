/**
 * Internal dependencies
 */
import { test, expect } from './fixtures';

test.describe( 'data-wp-on-window', () => {
	test.beforeAll( async ( { interactivityUtils: utils } ) => {
		await utils.activatePlugins();
		await utils.addPostWithBlock( 'test/directive-on-window' );
	} );

	test.beforeEach( async ( { interactivityUtils: utils, page } ) => {
		await page.goto( utils.getLink( 'test/directive-on-window' ) );
	} );

	test.afterAll( async ( { interactivityUtils: utils } ) => {
		await utils.deactivatePlugins();
		await utils.deleteAllPosts();
	} );

	test( 'the event listener is attached when the element is added', async ( {
		page,
	} ) => {
		const counter = page.getByTestId( 'counter' );
		const visibilityButton = page.getByTestId( 'visibility' );

		// Initial value.
		await expect( counter ).toHaveText( '0' );

		// Make sure the event listener is attached.
		await page.waitForSelector(
			'[data-testid="isEventAttached"]:has-text("yes")'
		);

		// Change the viewport size.
		await page.setViewportSize( { width: 600, height: 600 } );
		await expect( counter ).toHaveText( '1' );

		// Remove the element.
		await visibilityButton.click();

		// Make sure the event listener is not attached.
		await page.waitForSelector(
			'[data-testid="isEventAttached"]:has-text("no")'
		);

		// This resize should not increase the counter.
		await page.setViewportSize( { width: 300, height: 600 } );

		// Add the element back.
		await visibilityButton.click();

		// The counter should have the same value as before.
		await expect( counter ).toHaveText( '1' );

		// Make sure the event listener is re-attached.
		await page.waitForSelector(
			'[data-testid="isEventAttached"]:has-text("yes")'
		);

		// This resize should increase the counter.
		await page.setViewportSize( { width: 200, height: 600 } );
		await expect( counter ).toHaveText( '2' );
	} );
} );
