/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useInstanceId } from '@wordpress/compose';

export default function ListViewInfo() {
	const { headingCount, paragraphCount, blockCount } = useSelect(
		( select ) => {
			const { getGlobalBlockCount } = select( blockEditorStore );
			return {
				headingCount: getGlobalBlockCount( 'core/heading' ),
				paragraphCount: getGlobalBlockCount( 'core/paragraph' ),
				blockCount: getGlobalBlockCount(),
			};
		}
	);
	const instanceId = useInstanceId(
		ListViewInfo,
		'edit-post-editor-list-view-overview-info'
	);
	return (
		<div className="edit-post-editor__list-view-overview__container">
			<p id={ instanceId }>{ __( 'Document info' ) }</p>
			<ul
				className="edit-post-editor__list-view-overview"
				aria-describedby={ instanceId }
			>
				<li className="edit-post-editor__list-view-overview__item">
					<Text>{ __( 'Headings:' ) }&nbsp;</Text>
					<Text>{ headingCount }</Text>
				</li>
				<li className="edit-post-editor__list-view-overview__item">
					<Text>{ __( 'Paragraphs:' ) }&nbsp;</Text>
					<Text>{ paragraphCount }</Text>
				</li>
				<li className="edit-post-editor__list-view-overview__item">
					<Text>{ __( 'Blocks:' ) }&nbsp;</Text>
					<Text>{ blockCount }</Text>
				</li>
			</ul>
		</div>
	);
}
