/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Block Renaming', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.describe( 'Dialog renaming', () => {
		test.only( 'allows renaming of blocks that support the feature via dialog-based UI', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			// Create a two blocks on the page.
			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: 'First Paragraph' },
			} );
			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: 'Second Paragraph' },
			} );

			// Multiselect via keyboard.
			await pageUtils.pressKeys( 'primary+a' );
			await pageUtils.pressKeys( 'primary+a' );

			// Convert to a Group block which supports renaming.
			await editor.clickBlockOptionsMenuItem( 'Group' );

			await editor.clickBlockOptionsMenuItem( 'Rename' );

			const renameMenuItem = page.getByRole( 'menuitem', {
				name: 'Rename',
				includeHidden: true, // the option is hidden behind modal but assertion is still valid.
			} );

			await expect( renameMenuItem ).toHaveAttribute(
				'aria-expanded',
				'true'
			);

			const renameModal = page.getByRole( 'dialog', {
				name: 'Rename block',
			} );

			// Check focus is transferred into modal.
			await expect( renameModal ).toBeFocused();

			// Check the Modal is perceivable.
			await expect( renameModal ).toBeVisible();

			const saveButton = renameModal.getByRole( 'button', {
				name: 'Save',
				type: 'submit',
			} );

			await expect( saveButton ).toBeDisabled();

			const nameInput = renameModal.getByLabel( 'Block name' );

			await expect( nameInput ).toHaveValue( 'Group' );

			await nameInput.fill( 'My new name' );

			await expect( saveButton ).toBeEnabled();

			await saveButton.click();

			await expect( renameModal ).toBeHidden();

			// Check that focus is transferred back to original "Rename" menu item.
			await expect( renameMenuItem ).toBeFocused();

			await expect( renameMenuItem ).toHaveAttribute(
				'aria-expanded',
				'false'
			);

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: 'My new name',
						},
					},
				},
			] );
		} );

		test( 'allows custom name to be removed and reset to original block name', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			// Prefill with block that already has a custom name.
			await editor.insertBlock( {
				name: 'core/group',
				attributes: {
					metadata: {
						name: 'My custom name',
					},
				},
			} );

			await editor.clickBlockOptionsMenuItem( 'Rename' );

			const renameModal = page.getByRole( 'dialog', {
				name: 'Rename block',
			} );

			const saveButton = renameModal.getByRole( 'button', {
				name: 'Save',
				type: 'submit',
			} );

			await expect( saveButton ).toBeDisabled();

			const nameInput = renameModal.getByLabel( 'Block name' );

			await expect( nameInput ).toHaveValue( 'My custom name' );

			// Clear the input of text content.
			await nameInput.focus();
			await pageUtils.pressKeys( 'primary+a' );
			await page.keyboard.press( 'Delete' );

			// Trigger blur event on input.
			await saveButton.focus();

			// Expect value to automatically revert to original block name.
			await expect( nameInput ).toHaveValue( 'Group' );

			await expect( saveButton ).toBeEnabled();

			await saveButton.click();

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: undefined,
						},
					},
				},
			] );
		} );
	} );

	test.describe( 'Block inspector renaming', () => {
		test( 'allows renaming of blocks that support the feature via "Advanced" section of block inspector tools', async ( {
			editor,
			page,
			pageUtils,
		} ) => {
			// Create a two blocks on the page.
			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: 'First Paragraph' },
			} );
			await editor.insertBlock( {
				name: 'core/paragraph',
				attributes: { content: 'Second Paragraph' },
			} );

			// Multiselect via keyboard.
			await pageUtils.pressKeys( 'primary+a' );
			await pageUtils.pressKeys( 'primary+a' );

			// Convert to a Group block which supports renaming.
			await editor.clickBlockOptionsMenuItem( 'Group' );

			await editor.openDocumentSettingsSidebar();

			const advancedPanelToggle = page
				.getByRole( 'region', {
					name: 'Editor settings',
				} )
				.getByRole( 'button', {
					name: 'Advanced',
					expanded: false,
				} );

			await advancedPanelToggle.click();

			const nameInput = page.getByRole( 'textbox', {
				name: 'Custom block name',
			} );

			await expect( nameInput ).toBeEmpty();

			await nameInput.fill( 'My new name' );

			await expect( nameInput ).toHaveValue( 'My new name' );

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: 'My new name',
						},
					},
				},
			] );

			await nameInput.focus();
			await pageUtils.pressKeys( 'primary+a' );
			await page.keyboard.press( 'Delete' );

			await expect.poll( editor.getBlocks ).toMatchObject( [
				{
					name: 'core/group',
					attributes: {
						metadata: {
							name: '',
						},
					},
				},
			] );
		} );
	} );
} );
