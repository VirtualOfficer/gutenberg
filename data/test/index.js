/**
 * External dependencies
 */
import { render, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import {
	registerReducer,
	registerSelectors,
	registerActions,
	dispatch,
	select,
	query,
	subscribe,
} from '../';

describe( 'store', () => {
	it( 'Should append reducers to the state', () => {
		const reducer1 = () => 'chicken';
		const reducer2 = () => 'ribs';

		const store = registerReducer( 'red1', reducer1 );
		expect( store.getState() ).toEqual( 'chicken' );

		const store2 = registerReducer( 'red2', reducer2 );
		expect( store2.getState() ).toEqual( 'ribs' );
	} );
} );

describe( 'select', () => {
	it( 'registers multiple selectors to the public API', () => {
		const store = registerReducer( 'reducer1', () => 'state1' );
		const selector1 = jest.fn( () => 'result1' );
		const selector2 = jest.fn( () => 'result2' );

		registerSelectors( 'reducer1', {
			selector1,
			selector2,
		} );

		expect( select( 'reducer1' ).selector1() ).toEqual( 'result1' );
		expect( selector1 ).toBeCalledWith( store.getState() );

		expect( select( 'reducer1' ).selector2() ).toEqual( 'result2' );
		expect( selector2 ).toBeCalledWith( store.getState() );
	} );

	it( 'provides upgrade path for deprecated usage', () => {
		const store = registerReducer( 'reducer', () => 'state' );
		const selector = jest.fn( () => 'result' );

		registerSelectors( 'reducer', { selector } );

		expect( select( 'reducer', 'selector', 'arg' ) ).toEqual( 'result' );
		expect( selector ).toBeCalledWith( store.getState(), 'arg' );
		expect( console ).toHaveWarned();
	} );
} );

describe( 'query', () => {
	it( 'passes the relevant data to the component', () => {
		registerReducer( 'reactReducer', () => ( { reactKey: 'reactState' } ) );
		registerSelectors( 'reactReducer', {
			reactSelector: ( state, key ) => state[ key ],
		} );
		const Component = query( ( selectFunc, ownProps ) => {
			return {
				data: selectFunc( 'reactReducer' ).reactSelector( ownProps.keyName ),
			};
		} )( ( props ) => {
			return <div>{ props.data }</div>;
		} );

		const tree = render( <Component keyName="reactKey" /> );

		expect( tree ).toMatchSnapshot();
	} );

	it( 'passes the relevant actions to the component', () => {
		const store = registerReducer( 'reactCounter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + 1;
			}
			return state;
		} );
		const increment = () => ( { type: 'increment' } );
		registerActions( 'reactCounter', {
			increment,
		} );
		const Component = query( undefined, ( dispatchAction ) => ( {
			onClick: () => dispatchAction( 'reactCounter' ).increment(),
		} ) )( ( props ) => {
			return <button onClick={ props.onClick }>Increment</button>;
		} );

		const tree = mount( <Component keyName="reactKey" /> );
		const button = tree.find( 'button' );

		button.simulate( 'click' ); // state = 1
		button.simulate( 'click' ); // state = 2

		expect( store.getState() ).toBe( 2 );
	} );
} );

describe( 'subscribe', () => {
	it( 'registers multiple selectors to the public API', () => {
		let incrementedValue = null;
		const store = registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
		registerSelectors( 'myAwesomeReducer', {
			globalSelector: ( state ) => state,
		} );
		const unsubscribe = subscribe( () => {
			incrementedValue = select( 'myAwesomeReducer' ).globalSelector();
		} );
		const action = { type: 'dummy' };

		store.dispatch( action ); // increment the data by => data = 2
		expect( incrementedValue ).toBe( 2 );

		store.dispatch( action ); // increment the data by => data = 3
		expect( incrementedValue ).toBe( 3 );

		unsubscribe(); // Store subscribe to changes, the data variable stops upgrading.

		store.dispatch( action );
		store.dispatch( action );

		expect( incrementedValue ).toBe( 3 );
	} );
} );

describe( 'dispatch', () => {
	it( 'registers actions to the public API', () => {
		const store = registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + action.count;
			}
			return state;
		} );
		const increment = ( count = 1 ) => ( { type: 'increment', count } );
		registerActions( 'counter', {
			increment,
		} );

		dispatch( 'counter' ).increment(); // state = 1
		dispatch( 'counter' ).increment( 4 ); // state = 5
		expect( store.getState() ).toBe( 5 );
	} );
} );
