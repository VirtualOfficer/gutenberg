/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Inner blocks templates', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activatePlugin(
			'gutenberg-test-inner-blocks-templates'
		);
	} );

	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deactivatePlugin(
			'gutenberg-test-inner-blocks-templates'
		);
	} );

	test( 'applying block templates asynchronously does not create a persistent change in the editor', async ( {
		editor,
		page,
	} ) => {
		await editor.insertBlock( {
			name: 'test/test-inner-blocks-async-template',
		} );

		// Publish the post, then reload.
		await editor.publishPost();
		await page.reload();

		// Wait for the block that was inserted to appear with its templated content.
		await page
			.locator(
				'role=document[name="Block: Test Inner Blocks Async Template"i] >> text=OneTwo'
			)
			.waitFor();

		// The template resolution shouldn't cause the post to be dirty.
		const editorTopBar = page.locator(
			'role=region[name="Editor top bar"i]'
		);
		const undoButton = editorTopBar.locator( 'role=button[name="Undo"i]' );
		const updateButton = editorTopBar.locator(
			'role=button[name="Update"i]'
		);
		await expect( undoButton ).toHaveAttribute( 'aria-disabled', 'true' );
		await expect( updateButton ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
