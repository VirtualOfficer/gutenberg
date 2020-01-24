/**
 * Internal dependencies
 */
import { getEntity } from '../entity-provider';

describe( 'getEntity', () => {
	it( 'should return a "root" context', () => {
		expect( getEntity() ).toHaveProperty( 'context' );
	} );
	it( 'should return a "kind" context', () => {
		expect( getEntity( 'root' ) ).toHaveProperty( 'context' );
	} );
	it( 'should return a "kind-type" context', () => {
		expect( getEntity( 'root', 'postType' ) ).toHaveProperty( 'context' );
	} );
} );
