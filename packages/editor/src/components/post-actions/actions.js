/**
 * WordPress dependencies
 */
import { external, trash, edit, backup } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useDispatch } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { store as coreStore } from '@wordpress/core-data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from '@wordpress/element';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import RenamePostModalContent from './rename-post-modal-content';

function getItemTitle( item ) {
	if ( typeof item.title === 'string' ) {
		return decodeEntities( item.title );
	}
	return decodeEntities( item.title?.rendered || '' );
}

export const trashPostAction = {
	id: 'move-to-trash',
	label: __( 'Move to Trash' ),
	isPrimary: true,
	icon: trash,
	isEligible( { status } ) {
		return status !== 'trash';
	},
	supportsBulk: true,
	hideModalHeader: true,
	RenderModal: ( { items: posts, closeModal, onActionPerformed } ) => {
		const { createSuccessNotice, createErrorNotice } =
			useDispatch( noticesStore );
		const { deleteEntityRecord } = useDispatch( coreStore );
		return (
			<VStack spacing="5">
				<Text>
					{ posts.length === 1
						? sprintf(
								// translators: %s: The page's title.
								__( 'Are you sure you want to delete "%s"?' ),
								getItemTitle( posts[ 0 ] )
						  )
						: sprintf(
								// translators: %d: The number of pages (2 or more).
								_n(
									'Are you sure you want to delete %d page?',
									'Are you sure you want to delete %d pages?',
									posts.length
								),
								posts.length
						  ) }
				</Text>
				<HStack justify="right">
					<Button variant="tertiary" onClick={ closeModal }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ async () => {
							const promiseResult = await Promise.allSettled(
								posts.map( ( post ) => {
									return deleteEntityRecord(
										'postType',
										post.type,
										post.id,
										{},
										{ throwOnError: true }
									);
								} )
							);
							// If all the promises were fulfilled with success.
							if (
								promiseResult.every(
									( { status } ) => status === 'fulfilled'
								)
							) {
								let successMessage;
								if ( promiseResult.length === 1 ) {
									successMessage = sprintf(
										/* translators: The posts's title. */
										__( '"%s" moved to the Trash.' ),
										getItemTitle( posts[ 0 ] )
									);
								} else {
									successMessage = __(
										'Pages moved to the Trash.'
									);
								}
								createSuccessNotice( successMessage, {
									type: 'snackbar',
									id: 'edit-site-page-trashed',
								} );
							} else {
								// If there was at lease one failure.
								let errorMessage;
								// If we were trying to move a single post to the trash.
								if ( promiseResult.length === 1 ) {
									if ( promiseResult[ 0 ].reason?.message ) {
										errorMessage =
											promiseResult[ 0 ].reason.message;
									} else {
										errorMessage = __(
											'An error occurred while moving the post to the trash.'
										);
									}
									// If we were trying to move multiple posts to the trash
								} else {
									const errorMessages = new Set();
									const failedPromises = promiseResult.filter(
										( { status } ) => status === 'rejected'
									);
									for ( const failedPromise of failedPromises ) {
										if ( failedPromise.reason?.message ) {
											errorMessages.add(
												failedPromise.reason.message
											);
										}
									}
									if ( errorMessages.size === 0 ) {
										errorMessage = __(
											'An error occurred while moving the posts to the trash.'
										);
									} else if ( errorMessages.size === 1 ) {
										errorMessage = sprintf(
											/* translators: %s: an error message */
											__(
												'An error occurred while moving the posts to the trash: %s'
											),
											[ ...errorMessages ][ 0 ]
										);
									} else {
										errorMessage = sprintf(
											/* translators: %s: a list of comma separated error messages */
											__(
												'Some errors occurred while moving the pages to the trash: %s'
											),
											[ ...errorMessages ].join( ',' )
										);
									}
									createErrorNotice( errorMessage, {
										type: 'snackbar',
									} );
								}
							}
							if ( onActionPerformed ) {
								onActionPerformed( posts );
							}
							closeModal();
						} }
					>
						{ __( 'Delete' ) }
					</Button>
				</HStack>
			</VStack>
		);
	},
};

