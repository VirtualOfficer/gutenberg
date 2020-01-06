/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { text } from '@storybook/addon-knobs';
/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Button from '../../button';
import TreeSelect from '../';

export default { title: 'Components|TreeSelect', component: TreeSelect };

const exampleTree = [
	{
		name: 'Page 1',
		id: 'p1',
		children: [
			{ name: 'Descend 1 of page 1', id: 'p11' },
			{ name: 'Descend 2 of page 1', id: 'p12' },
		],
	},
	{
		name: 'Page 2',
		id: 'p2',
		children: [
			{
				name: 'Descend 1 of page 2',
				id: 'p21',
				children: [
					{
						name: 'Descend 1 of Descend 1 of page 2',
						id: 'p211',
					},
				],
			},
		],
	},
];

const ParentPageTreeSelectExample = ( {
	label,
	noOptionLabelProp,
	loadingText,
	loadingTimeout = 1000,
} ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ tree, setTree ] = useState( exampleTree );
	const [ selected, setSelected ] = useState();
	const simulateLoadTimeout = useRef();

	const clearSimulateLoadTimeout = useCallback( () => {
		if ( simulateLoadTimeout.current ) {
			clearTimeout( simulateLoadTimeout.current );
			simulateLoadTimeout.current = null;
		}
	}, [] );

	const simulateLoad = useCallback( () => {
		clearSimulateLoadTimeout();
		setIsLoading( true );
		setTree( [] );
		simulateLoadTimeout.current = setTimeout( () => {
			setIsLoading( false );
			setTree( exampleTree );
		}, loadingTimeout );
	}, [] );

	useEffect( () => {
		simulateLoad();

		return () => {
			clearSimulateLoadTimeout();
		};
	}, [ simulateLoad, clearSimulateLoadTimeout ] );

	const noOptionLabel = isLoading ? loadingText : noOptionLabelProp;

	const handleOnChange = ( selectedId ) => setSelected( selectedId );

	const props = {
		isLoading,
		label,
		noOptionLabel,
		onChange: handleOnChange,
		selectedId: selected,
		tree,
	};

	return (
		<Container>
			<ButtonWrapper>
				<Button isDefault onClick={ simulateLoad } isSmall>
					Simulate Loading
				</Button>
			</ButtonWrapper>
			<TreeSelect { ...props } />
		</Container>
	);
};

export const _default = () => {
	const label = text( 'label', 'Parent page' );
	const noOptionLabel = text( 'noOptionLabel', 'No parent page' );

	const props = {
		label,
		noOptionLabel,
		onChange: () => undefined,
		tree: exampleTree,
	};

	return <TreeSelect { ...props } />;
};

export const loading = () => {
	const label = text( 'label', 'Parent page' );
	const noOptionLabel = text( 'noOptionLabel', 'No parent page' );
	const loadingText = text( 'loadingText', 'Loading...' );

	const props = {
		label,
		noOptionLabel,
		loadingText,
	};

	return <ParentPageTreeSelectExample { ...props } />;
};

const Container = styled.div`
	max-width: 500px;
	padding: 20px;
`;
const ButtonWrapper = styled.div`
	margin-bottom: 20px;
`;
