/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import Navigation from '../';
import NavigationMenu from '../menu';
import NavigationMenuItem from '../menu-item';

export default {
	title: 'Components/Navigation',
	component: Navigation,
};

// Example Link component from a router such as React Router
const CustomRouterLink = ( { children, onClick } ) => {
	// Here I'm passing the onClick prop for simplicity, but behavior can be
	// anything here.
	return <Button onClick={ onClick }>{ children }</Button>;
};

const data = [
	{
		title: 'Item 1',
		id: 'item-1',
	},
	{
		title: 'Item 2',
		id: 'item-2',
	},
	{
		title: 'Category',
		id: 'item-3',
		badge: '2',
	},
	{
		title: 'Child 1',
		id: 'child-1',
		parent: 'item-3',
		badge: '1',
	},
	{
		title: 'Child 2',
		id: 'child-2',
		parent: 'item-3',
	},
	{
		title: 'Nested Category',
		id: 'child-3',
		parent: 'item-3',
	},
	{
		title: 'Sub Child 1',
		id: 'sub-child-1',
		parent: 'child-3',
	},
	{
		title: 'Sub Child 2',
		id: 'sub-child-2',
		parent: 'child-3',
	},
	{
		title: 'External link',
		id: 'item-4',
		href: 'https://wordpress.org',
		linkProps: {
			target: '_blank',
		},
	},
	{
		title: 'Internal link',
		id: 'item-5',
		LinkComponent: CustomRouterLink,
	},
	{
		title: 'Secondary Item 1',
		id: 'secondary-item-1',
		isSecondary: true,
	},
	{
		title: 'Secondary Item 2',
		id: 'secondary-item-2',
		isSecondary: true,
	},
	{
		title: 'Secondary Child 1',
		id: 'secondary-child-1',
		parent: 'secondary-item-1',
		isSecondary: true,
	},
	{
		title: 'Secondary Child 2',
		id: 'secondary-child-2',
		parent: 'secondary-item-1',
		isSecondary: true,
	},
];

function Example() {
	const [ active, setActive ] = useState( 'item-1' );

	const renderMenuItem = ( item ) => (
		<NavigationMenuItem
			{ ...item }
			key={ item.id }
			onClick={
				! item.href ? ( selected ) => setActive( selected.id ) : null
			}
		/>
	);

	return (
		<>
			{ active !== 'child-2' ? (
				<Button
					style={ { position: 'absolute', bottom: 0 } }
					onClick={ () => setActive( 'child-2' ) }
				>
					Non-navigation link to Child 2
				</Button>
			) : null }
			<Container>
				<Navigation
					activeItemId={ active }
					data={ data }
					rootTitle="Home"
				>
					{ ( { level, parentLevel, NavigationBackButton } ) => {
						return (
							<>
								{ parentLevel && (
									<NavigationBackButton>
										{ parentLevel.title }
									</NavigationBackButton>
								) }
								<NavigationMenu title={ level.title }>
									{ level.children
										.filter(
											( item ) => ! item.isSecondary
										)
										.map( ( item ) =>
											renderMenuItem( item )
										) }
								</NavigationMenu>
								<NavigationMenu
									title={
										level.id === 'root'
											? 'Secondary Menu'
											: level.title
									}
								>
									{ level.children
										.filter( ( item ) => item.isSecondary )
										.map( ( item ) =>
											renderMenuItem( item )
										) }
								</NavigationMenu>
							</>
						);
					} }
				</Navigation>
			</Container>
		</>
	);
}

const Container = styled.div`
	max-width: 246px;
`;

export const _default = () => {
	return <Example />;
};
