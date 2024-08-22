/**
 * External dependencies
 */
import type { Meta, StoryObj } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Composite } from '..';

const meta: Meta< typeof Composite > = {
	title: 'Components/Composite (V2)',
	component: Composite,
	subcomponents: {
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.Group': Composite.Group,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.GroupLabel': Composite.GroupLabel,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.Row': Composite.Row,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.Item': Composite.Item,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.Hover': Composite.Hover,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Composite.Typeahead': Composite.Typeahead,
	},
	argTypes: {
		children: { control: { type: null } },
		render: { control: { type: null } },
		setActiveId: { control: { type: null } },
		focusLoop: {
			control: 'select',
			options: [ true, false, 'horizontal', 'vertical', 'both' ],
		},
		focusWrap: {
			control: 'select',
			options: [ true, false, 'horizontal', 'vertical', 'both' ],
		},
	},
	tags: [ 'status-private' ],
	parameters: {
		controls: { expanded: true },
		docs: {
			canvas: { sourceState: 'shown' },
		},
	},
	decorators: [
		( Story ) => {
			return (
				<>
					{ /* Visually style the active composite item  */ }
					<style>{ `
						[data-active-item] {
							background-color: #ffc0b5;
						}
					` }</style>
					<Story />
					<div
						style={ {
							marginTop: '2em',
							fontSize: '12px',
							fontStyle: 'italic',
						} }
					>
						{ /* eslint-disable-next-line no-restricted-syntax */ }
						<p id="list-title">Notes</p>
						<ul aria-labelledby="list-title">
							<li>
								The active composite item is highlighted with a
								different background color;
							</li>
							<li>
								A composite item can be the active item even
								when it doesn&apos;t have keyboard focus.
							</li>
						</ul>
					</div>
				</>
			);
		},
	],
};
export default meta;

export const Default: StoryObj< typeof Composite > = {
	args: {
		rtl: isRTL(),
		children: (
			<>
				<Composite.Item>Item one</Composite.Item>
				<Composite.Item>Item two</Composite.Item>
				<Composite.Item>Item three</Composite.Item>
			</>
		),
	},
};

export const Groups: StoryObj< typeof Composite > = {
	...Default,
	args: {
		children: (
			<>
				<Composite.Group>
					<Composite.GroupLabel>Group one</Composite.GroupLabel>
					<Composite.Item>Item 1.1</Composite.Item>
					<Composite.Item>Item 1.2</Composite.Item>
				</Composite.Group>
				<Composite.Group>
					<Composite.GroupLabel>Group two</Composite.GroupLabel>
					<Composite.Item>Item 2.1</Composite.Item>
					<Composite.Item>Item 2.1</Composite.Item>
				</Composite.Group>
			</>
		),
	},
};

export const Grid: StoryObj< typeof Composite > = {
	...Default,
	args: {
		role: 'grid',
		'aria-label': 'Composite',
		children: (
			<>
				<Composite.Row role="row">
					<Composite.Item role="gridcell">Item A1</Composite.Item>
					<Composite.Item role="gridcell">Item A2</Composite.Item>
					<Composite.Item role="gridcell">Item A3</Composite.Item>
				</Composite.Row>
				<Composite.Row role="row">
					<Composite.Item role="gridcell">Item B1</Composite.Item>
					<Composite.Item role="gridcell">Item B2</Composite.Item>
					<Composite.Item role="gridcell">Item B3</Composite.Item>
				</Composite.Row>
				<Composite.Row role="row">
					<Composite.Item role="gridcell">Item C1</Composite.Item>
					<Composite.Item role="gridcell">Item C2</Composite.Item>
					<Composite.Item role="gridcell">Item C3</Composite.Item>
				</Composite.Row>
			</>
		),
	},
};

export const Hover: StoryObj< typeof Composite > = {
	...Default,
	args: {
		children: (
			<>
				<Composite.Hover render={ <Composite.Item /> }>
					Hover item one
				</Composite.Hover>
				<Composite.Hover render={ <Composite.Item /> }>
					Hover item two
				</Composite.Hover>
				<Composite.Hover render={ <Composite.Item /> }>
					Hover item three
				</Composite.Hover>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story: 'Elements in the composite widget will receive focus on mouse move and lose focus to the composite base element on mouse leave.',
			},
		},
	},
};

export const Typeahead: StoryObj< typeof Composite > = {
	args: {
		render: <Composite.Typeahead />,
		children: (
			<>
				<Composite.Item>Apple</Composite.Item>
				<Composite.Item>Banana</Composite.Item>
				<Composite.Item>Peach</Composite.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story: 'When focus in on the composite widget, hitting printable character keys will move focus to the next composite item that begins with the input characters.',
			},
		},
	},
};

// TODO: example accessing the store

// TODO: example across SlotFill forwarding context
