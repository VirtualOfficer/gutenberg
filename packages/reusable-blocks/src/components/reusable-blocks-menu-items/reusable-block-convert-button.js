/**
 * WordPress dependencies
 */
import { hasBlockSupport, isReusableBlock } from '@wordpress/blocks';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useCallback, useState } from '@wordpress/element';
import {
	MenuItem,
	Modal,
	Button,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	SelectControl,
} from '@wordpress/components';
import { symbol } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store } from '../../store';

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
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ blockType, setBlockType ] = useState( 'resuable' );
	const [ title, setTitle ] = useState( '' );
	const [ categoryName, setCategoryName ] = useState( '' );
	const { canConvert, patternCategories } = useSelect(
		( select ) => {
			const { canUser } = select( coreStore );
			const { getBlocksByClientId, canInsertBlockType, getSettings } =
				select( blockEditorStore );

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
				canInsertBlockType( 'core/block', rootClientId ) &&
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

			return {
				canConvert: _canConvert,
				patternCategories:
					getSettings().__experimentalBlockPatternCategories,
			};
		},
		[ clientIds ]
	);

	const { __experimentalConvertBlocksToReusable: convertBlocksToReusable } =
		useDispatch( store );

	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );
	const onConvert = useCallback(
		async function ( reusableBlockTitle ) {
			try {
				await convertBlocksToReusable(
					clientIds,
					reusableBlockTitle,
					blockType,
					categoryName
				);
				createSuccessNotice(
					sprintf(
						__( '%s created.' ),
						blockType === 'reusable'
							? __( 'Reusable block' )
							: __( 'Pattern' )
					),
					{
						type: 'snackbar',
					}
				);
			} catch ( error ) {
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			}
		},
		[
			convertBlocksToReusable,
			clientIds,
			blockType,
			categoryName,
			createSuccessNotice,
			createErrorNotice,
		]
	);

	if ( ! canConvert ) {
		return null;
	}

	const categoryOptions = patternCategories.map( ( category ) => ( {
		label: category.label,
		value: category.name,
	} ) );

	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<>
					<MenuItem
						icon={ symbol }
						onClick={ () => {
							setBlockType( 'reusable' );
							setIsModalOpen( true );
						} }
					>
						{ __( 'Create Reusable block' ) }
					</MenuItem>
					<MenuItem
						icon={ symbol }
						onClick={ () => {
							setBlockType( 'pattern' );
							setIsModalOpen( true );
						} }
					>
						{ __( 'Create a Pattern' ) }
					</MenuItem>
					{ isModalOpen && (
						<Modal
							title={ sprintf(
								__( 'Create %s' ),
								blockType === 'reusable'
									? __( 'Reusable block' )
									: __( 'Pattern' )
							) }
							onRequestClose={ () => {
								setIsModalOpen( false );
								setTitle( '' );
							} }
							overlayClassName="reusable-blocks-menu-items__convert-modal"
						>
							<form
								onSubmit={ ( event ) => {
									event.preventDefault();
									onConvert( title );
									setIsModalOpen( false );
									setTitle( '' );
									onClose();
								} }
							>
								<VStack spacing="5">
									<TextControl
										__nextHasNoMarginBottom
										label={ __( 'Name' ) }
										value={ title }
										onChange={ setTitle }
									/>
									{ blockType === 'pattern' && (
										<SelectControl
											label={ __( 'Category' ) }
											onChange={ setCategoryName }
											options={ categoryOptions }
											size="__unstable-large"
											value={ categoryName }
										/>
									) }
									<HStack justify="right">
										<Button
											variant="tertiary"
											onClick={ () => {
												setIsModalOpen( false );
												setTitle( '' );
											} }
										>
											{ __( 'Cancel' ) }
										</Button>

										<Button variant="primary" type="submit">
											{ __( 'Save' ) }
										</Button>
									</HStack>
								</VStack>
							</form>
						</Modal>
					) }
				</>
			) }
		</BlockSettingsMenuControls>
	);
}
