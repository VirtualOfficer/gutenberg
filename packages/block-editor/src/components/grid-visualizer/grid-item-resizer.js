/**
 * WordPress dependencies
 */
import { ResizableBox } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __unstableUseBlockElement as useBlockElement } from '../block-list/use-block-props/use-block-refs';
import BlockPopoverCover from '../block-popover/cover';
import { getComputedCSS } from './utils';

export function GridItemResizer( { clientId, onChange } ) {
	const blockElement = useBlockElement( clientId );
	if ( ! blockElement ) {
		return null;
	}
	return (
		<BlockPopoverCover
			className="block-editor-grid-item-resizer"
			clientId={ clientId }
			__unstablePopoverSlot="block-toolbar"
		>
			<ResizableBox
				className="block-editor-grid-item-resizer__box"
				size={ {
					width: '100%',
					height: '100%',
				} }
				enable={ {
					bottom: true,
					bottomLeft: false,
					bottomRight: false,
					left: false,
					right: true,
					top: false,
					topLeft: false,
					topRight: false,
				} }
				onResizeStop={ ( event, direction, boxElement ) => {
					const gridElement = blockElement.parentElement;
					const columnGap = parseFloat(
						getComputedCSS( gridElement, 'column-gap' )
					);
					const rowGap = parseFloat(
						getComputedCSS( gridElement, 'row-gap' )
					);
					const gridColumnTracks = getGridTracks(
						getComputedCSS( gridElement, 'grid-template-columns' ),
						columnGap
					);
					const gridRowTracks = getGridTracks(
						getComputedCSS( gridElement, 'grid-template-rows' ),
						rowGap
					);
					const columnStart =
						getClosestTrack(
							gridColumnTracks,
							blockElement.offsetLeft
						) + 1;
					const rowStart =
						getClosestTrack(
							gridRowTracks,
							blockElement.offsetTop
						) + 1;
					const columnEnd =
						getClosestTrack(
							gridColumnTracks,
							blockElement.offsetLeft + boxElement.offsetWidth,
							'end'
						) + 1;
					const rowEnd =
						getClosestTrack(
							gridRowTracks,
							blockElement.offsetTop + boxElement.offsetHeight,
							'end'
						) + 1;
					onChange( {
						columnSpan: columnEnd - columnStart + 1,
						rowSpan: rowEnd - rowStart + 1,
					} );
				} }
			/>
		</BlockPopoverCover>
	);
}

/**
 * Given a grid-template-columns or grid-template-rows CSS property value, gets the start and end
 * position in pixels of each grid track.
 *
 * https://css-tricks.com/snippets/css/complete-guide-grid/#aa-grid-track
 *
 * @param {string} template The grid-template-columns or grid-template-rows CSS property value.
 *                          Only supports fixed sizes in pixels.
 * @param {number} gap      The gap between grid tracks in pixels.
 *
 * @return {Array<{start: number, end: number}>} An array of objects with the start and end
 *                                               position in pixels of each grid track.
 */
function getGridTracks( template, gap ) {
	const tracks = [];
	for ( const size of template.split( ' ' ) ) {
		const previousTrack = tracks[ tracks.length - 1 ];
		const start = previousTrack ? previousTrack.end + gap : 0;
		const end = start + parseFloat( size );
		tracks.push( { start, end } );
	}
	return tracks;
}

/**
 * Given an array of grid tracks and a position in pixels, gets the index of the closest track to
 * that position.
 *
 * https://css-tricks.com/snippets/css/complete-guide-grid/#aa-grid-track
 *
 * @param {Array<{start: number, end: number}>} tracks   An array of objects with the start and end
 *                                                       position in pixels of each grid track.
 * @param {number}                              position The position in pixels.
 * @param {string}                              edge     The edge of the track to compare the
 *                                                       position to. Either 'start' or 'end'.
 *
 * @return {number} The index of the closest track to the position. 0-based, unlike CSS grid which
 *                  is 1-based.
 */
function getClosestTrack( tracks, position, edge = 'start' ) {
	return tracks.reduce(
		( closest, track, index ) =>
			Math.abs( track[ edge ] - position ) <
			Math.abs( tracks[ closest ][ edge ] - position )
				? index
				: closest,
		0
	);
}
