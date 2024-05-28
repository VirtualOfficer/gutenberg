/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';
import { action } from '@storybook/addon-actions';

/**
 * Internal dependencies
 */
import { TimeInput } from '../time-input';

const meta: Meta< typeof TimeInput > = {
	title: 'Components/TimeInput',
	component: TimeInput,
	argTypes: {
		onChange: { action: 'onChange', control: { type: null } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
	args: {
		onChange: ( obj ) => {
			action( 'onChange' )( obj );
		},
	},
};
export default meta;

const Template: StoryFn< typeof TimeInput > = ( args ) => {
	return <TimeInput { ...args } />;
};

export const Default: StoryFn< typeof TimeInput > = Template.bind( {} );
