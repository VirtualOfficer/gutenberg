/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	Icon,
	Modal,
} from '@wordpress/components';
import { dragHandle, trash } from '@wordpress/icons';
import { useInstanceId } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import useBlockDisplayInformation from '../use-block-display-information';
import { store as blockEditorStore } from '../../store';

export default function BlockLockModal( { clientId, onClose } ) {
	const [ lock, setLock ] = useState( { move: false, remove: false } );
	const { canMove, canRemove } = useSelect(
		( select ) => {
			const { canMoveBlock, canRemoveBlock } = select( blockEditorStore );

			return {
				canMove: canMoveBlock( clientId ),
				canRemove: canRemoveBlock( clientId ),
			};
		},
		[ clientId ]
	);
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const blockInformation = useBlockDisplayInformation( clientId );
	const instanceId = useInstanceId(
		BlockLockModal,
		'block-editor-block-lock-modal__options-title'
	);

	useEffect( () => {
		setLock( {
			move: ! canMove,
			remove: ! canRemove,
		} );
	}, [ canMove, canRemove ] );

	const isAllChecked = Object.values( lock ).every( Boolean );

	let ariaChecked;
	if ( isAllChecked ) {
		ariaChecked = 'true';
	} else if ( Object.values( lock ).some( Boolean ) ) {
		ariaChecked = 'mixed';
	} else {
		ariaChecked = 'false';
	}

	return (
		<Modal
			title={ sprintf(
				/* translators: %s: Name of the block. */
				__( 'Lock %s' ),
				blockInformation.title
			) }
			overlayClassName="block-editor-block-lock-modal"
			closeLabel={ __( 'Close' ) }
			onRequestClose={ onClose }
		>
			<form
				onSubmit={ ( event ) => {
					event.preventDefault();
					updateBlockAttributes( [ clientId ], { lock } );
					onClose();
				} }
			>
				<p>
					{ __(
						'Locking a block allowss you to restrict which attributes of the block are ditable. The block can be unlocked any time using "Options" menu in the block toolbar'
					) }
				</p>
				<div
					role="group"
					aria-labelledby={ instanceId }
					className="block-editor-block-lock-modal__options"
				>
					<CheckboxControl
						className="block-editor-block-lock-modal__options-title"
						label={
							<span id={ instanceId }>
								{ __( 'Lock block' ) }
							</span>
						}
						checked={ isAllChecked }
						aria-checked={ ariaChecked }
						onChange={ ( newValue ) =>
							setLock( {
								move: newValue,
								remove: newValue,
							} )
						}
					/>
					<ul className="block-editor-block-lock-modal__checklist">
						<li className="block-editor-block-lock-modal__checklist-item">
							<CheckboxControl
								label={
									<>
										{ __( 'Lock movement' ) }
										<Icon icon={ dragHandle } />
									</>
								}
								checked={ lock.move }
								onChange={ ( move ) =>
									setLock( ( prevLock ) => ( {
										...prevLock,
										move,
									} ) )
								}
							/>
						</li>
						<li className="block-editor-block-lock-modal__checklist-item">
							<CheckboxControl
								label={
									<>
										{ __( 'Lock removal' ) }
										<Icon icon={ trash } />
									</>
								}
								checked={ lock.remove }
								onChange={ ( remove ) =>
									setLock( ( prevLock ) => ( {
										...prevLock,
										remove,
									} ) )
								}
							/>
						</li>
					</ul>
				</div>
				<Flex
					className="block-editor-block-lock-modal__actions"
					justify="flex-end"
					expanded={ false }
				>
					<FlexItem>
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Canel' ) }
						</Button>
					</FlexItem>
					<FlexItem>
						<Button variant="primary" type="submit">
							{ __( 'Apply' ) }
						</Button>
					</FlexItem>
				</Flex>
			</form>
		</Modal>
	);
}
