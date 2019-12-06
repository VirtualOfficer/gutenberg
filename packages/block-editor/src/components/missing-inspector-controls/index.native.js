/**
 * External dependencies
 */
import React from 'react';
/**
 * WordPress dependencies
 */
import {
	createSlotFill,
} from '@wordpress/components';

const { Slot, Fill } = createSlotFill( 'MissingInspectorControls' );

function MissingInspectorControls( { children } ) {
	return (
		<Fill>
			{ children }
		</Fill>
	);
}

MissingInspectorControls.Slot = Slot;

export default Slot;
export {
	MissingInspectorControls,
};
