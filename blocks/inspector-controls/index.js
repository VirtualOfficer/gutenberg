/**
 * WordPress dependencies
 */
import { Fill } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BaseControl from './base-control';
import CheckboxControl from './checkbox-control';
import RadioControl from './radio-control';
import RangeControl from './range-control';
import SelectControl from './select-control';
import TextControl from './text-control';
import TextareaControl from './textarea-control';
import ToggleControl from './toggle-control';

export default function InspectorControls( { children } ) {
	return (
		<Fill name="Inspector.Controls">
			{ children }
		</Fill>
	);
}

function InspectorAdvancedControls( { children } ) {
	return (
		<Fill name="Inspector.AdvancedControls">
			{ children }
		</Fill>
	);
}

InspectorControls.Advanced = InspectorAdvancedControls;
InspectorControls.BaseControl = BaseControl;
InspectorControls.CheckboxControl = CheckboxControl;
InspectorControls.RadioControl = RadioControl;
InspectorControls.RangeControl = RangeControl;
InspectorControls.SelectControl = SelectControl;
InspectorControls.TextControl = TextControl;
InspectorControls.TextareaControl = TextareaControl;
InspectorControls.ToggleControl = ToggleControl;
