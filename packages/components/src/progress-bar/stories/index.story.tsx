/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '..';

const meta: Meta< typeof ProgressBar > = {
	component: ProgressBar,
	title: 'Components/ProgressBar',
	argTypes: {
		value: { control: { type: 'number', min: 0, max: 100, step: 1 } },
	},
	parameters: {
		controls: {
			expanded: true,
		},
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof ProgressBar > = ( { ...args } ) => {
	return <ProgressBar { ...args } />;
};

export const Default: StoryFn< typeof ProgressBar > = Template.bind( {} );
Default.args = {};

const withCustomWidthCustomCSS = `
	.custom-progress-bar {
		width: 100%;
	}
`;

/**
 * A progress bar with a custom width.
 *
 * You can override the default `width` or further customize the behavior
 * and visuals by passing a custom CSS class via the `cssName` prop.
 *
 * This example shows a progress bar with an overriden `width` of `100%` which
 * makes it fit all available horizontal space of the parent element. The CSS
 * class looks like this:
 *
 * ```css
 * .custom-progress-bar {
 *   width: 100%;
 * }
 * ```
 */
export const WithCustomWidth: StoryFn< typeof ProgressBar > = () => {
	return (
		<>
			<style>{ withCustomWidthCustomCSS }</style>
			<ProgressBar className="custom-progress-bar" />
		</>
	);
};
