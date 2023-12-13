/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import {
	Composite as ReakitComposite,
	CompositeGroup as ReakitCompositeGroup,
	CompositeItem as ReakitCompositeItem,
	useCompositeState as ReakitUseCompositeState,
} from '..';

const COMPOSITE_SUITES = {
	reakit: {
		Composite: ReakitComposite,
		CompositeGroup: ReakitCompositeGroup,
		CompositeItem: ReakitCompositeItem,
		useCompositeState: ReakitUseCompositeState,
	},
};

type InitialState = Parameters< typeof ReakitUseCompositeState >[ 0 ];

// It was decided not to test the full API, instead opting
// to cover basic usage, with a view to adding broader support
// for the original API should the need arise. As such we are
// only testing here for standard usage.
// See https://github.com/WordPress/gutenberg/pull/56645

describe.each( Object.entries( COMPOSITE_SUITES ) )(
	'Validate %s implementation',
	( _, { Composite, CompositeGroup, CompositeItem, useCompositeState } ) => {
		function useSpreadProps( initialState?: InitialState ) {
			return useCompositeState( initialState );
		}

		function useStateProps( initialState?: InitialState ) {
			return {
				state: useCompositeState( initialState ),
			};
		}

		function useCustomProps( initialState?: InitialState ) {
			const state = useCompositeState( initialState );
			const { up, down, previous, next, move } = state;

			return {
				...state,
				up: jest.fn( up ),
				down: jest.fn( down ),
				previous: jest.fn( previous ),
				next: jest.fn( next ),
				move: jest.fn( move ),
			};
		}

		describe.each( [
			[ 'With "spread" state', useSpreadProps ],
			[ 'With `state` prop', useStateProps ],
			[ 'With custom props', useCustomProps ],
		] )( '%s', ( __, useProps ) => {
			function OneDimensionalTest( initialState?: InitialState ) {
				const props = useProps( initialState );
				return (
					<Composite { ...props } aria-label="composite">
						<CompositeItem { ...props }>Item 1</CompositeItem>
						<CompositeItem { ...props }>Item 2</CompositeItem>
						<CompositeItem { ...props }>Item 3</CompositeItem>
					</Composite>
				);
			}

			function getOneDimensionalItems() {
				return {
					item1: screen.getByText( 'Item 1' ),
					item2: screen.getByText( 'Item 2' ),
					item3: screen.getByText( 'Item 3' ),
				};
			}

			function initialiseOneDimensionalTest(
				initialState?: InitialState
			) {
				render( <OneDimensionalTest { ...initialState } /> );
				return getOneDimensionalItems();
			}

			function TwoDimensionalTest( initialState?: InitialState ) {
				const props = useProps( initialState );

				return (
					<Composite { ...props } aria-label="composite">
						<CompositeGroup { ...props }>
							<CompositeItem { ...props }>Item A1</CompositeItem>
							<CompositeItem { ...props }>Item A2</CompositeItem>
							<CompositeItem { ...props }>Item A3</CompositeItem>
						</CompositeGroup>
						<CompositeGroup { ...props }>
							<CompositeItem { ...props }>Item B1</CompositeItem>
							<CompositeItem { ...props }>Item B2</CompositeItem>
							<CompositeItem { ...props }>Item B3</CompositeItem>
						</CompositeGroup>
						<CompositeGroup { ...props }>
							<CompositeItem { ...props }>Item C1</CompositeItem>
							<CompositeItem { ...props }>Item C2</CompositeItem>
							<CompositeItem { ...props }>Item C3</CompositeItem>
						</CompositeGroup>
					</Composite>
				);
			}

			function getTwoDimensionalItems() {
				return {
					itemA1: screen.getByText( 'Item A1' ),
					itemA2: screen.getByText( 'Item A2' ),
					itemA3: screen.getByText( 'Item A3' ),
					itemB1: screen.getByText( 'Item B1' ),
					itemB2: screen.getByText( 'Item B2' ),
					itemB3: screen.getByText( 'Item B3' ),
					itemC1: screen.getByText( 'Item C1' ),
					itemC2: screen.getByText( 'Item C2' ),
					itemC3: screen.getByText( 'Item C3' ),
				};
			}

			function initialiseTwoDimensionalTest(
				initialState?: InitialState
			) {
				render( <TwoDimensionalTest { ...initialState } /> );
				return getTwoDimensionalItems();
			}

			function initialiseShiftTest( shift: boolean ) {
				const Test = () => {
					const props = useProps( { shift } );

					return (
						<Composite { ...props } aria-label="composite">
							<CompositeGroup { ...props }>
								<CompositeItem { ...props }>
									Item A1
								</CompositeItem>
							</CompositeGroup>
							<CompositeGroup { ...props }>
								<CompositeItem { ...props }>
									Item B1
								</CompositeItem>
								<CompositeItem { ...props }>
									Item B2
								</CompositeItem>
							</CompositeGroup>
							<CompositeGroup { ...props }>
								<CompositeItem { ...props }>
									Item C1
								</CompositeItem>
								<CompositeItem { ...props } disabled>
									Item C2
								</CompositeItem>
							</CompositeGroup>
						</Composite>
					);
				};
				render( <Test /> );
				return {
					itemA1: screen.getByText( 'Item A1' ),
					itemB1: screen.getByText( 'Item B1' ),
					itemB2: screen.getByText( 'Item B2' ),
					itemC1: screen.getByText( 'Item C1' ),
					itemC2: screen.getByText( 'Item C2' ),
				};
			}

			test( 'Renders as a single tab stop', async () => {
				const user = userEvent.setup();
				const Test = () => (
					<>
						<button>Before</button>
						<OneDimensionalTest />
						<button>After</button>
					</>
				);
				render( <Test /> );

				await user.tab();
				expect( screen.getByText( 'Before' ) ).toHaveFocus();
				await user.tab();
				expect( screen.getByText( 'Item 1' ) ).toHaveFocus();
				await user.tab();
				expect( screen.getByText( 'After' ) ).toHaveFocus();
				await user.tab( { shift: true } );
				expect( screen.getByText( 'Item 1' ) ).toHaveFocus();
			} );

			test( 'Excludes disabled items', async () => {
				const user = userEvent.setup();
				const Test = () => {
					const props = useProps();
					return (
						<Composite { ...props } aria-label="composite">
							<CompositeItem { ...props }>Item 1</CompositeItem>
							<CompositeItem { ...props } disabled>
								Item 2
							</CompositeItem>
							<CompositeItem { ...props }>Item 3</CompositeItem>
						</Composite>
					);
				};
				render( <Test /> );

				const { item1, item2, item3 } = getOneDimensionalItems();

				expect( item2 ).toBeDisabled();

				await user.tab();
				expect( item1 ).toHaveFocus();
				await user.keyboard( '[ArrowDown]' );
				expect( item2 ).not.toHaveFocus();
				expect( item3 ).toHaveFocus();
			} );

			test( 'Includes focusable disabled items', async () => {
				const user = userEvent.setup();
				const Test = () => {
					const props = useProps();
					return (
						<Composite { ...props } aria-label="composite">
							<CompositeItem { ...props }>Item 1</CompositeItem>
							<CompositeItem { ...props } disabled focusable>
								Item 2
							</CompositeItem>
							<CompositeItem { ...props }>Item 3</CompositeItem>
						</Composite>
					);
				};
				render( <Test /> );
				const { item1, item2, item3 } = getOneDimensionalItems();

				expect( item2 ).toBeEnabled();
				expect( item2 ).toHaveAttribute( 'aria-disabled', 'true' );

				await user.tab();
				expect( item1 ).toHaveFocus();
				await user.keyboard( '[ArrowDown]' );
				expect( item2 ).toHaveFocus();
				expect( item3 ).not.toHaveFocus();
			} );

			describe( 'In one dimension', () => {
				test( 'All directions work with no orientation', async () => {
					const user = userEvent.setup();
					const { item1, item2, item3 } =
						initialiseOneDimensionalTest();

					await user.tab();
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[End]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[Home]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[PageDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[PageUp]' );
					expect( item1 ).toHaveFocus();
				} );

				test( 'Only left/right work with horizontal orientation', async () => {
					const user = userEvent.setup();
					const { item1, item2, item3 } =
						initialiseOneDimensionalTest( {
							orientation: 'horizontal',
						} );

					await user.tab();
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[End]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[Home]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[PageDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[PageUp]' );
					expect( item1 ).toHaveFocus();
				} );

				test( 'Only up/down work with vertical orientation', async () => {
					const user = userEvent.setup();
					const { item1, item2, item3 } =
						initialiseOneDimensionalTest( {
							orientation: 'vertical',
						} );

					await user.tab();
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[End]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[Home]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[PageDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[PageUp]' );
					expect( item1 ).toHaveFocus();
				} );

				test( 'Focus wraps with loop enabled', async () => {
					const user = userEvent.setup();
					const { item1, item2, item3 } =
						initialiseOneDimensionalTest( {
							loop: true,
						} );

					await user.tab();
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item2 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( item3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( item1 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( item3 ).toHaveFocus();
				} );
			} );

			describe( 'In two dimensions', () => {
				test( 'All directions work as standard', async () => {
					const user = userEvent.setup();
					const {
						itemA1,
						itemA2,
						itemA3,
						itemB1,
						itemB2,
						itemC1,
						itemC3,
					} = initialiseTwoDimensionalTest();

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemB2 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( itemA2 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[End]' );
					expect( itemA3 ).toHaveFocus();
					await user.keyboard( '[PageDown]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[Home]' );
					expect( itemC1 ).toHaveFocus();
					await user.keyboard( '[PageUp]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '{Control>}[End]{/Control}' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '{Control>}[Home]{/Control}' );
					expect( itemA1 ).toHaveFocus();
				} );

				test( 'Focus wraps around rows/columns with loop enabled', async () => {
					const user = userEvent.setup();
					const { itemA1, itemA2, itemA3, itemB1, itemC1, itemC3 } =
						initialiseTwoDimensionalTest( { loop: true } );

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA2 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemC1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemA3 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( itemC3 ).toHaveFocus();
				} );

				test( 'Focus moves between rows/columns with wrap enabled', async () => {
					const user = userEvent.setup();
					const { itemA1, itemA2, itemA3, itemB1, itemC1, itemC3 } =
						initialiseTwoDimensionalTest( { wrap: true } );

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA2 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemC1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemA2 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '{Control>}[End]{/Control}' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemC3 ).toHaveFocus();
				} );

				test( 'Focus wraps around start/end with loop and wrap enabled', async () => {
					const user = userEvent.setup();
					const { itemA1, itemC3 } = initialiseTwoDimensionalTest( {
						loop: true,
						wrap: true,
					} );

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowLeft]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					expect( itemC3 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemA1 ).toHaveFocus();
				} );

				test( 'Focus shifts if vertical neighbour unavailable when shift enabled', async () => {
					const user = userEvent.setup();
					const { itemA1, itemB1, itemB2, itemC1 } =
						initialiseShiftTest( true );

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemB2 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					// A2 doesn't exist
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemB2 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					// C2 is disabled
					expect( itemC1 ).toHaveFocus();
				} );

				test( 'Focus does not shift if vertical neighbour unavailable when shift not enabled', async () => {
					const user = userEvent.setup();
					const { itemA1, itemB1, itemB2 } =
						initialiseShiftTest( false );

					await user.tab();
					expect( itemA1 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					expect( itemB1 ).toHaveFocus();
					await user.keyboard( '[ArrowRight]' );
					expect( itemB2 ).toHaveFocus();
					await user.keyboard( '[ArrowUp]' );
					// A2 doesn't exist
					expect( itemB2 ).toHaveFocus();
					await user.keyboard( '[ArrowDown]' );
					// C2 is disabled
					expect( itemB2 ).toHaveFocus();
				} );
			} );
		} );
	}
);
