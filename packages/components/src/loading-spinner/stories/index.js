/**
 * External dependencies
 */
import { text, number } from '@storybook/addon-knobs';

/**
 * Internal dependencies
 */
import LoadingSpinner from '../';

export default {
	title: 'Components|LoadingSpinner',
	component: LoadingSpinner,
};

export const _default = () => {
	const size = number( 'size', 18 );
	const speed = number( 'speed', 1400 );
	const color = text( 'color', '#555d66' );
	const opacity = number( 'opacity', 1 );

	const props = {
		color,
		opacity,
		size,
		speed,
	};

	return <LoadingSpinner { ...props } />;
};
