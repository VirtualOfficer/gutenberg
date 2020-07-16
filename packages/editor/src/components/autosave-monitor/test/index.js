/**
 * External dependencies
 */
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { AutosaveMonitor } from '../';

const mockScheduleSave = jest.fn();
const mockCancelSave = jest.fn();
jest.mock( '../use-throttle', () => {
	return () => ( {
		scheduleSave: () => mockScheduleSave(),
		cancelSave: () => mockCancelSave(),
	} );
} );

describe( 'AutosaveMonitor', () => {
	beforeEach( () => {
		mockScheduleSave.mockClear();
		mockCancelSave.mockClear();
	} );

	it( 'should schedule an autosave when dirty and saveable on initial render', () => {
		render( <AutosaveMonitor isDirty={ true } isAutosaveable={ true } /> );
		expect( mockCancelSave ).toHaveBeenCalledTimes( 0 );
		expect( mockScheduleSave ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should schedule autosave when having become dirty and saveable', async () => {
		render( <AutosaveMonitor isDirty={ true } isAutosaveable={ true } /> );
		expect( mockScheduleSave ).toHaveBeenCalledTimes( 1 );
		expect( mockCancelSave ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should stop autosave timer when the autosave is up to date', () => {
		render( <AutosaveMonitor isDirty={ false } isAutosaveable={ true } /> );

		expect( mockScheduleSave ).toHaveBeenCalledTimes( 0 );
		expect( mockCancelSave ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should stop autosave timer when having become dirty but not autosaveable', () => {
		render( <AutosaveMonitor isDirty={ true } isAutosaveable={ false } /> );

		expect( mockScheduleSave ).toHaveBeenCalledTimes( 0 );
		expect( mockCancelSave ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should stop autosave timer when having become not dirty', () => {
		const { rerender } = render(
			<AutosaveMonitor isDirty={ true } isAutosaveable={ true } />
		);
		rerender(
			<AutosaveMonitor isDirty={ false } isAutosaveable={ true } />
		);

		expect( mockCancelSave ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should stop autosave timer when having become not autosaveable', () => {
		const { rerender } = render(
			<AutosaveMonitor isDirty={ true } isAutosaveable={ true } />
		);
		rerender(
			<AutosaveMonitor isDirty={ true } isAutosaveable={ false } />
		);

		expect( mockCancelSave ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render nothing', () => {
		const { container } = render( <AutosaveMonitor /> );
		expect( container.childElementCount ).toBe( 0 );
	} );
} );
