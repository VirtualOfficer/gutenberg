/**
 * External dependencies
 */
import colorize from 'tinycolor2';
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

export default function ColorControl( { value = 'black' } ) {
	const [ color ] = useState( toColor( value ) );
	return (
		<div>
			<input type="color" value={ color } />
			{ color }
		</div>
	);
}

function toColor( color ) {
	return colorize( color ).toHexString();
}
