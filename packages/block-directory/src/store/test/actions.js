/**
 * WordPress dependencies
 */
import * as BlockFunctions from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	downloadBlock,
	installBlock,
} from '../actions';
import * as Controls from '../controls';

const ACTIONS = {
	apiFetch: 'API_FETCH',
	addInstalledBlockType: 'ADD_INSTALLED_BLOCK_TYPE',
	removeInstalledBlockType: 'REMOVE_INSTALLED_BLOCK_TYPE',
	fetchInstallBlock: 'FETCH_INSTALL_BLOCK',
	receiveInstallBlock: 'RECEIVE_INSTALL_BLOCKS',
};

jest.mock( '@wordpress/blocks' );

describe( 'actions', () => {
	const item = { id: 'block/block', name: 'Test Block' };
	const blockPlugin = {
		assets: [ 'http://www.wordpress.org/plugins/fakeasset.js' ],
	};
	const getBlockTypeMock = jest.spyOn( BlockFunctions, 'getBlockTypes' );
	jest.spyOn( Controls, 'apiFetch' );
	jest.spyOn( Controls, 'loadAssets' );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	afterAll( () => {
		jest.resetAllMocks();
	} );

	const testApiFetch = ( generator ) => {
		return expect(
			generator.next( { success: true } ).value.type,
		).toEqual( ACTIONS.apiFetch );
	};

	const testInstallFetch = ( generator ) => {
		expect(
			generator.next().value.type,
		).toEqual( ACTIONS.fetchInstallBlock );
	};

	const expectTest = ( hasCall, noCall ) => {
		expect( hasCall.mock.calls.length ).toBe( 1 );
		expect( noCall.mock.calls.length ).toBe( 0 );
	};

	const expectSuccess = ( onSuccess, onError ) => {
		expectTest( onSuccess, onError );
	};

	const expectError = ( onSuccess, onError ) => {
		expectTest( onError, onSuccess );
	};

	describe( 'downloadBlock', () => {
		it( 'should throw error if the plugin has no assets', () => {
			const onSuccess = jest.fn();
			const onError = jest.fn();

			const generator = downloadBlock( {
				assets: [],
			}, onSuccess, onError );

			// Trigger the check of whether the block plugin has assets
			generator.next();

			expectError( onSuccess, onError );
		} );

		it( 'should call on success function', () => {
			const onSuccess = jest.fn();
			const onError = jest.fn();

			// The block is registered
			getBlockTypeMock.mockReturnValue( [ item ] );

			const generator = downloadBlock( blockPlugin, onSuccess, onError );

			// Trigger the loading of assets
			generator.next();

			// Trigger the block check via getBlockTypes
			generator.next();

			expectSuccess( onSuccess, onError );
		} );

		it( 'should call on error when no blocks are returned', () => {
			const onSuccess = jest.fn();
			const onError = jest.fn();

			// The block is not registered
			getBlockTypeMock.mockReturnValue( [] );

			const generator = downloadBlock( blockPlugin, onSuccess, onError );

			// Trigger the loading of assets
			generator.next();

			// Trigger the block check via getBlockTypes
			generator.next();

			expectError( onSuccess, onError );
		} );
	} );

	describe( 'installBlock', () => {
		it( 'should install a block successfully', () => {
			const onSuccess = jest.fn();
			const onError = jest.fn();

			const generator = installBlock( item, onSuccess, onError );

			// It triggers FETCH_INSTALL_BLOCK
			testInstallFetch( generator );

			// It triggers API_FETCH that wraps @wordpress/api-fetch
			testApiFetch( generator );

			// It triggers ADD_INSTALLED_BLOCK_TYPE
			expect(
				generator.next( { success: true } ).value.type,
			).toEqual( ACTIONS.addInstalledBlockType );

			// It triggers RECEIVE_INSTALL_BLOCKS
			expect(
				generator.next().value.type,
			).toEqual( ACTIONS.receiveInstallBlock );

			expectSuccess( onSuccess, onError );
		} );

		it( 'should trigger error state when error is thrown', () => {
			const onSuccess = jest.fn();
			const onError = jest.fn();

			const generator = installBlock( item, onSuccess, onError );

			// It triggers FETCH_INSTALL_BLOCK
			testInstallFetch( generator );

			// It triggers API_FETCH that wraps @wordpress/api-fetch
			testApiFetch( generator );

			// Resolve fetch and make it fail
			generator.next( { success: false } );

			expectError( onSuccess, onError );
		} );
	} );
} );
