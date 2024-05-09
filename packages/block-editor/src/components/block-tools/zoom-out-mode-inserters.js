/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockPopoverInbetween from '../block-popover/inbetween';
import { store as blockEditorStore } from '../../store';
import Inserter from '../inserter';
import { unlock } from '../../lock-unlock';

function ZoomOutModeInserters( { __unstableContentRef } ) {
	const [ isReady, setIsReady ] = useState( false );
	const blockOrder = useSelect( ( select ) => {
		const { sectionRootClientId } = unlock(
			select( blockEditorStore ).getSettings()
		);
		return select( blockEditorStore ).getBlockOrder( sectionRootClientId );
	}, [] );

	// Defer the initial rendering to avoid the jumps due to the animation.
	useEffect( () => {
		const timeout = setTimeout( () => {
			setIsReady( true );
		}, 500 );
		return () => {
			clearTimeout( timeout );
		};
	}, [] );

	if ( ! isReady ) {
		return null;
	}

	return [ undefined, ...blockOrder ].map( ( clientId, index ) => {
		return (
			<BlockPopoverInbetween
				key={ index }
				previousClientId={ clientId }
				nextClientId={ blockOrder[ index ] }
				__unstableContentRef={ __unstableContentRef }
			>
				<div className="block-editor-block-list__insertion-point-inserter is-with-inserter">
					<Inserter
						position="bottom center"
						clientId={ blockOrder[ index ] }
						__experimentalIsQuick
					/>
				</div>
			</BlockPopoverInbetween>
		);
	} );
}

export default ZoomOutModeInserters;
