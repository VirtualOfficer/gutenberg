/**
 * External dependencies
 */
import type { ReactNode, ForwardedRef, ComponentPropsWithoutRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	NavigatorProvider,
	NavigatorScreen,
	NavigatorButton,
	NavigatorBackButton,
} from '..';

jest.mock( 'framer-motion', () => {
	const actual = jest.requireActual( 'framer-motion' );
	return {
		__esModule: true,
		...actual,
		AnimatePresence:
			( { children }: { children?: ReactNode } ) =>
			() =>
				<div>{ children }</div>,
		motion: {
			...actual.motion,
			div: require( 'react' ).forwardRef(
				(
					{ children }: { children?: ReactNode },
					ref: ForwardedRef< HTMLDivElement >
				) => <div ref={ ref }>{ children }</div>
			),
		},
	};
} );

const INVALID_HTML_ATTRIBUTE = {
	raw: ' "\'><=invalid_path',
	escaped: " &quot;'&gt;<=invalid_path",
};

const PATHS = {
	HOME: '/',
	CHILD: '/child',
	NESTED: '/child/nested',
	INVALID_HTML_ATTRIBUTE: INVALID_HTML_ATTRIBUTE.raw,
	NOT_FOUND: '/not-found',
};

type CustomTestOnClickHandler = (
	args:
		| {
				type: 'goTo';
				path: string;
		  }
		| { type: 'goBack' }
) => void;

function CustomNavigatorButton( {
	path,
	onClick,
	...props
}: Omit< ComponentPropsWithoutRef< typeof NavigatorButton >, 'onClick' > & {
	onClick?: CustomTestOnClickHandler;
} ) {
	return (
		<NavigatorButton
			onClick={ () => {
				// Used to spy on the values passed to `navigator.goTo`.
				onClick?.( { type: 'goTo', path } );
			} }
			path={ path }
			{ ...props }
		/>
	);
}

function CustomNavigatorButtonWithFocusRestoration( {
	path,
	onClick,
	...props
}: Omit< ComponentPropsWithoutRef< typeof NavigatorButton >, 'onClick' > & {
	onClick?: CustomTestOnClickHandler;
} ) {
	return (
		<NavigatorButton
			onClick={ () => {
				// Used to spy on the values passed to `navigator.goTo`.
				onClick?.( { type: 'goTo', path } );
			} }
			path={ path }
			{ ...props }
		/>
	);
}

function CustomNavigatorBackButton( {
	onClick,
	...props
}: Omit< ComponentPropsWithoutRef< typeof NavigatorBackButton >, 'onClick' > & {
	onClick?: CustomTestOnClickHandler;
} ) {
	return (
		<NavigatorBackButton
			onClick={ () => {
				// Used to spy on the values passed to `navigator.goBack`.
				onClick?.( { type: 'goBack' } );
			} }
			{ ...props }
		/>
	);
}

const MyNavigation = ( {
	initialPath = PATHS.HOME,
	onNavigatorButtonClick,
}: {
	initialPath?: string;
	onNavigatorButtonClick?: CustomTestOnClickHandler;
} ) => {
	const [ inputValue, setInputValue ] = useState( '' );
	return (
		<NavigatorProvider initialPath={ initialPath }>
			<NavigatorScreen path={ PATHS.HOME }>
				<p>This is the home screen.</p>
				<CustomNavigatorButton
					path={ PATHS.NOT_FOUND }
					onClick={ onNavigatorButtonClick }
				>
					Navigate to non-existing screen.
				</CustomNavigatorButton>
				<CustomNavigatorButton
					path={ PATHS.CHILD }
					onClick={ onNavigatorButtonClick }
				>
					Navigate to child screen.
				</CustomNavigatorButton>
				<CustomNavigatorButton
					path={ PATHS.INVALID_HTML_ATTRIBUTE }
					onClick={ onNavigatorButtonClick }
				>
					Navigate to screen with an invalid HTML value as a path.
				</CustomNavigatorButton>
			</NavigatorScreen>

			<NavigatorScreen path={ PATHS.CHILD }>
				<p>This is the child screen.</p>
				<CustomNavigatorButtonWithFocusRestoration
					path={ PATHS.NESTED }
					onClick={ onNavigatorButtonClick }
				>
					Navigate to nested screen.
				</CustomNavigatorButtonWithFocusRestoration>
				<CustomNavigatorBackButton onClick={ onNavigatorButtonClick }>
					Go back
				</CustomNavigatorBackButton>

				<label htmlFor="test-input">This is a test input</label>
				<input
					name="test-input"
					// eslint-disable-next-line no-restricted-syntax
					id="test-input"
					onChange={ ( e ) => {
						setInputValue( e.target.value );
					} }
					value={ inputValue }
				/>
			</NavigatorScreen>

			<NavigatorScreen path={ PATHS.NESTED }>
				<p>This is the nested screen.</p>
				<CustomNavigatorBackButton onClick={ onNavigatorButtonClick }>
					Go back
				</CustomNavigatorBackButton>
			</NavigatorScreen>

			<NavigatorScreen path={ PATHS.INVALID_HTML_ATTRIBUTE }>
				<p>This is the screen with an invalid HTML value as a path.</p>
				<CustomNavigatorBackButton onClick={ onNavigatorButtonClick }>
					Go back
				</CustomNavigatorBackButton>
			</NavigatorScreen>

			{ /* A `NavigatorScreen` with `path={ PATHS.NOT_FOUND }` is purposefully not included. */ }
		</NavigatorProvider>
	);
};

