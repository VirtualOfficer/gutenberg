/**
 * External dependencies
 */
import { screen } from '@testing-library/react';
import { render } from '@ariakit/test/react';

/**
 * Internal dependencies
 */
import PanelHeader from '../header';

describe( 'PanelHeader', () => {
	describe( 'basic rendering', () => {
		it( 'should render PanelHeader with empty div inside', async () => {
			const container = document.createElement( 'div' );
			document.body.appendChild( container );
			await render( <PanelHeader />, { container } );

			expect( container ).toMatchSnapshot();
		} );

		it( 'should render a label matching the text provided in the prop', async () => {
			await render( <PanelHeader label="Some Label" /> );

			const heading = screen.getByRole( 'heading' );
			expect( heading ).toBeVisible();
			expect( heading ).toHaveTextContent( 'Some Label' );
		} );

		it( 'should render child elements in the panel header body when provided', async () => {
			await render(
				<PanelHeader>
					<dfn>Some text</dfn>
				</PanelHeader>
			);

			const term = screen.getByRole( 'term' );
			expect( term ).toBeVisible();
			expect( term ).toHaveTextContent( 'Some text' );
		} );

		it( 'should render both child elements and label when passed in', async () => {
			await render(
				<PanelHeader label="Some Label">
					<dfn>Some text</dfn>
				</PanelHeader>
			);

			const heading = screen.getByRole( 'heading' );
			expect( heading ).toBeVisible();
			expect( heading ).toHaveTextContent( 'Some Label' );

			const term = screen.getByRole( 'term' );
			expect( term ).toBeVisible();
			expect( term ).toHaveTextContent( 'Some text' );
		} );
	} );
} );
