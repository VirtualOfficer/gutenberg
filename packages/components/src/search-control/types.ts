/**
 * External dependencies
 */
import type { HTMLAttributes } from 'react';

/**
 * Internal dependencies
 */
import type { BaseControlProps } from '../base-control/types';

export type SearchControlProps = Pick<
	BaseControlProps,
	'__nextHasNoMarginBottom' | 'help' | 'hideLabelFromVision' | 'label'
> & {
	/**
	 * A function that receives the value of the input when the value is changed.
	 */
	onChange: ( value: string ) => void;
	/**
	 * When an `onClose` callback is provided, the search control will render a close button
	 * that will trigger the given callback.
	 */
	onClose?: () => void;
	/**
	 * A placeholder for the input.
	 *
	 * @default 'Search'
	 */
	placeholder?: HTMLAttributes< HTMLInputElement >[ 'placeholder' ];
	/**
	 * The current value of the input.
	 */
	value?: string;
};
