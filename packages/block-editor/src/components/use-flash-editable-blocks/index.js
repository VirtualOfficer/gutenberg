/**
 * WordPress dependencies
 */
import { useRefEffect } from '@wordpress/compose';
import { useRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

export function useFlashEditableBlocks( clientId = '' ) {
	const registry = useRegistry();
	return useRefEffect(
		( element ) => {
			const flashEditableBlocks = () => {
				const { getEnabledClientIdsTree } = unlock(
					registry.select( blockEditorStore )
				);
				getEnabledClientIdsTree( clientId ).forEach(
					( { clientId: id } ) => {
						const block = element.querySelector(
							`[data-block="${ id }"]`
						);
						if ( ! block ) {
							return;
						}
						block.classList.remove( 'has-editable-outline' );
						// Force reflow to trigger the animation.
						// eslint-disable-next-line no-unused-expressions
						block.offsetWidth;
						block.classList.add( 'has-editable-outline' );
					}
				);
			};

			const handleClick = ( event ) => {
				const shouldFlash =
					event.target === element ||
					event.target.classList.contains( 'is-root-container' );
				if ( ! shouldFlash ) {
					return;
				}
				if ( event.defaultPrevented ) {
					return;
				}
				event.preventDefault();
				flashEditableBlocks();
			};

			element.addEventListener( 'click', handleClick );
			return () => element.removeEventListener( 'click', handleClick );
		},
		[ registry ]
	);
}
