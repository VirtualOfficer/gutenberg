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
import FontSizePicker from '../';

const meta: ComponentMeta< typeof FontSizePicker > = {
	title: 'Components/FontSizePicker',
	component: FontSizePicker,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
		docs: { source: { state: 'open' } },
	},
};
export default meta;

const FontSizePickerWithState: ComponentStory< typeof FontSizePicker > = ( {
	value,
	...props
} ) => {
	const [ fontSize, setFontSize ] = useState( value );
	return (
		<FontSizePicker
			{ ...props }
			value={ fontSize }
			onChange={ setFontSize }
		/>
	);
};

const TwoFontSizePickersWithState: ComponentStory< typeof FontSizePicker > = ( {
	fontSizes,
	...props
} ) => {
	return (
		<>
			<h2>Fewer font sizes</h2>
			<FontSizePickerWithState
				{ ...props }
				fontSizes={ fontSizes?.slice( 0, 4 ) }
			/>

			<h2>More font sizes</h2>
			<FontSizePickerWithState { ...props } fontSizes={ fontSizes } />
		</>
	);
};

export const Default: ComponentStory< typeof FontSizePicker > =
	FontSizePickerWithState.bind( {} );
Default.args = {
	__nextHasNoMarginBottom: true,
	disableCustomFontSizes: false,
	fontSizes: [
		{
			name: 'Small',
			slug: 'small',
			size: 12,
		},
		{
			name: 'Normal',
			slug: 'normal',
			size: 16,
		},
		{
			name: 'Big',
			slug: 'big',
			size: 26,
		},
	],
	value: 16,
	withSlider: false,
};

export const WithSlider: ComponentStory< typeof FontSizePicker > =
	FontSizePickerWithState.bind( {} );
WithSlider.args = {
	...Default.args,
	fallbackFontSize: 16,
	value: undefined,
	withSlider: true,
};

/**
 * With custom font sizes disabled via the `disableCustomFontSizes` prop, the user will
 * only be able to pick one of the predefined sizes passed in `fontSizes`.
 */
export const WithCustomSizesDisabled: ComponentStory< typeof FontSizePicker > =
	FontSizePickerWithState.bind( {} );
WithCustomSizesDisabled.args = {
	...Default.args,
	disableCustomFontSizes: true,
};

/**
 * When there are more than 5 font size options, the UI is no longer a toggle group.
 */
export const WithMoreFontSizes: ComponentStory< typeof FontSizePicker > =
	FontSizePickerWithState.bind( {} );
WithMoreFontSizes.args = {
	...Default.args,
	fontSizes: [
		{
			name: 'Tiny',
			slug: 'tiny',
			size: 8,
		},
		{
			name: 'Small',
			slug: 'small',
			size: 12,
		},
		{
			name: 'Normal',
			slug: 'normal',
			size: 16,
		},
		{
			name: 'Big',
			slug: 'big',
			size: 26,
		},
		{
			name: 'Bigger',
			slug: 'bigger',
			size: 30,
		},
		{
			name: 'Huge',
			slug: 'huge',
			size: 36,
		},
	],
	value: 8,
};

/**
 * When units like `px` are specified explicitly, it will be shown as a label hint.
 */
export const WithUnits: ComponentStory< typeof FontSizePicker > =
	TwoFontSizePickersWithState.bind( {} );
WithUnits.args = {
	...WithMoreFontSizes.args,
	fontSizes: WithMoreFontSizes.args.fontSizes?.map( ( option ) => ( {
		...option,
		size: `${ option.size }px`,
	} ) ),
	value: '8px',
};

/**
 * The label hint will not be shown if it is a complex CSS value. Some examples of complex CSS values
 * in this context are CSS functions like `calc()`, `clamp()`, and `var()`.
 */
export const WithComplexCSSValues: ComponentStory< typeof FontSizePicker > =
	TwoFontSizePickersWithState.bind( {} );
WithComplexCSSValues.args = {
	...Default.args,
	fontSizes: [
		{
			name: 'Small',
			slug: 'small',
			// Adding just one complex css value is enough
			size: 'clamp(1.75rem, 3vw, 2.25rem)',
		},
		{
			name: 'Medium',
			slug: 'medium',
			size: '1.125rem',
		},
		{
			name: 'Large',
			slug: 'large',
			size: '1.7rem',
		},
		{
			name: 'Extra Large',
			slug: 'extra-large',
			size: '1.95rem',
		},
		{
			name: 'Extra Extra Large',
			slug: 'extra-extra-large',
			size: '2.5rem',
		},
		{
			name: 'Huge',
			slug: 'huge',
			size: '2.8rem',
		},
	],
	value: '1.125rem',
};
