/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';
import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';
import { store as blockEditorStore } from '../../store';
import useBlockDisplayInformation from '../use-block-display-information';

function BlockCard( { title, icon, description, blockType, className } ) {
	if ( blockType ) {
		deprecated( '`blockType` property in `BlockCard component`', {
			since: '5.7',
			alternative: '`title, icon and description` properties',
		} );
		( { title, icon, description } = blockType );
	}

	const parentClientId = useSelect( ( select ) => {
		const {
			getSelectedBlockClientId,
			getBlockParentsByBlockName,
			__unstableGetContentLockingParent,
		} = select( blockEditorStore );

		const _selectedBlockClientId = getSelectedBlockClientId();
		let _parentClientId = getBlockParentsByBlockName(
			_selectedBlockClientId,
			'core/navigation',
			true
		)[ 0 ];

		if ( ! _parentClientId ) {
			_parentClientId = __unstableGetContentLockingParent(
				_selectedBlockClientId
			);
		}

		return _parentClientId;
	}, [] );
	const parentDisplayInfo = useBlockDisplayInformation( parentClientId );
	const { selectBlock } = useDispatch( blockEditorStore );

	return (
		<div className={ classnames( 'block-editor-block-card', className ) }>
			{ parentClientId && ( // This is only used by the Navigation block for now. It's not ideal having Navigation block specific code here.
				<Button
					onClick={ () => selectBlock( parentClientId ) }
					label={ sprintf(
						// translators: %s: the block title of the parent.
						__( 'Go to parent: %s' ),
						parentDisplayInfo?.title
					) }
					style={
						// TODO: This style override is also used in ToolsPanelHeader.
						// It should be supported out-of-the-box by Button.
						{ minWidth: 24, padding: 0 }
					}
					icon={ isRTL() ? chevronRight : chevronLeft }
					size="small"
				/>
			) }
			<BlockIcon icon={ icon } showColors />
			<div className="block-editor-block-card__content">
				<h2 className="block-editor-block-card__title">{ title }</h2>
				{ description && (
					<span className="block-editor-block-card__description">
						{ description }
					</span>
				) }
			</div>
		</div>
	);
}

export default BlockCard;
