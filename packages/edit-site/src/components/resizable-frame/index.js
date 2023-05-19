/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useRef } from '@wordpress/element';
import {
	ResizableBox,
	__unstableMotion as motion,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { unlock } from '../../private-apis';
import { store as editSiteStore } from '../../store';

// Removes the inline styles in the drag handles.
const HANDLE_STYLES_OVERRIDE = {
	position: undefined,
	userSelect: undefined,
	cursor: undefined,
	width: undefined,
	height: undefined,
	top: undefined,
	right: undefined,
	bottom: undefined,
	left: undefined,
};

const MIN_FRAME_SIZE = 340;
const lerp = ( a, b, amount ) => {
	return a + ( b - a ) * amount;
};

function ResizableFrame( { isFull, children } ) {
	const [ frameSize, setFrameSize ] = useState( {
		width: '100%',
		height: '100%',
	} );
	const [ isResizing, setIsResizing ] = useState( false );
	const [ isHovering, setIsHovering ] = useState( false );
	const [ isOversized, setIsOversized ] = useState( false );
	const { setCanvasMode } = unlock( useDispatch( editSiteStore ) );
	const initialAspectRatioRef = useRef( null );
	const initialComputedWidthRef = useRef( null );
	const FRAME_TRANSITION = { type: 'tween', duration: isResizing ? 0 : 0.5 };

	// Calculate the frame size based on the window width as its resized.
	const handleResize = ( event, direction, ref ) => {
		const updatedWidth = ref.offsetWidth;
		const updatedHeight = ref.offsetHeight;

		if ( initialComputedWidthRef.current === null ) {
			initialComputedWidthRef.current = updatedWidth;
		}

		// Set the initial aspect ratio if it hasn't been set yet.
		if ( initialAspectRatioRef.current === null ) {
			initialAspectRatioRef.current = updatedWidth / updatedHeight;
		}

		// Calculate the intermediate aspect ratio based on the current width.
		const lerpFactor =
			1 -
			Math.max(
				0,
				Math.min(
					1,
					( updatedWidth - MIN_FRAME_SIZE ) /
						( 1300 - MIN_FRAME_SIZE )
				)
			);

		// Calculate the height based on the intermediate aspect ratio
		// ensuring the frame arrives at a 9:19.5 aspect ratio.
		const intermediateAspectRatio = lerp(
			initialAspectRatioRef.current,
			9 / 19.5,
			lerpFactor
		);
		const newHeight = updatedWidth / intermediateAspectRatio;

		setIsResizing( true );

		if ( event.clientX < 344 ) {
			const oversizeWidth = Math.max(
				initialComputedWidthRef.current +
					( updatedWidth - initialComputedWidthRef.current ) / 2,
				initialComputedWidthRef.current
			);

			setFrameSize( {
				width: oversizeWidth,
				height: '100%',
			} );
			setIsOversized( true );
		} else {
			setFrameSize( { width: updatedWidth, height: newHeight } );
			setIsOversized( false );
		}
	};

	// Make the frame full screen when the user resizes it to the left.
	const handleResizeStop = ( event ) => {
		// Reset the initial aspect ratio if the frame is resized slightly
		// above the sidebar but not far enough to trigger full screen.
		if ( event.clientX < 344 && event.clientX > 200 ) {
			setFrameSize( { width: '100%', height: '100%' } );
		}

		// Trigger full screen if the frame is resized far enough to the left.
		if ( event.clientX < 200 ) {
			setCanvasMode( 'edit' );
			// Wait for the frame to animate to full screen before resetting its size.
			const timeoutId = setTimeout( () => {
				setFrameSize( { width: '100%', height: '100%' } );
			}, 500 );

			// Clean up the timeout when the effect is no longer needed.
			return () => clearTimeout( timeoutId );
		}

		setIsResizing( false );
	};

	return (
		<ResizableBox
			as={ motion.div }
			initial={ false }
			animate={ {
				flexGrow: isFull ? 1 : 0,
				height: frameSize.height,
			} }
			transition={ FRAME_TRANSITION }
			size={ frameSize }
			enable={ {
				top: false,
				right: false,
				bottom: false,
				left: true,
				topRight: false,
				bottomRight: false,
				bottomLeft: false,
				topLeft: false,
			} }
			resizeRatio={ isOversized ? 1 : 2 }
			handleClasses={ undefined }
			handleStyles={ {
				left: HANDLE_STYLES_OVERRIDE,
				right: HANDLE_STYLES_OVERRIDE,
			} }
			minWidth={ MIN_FRAME_SIZE }
			maxWidth={ '150%' }
			maxHeight={ '100%' }
			onMouseOver={ () => setIsHovering( true ) }
			onMouseOut={ () => setIsHovering( false ) }
			handleComponent={ {
				left: ! isHovering ? null : (
					<motion.div
						key="handle"
						className="edit-site-the-frame__handle"
						title="drag to resize"
						initial={ {
							opacity: 0,
							left: 0,
						} }
						animate={ {
							opacity: 1,
							left: -15,
						} }
						exit={ {
							opacity: 0,
							left: 0,
						} }
						whileHover={ { scale: 1.1 } }
					/>
				),
			} }
			onResize={ handleResize }
			onResizeStop={ handleResizeStop }
			className={ classnames( 'edit-site-the-frame__inner', {
				resizing: isResizing,
				'is-oversized': isOversized,
			} ) }
		>
			<motion.div
				className="edit-site-the-frame__content"
				animate={ {
					borderRadius: isFull ? 0 : 8,
				} }
				transition={ FRAME_TRANSITION }
			>
				{ children }
			</motion.div>
		</ResizableBox>
	);
}

export default ResizableFrame;
