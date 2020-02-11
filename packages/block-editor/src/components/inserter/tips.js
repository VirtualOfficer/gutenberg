/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalCreateInterpolateElement,
	useState,
} from '@wordpress/element';
import { Tip } from '@wordpress/components';

const globalTips = [
	__experimentalCreateInterpolateElement(
		__(
			'While writing, you can press <kbd>/</kbd> to quickly insert new blocks.'
		),
		{ kbd: <kbd /> }
	),
	__experimentalCreateInterpolateElement(
		__(
			'Indent a list by pressing <kbd>space</kbd> at the beginning of a line'
		),
		{ kbd: <kbd /> }
	),
	__experimentalCreateInterpolateElement(
		__(
			'Outdent a list by pressing <kbd>backspace</kbd> at the beginning of a line'
		),
		{ kbd: <kbd /> }
	),
	__( 'Drag files into the editor to create media blocks' ),
	__(
		'Transform blocks into other blocks by pressing its icon on the toolbar'
	),
];

function Tips() {
	const [ randomIndex ] = useState(
		// Disable Reason: I'm not generating an HTML id.
		// eslint-disable-next-line no-restricted-syntax
		Math.floor( Math.random() * globalTips.length )
	);

	return <Tip>{ globalTips[ randomIndex ] }</Tip>;
}

export default Tips;
