/**
 * External dependencies
 */
import { screen } from '@testing-library/react';
import { render } from '@ariakit/test/react';

/**
 * Internal dependencies
 */
import {
	Card,
	CardBody,
	CardDivider,
	CardFooter,
	CardHeader,
	CardMedia,
} from '../';

function createContainer() {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	return container;
}

describe( 'Card', () => {
	describe( 'Card component', () => {
		it( 'should render correctly', async () => {
			const container = createContainer();
			await render(
				<Card>
					<CardHeader>Card Header</CardHeader>
					<CardBody>Card Body 1</CardBody>
					<CardBody>Card Body 2</CardBody>
					<CardDivider />
					<CardBody>Card Body 3</CardBody>
					<CardMedia>
						<img
							alt="Card Media"
							src="https://images.unsplash.com/photo-1566125882500-87e10f726cdc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1867&q=80"
						/>
					</CardMedia>
					<CardFooter>Card Footer</CardFooter>
				</Card>,
				{ container }
			);
			expect( container ).toMatchSnapshot();
		} );

		it( 'should remove borders when the isBorderless prop is true', async () => {
			const { rerender } = await render(
				<Card data-testid="card-wrapper">Code is Poetry</Card>
			);

			expect( screen.getByTestId( 'card-wrapper' ) ).not.toHaveStyle(
				'box-shadow: none'
			);

			await rerender(
				<Card data-testid="card-wrapper" isBorderless>
					Code is Poetry
				</Card>
			);

			expect( screen.getByTestId( 'card-wrapper' ) ).toHaveStyle(
				'box-shadow: none'
			);
		} );

		it( 'should add rounded border when the isRounded prop is true', async () => {
			await render(
				<Card data-testid="card-rounded" isRounded>
					Code is Poetry
				</Card>
			);
			await render(
				<Card data-testid="card-squared" isRounded={ false }>
					Code is Poetry
				</Card>
			);
			expect(
				screen.getByTestId( 'card-rounded' )
			).toMatchStyleDiffSnapshot( screen.getByTestId( 'card-squared' ) );
		} );

		it( 'should show a box shadow when the elevation prop is greater than 0', async () => {
			const withElevation = createContainer();
			await render( <Card elevation={ 2 }>Code is Poetry</Card>, {
				container: withElevation,
			} );
			// The `elevation` prop has a default value of "0"
			const withoutElevation = createContainer();
			await render( <Card>Code is Poetry</Card>, {
				container: withoutElevation,
			} );

			expect( withElevation ).toMatchDiffSnapshot( withoutElevation );
		} );

		it( 'should add different amounts of white space when using the size prop', async () => {
			// The `size` prop has a default value of "medium"
			const withSizeDefault = createContainer();
			await render(
				<Card>
					<CardHeader>Header</CardHeader>
					<CardBody>Code is Poetry</CardBody>
				</Card>,
				{ container: withSizeDefault }
			);
			const withSizeLarge = createContainer();
			await render(
				<Card size="large">
					<CardHeader>Header</CardHeader>
					<CardBody>Code is Poetry</CardBody>
				</Card>,
				{ container: withSizeLarge }
			);

			expect( withSizeDefault ).toMatchDiffSnapshot( withSizeLarge );
		} );

		it( 'should warn when the isElevated prop is passed', async () => {
			// `isElevated` is automatically converted to `elevation="2"`
			const container = createContainer();
			await render( <Card isElevated>Code is Poetry</Card>, {
				container,
			} );
			expect( container ).toMatchSnapshot();

			expect( console ).toHaveWarned();
		} );

		it( 'should pass the isBorderless and isSize props from its context to its sub-components', async () => {
			const withoutBorderLarge = createContainer();
			await render(
				<Card isBorderless size="large">
					<CardHeader>Header</CardHeader>
					<CardBody>Body</CardBody>
					<CardFooter>Footer</CardFooter>
				</Card>,
				{ container: withoutBorderLarge }
			);
			const withBorderSmall = createContainer();
			await render(
				<Card isBorderless={ false } size="small">
					<CardHeader>Header</CardHeader>
					<CardBody>Body</CardBody>
					<CardFooter>Footer</CardFooter>
				</Card>,
				{ container: withBorderSmall }
			);
			expect( withoutBorderLarge ).toMatchDiffSnapshot( withBorderSmall );
		} );

		it( 'should get the isBorderless and isSize props (passed from its context) overriddenwhen the same props is specified directly on the component', async () => {
			const withoutBorder = createContainer();
			await render(
				<Card isBorderless size="large">
					<CardHeader>Header</CardHeader>
					<CardBody>Body</CardBody>
					<CardFooter>Footer</CardFooter>
				</Card>,
				{ container: withoutBorder }
			);
			const withBorder = createContainer();
			await render(
				<Card isBorderless size="large">
					<CardHeader isBorderless={ false } size="small">
						Header
					</CardHeader>
					<CardBody size="medium">Body</CardBody>
					<CardFooter isBorderless={ false } size="xSmall">
						Footer
					</CardFooter>
				</Card>,
				{ container: withBorder }
			);
			expect( withoutBorder ).toMatchDiffSnapshot( withBorder );
		} );

		it( 'should support the legacy extraSmall value for the size prop as an alias for the xSmall value', async () => {
			const containerXSmall = createContainer();
			await render(
				<Card size="xSmall">
					<CardHeader>Header</CardHeader>
					<CardBody>Body</CardBody>
					<CardFooter>Footer</CardFooter>
				</Card>,
				{ container: containerXSmall }
			);
			const containerExtraSmall = createContainer();
			await render(
				<Card size="extraSmall">
					<CardHeader>Header</CardHeader>
					<CardBody>Body</CardBody>
					<CardFooter>Footer</CardFooter>
				</Card>,
				{ container: containerExtraSmall }
			);
			expect( containerXSmall ).toMatchDiffSnapshot(
				containerExtraSmall
			);
		} );

		describe( 'CardHeader', () => {
			it( 'should render with a darker background color when isShady is true', async () => {
				const container = createContainer();
				await render( <CardHeader>Header</CardHeader>, { container } );
				const containerShady = createContainer();
				await render( <CardHeader isShady>Header</CardHeader>, {
					container: containerShady,
				} );
				expect( container ).toMatchDiffSnapshot( containerShady );
			} );
		} );

		describe( 'CardFooter', () => {
			it( 'should render with a darker background color when isShady is true', async () => {
				const container = createContainer();
				await render( <CardFooter>Footer</CardFooter>, { container } );
				const containerShady = createContainer();
				await render( <CardFooter isShady>Footer</CardFooter>, {
					container: containerShady,
				} );
				expect( container ).toMatchDiffSnapshot( containerShady );
			} );

			it( 'should use the justify prop to align its content, like a Flex container', async () => {
				const container = createContainer();
				await render( <CardFooter>Footer</CardFooter>, { container } );
				const containerWithFlexEnd = createContainer();
				await render(
					<CardFooter justify="flex-end">Footer</CardFooter>,
					{ container: containerWithFlexEnd }
				);
				expect( container ).toMatchDiffSnapshot( containerWithFlexEnd );
			} );
		} );

		describe( 'CardBody', () => {
			it( 'should render with a darker background color when isShady is true', async () => {
				const container = createContainer();
				await render( <CardBody>Body</CardBody>, { container } );
				const containerShady = createContainer();
				await render( <CardBody isShady>Body</CardBody>, {
					container: containerShady,
				} );
				expect( container ).toMatchDiffSnapshot( containerShady );
			} );

			it( 'should allow scrolling content with the scrollable prop is true', async () => {
				const containerScrollable = createContainer();
				await render( <CardBody isScrollable>Body</CardBody>, {
					container: containerScrollable,
				} );
				const container = createContainer();
				await render( <CardBody>Body</CardBody>, { container } );
				expect( container ).toMatchDiffSnapshot( containerScrollable );
			} );
		} );
	} );
} );
