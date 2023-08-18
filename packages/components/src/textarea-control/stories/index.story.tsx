/**
 * External dependencies
 */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TextareaControl from '..';

const meta: ComponentMeta< typeof TextareaControl > = {
	component: TextareaControl,
	title: 'Components/TextareaControl',
	argTypes: {
		onChange: { action: 'onChange' },
		label: { control: { type: 'text' } },
		help: { control: { type: 'text' } },
		value: { control: { type: null } },
	},
	parameters: {
		controls: {
			expanded: true,
		},
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: ComponentStory< typeof TextareaControl > = ( {
	onChange,
	...args
} ) => {
	const [ value, setValue ] = useState( '' );

	return (
		<TextareaControl
			{ ...args }
			value={ value }
			onChange={ ( v ) => {
				setValue( v );
				onChange( v );
			} }
		/>
	);
};

export const Default: ComponentStory< typeof TextareaControl > = Template.bind(
	{}
);
Default.args = {
	label: 'Text',
	help: 'Enter some text',
};
