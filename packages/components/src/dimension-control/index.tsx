/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Icon from '../icon';
import SelectControl from '../select-control';
import sizesTable, { findSizeBySlug } from './sizes';
import type { DimensionControlProps, Size } from './types';
import type { SelectControlProps } from '../select-control/types';

export function DimensionControl( props: DimensionControlProps ) {
	const {
		label,
		value,
		sizes = sizesTable,
		icon,
		onChange,
		className = '',
	} = props;

	const onChangeSpacingSize: SelectControlProps[ 'onChange' ] = ( val ) => {
		/* TODO: We know `val` is going to be a string (and not an array of strings) because
		we don't pass `multiple` to `SelectControl`. Reevaluate if we can get rid of the type cast
		after https://github.com/WordPress/gutenberg/pull/47390 is finished. */
		const theSize = findSizeBySlug( sizes, val as string );

		if ( ! theSize || value === theSize.slug ) {
			onChange?.( undefined );
		} else if ( typeof onChange === 'function' ) {
			onChange( theSize.slug );
		}
	};

	const formatSizesAsOptions = ( theSizes: Size[] ) => {
		const options = theSizes.map( ( { name, slug } ) => ( {
			label: name,
			value: slug,
		} ) );

		return [
			{
				label: __( 'Default' ),
				value: '',
			},
			...options,
		];
	};

	const selectLabel = (
		<>
			{ icon && <Icon icon={ icon } /> }
			{ label }
		</>
	);

	return (
		<SelectControl
			className={ classnames(
				className,
				'block-editor-dimension-control'
			) }
			label={ selectLabel }
			hideLabelFromVision={ false }
			value={ value }
			onChange={ onChangeSpacingSize }
			options={ formatSizesAsOptions( sizes ) }
		/>
	);
}

/**
 * `DimensionControl` is a component designed to provide a UI to control spacing and/or dimensions.
 *
 * This feature is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.
 *
 *  * ```jsx
 * import {
 *	__experimentalDimensionControl as DimensionControl
 * } from '@wordpress/components';
 *
 * const MyDimensionControl = () => {
 * 	return (
 *		<DimensionConrol
 *			label="Please select a size"
 *			onChange={ (size) => console.log(size) }
 *		/>
 * 	);
 * };
 * ```
 */
export default DimensionControl;
