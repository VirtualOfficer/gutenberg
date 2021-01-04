/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import items from './fixtures';
import BlocksTypesTab from '../blocks-types-tab';
import BlocksTypesList from '../../block-types-list';

jest.mock( '../../block-types-list' );
jest.mock( '@wordpress/data/src/components/use-select' );

const selectMock = {
	getInserterItems: jest.fn().mockReturnValue( [] ),
	canInsertBlockType: jest.fn(),
	getBlockType: jest.fn(),
	getClipboard: jest.fn(),
};

describe( 'BlocksTypesTab component', () => {
	beforeEach( () => {
		useSelect.mockImplementation( ( callback ) =>
			callback( () => selectMock )
		);
	} );

	it( 'renders without crashing', () => {
		const component = shallow(
			<BlocksTypesTab
				rootClientId={ 0 }
				onSelect={ jest.fn() }
				listProps={ {} }
			/>
		);
		expect( component ).toBeTruthy();
	} );

	it( 'shows block items', () => {
		selectMock.getInserterItems.mockReturnValue( items );

		const blockItems = items.filter(
			( { category } ) => category !== 'reusable'
		);
		const component = shallow(
			<BlocksTypesTab
				rootClientId={ 0 }
				onSelect={ jest.fn() }
				listProps={ {} }
			/>
		);
		expect( component.find( BlocksTypesList ).prop( 'items' ) ).toEqual(
			blockItems
		);
	} );
} );
