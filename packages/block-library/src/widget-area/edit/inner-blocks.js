/**
 * WordPress dependencies
 */
import { useEntityBlockEditor } from '@wordpress/core-data';
import { InnerBlocks } from '@wordpress/block-editor';

export default function WidgetAreaInnerBlocks() {
	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		'root',
		'widgetArea'
	);
	return (
		<InnerBlocks
			__experimentalBlocks={ blocks }
			onInput={ onInput }
			onChange={ onChange }
			templateLock={ false }
			renderAppender={ InnerBlocks.ButtonBlockAppender }
		/>
	);
}
