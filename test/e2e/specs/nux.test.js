/**
 * Internal dependencies
 */
import '../support/bootstrap';
import {
	clearLocalStorage,
	clickOnMoreMenuItem,
	newDesktopBrowserPage,
	newPost,
} from '../support/utils';

describe( 'New User Experience (NUX)', () => {
	const NUMBER_OF_TIPS = 4;

	async function getTipsLocalStorage( page ) {
		return await page.evaluate( () => {
			return JSON.parse( window.localStorage.GUTENBERG_NUX_1 );
		} );
	}

	beforeEach( async () => {
		await newDesktopBrowserPage();
		await newPost( undefined, false );

		// Clear localStorage tips so they aren't persisted for the next test.
		await clearLocalStorage();
		await page.reload();
	} );

	it( 'should show tips to a first-time user', async () => {
		const firstTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( firstTipText ).toContain( 'Welcome to the wonderful world of blocks!' );

		const [ nextTipButton ] = await page.$x( '//button[contains(text(), \'See next tip\')]' );
		await nextTipButton.click();

		const secondTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( secondTipText ).toContain( 'You’ll find more settings for your page and blocks in the sidebar.' );
	} );

	it( 'should show "Got it" once all tips have been displayed', async () => {
		for ( let i = 1; i < NUMBER_OF_TIPS; i++ ) {
			await page.click( '.nux-dot-tip .components-button.is-link' );
		}

		// Make sure "Got it" button appears on the last tip.
		const gotItButton = await page.$x( '//button[contains(text(), \'Got it\')]' );
		expect( gotItButton ).toHaveLength( 1 );

		// Click the "Got it button".
		await page.click( '.nux-dot-tip .components-button.is-link' );

		// Verify no more tips are visible on the page.
		const nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Tips should not be marked as disabled, but when the user has seen all
		// of the available tips, they will not appear.
		const nuxTipsLocalStorage = await getTipsLocalStorage( page );
		expect( nuxTipsLocalStorage.areTipsEnabled ).toEqual( true );
		expect( Object.keys( nuxTipsLocalStorage.dismissedTips ) ).toHaveLength( NUMBER_OF_TIPS );
	} );

	it( 'should dismiss tips if "disable tips" button is clicked', async () => {
		await page.click( '.nux-dot-tip__disable' );

		// Verify no more tips are visible on the page.
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// We should be disabling the tips using localStorage so they don't appear
		// again.
		const nuxTipsLocalStorage = await getTipsLocalStorage( page );
		expect( nuxTipsLocalStorage.areTipsEnabled ).toEqual( false );

		// Refresh the page; tips should not show because they were disabled.
		await page.reload();

		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );
	} );

	it( 'should toggle tips when the "Show tips" menu item is clicked', async () => {
		await clickOnMoreMenuItem( 'Show Tips' );

		// Should disable tips from appearing.
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Tips should be disabled in localStorage as well.
		let nuxTipsLocalStorage = await getTipsLocalStorage( page );
		expect( nuxTipsLocalStorage.areTipsEnabled ).toEqual( false );

		// Click again to re-enable tips; they should appear.
		await clickOnMoreMenuItem( 'Show Tips' );

		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );

		nuxTipsLocalStorage = await getTipsLocalStorage( page );
		expect( nuxTipsLocalStorage.areTipsEnabled ).toEqual( true );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7458 is fixed.
	it.skip( 'should show tips as disabled if all tips have been shown', async () => {
		// Clicks through all tips.
		for ( let i = 1; i <= NUMBER_OF_TIPS; i++ ) {
			await page.click( '.nux-dot-tip .components-button.is-link' );
		}

		// Open the "More" menu to check the "Show Tips" element.
		await page.click( '.edit-post-more-menu [aria-label="More"]' );
		const showTipsButton = await page.$x( '//button[contains(text(), "Show Tips")][@aria-pressed="false"]' );

		expect( showTipsButton ).toHaveLength( 1 );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7458 is fixed.
	it.skip( 'should reset tips if all tips have been shown and show tips was unchecked', async () => {
		// Clicks through all tips.
		for ( let i = 1; i <= NUMBER_OF_TIPS; i++ ) {
			await page.click( '.nux-dot-tip .components-button.is-link' );
		}

		// Click again to re-enable tips; they should appear.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Open the "More" menu to check the "Show Tips" element.
		await page.click( '.edit-post-more-menu [aria-label="More"]' );
		const showTipsButton = await page.$x( '//button[contains(text(), "Show Tips")][@aria-pressed="true"]' );

		expect( showTipsButton ).toHaveLength( 1 );

		// Tips should re-appear on the page.
		const nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );

		// Dismissed tips should be reset.
		const nuxTipsLocalStorage = await getTipsLocalStorage( page );
		expect( nuxTipsLocalStorage.areTipsEnabled ).toEqual( true );
		expect( Object.keys( nuxTipsLocalStorage.dismissedTips ) ).toHaveLength( 0 );
	} );

	// TODO: This test should be enabled once
	// https://github.com/WordPress/gutenberg/issues/7753 is fixed.
	// See: https://github.com/WordPress/gutenberg/issues/7753#issuecomment-403952816
	it.skip( 'should show tips if "Show tips" was disabled on a draft and then enabled', async () => {
		// Disable tips.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Let's type something so there's content in this post.
		await page.click( '.editor-post-title__input' );
		await page.keyboard.type( 'Post title' );
		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'Post content goes here.' );
		// Save the post as a draft.
		await page.click( '.editor-post-save-draft' );

		await page.waitForSelector( '.editor-post-saved-state.is-saved' );

		// Refresh the page; tips should be disabled.
		await page.reload();
		let nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 0 );

		// Clicking should re-enable tips.
		await clickOnMoreMenuItem( 'Show Tips' );

		// Tips should re-appear on the page.
		nuxTipElements = await page.$$( '.nux-dot-tip' );
		expect( nuxTipElements ).toHaveLength( 1 );
	} );
} );
