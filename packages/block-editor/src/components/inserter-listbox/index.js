/**
 * WordPress dependencies
 */
import { Composite } from '@wordpress/components';

/**
 * Internal dependencies
 */

export { default as InserterListboxGroup } from './group';
export { default as InserterListboxRow } from './row';
export { default as InserterListboxItem } from './item';

const useCompositeStore = Composite.useStore;

function InserterListbox( { children } ) {
	const store = useCompositeStore( {
		focusShift: true,
		focusWrap: 'horizontal',
	} );

	return (
		<Composite.Root store={ store } render={ <></> }>
			{ children }
		</Composite.Root>
	);
}

export default InserterListbox;
