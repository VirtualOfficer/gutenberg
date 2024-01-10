/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { shortcutAriaLabel } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import Tooltip from '..';
import Button from '../../button';

const meta: Meta< typeof Tooltip > = {
	title: 'Components/Tooltip',
	component: Tooltip,
	argTypes: {
		children: { control: { type: null } },
		position: {
			control: { type: 'select' },
			options: [
				'top left',
				'top center',
				'top right',
				'bottom left',
				'bottom center',
				'bottom right',
			],
		},
		shortcut: { control: { type: 'object' } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof Tooltip > = ( props ) => (
	<Tooltip { ...props } />
);

export const Default: StoryFn< typeof Tooltip > = Template.bind( {} );
Default.args = {
	children: <Button variant="primary">Tooltip Anchor</Button>,
	text: 'Tooltip Text',
};

export const KeyboardShortcut = Template.bind( {} );
KeyboardShortcut.args = {
	children: <Button variant="secondary">Keyboard Shortcut</Button>,
	shortcut: {
		display: '⇧⌘,',
		ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
	},
};

/**
 * Nested `Tooltip` components simply ignore the tooltip part, and only
 */
export const Nested: StoryFn< typeof Tooltip > = Template.bind( {} );
Nested.args = {
	children: (
		<Tooltip text="Nested tooltip text (that will never show)">
			<Button variant="primary">Tooltip Anchor</Button>
		</Tooltip>
	),
	text: 'Outer tooltip text',
};
