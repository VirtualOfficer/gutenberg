/**
 * WordPress dependencies
 */
import { edit } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { forwardRef, useMemo, useState } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock as create } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';

// copied from packages/block-library/src/page-list/edit.js

// We only show the edit option when page count is <= MAX_PAGE_COUNT
// Performance of Navigation Links is not good past this value.
const MAX_PAGE_COUNT = 100;

const usePageData = () => {
	// 1. Grab editor settings
	// 2. Call the selector when we need it
	const { pages } = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );

		return {
			pages: getSettings().__experimentalFetchPageEntities( {
				orderby: 'menu_order',
				order: 'asc',
				_fields: [ 'id', 'link', 'parent', 'title', 'menu_order' ],
				per_page: -1,
				context: 'view',
			} ),
		};
	}, [] );

	return useMemo( () => {
		// TODO: Once the REST API supports passing multiple values to
		// 'orderby', this can be removed.
		// https://core.trac.wordpress.org/ticket/39037
		const sortedPages = [ ...( pages ?? [] ) ].sort( ( a, b ) => {
			if ( a.menu_order === b.menu_order ) {
				return a.title.rendered.localeCompare( b.title.rendered );
			}
			return a.menu_order - b.menu_order;
		} );
		const pagesByParentId = sortedPages.reduce( ( accumulator, page ) => {
			const { parent } = page;
			if ( accumulator.has( parent ) ) {
				accumulator.get( parent ).push( page );
			} else {
				accumulator.set( parent, [ page ] );
			}
			return accumulator;
		}, new Map() );

		return {
			pages, // necessary for access outside the hook
			pagesByParentId,
			totalPages: pages?.length ?? null,
		};
	}, [ pages ] );
};

// copied from convert-to-links-modal.js
const convertSelectedBlockToNavigationLinks =
	( { pages, clientId, replaceBlock, createBlock } ) =>
	() => {
		if ( ! pages?.length ) {
			return;
		}

		const linkMap = {};
		const navigationLinks = [];
		pages.forEach( ( { id, title, link: url, type, parent } ) => {
			// See if a placeholder exists. This is created if children appear before parents in list.
			const innerBlocks = linkMap[ id ]?.innerBlocks ?? [];
			linkMap[ id ] = createBlock(
				'core/navigation-link',
				{
					id,
					label: title.rendered,
					url,
					type,
					kind: 'post-type',
				},
				innerBlocks
			);

			if ( ! parent ) {
				navigationLinks.push( linkMap[ id ] );
			} else {
				if ( ! linkMap[ parent ] ) {
					// Use a placeholder if the child appears before parent in list.
					linkMap[ parent ] = { innerBlocks: [] };
				}
				const parentLinkInnerBlocks = linkMap[ parent ].innerBlocks;
				parentLinkInnerBlocks.push( linkMap[ id ] );
			}
		} );

		// Transform all links with innerBlocks into Submenus. This can't be done
		// sooner because page objects have no information on their children.

		const transformSubmenus = ( listOfLinks ) => {
			listOfLinks.forEach( ( block, index, listOfLinksArray ) => {
				const { attributes, innerBlocks } = block;
				if ( innerBlocks.length !== 0 ) {
					transformSubmenus( innerBlocks );
					const transformedBlock = createBlock(
						'core/navigation-submenu',
						attributes,
						innerBlocks
					);
					listOfLinksArray[ index ] = transformedBlock;
				}
			} );
		};

		transformSubmenus( navigationLinks );

		replaceBlock( clientId, navigationLinks );
	};

const ConvertToLinksModal = ( { onClose, clientId, pages } ) => {
	const hasPages = !! pages?.length;

	const { replaceBlock } = useDispatch( blockEditorStore );

	return (
		<Modal
			closeLabel={ __( 'Close' ) }
			onRequestClose={ onClose }
			title={ __( 'Customize this menu' ) }
			className={ 'wp-block-page-list-modal' }
			aria={ { describedby: 'wp-block-page-list-modal__description' } }
		>
			<p id={ 'wp-block-page-list-modal__description' }>
				{ __(
					'This menu is automatically kept in sync with pages on your site. You can manage the menu yourself by clicking customize below.'
				) }
			</p>
			<div className="wp-block-page-list-modal-buttons">
				<Button variant="tertiary" onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					disabled={ ! hasPages }
					onClick={ convertSelectedBlockToNavigationLinks( {
						pages,
						replaceBlock,
						clientId,
						createBlock: create,
					} ) }
				>
					{ __( 'Customize' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default forwardRef( function BlockEditButton(
	{ clientId, ...props },
	ref
) {
	const { selectBlock } = useDispatch( blockEditorStore );
	const [ convertModalOpen, setConvertModalOpen ] = useState( false );
	const { pages, totalPages } = usePageData();

	const block = useSelect(
		( select ) => {
			return select( blockEditorStore ).getBlock( clientId );
		},
		[ clientId ]
	);

	const allowConvertToLinks =
		'core/page-list' === block.name && totalPages <= MAX_PAGE_COUNT;

	const onClick = () => {
		if ( allowConvertToLinks ) {
			setConvertModalOpen( ! convertModalOpen );
		} else {
			selectBlock( clientId );
		}
	};

	return (
		<>
			{ convertModalOpen && (
				<ConvertToLinksModal
					onClose={ () => setConvertModalOpen( false ) }
					clientId={ clientId }
					pages={ pages }
				/>
			) }
			<Button
				{ ...props }
				ref={ ref }
				icon={ edit }
				onClick={ onClick }
			/>
		</>
	);
} );
