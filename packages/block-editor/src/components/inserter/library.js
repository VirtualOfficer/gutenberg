/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { privateApis as blockEditorPrivateApis } from '../../private-apis';
import { store as blockEditorStore } from '../../store';

const { PrivateInserterMenu: InserterMenu } = unlock( blockEditorPrivateApis );
const noop = () => {};

function InserterLibrary(
	{
		rootClientId,
		clientId,
		isAppender,
		showInserterHelpPanel,
		showMostUsedBlocks = false,
		__experimentalInsertionIndex,
		__experimentalInitialTab,
		__experimentalInitialCategory,
		__experimentalFilterValue,
		__experimentalOnPatternCategorySelection,
		onSelect = noop,
		shouldFocusBlock = false,
		onClose,
	},
	ref
) {
	const { destinationRootClientId } = useSelect(
		( select ) => {
			const { getBlockRootClientId } = select( blockEditorStore );
			const _rootClientId =
				rootClientId || getBlockRootClientId( clientId ) || undefined;
			return {
				destinationRootClientId: _rootClientId,
			};
		},
		[ clientId, rootClientId ]
	);

	return (
		<InserterMenu
			onSelect={ onSelect }
			rootClientId={ destinationRootClientId }
			clientId={ clientId }
			isAppender={ isAppender }
			showInserterHelpPanel={ showInserterHelpPanel }
			showMostUsedBlocks={ showMostUsedBlocks }
			__experimentalInsertionIndex={ __experimentalInsertionIndex }
			__experimentalFilterValue={ __experimentalFilterValue }
			__experimentalOnPatternCategorySelection={
				__experimentalOnPatternCategorySelection
			}
			__experimentalInitialTab={ __experimentalInitialTab }
			__experimentalInitialCategory={ __experimentalInitialCategory }
			shouldFocusBlock={ shouldFocusBlock }
			ref={ ref }
			onClose={ onClose }
		/>
	);
}

export default forwardRef( InserterLibrary );