export function usePermanentlyDeletePostAction() {
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );
	const { deleteEntityRecord } = useDispatch( coreStore );

	return useMemo(
		() => ( {
			id: 'permanently-delete',
			label: __( 'Permanently delete' ),
			supportsBulk: true,
			isEligible( { status } ) {
				return status === 'trash';
			},
			async callback( posts, onActionPerformed ) {
				const promiseResult = await Promise.allSettled(
					posts.map( ( post ) => {
						return deleteEntityRecord(
							'postType',
							post.type,
							post.id,
							{ force: true },
							{ throwOnError: true }
						);
					} )
				);
				// If all the promises were fulfilled with success.
				if (
					promiseResult.every(
						( { status } ) => status === 'fulfilled'
					)
				) {
					let successMessage;
					if ( promiseResult.length === 1 ) {
						successMessage = sprintf(
							/* translators: The posts's title. */
							__( '"%s" permanently deleted.' ),
							getItemTitle( posts[ 0 ] )
						);
					} else {
						successMessage = __(
							'The posts were permanently deleted.'
						);
					}
					createSuccessNotice( successMessage, {
						type: 'snackbar',
						id: 'edit-site-post-permanently-deleted',
					} );
					if ( onActionPerformed ) {
						onActionPerformed( posts );
					}
				} else {
					// If there was at lease one failure.
					let errorMessage;
					// If we were trying to permanently delete a single post.
					if ( promiseResult.length === 1 ) {
						if ( promiseResult[ 0 ].reason?.message ) {
							errorMessage = promiseResult[ 0 ].reason.message;
						} else {
							errorMessage = __(
								'An error occurred while permanently deleting the post.'
							);
						}
						// If we were trying to permanently delete multiple posts
					} else {
						const errorMessages = new Set();
						const failedPromises = promiseResult.filter(
							( { status } ) => status === 'rejected'
						);
						for ( const failedPromise of failedPromises ) {
							if ( failedPromise.reason?.message ) {
								errorMessages.add(
									failedPromise.reason.message
								);
							}
						}
						if ( errorMessages.size === 0 ) {
							errorMessage = __(
								'An error occurred while permanently deleting the posts.'
							);
						} else if ( errorMessages.size === 1 ) {
							errorMessage = sprintf(
								/* translators: %s: an error message */
								__(
									'An error occurred while permanently deleting the posts: %s'
								),
								[ ...errorMessages ][ 0 ]
							);
						} else {
							errorMessage = sprintf(
								/* translators: %s: a list of comma separated error messages */
								__(
									'Some errors occurred while permanently deleting the posts: %s'
								),
								[ ...errorMessages ].join( ',' )
							);
						}
						createErrorNotice( errorMessage, {
							type: 'snackbar',
						} );
					}
				}
			},
		} ),
		[ createSuccessNotice, createErrorNotice, deleteEntityRecord ]
	);
}

export function useRestorePostAction() {
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );
	const { editEntityRecord, saveEditedEntityRecord } =
		useDispatch( coreStore );

	return useMemo(
		() => ( {
			id: 'restore',
			label: __( 'Restore' ),
			isPrimary: true,
			icon: backup,
			supportsBulk: true,
			isEligible( { status } ) {
				return status === 'trash';
			},
			async callback( posts, onActionPerformed ) {
				try {
					for ( const post of posts ) {
						await editEntityRecord(
							'postType',
							post.type,
							post.id,
							{
								status: 'draft',
							}
						);
						await saveEditedEntityRecord(
							'postType',
							post.type,
							post.id,
							{ throwOnError: true }
						);
					}

					createSuccessNotice(
						posts.length > 1
							? sprintf(
									/* translators: The number of posts. */
									__( '%d posts have been restored.' ),
									posts.length
							  )
							: sprintf(
									/* translators: The number of posts. */
									__( '"%s" has been restored.' ),
									getItemTitle( posts[ 0 ] )
							  ),
						{
							type: 'snackbar',
							id: 'edit-site-post-restored',
						}
					);
					if ( onActionPerformed ) {
						onActionPerformed( posts );
					}
				} catch ( error ) {
					let errorMessage;
					if (
						error.message &&
						error.code !== 'unknown_error' &&
						error.message
					) {
						errorMessage = error.message;
					} else if ( posts.length > 1 ) {
						errorMessage = __(
							'An error occurred while restoring the posts.'
						);
					} else {
						errorMessage = __(
							'An error occurred while restoring the post.'
						);
					}

					createErrorNotice( errorMessage, { type: 'snackbar' } );
				}
			},
		} ),
		[
			createSuccessNotice,
			createErrorNotice,
			editEntityRecord,
			saveEditedEntityRecord,
		]
	);
}

