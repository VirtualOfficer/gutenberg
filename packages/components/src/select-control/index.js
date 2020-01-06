/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BaseControl from '../base-control';

export default function SelectControl( {
	className,
	disabled,
	help,
	hideLabelFromVision,
	isLoading = false,
	label,
	multiple = false,
	onChange,
	options = [],
	...props
} ) {
	const instanceId = useInstanceId( SelectControl );
	const id = `inspector-select-control-${ instanceId }`;
	const isDisabled = disabled || isLoading;

	const classes = classnames(
		'components-select-control__input',
		isDisabled && 'is-disabled',
		className
	);

	const onChangeValue = ( event ) => {
		if ( multiple ) {
			const selectedOptions = [ ...event.target.options ].filter(
				( { selected } ) => selected
			);
			const newValues = selectedOptions.map( ( { value } ) => value );
			onChange( newValues );
			return;
		}
		onChange( event.target.value );
	};

	// Disable reason: A select with an onchange throws a warning

	/* eslint-disable jsx-a11y/no-onchange */
	return (
		! isEmpty( options ) && (
			<BaseControl
				className={ classes }
				disabled={ isDisabled }
				help={ help }
				hideLabelFromVision={ hideLabelFromVision }
				id={ id }
				isLoading={ isLoading }
				label={ label }
			>
				<select
					aria-describedby={ !! help ? `${ id }__help` : undefined }
					className="components-select-control__input"
					disabled={ isDisabled }
					id={ id }
					multiple={ multiple }
					onChange={ onChangeValue }
					{ ...props }
				>
					{ options.map( ( option, index ) => (
						<option
							disabled={ option.disabled }
							key={ `${ option.label }-${ option.value }-${ index }` }
							value={ option.value }
						>
							{ option.label }
						</option>
					) ) }
				</select>
			</BaseControl>
		)
	);
	/* eslint-enable jsx-a11y/no-onchange */
}
