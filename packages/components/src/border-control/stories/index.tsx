/**
 * External dependencies
 */
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import type { ComponentProps } from 'react';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { BorderControl } from '..';
import { Provider as SlotFillProvider } from '../../slot-fill';
import Popover from '../../popover';
import type { Border } from '../types';

const meta: ComponentMeta< typeof BorderControl > = {
	title: 'Components (Experimental)/BorderControl',
	component: BorderControl,
	argTypes: {
		onChange: {
			action: 'onChange',
		},
		width: { control: { type: 'text' } },
		value: { control: { type: null } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { source: { state: 'open' } },
	},
};
export default meta;

// Available border colors.
const colors = [
	{ name: 'Gray 0', color: '#f6f7f7' },
	{ name: 'Gray 5', color: '#dcdcde' },
	{ name: 'Gray 20', color: '#a7aaad' },
	{ name: 'Gray 70', color: '#3c434a' },
	{ name: 'Gray 100', color: '#101517' },
	{ name: 'Blue 20', color: '#72aee6' },
	{ name: 'Blue 40', color: '#3582c4' },
	{ name: 'Blue 70', color: '#0a4b78' },
	{ name: 'Red 40', color: '#e65054' },
	{ name: 'Red 70', color: '#8a2424' },
	{ name: 'Green 10', color: '#68de7c' },
	{ name: 'Green 40', color: '#00a32a' },
	{ name: 'Green 60', color: '#007017' },
	{ name: 'Yellow 10', color: '#f2d675' },
	{ name: 'Yellow 40', color: '#bd8600' },
];

// Multiple origin colors.
const multipleOriginColors = [
	{
		name: 'Default',
		colors: [
			{ name: 'Gray 0', color: '#f6f7f7' },
			{ name: 'Gray 5', color: '#dcdcde' },
			{ name: 'Gray 20', color: '#a7aaad' },
			{ name: 'Gray 70', color: '#3c434a' },
			{ name: 'Gray 100', color: '#101517' },
		],
	},
	{
		name: 'Theme',
		colors: [
			{ name: 'Blue 20', color: '#72aee6' },
			{ name: 'Blue 40', color: '#3582c4' },
			{ name: 'Blue 70', color: '#0a4b78' },
			{ name: 'Red 40', color: '#e65054' },
			{ name: 'Red 70', color: '#8a2424' },
		],
	},
	{
		name: 'User',
		colors: [
			{ name: 'Green 10', color: '#68de7c' },
			{ name: 'Green 40', color: '#00a32a' },
			{ name: 'Green 60', color: '#007017' },
			{ name: 'Yellow 10', color: '#f2d675' },
			{ name: 'Yellow 40', color: '#bd8600' },
		],
	},
];

const Template: ComponentStory< typeof BorderControl > = ( {
	onChange,
	...props
} ) => {
	const [ border, setBorder ] = useState< Border >();
	const onChangeMerged: ComponentProps<
		typeof BorderControl
	>[ 'onChange' ] = ( newBorder ) => {
		setBorder( newBorder );
		onChange( newBorder );
	};

	return (
		<SlotFillProvider>
			<div style={ { maxWidth: '280px' } }>
				<BorderControl
					onChange={ onChangeMerged }
					value={ border }
					{ ...props }
				/>
			</div>
			{ /* @ts-ignore Ignore until Popover is converted to TS */ }
			<Popover.Slot />
		</SlotFillProvider>
	);
};

export const Default = Template.bind( {} );
Default.args = {
	colors,
	label: 'Border',
};

/**
 * Render a slider beside the control.
 */
export const WithSlider = Template.bind( {} );
WithSlider.args = {
	...Default.args,
	withSlider: true,
};

/**
 * When rendering with a slider, the `width` prop is useful to customize the width of the number input.
 */
export const WithSliderCustomWidth = Template.bind( {} );
WithSliderCustomWidth.args = {
	...Default.args,
	withSlider: true,
	width: '150px',
};
WithSliderCustomWidth.storyName = 'With Slider (Custom Width)';

/**
 * Restrict the width of the control and prevent it from expanding to take up additional space.
 * When `true`, the `width` prop will be ignored.
 */
export const IsCompact = Template.bind( {} );
IsCompact.args = {
	...Default.args,
	isCompact: true,
};

/**
 * The `colors` object can contain multiple origins.
 */
export const WithMultipleOrigins = Template.bind( {} );
WithMultipleOrigins.args = {
	...Default.args,
	colors: multipleOriginColors,
	__experimentalHasMultipleOrigins: true,
};

/**
 * Allow the alpha channel to be edited on each color.
 */
export const WithAlphaEnabled = Template.bind( {} );
WithAlphaEnabled.args = {
	...Default.args,
	enableAlpha: true,
};
