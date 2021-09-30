/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { forwardRef, useRef, useImperativeHandle } from '@wordpress/element';
import { Picker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DEFAULT_PICKER_OPTIONS = [
	{
		id: 'createEmbed',
		label: __( 'Create embed' ),
		value: 'createEmbed',
		onSelect: noop,
	},
	{
		id: 'createLink',
		label: __( 'Create link' ),
		value: 'createLink',
		onSelect: noop,
	},
];

export default forwardRef( ( {}, ref ) => {
	const pickerRef = useRef();
	const pickerOptions = useRef( DEFAULT_PICKER_OPTIONS ).current;

	function onPickerSelect( value ) {
		const selectedItem = pickerOptions.find(
			( item ) => item.value === value
		);
		selectedItem.onSelect();
	}

	useImperativeHandle( ref, () => ( {
		presentPicker: ( { createEmbed, createLink } ) => {
			pickerOptions[ 0 ].onSelect = createEmbed;
			pickerOptions[ 1 ].onSelect = createLink;
			pickerRef.current?.presentPicker();
		},
	} ) );

	return (
		<Picker
			ref={ pickerRef }
			options={ pickerOptions }
			onChange={ onPickerSelect }
			hideCancelButton
			leftAlign
		/>
	);
} );
