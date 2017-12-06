describe( 'Multi-block selection', () => {
	before( () => {
		cy.newPost();
	} );

	it( 'Should select/unselect multiple blocks', () => {
		const lastBlockSelector = '.editor-block-item__edit:last [contenteditable="true"]:first';
		const firstBlockContainerSelector = '.editor-block-item:first';
		const lastBlockContainerSelector = '.editor-block-item:last';
		const multiSelectedCssClass = 'is-multi-selected';

		// Creating test blocks
		cy.get( '.editor-default-block-appender' ).click();
		cy.get( lastBlockSelector ).type( 'First Paragraph' );
		cy.get( '.editor-visual-editor__inserter [aria-label="Insert Paragraph"]' ).click();
		cy.get( lastBlockSelector ).type( 'Second Paragraph' );

		// Default: No selection
		cy.get( firstBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );
		cy.get( lastBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );

		// Multiselect via Shift + click
		cy.get( firstBlockContainerSelector ).click();
		cy.get( 'body' ).type( '{shift}', { release: false } );
		cy.get( lastBlockContainerSelector ).click();

		// Verify selection
		cy.get( firstBlockContainerSelector ).should( 'have.class', multiSelectedCssClass );
		cy.get( lastBlockContainerSelector ).should( 'have.class', multiSelectedCssClass );

		// Unselect
		cy.get( 'body' ).type( '{shift}' ); // releasing shift
		cy.get( lastBlockContainerSelector ).click();

		// No selection
		cy.get( firstBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );
		cy.get( lastBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );

		// Multiselect via keyboard
		// Mac uses meta modifier so we press both here
		cy.get( 'body' ).type( '{ctrl}a' );
		cy.get( 'body' ).type( '{meta}a' );

		// Verify selection
		cy.get( firstBlockContainerSelector ).should( 'have.class', multiSelectedCssClass );
		cy.get( lastBlockContainerSelector ).should( 'have.class', multiSelectedCssClass );

		// Unselect
		cy.get( 'body' ).type( '{esc}' );

		// No selection
		cy.get( firstBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );
		cy.get( lastBlockContainerSelector ).should( 'not.have.class', multiSelectedCssClass );
	} );
} );
