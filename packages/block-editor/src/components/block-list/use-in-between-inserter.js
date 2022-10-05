/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { InsertionPointOpenRef } from '../block-tools/insertion-point';

export function useInBetweenInserter() {
	const openRef = useContext( InsertionPointOpenRef );
	const isInBetweenInserterDisabled = useSelect(
		( select ) =>
			select( blockEditorStore ).getSettings().hasReducedUI ||
			select( blockEditorStore ).__unstableGetEditorMode() === 'zoom-out',
		[]
	);
	const {
		getBlockListSettings,
		getBlockRootClientId,
		getBlockIndex,
		isBlockInsertionPointVisible,
		isMultiSelecting,
		getSelectedBlockClientIds,
		getTemplateLock,
		__unstableIsWithinBlockOverlay,
	} = useSelect( blockEditorStore );
	const { showInsertionPoint, hideInsertionPoint } =
		useDispatch( blockEditorStore );

	return useRefEffect(
		( node ) => {
			if ( isInBetweenInserterDisabled ) {
				return;
			}

			function onMouseMove( event ) {
				if ( openRef.current ) {
					return;
				}

				if ( isMultiSelecting() ) {
					return;
				}

				if (
					! event.target.classList.contains(
						'block-editor-block-list__layout'
					)
				) {
					hideInsertionPoint();
					return;
				}

				let rootClientId;
				if (
					! event.target.classList.contains( 'is-root-container' )
				) {
					const blockElement = !! event.target.getAttribute(
						'data-block'
					)
						? event.target
						: event.target.closest( '[data-block]' );
					rootClientId = blockElement.getAttribute( 'data-block' );
				}

				// Don't set the insertion point if the template is locked.
				if ( getTemplateLock( rootClientId ) ) {
					return;
				}

				const orientation =
					getBlockListSettings( rootClientId )?.orientation ||
					'vertical';
				const offsetTop = event.clientY;
				const offsetLeft = event.clientX;

				const children = Array.from( event.target.children );
				let element = children.find( ( blockEl ) => {
					const blockElRect = blockEl.getBoundingClientRect();
					return (
						( blockEl.classList.contains( 'wp-block' ) &&
							orientation === 'vertical' &&
							blockElRect.top > offsetTop ) ||
						( blockEl.classList.contains( 'wp-block' ) &&
							orientation === 'horizontal' &&
							blockElRect.left > offsetLeft )
					);
				} );

				if ( ! element ) {
					return;
				}

				// The block may be in an alignment wrapper, so check the first direct
				// child if the element has no ID.
				if ( ! element.id ) {
					element = element.firstElementChild;

					if ( ! element ) {
						return;
					}
				}

				// Don't show the insertion point if a parent block has an "overlay"
				// See https://github.com/WordPress/gutenberg/pull/34012#pullrequestreview-727762337
				const clientId = element.id.slice( 'block-'.length );
				if (
					! clientId ||
					__unstableIsWithinBlockOverlay( clientId )
				) {
					return;
				}

				// Don't show the inserter when hovering above (conflicts with
				// block toolbar) or inside selected block(s).
				if ( getSelectedBlockClientIds().includes( clientId ) ) {
					return;
				}
				const elementRect = element.getBoundingClientRect();

				if (
					( orientation === 'horizontal' &&
						( event.clientY > elementRect.bottom ||
							event.clientY < elementRect.top ) ) ||
					( orientation === 'vertical' &&
						( event.clientX > elementRect.right ||
							event.clientX < elementRect.left ) )
				) {
					hideInsertionPoint();
					return;
				}

				const index = getBlockIndex( clientId );

				// Don't show the in-between inserter before the first block in
				// the list (preserves the original behaviour).
				if ( index === 0 ) {
					hideInsertionPoint();
					return;
				}

				showInsertionPoint( rootClientId, index, {
					__unstableWithInserter: true,
					delay: 500,
				} );
			}

			node.addEventListener( 'mousemove', onMouseMove );

			return () => {
				node.removeEventListener( 'mousemove', onMouseMove );
			};
		},
		[
			openRef,
			getBlockListSettings,
			getBlockRootClientId,
			getBlockIndex,
			isBlockInsertionPointVisible,
			isMultiSelecting,
			showInsertionPoint,
			hideInsertionPoint,
			getSelectedBlockClientIds,
			isInBetweenInserterDisabled,
		]
	);
}