type HelperGetterOptions = {
	throwIfNotFound?: boolean;
};
const getNavigationScreenByText = (
	text: string,
	{ throwIfNotFound = true }: HelperGetterOptions = {}
) => {
	const fnName = throwIfNotFound ? 'getByText' : 'queryByText';
	return screen[ fnName ]( text );
};
const getHomeScreen = ( { throwIfNotFound }: HelperGetterOptions = {} ) =>
	getNavigationScreenByText( 'This is the home screen.', {
		throwIfNotFound,
	} );
const getChildScreen = ( { throwIfNotFound }: HelperGetterOptions = {} ) =>
	getNavigationScreenByText( 'This is the child screen.', {
		throwIfNotFound,
	} );
const getNestedScreen = ( { throwIfNotFound }: HelperGetterOptions = {} ) =>
	getNavigationScreenByText( 'This is the nested screen.', {
		throwIfNotFound,
	} );
const getInvalidHTMLPathScreen = ( {
	throwIfNotFound,
}: HelperGetterOptions = {} ) =>
	getNavigationScreenByText(
		'This is the screen with an invalid HTML value as a path.',
		{
			throwIfNotFound,
		}
	);

const getNavigationButtonByText = (
	text: string,
	{ throwIfNotFound = true }: HelperGetterOptions = {}
) => {
	const fnName = throwIfNotFound ? 'getByRole' : 'queryByRole';
	return screen[ fnName ]( 'button', { name: text } );
};
const getToNonExistingScreenButton = ( {
	throwIfNotFound,
}: HelperGetterOptions = {} ) =>
	getNavigationButtonByText( 'Navigate to non-existing screen.', {
		throwIfNotFound,
	} );
const getToChildScreenButton = ( {
	throwIfNotFound,
}: HelperGetterOptions = {} ) =>
	getNavigationButtonByText( 'Navigate to child screen.', {
		throwIfNotFound,
	} );
const getToNestedScreenButton = ( {
	throwIfNotFound,
}: HelperGetterOptions = {} ) =>
	getNavigationButtonByText( 'Navigate to nested screen.', {
		throwIfNotFound,
	} );
const getToInvalidHTMLPathScreenButton = ( {
	throwIfNotFound,
}: HelperGetterOptions = {} ) =>
	getNavigationButtonByText(
		'Navigate to screen with an invalid HTML value as a path.',
		{
			throwIfNotFound,
		}
	);
const getBackButton = ( { throwIfNotFound }: HelperGetterOptions = {} ) =>
	getNavigationButtonByText( 'Go back', {
		throwIfNotFound,
	} );

