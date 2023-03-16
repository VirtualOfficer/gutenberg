/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import Editor from './mock-editor';

function setup( jsx ) {
	return {
		user: userEvent.setup(),
		...render( jsx ),
	};
}

describe( 'Cover edit', () => {
	describe( 'Placeholder', () => {
		test( 'shows placeholder if background image and color not set', async () => {
			setup( <Editor testBlock={ { name: 'core/cover' } } /> );

			expect(
				screen.getByRole( 'group', {
					name: 'To edit this block, you need permission to upload media.',
				} )
			).toBeInTheDocument();
		} );

		test( 'does not show placeholder if background color selected from placeholder', async () => {
			const { user } = setup(
				<Editor testBlock={ { name: 'core/cover' } } />
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Color: Black',
				} )
			);
			expect(
				screen.queryByRole( 'group', {
					name: 'To edit this block, you need permission to upload media.',
				} )
			).not.toBeInTheDocument();
		} );

		test( 'shows block toolbar if selected block', async () => {
			const { user } = setup(
				<Editor testBlock={ { name: 'core/cover' } } />
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Color: Black',
				} )
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Select Cover',
				} )
			);
			expect(
				screen.getByRole( 'button', {
					name: 'Change content position',
				} )
			).toBeInTheDocument();
		} );

		test( 'shows inspector panel if selected block', async () => {
			const { user } = setup(
				<Editor testBlock={ { name: 'core/cover' } } />
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Color: Black',
				} )
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Select Cover',
				} )
			);

			await user.click(
				screen.getByRole( 'tab', {
					name: 'Styles',
				} )
			);
			expect( screen.getByText( 'Overlay' ) ).toBeInTheDocument();
		} );

		test( 'applies selected opacity to block', async () => {
			const { user, container } = setup(
				<Editor testBlock={ { name: 'core/cover' } } />
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Color: Black',
				} )
			);
			await user.click(
				screen.getByRole( 'button', {
					name: 'Select Cover',
				} )
			);
			// eslint-disable-next-line testing-library/no-node-access
			const overlay = container.getElementsByClassName(
				'wp-block-cover__background'
			);

			expect( overlay[ 0 ] ).toHaveClass( 'has-background-dim-100' );

			await user.click(
				screen.getByRole( 'tab', {
					name: 'Styles',
				} )
			);

			fireEvent.change(
				screen.getByRole( 'spinbutton', {
					name: 'Overlay opacity',
				} ),
				{
					target: { value: '40' },
				}
			);

			expect( overlay[ 0 ] ).toHaveClass( 'has-background-dim-40' );
		} );
	} );
} );
