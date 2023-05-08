/**
 * WordPress dependencies
 */
const {
	test,
	expect,
	Editor,
} = require( '@wordpress/e2e-test-utils-playwright' );

test.use( {
	editor: async ( { page }, use ) => {
		await use( new Editor( { page, hasIframe: true } ) );
	},
	userGlobalStylesRevisions: async ( { page, requestUtils }, use ) => {
		await use( new UserGlobalStylesRevisions( { page, requestUtils } ) );
	},
} );

test.describe( 'Global styles revisions', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await Promise.all( [
			requestUtils.activateTheme( 'emptytheme' ),
			requestUtils.deleteAllTemplates( 'wp_template' ),
			requestUtils.deleteAllTemplates( 'wp_template_part' ),
		] );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.afterEach( async ( { requestUtils } ) => {
		await Promise.all( [
			requestUtils.deleteAllTemplates( 'wp_template' ),
			requestUtils.deleteAllTemplates( 'wp_template_part' ),
		] );
	} );

	test.beforeEach( async ( { admin } ) => {
		await admin.visitSiteEditor( {
			canvas: 'edit',
		} );
	} );

	test( 'should display revisions UI when there is more than 1 revision', async ( {
		page,
		editor,
		userGlobalStylesRevisions,
	} ) => {
		// Navigates to Styles -> Typography -> Text and click on a size.
		await page.getByRole( 'button', { name: 'Styles' } ).click();

		const currentRevisions =
			await userGlobalStylesRevisions.getGlobalStylesRevisions();

		/*
		 * There are not enough revisions to show the revisions UI yet, so let's create some.
		 * The condition exists until we have way (and the requirement) to delete global styles revisions.
		 */
		if ( currentRevisions.length < 1 ) {
			// Change a style and save it.
			await page
				.getByRole( 'button', { name: 'Typography styles' } )
				.click();
			await page
				.getByRole( 'button', { name: 'Typography Text styles' } )
				.click();
			await page.click(
				'role=radiogroup[name="Font size"i] >> role=radio[name="Large"i]'
			);
			await editor.saveSiteEditorEntities();

			// Change a style and save it again just for good luck.
			// We need more than 2 revisions to show the UI.
			await page.click(
				'role=radiogroup[name="Font size"i] >> role=radio[name="Medium"i]'
			);
			await editor.saveSiteEditorEntities();

			// Now there should be enough revisions to show the revisions UI.
			await page
				.getByRole( 'button', { name: 'Styles actions' } )
				.click();
			await page.getByRole( 'menuitem', { name: 'Revisions' } ).click();
			const revisionButtons = page.locator(
				'role=group[name="Global styles revisions"i] >> role=button[name=/^Revision by /]'
			);

			await expect( revisionButtons ).toHaveCount(
				currentRevisions.length + 2
			);
		} else {
			// There are some revisions. Let's check that the UI looks how we expect it to.
			await page
				.getByRole( 'button', { name: 'Styles actions' } )
				.click();
			await page.getByRole( 'menuitem', { name: 'Revisions' } ).click();
			const revisionButtons = page.locator(
				'role=group[name="Global styles revisions"i] >> role=button[name=/^Revision by /]'
			);

			await expect( revisionButtons ).toHaveCount(
				currentRevisions.length
			);
		}
	} );
} );

class UserGlobalStylesRevisions {
	constructor( { page, requestUtils } ) {
		this.page = page;
		this.requestUtils = requestUtils;
	}
	async getGlobalStylesRevisions() {
		const stylesPostId =
			await this.requestUtils.getCurrentThemeGlobalStylesPostId();
		if ( stylesPostId ) {
			return await this.requestUtils.getThemeGlobalStylesRevisions(
				stylesPostId
			);
		}
		return [];
	}
}