describe( 'Navigator', () => {
	const originalGetClientRects = window.Element.prototype.getClientRects;

	// `getClientRects` needs to be mocked so that `isVisible` from the `@wordpress/dom`
	// `focusable` module can pass, in a JSDOM env where the DOM elements have no width/height.
	const mockedGetClientRects = jest.fn( () => [
		{
			x: 0,
			y: 0,
			width: 100,
			height: 100,
		},
	] );

	beforeAll( () => {
		// @ts-expect-error There's no need for an exact mock, this is just needed
		// for the tests to pass (see `mockedGetClientRects` inline comments).
		window.Element.prototype.getClientRects =
			jest.fn( mockedGetClientRects );
	} );

	afterAll( () => {
		window.Element.prototype.getClientRects = originalGetClientRects;
	} );

	it( 'should render', () => {
		render( <MyNavigation /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect(
			getChildScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
	} );

	it( 'should show a different screen on the first render depending on the value of `initialPath`', () => {
		render( <MyNavigation initialPath={ PATHS.CHILD } /> );

		expect(
			getHomeScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect( getChildScreen() ).toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
	} );

	it( 'should ignore changes to `initialPath` after the first render', () => {
		const { rerender } = render( <MyNavigation /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect(
			getChildScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();

		rerender( <MyNavigation initialPath={ PATHS.CHILD } /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect(
			getChildScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
	} );

	it( 'should not rended anything if the `initialPath` does not match any available screen', () => {
		render( <MyNavigation initialPath={ PATHS.NOT_FOUND } /> );

		expect(
			getHomeScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getChildScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
	} );

	it( 'should navigate across screens', () => {
		const spy = jest.fn();

		render( <MyNavigation onNavigatorButtonClick={ spy } /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToChildScreenButton() ).toBeInTheDocument();

		// Navigate to child screen.
		fireEvent.click( getToChildScreenButton() );

		expect( getChildScreen() ).toBeInTheDocument();
		expect( getBackButton() ).toBeInTheDocument();

		// Navigate back to home screen.
		fireEvent.click( getBackButton() );
		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToChildScreenButton() ).toBeInTheDocument();

		// Navigate again to child screen.
		fireEvent.click( getToChildScreenButton() );

		expect( getChildScreen() ).toBeInTheDocument();
		expect( getToNestedScreenButton() ).toBeInTheDocument();

		// Navigate to nested screen.
		fireEvent.click( getToNestedScreenButton() );

		expect( getNestedScreen() ).toBeInTheDocument();
		expect( getBackButton() ).toBeInTheDocument();

		// Navigate back to child screen.
		fireEvent.click( getBackButton() );

		expect( getChildScreen() ).toBeInTheDocument();
		expect( getToNestedScreenButton() ).toBeInTheDocument();

		// Navigate back to home screen.
		fireEvent.click( getBackButton() );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToChildScreenButton() ).toBeInTheDocument();

		// Check the values passed to `navigator.goTo()`.
		expect( spy ).toHaveBeenCalledTimes( 6 );
		expect( spy ).toHaveBeenNthCalledWith( 1, {
			path: PATHS.CHILD,
			type: 'goTo',
		} );
		expect( spy ).toHaveBeenNthCalledWith( 2, {
			type: 'goBack',
		} );
		expect( spy ).toHaveBeenNthCalledWith( 3, {
			path: PATHS.CHILD,
			type: 'goTo',
		} );
		expect( spy ).toHaveBeenNthCalledWith( 4, {
			path: PATHS.NESTED,
			type: 'goTo',
		} );
		expect( spy ).toHaveBeenNthCalledWith( 5, {
			type: 'goBack',
		} );
		expect( spy ).toHaveBeenNthCalledWith( 6, {
			type: 'goBack',
		} );
	} );

	it( 'should not rended anything if the path does not match any available screen', () => {
		const spy = jest.fn();

		render( <MyNavigation onNavigatorButtonClick={ spy } /> );

		expect( getToNonExistingScreenButton() ).toBeInTheDocument();

		// Attempt to navigate to non-existing screen. No screens get rendered.
		fireEvent.click( getToNonExistingScreenButton() );

		expect(
			getHomeScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getChildScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();
		expect(
			getNestedScreen( { throwIfNotFound: false } )
		).not.toBeInTheDocument();

		// Check the values passed to `navigator.goTo()`.
		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( spy ).toHaveBeenNthCalledWith( 1, {
			path: PATHS.NOT_FOUND,
			type: 'goTo',
		} );
	} );

	it( 'should restore focus correctly', () => {
		render( <MyNavigation /> );

		expect( getHomeScreen() ).toBeInTheDocument();

		// Navigate to child screen.
		fireEvent.click( getToChildScreenButton() );

		expect( getChildScreen() ).toBeInTheDocument();

		// Navigate to nested screen.
		fireEvent.click( getToNestedScreenButton() );

		expect( getNestedScreen() ).toBeInTheDocument();

		// Navigate back to child screen, check that focus was correctly restored.
		fireEvent.click( getBackButton() );

		expect( getChildScreen() ).toBeInTheDocument();
		expect( getToNestedScreenButton() ).toHaveFocus();

		// Navigate back to home screen, check that focus was correctly restored.
		fireEvent.click( getBackButton() );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToChildScreenButton() ).toHaveFocus();
	} );

	it( 'should escape the value of the `path` prop', () => {
		render( <MyNavigation /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToInvalidHTMLPathScreenButton() ).toBeInTheDocument();

		// The following line tests the implementation details, but it's necessary
		// as this would be otherwise transparent to the user.
		expect( getToInvalidHTMLPathScreenButton() ).toHaveAttribute(
			'id',
			INVALID_HTML_ATTRIBUTE.escaped
		);

		// Navigate to screen with an invalid HTML value for its `path`.
		fireEvent.click( getToInvalidHTMLPathScreenButton() );

		expect( getInvalidHTMLPathScreen() ).toBeInTheDocument();
		expect( getBackButton() ).toBeInTheDocument();

		// Navigate back to home screen, check that the focus restoration selector
		// worked correctly despite the escaping.
		fireEvent.click( getBackButton() );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToInvalidHTMLPathScreenButton() ).toHaveFocus();
	} );

	it( 'should keep focus on the element that is being interacted with, while re-rendering', async () => {
		const user = userEvent.setup( {
			advanceTimers: jest.advanceTimersByTime,
		} );

		render( <MyNavigation /> );

		expect( getHomeScreen() ).toBeInTheDocument();
		expect( getToChildScreenButton() ).toBeInTheDocument();

		// Navigate to child screen.
		await user.click( getToChildScreenButton() );

		expect( getChildScreen() ).toBeInTheDocument();
		expect( getBackButton() ).toBeInTheDocument();
		expect( getToNestedScreenButton() ).toHaveFocus();

		// Interact with the input, the focus should stay on the input element.
		const input = screen.getByLabelText( 'This is a test input' );
		await user.type( input, 'd' );
		expect( input ).toHaveFocus();
	} );
} );
