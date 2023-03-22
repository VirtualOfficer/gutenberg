/**
 * External dependencies
 */
import { act, renderHook } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';

/**
 * Internal dependencies
 */
import useKeyboardOffset from '../use-keyboard-offset';

describe( 'useKeyboardOffset', () => {
	beforeEach( () => {
		Keyboard.removeAllListeners( 'keyboardWillShow' );
		Keyboard.removeAllListeners( 'keyboardDidShow' );
		Keyboard.removeAllListeners( 'keyboardWillHide' );
	} );

	it( 'returns the initial state', () => {
		// Arrange
		const { result } = renderHook( () => useKeyboardOffset( true ) );
		const [ isKeyboardVisible, keyboardOffset ] = result.current;

		// Assert
		expect( isKeyboardVisible ).toBe( false );
		expect( keyboardOffset ).toBe( 0 );
	} );

	it( 'updates keyboard visibility and offset when the keyboard is shown', () => {
		// Arrange
		const { result } = renderHook( () => useKeyboardOffset( true ) );

		// Act
		act( () => {
			RCTDeviceEventEmitter.emit( 'keyboardWillShow' );
			RCTDeviceEventEmitter.emit( 'keyboardDidShow', {
				endCoordinates: { height: 250 },
			} );
		} );

		// Assert
		const [ isKeyboardVisible, keyboardOffset ] = result.current;
		expect( isKeyboardVisible ).toBe( true );
		expect( keyboardOffset ).toBe( 250 );
	} );

	it( 'updates keyboard visibility and offset when the keyboard is hidden', () => {
		// Arrange
		const { result } = renderHook( () => useKeyboardOffset( true ) );

		// Act
		act( () => {
			RCTDeviceEventEmitter.emit( 'keyboardWillShow' );
			RCTDeviceEventEmitter.emit( 'keyboardDidShow', {
				endCoordinates: { height: 250 },
			} );
		} );

		act( () => {
			RCTDeviceEventEmitter.emit( 'keyboardWillHide' );
		} );

		// Assert
		const [ isKeyboardVisible, keyboardOffset ] = result.current;
		expect( isKeyboardVisible ).toBe( false );
		expect( keyboardOffset ).toBe( 0 );
	} );
} );