export const viewPostAction = {
	id: 'view-post',
	label: __( 'View' ),
	isPrimary: true,
	icon: external,
	isEligible( post ) {
		return post.status !== 'trash';
	},
	callback( posts, onActionPerformed ) {
		const post = posts[ 0 ];
		window.open( post.link, '_blank' );
		if ( onActionPerformed ) {
			onActionPerformed( posts );
		}
	},
};

export const editPostAction = {
	id: 'edit-post',
	label: __( 'Edit' ),
	isPrimary: true,
	icon: edit,
	isEligible( { status } ) {
		return status !== 'trash';
	},
	callback( posts, onActionPerformed ) {
		if ( onActionPerformed ) {
			onActionPerformed( posts );
		}
	},
};
export const postRevisionsAction = {
	id: 'view-post-revisions',
	label: __( 'View revisions' ),
	isPrimary: false,
	isEligible: ( post ) => {
		if ( post.status === 'trash' ) {
			return false;
		}
		const lastRevisionId =
			post?._links?.[ 'predecessor-version' ]?.[ 0 ]?.id ?? null;
		const revisionsCount =
			post?._links?.[ 'version-history' ]?.[ 0 ]?.count ?? 0;
		return lastRevisionId && revisionsCount > 1;
	},
	callback( posts, onActionPerformed ) {
		const post = posts[ 0 ];
		const href = addQueryArgs( 'revision.php', {
			revision: post?._links?.[ 'predecessor-version' ]?.[ 0 ]?.id,
		} );
		document.location.href = href;
		if ( onActionPerformed ) {
			onActionPerformed( posts );
		}
	},
};

export const renamePostAction = {
	id: 'rename-post',
	label: __( 'Rename' ),
	isEligible( post ) {
		return post.status !== 'trash';
	},
	RenderModal: RenamePostModalContent,
};

export function usePostActions( onActionPerformed, actionIds = null ) {
	const permanentlyDeletePostAction = usePermanentlyDeletePostAction();
	const restorePostAction = useRestorePostAction();
	return useMemo(
		() => {
			// By default, return all actions...
			const defaultActions = [
				editPostAction,
				viewPostAction,
				restorePostAction,
				permanentlyDeletePostAction,
				postRevisionsAction,
				renamePostAction,
				trashPostAction,
			];

			// ... unless `actionIds` was specified, in which case we find the
			// actions matching the given IDs.
			const actions = actionIds
				? actionIds.map( ( actionId ) =>
						defaultActions.find( ( { id } ) => actionId === id )
				  )
				: defaultActions;

			if ( onActionPerformed ) {
				for ( let i = 0; i < actions.length; ++i ) {
					if ( actions[ i ].callback ) {
						const existingCallback = actions[ i ].callback;
						actions[ i ] = {
							...actions[ i ],
							callback: ( items, _onActionPerformed ) => {
								existingCallback( items, ( _items ) => {
									if ( _onActionPerformed ) {
										_onActionPerformed( _items );
									}
									onActionPerformed(
										actions[ i ].id,
										_items
									);
								} );
							},
						};
					}
					if ( actions[ i ].RenderModal ) {
						const ExistingRenderModal = actions[ i ].RenderModal;
						actions[ i ] = {
							...actions[ i ],
							RenderModal: ( props ) => {
								return (
									<ExistingRenderModal
										items={ props.items }
										closeModal={ props.closeModal }
										onActionPerformed={ ( _items ) => {
											if ( props.onActionPerformed ) {
												props.onActionPerformed(
													_items
												);
											}
											onActionPerformed(
												actions[ i ].id,
												_items
											);
										} }
									/>
								);
							},
						};
					}
				}
			}
			return actions;
		},

		// Disable reason: if provided, `actionIds` is a shallow array of
		// strings, and the strings themselves should be part of the useMemo
		// dependencies. Two different disable statements are needed, as the
		// first flags what it thinks are missing dependencies, and the second
		// flags the array spread operation.
		//
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			// eslint-disable-next-line react-hooks/exhaustive-deps
			...( actionIds || [] ),
			permanentlyDeletePostAction,
			restorePostAction,
			onActionPerformed,
		]
	);
}
