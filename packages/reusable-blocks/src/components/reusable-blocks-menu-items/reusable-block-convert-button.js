/**
 * WordPress dependencies
 */
import { hasBlockSupport, isReusableBlock } from '@wordpress/blocks';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { MenuItem } from '@wordpress/components';
import { symbol } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
/**
 * Internal dependencies
 */
import CreatePatternModal from '../create-pattern-modal';

/**
 * Menu control to convert block(s) to reusable block.
 *
 * @param {Object}   props              Component props.
 * @param {string[]} props.clientIds    Client ids of selected blocks.
 * @param {string}   props.rootClientId ID of the currently selected top-level block.
 * @return {import('@wordpress/element').WPComponent} The menu control or null.
 */
export default function ReusableBlockConvertButton( {
	clientIds,
	rootClientId,
} ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const canConvert = useSelect(
		( select ) => {
			const { canUser } = select( coreStore );
			const {
				getBlocksByClientId,
				canInsertBlockType,
				getBlockRootClientId,
			} = select( blockEditorStore );

			const rootId =
				rootClientId ||
				( clientIds.length > 0
					? getBlockRootClientId( clientIds[ 0 ] )
					: undefined );

			const blocks = getBlocksByClientId( clientIds ) ?? [];

			const isReusable =
				blocks.length === 1 &&
				blocks[ 0 ] &&
				isReusableBlock( blocks[ 0 ] ) &&
				!! select( coreStore ).getEntityRecord(
					'postType',
					'wp_block',
					blocks[ 0 ].attributes.ref
				);

			const _canConvert =
				// Hide when this is already a reusable block.
				! isReusable &&
				// Hide when reusable blocks are disabled.
				canInsertBlockType( 'core/block', rootId ) &&
				blocks.every(
					( block ) =>
						// Guard against the case where a regular block has *just* been converted.
						!! block &&
						// Hide on invalid blocks.
						block.isValid &&
						// Hide when block doesn't support being made reusable.
						hasBlockSupport( block.name, 'reusable', true )
				) &&
				// Hide when current doesn't have permission to do that.
				!! canUser( 'create', 'blocks' );

			return _canConvert;
		},
		[ clientIds, rootClientId ]
	);

	if ( ! canConvert ) {
		return null;
	}

	const handleSuccess = ( newPattern ) => {
		createSuccessNotice(
			! newPattern.wp_pattern_sync_status === 'unsynced'
				? sprintf(
						// translators: %s: the name the user has given to the pattern.
						__( 'Unsynced Pattern created: %s' ),
						newPattern.title.raw
				  )
				: sprintf(
						// translators: %s: the name the user has given to the pattern.
						__( 'Synced Pattern created: %s' ),
						newPattern.title.raw
				  ),
			{
				type: 'snackbar',
				id: 'convert-to-reusable-block-success',
			}
		);
		setIsModalOpen( false );
	};
	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<>
					<MenuItem
						icon={ symbol }
						onClick={ () => setIsModalOpen( true ) }
					>
						{ __( 'Create pattern' ) }
					</MenuItem>
					{ isModalOpen && (
						<CreatePatternModal
							clientIds={ clientIds }
							onSuccess={ ( { newPattern } ) => {
								handleSuccess( newPattern );
								onClose();
							} }
							onError={ () => {
								setIsModalOpen( false );
								onClose();
							} }
							onClose={ () => {
								setIsModalOpen( false );
								onClose();
							} }
						/>
					) }
				</>
			) }
		</BlockSettingsMenuControls>
	);
}
