/**
 * External dependencies
 */
import { boolean, text } from '@storybook/addon-knobs';

/**
 * Internal dependencies
 */
import SelectControl from '../';

export default { title: 'Components|SelectControl', component: SelectControl };

export const _default = () => {
	const label = text( 'label', 'Select Label' );
	const help = text( 'help', 'Help text for select' );
	const hideLabelFromVision = boolean( 'hideLabelFromVision', true );
	const isLoading = boolean( 'isLoading', false );

	const options = [
		{
			id: 1,
			label: 'Red',
			value: 'red',
		},
		{
			id: 2,
			label: 'Green',
			value: 'green',
		},
		{
			id: 3,
			label: 'Blue',
			value: 'blue',
		},
	];

	const props = {
		label,
		help,
		hideLabelFromVision,
		isLoading,
		options,
	};

	return <SelectControl { ...props } />;
};
