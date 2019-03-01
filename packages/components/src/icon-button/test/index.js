/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import TestUtils from 'react-dom/test-utils';

/**
 * WordPress dependencies
 */
import { createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import IconButton from '../';

describe( 'IconButton', () => {
	describe( 'basic rendering', () => {
		it( 'should render an top level element with only a class property', () => {
			const iconButton = shallow( <IconButton /> );
			expect( iconButton.hasClass( 'components-icon-button' ) ).toBe( true );
			expect( iconButton.prop( 'aria-label' ) ).toBeUndefined();
		} );

		it( 'should render a Dashicon component matching the wordpress icon', () => {
			const iconButton = shallow( <IconButton icon="wordpress" /> );
			expect( iconButton.find( 'Dashicon' ).shallow().hasClass( 'dashicons-wordpress' ) ).toBe( true );
		} );

		it( 'should render child elements when passed as children', () => {
			const iconButton = shallow( <IconButton children={ <p className="test">Test</p> } /> );
			expect( iconButton.find( '.test' ).shallow().text() ).toBe( 'Test' );
		} );

		it( 'should add an aria-label when the label property is used', () => {
			const iconButton = shallow( <IconButton label="WordPress">WordPress</IconButton> );
			expect( iconButton.name() ).toBe( 'ForwardRef(Button)' );
			expect( iconButton.prop( 'aria-label' ) ).toBe( 'WordPress' );
		} );

		it( 'should add an aria-label when the label property is used, with Tooltip wrapper', () => {
			const iconButton = shallow( <IconButton label="WordPress" /> );
			expect( iconButton.name() ).toBe( 'Tooltip' );
			expect( iconButton.prop( 'text' ) ).toBe( 'WordPress' );
			expect( iconButton.find( 'ForwardRef(Button)' ).prop( 'aria-label' ) ).toBe( 'WordPress' );
		} );

		it( 'should support explicit aria-label override', () => {
			const iconButton = shallow( <IconButton aria-label="Custom" /> );
			expect( iconButton.prop( 'aria-label' ) ).toBe( 'Custom' );
		} );

		it( 'should add an additional className', () => {
			const iconButton = shallow( <IconButton className="test" /> );
			expect( iconButton.hasClass( 'test' ) ).toBe( true );
		} );

		it( 'should pass additional props to the underlying button', () => {
			const iconButton = shallow( <IconButton disabled aria-pressed="true" /> );

			expect( iconButton.find( 'ForwardRef(Button)' ).prop( 'aria-pressed' ) ).toBe( 'true' );
			expect( iconButton.find( 'ForwardRef(Button)' ).prop( 'disabled' ) ).toBe( true );
		} );

		it( 'should allow custom tooltip text', () => {
			const iconButton = shallow( <IconButton label="WordPress" tooltip="Custom" /> );
			expect( iconButton.name() ).toBe( 'Tooltip' );
			expect( iconButton.prop( 'text' ) ).toBe( 'Custom' );
			expect( iconButton.find( 'ForwardRef(Button)' ).prop( 'aria-label' ) ).toBe( 'WordPress' );
		} );

		it( 'should allow tooltip disable', () => {
			const iconButton = shallow( <IconButton label="WordPress" tooltip={ false } /> );
			expect( iconButton.name() ).toBe( 'ForwardRef(Button)' );
			expect( iconButton.prop( 'aria-label' ) ).toBe( 'WordPress' );
		} );

		it( 'should show the tooltip for empty children', () => {
			const iconButton = shallow( <IconButton label="WordPress" children={ [] } /> );
			expect( iconButton.name() ).toBe( 'Tooltip' );
			expect( iconButton.prop( 'text' ) ).toBe( 'WordPress' );
		} );

		it( 'forwards ref', () => {
			const ref = createRef();

			TestUtils.renderIntoDocument( <IconButton ref={ ref } /> );
			expect( ref.current.type ).toBe( 'button' );
		} );
	} );
} );
