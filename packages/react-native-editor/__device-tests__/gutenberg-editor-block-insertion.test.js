/**
 * @format
 * */

/**
 * Internal dependencies
 */
import EditorPage from './pages/editor-page';
import {
	setupDriver,
	isLocalEnvironment,
	stopDriver,
	isAndroid,
	swipeDown,
	clickMiddleOfElement,
} from './helpers/utils';
import testData from './helpers/test-data';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

describe( 'Gutenberg Editor tests for Block insertion', () => {
	let driver;
	let editorPage;
	let allPassed = true;

	// Use reporter for setting status for saucelabs Job
	if ( ! isLocalEnvironment() ) {
		const reporter = {
			specDone: async ( result ) => {
				allPassed = allPassed && result.status !== 'failed';
			},
		};

		jasmine.getEnv().addReporter( reporter );
	}

	beforeAll( async () => {
		driver = await setupDriver();
		editorPage = new EditorPage( driver );
	} );

	it( 'should be able to see visual editor', async () => {
		// wait for the block editor to load
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	it( 'should be able to insert block into post', async () => {
		await editorPage.addNewParagraphBlock();
		let paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 1 );
		if ( isAndroid() ) {
			await paragraphBlockElement.click();
		}
		await editorPage.sendTextToParagraphBlockAtPosition( 1, testData.longText );
		// Should have 3 paragraph blocks at this point

		paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 2 );
		await paragraphBlockElement.click();

		await editorPage.addNewParagraphBlock();
		paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 3 );
		await paragraphBlockElement.click();
		await editorPage.sendTextToParagraphBlockAtPosition( 3, testData.mediumText );

		await editorPage.verifyHtmlContent( testData.blockInsertionHtml );

		// wait for the block editor to load and for accessibility ids to update
		await driver.sleep( 3000 );

		// Workaround for now since deleting the first element causes a crash on CI for Android
		if ( isAndroid() ) {
			paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 3, { autoscroll: true } );
			await paragraphBlockElement.click();
			await editorPage.removeParagraphBlockAtPosition( 3 );
			for ( let i = 3; i > 0; i-- ) {
				// wait for accessibility ids to update
				await driver.sleep( 1000 );
				paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( i, { autoscroll: true } );
				await paragraphBlockElement.click();
				await editorPage.removeParagraphBlockAtPosition( i );
			}
		} else {
			for ( let i = 4; i > 0; i-- ) {
				// wait for accessibility ids to update
				await driver.sleep( 1000 );
				paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 1 );
				await clickMiddleOfElement( driver, paragraphBlockElement );
				await editorPage.removeParagraphBlockAtPosition( 1 );
			}
		}
	} );

	it( 'should be able to insert block at the beginning of post from the title', async () => {
		await editorPage.addNewParagraphBlock();
		let paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 1 );
		if ( isAndroid() ) {
			await paragraphBlockElement.click();
		}
		await editorPage.sendTextToParagraphBlockAtPosition( 1, testData.longText );
		// Should have 3 paragraph blocks at this point

		if ( isAndroid() ) {
			await editorPage.dismissKeyboard();
		}

		await swipeDown( driver );
		const titleElement = await editorPage.getTitleElement( { autoscroll: true } );
		await titleElement.click();
		await titleElement.click();

		await editorPage.addNewParagraphBlock();
		paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 1 );
		await clickMiddleOfElement( driver, paragraphBlockElement );
		await editorPage.sendTextToParagraphBlockAtPosition( 1, testData.mediumText );
		await paragraphBlockElement.click();
		await editorPage.verifyHtmlContent( testData.blockInsertionHtmlFromTitle );
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
