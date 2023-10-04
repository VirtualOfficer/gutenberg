/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import useClipboardHandler from '../writing-flow/use-clipboard-handler';

/**
 * @deprecated
 */
export const __unstableUseClipboardHandler = () => {
	deprecated( '__unstableUseClipboardHandler', {
		alternative: 'BlockCanvas or WritingFlow',
		version: '6.4',
	} );
	return useClipboardHandler();
};

/**
 * @deprecated
 * @param {Object} props
 */
export default function CopyHandler( props ) {
	deprecated( 'CopyHandler', {
		alternative: 'BlockCanvas or WritingFlow',
		version: '6.4',
	} );
	return <div { ...props } ref={ useClipboardHandler() } />;
}
