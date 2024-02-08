/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * Tracks whether user is touching screen; used to
 * differentiate behavior for touch and mouse input.
 *
 * @type {boolean}
 */
let isTouching = false;

/**
 * Tracks the last time the screen was touched; used to
 * differentiate behavior for touch and mouse input.
 *
 * @type {number}
 */
let lastTouchTime = 0;

let imageRef;
let triggerRef;

const { state, actions, callbacks } = store(
	'core/image',
	{
		state: {
			currentImage: {},
			get scrollDisabled() {
				return state.currentImage.currentSrc;
			},
			get roleAttribute() {
				return state.lightboxEnabled ? 'dialog' : null;
			},
			get ariaModal() {
				return state.lightboxEnabled ? 'true' : null;
			},
			get enlargedSrc() {
				return (
					state.currentImage.uploadedSrc ||
					'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
				);
			},
			imgAttributes( attribute ) {
				return state.currentImage[ `img-${ attribute }` ];
			},
			figureAttributes( attribute ) {
				return state.currentImage[ `figure-${ attribute }` ];
			},
		},
		actions: {
			showLightbox() {
				const ctx = getContext();

				// We can't initialize the lightbox until the reference image is loaded,
				// otherwise the UX is broken.
				if ( ! ctx.imageRef.complete ) {
					return;
				}

				state.scrollTopReset = document.documentElement.scrollTop;
				// In most cases, this value will be 0, but this is included
				// in case a user has created a page with horizontal scrolling.
				state.scrollLeftReset = document.documentElement.scrollLeft;

				ctx.currentSrc = ctx.imageRef.currentSrc;
				imageRef = ctx.imageRef;
				triggerRef = ctx.triggerRef;
				state.currentImage = ctx;
				state.lightboxEnabled = true;

				callbacks.setOverlayStyles();
			},
			hideLightbox() {
				if ( state.lightboxEnabled ) {
					// We want to wait until the close animation is completed
					// before allowing a user to scroll again. The duration of this
					// animation is defined in the styles.scss and depends on if the
					// animation is 'zoom' or 'fade', but in any case we should wait
					// a few milliseconds longer than the duration, otherwise a user
					// may scroll too soon and cause the animation to look sloppy.
					setTimeout( function () {
						state.currentImage = {};
						// If we don't delay before changing the focus,
						// the focus ring will appear on Firefox before
						// the image has finished animating, which looks broken.
						triggerRef.focus( {
							preventScroll: true,
						} );
					}, 450 );

					state.hideAnimationEnabled = true;
					state.lightboxEnabled = false;
				}
			},
			handleKeydown( event ) {
				if ( state.lightboxEnabled ) {
					// Focuses the close button when the user presses the tab key.
					if ( event.key === 'Tab' ) {
						event.preventDefault();
						const { ref } = getElement();
						ref.querySelector( 'button' ).focus();
					}
					// Closes the lightbox when the user presses the escape key.
					if ( event.key === 'Escape' ) {
						actions.hideLightbox();
					}
				}
			},
			handleTouchMove( event ) {
				// On mobile devices, we want to prevent triggering the
				// scroll event because otherwise the page jumps around as
				// we reset the scroll position. This also means that closing
				// the lightbox requires that a user perform a simple tap. This
				// may be changed in the future if we find a better alternative
				// to override or reset the scroll position during swipe actions.
				if ( state.lightboxEnabled ) {
					event.preventDefault();
				}
			},
			handleTouchStart() {
				isTouching = true;
			},
			handleTouchEnd() {
				// We need to wait a few milliseconds before resetting
				// to ensure that pinch to zoom works consistently
				// on mobile devices when the lightbox is open.
				lastTouchTime = Date.now();
				isTouching = false;
			},
			handleScroll() {
				// This handler is added to prevent scrolling behaviors that trigger content
				// shift while the lightbox is open.  It would be better to accomplish this
				// through CSS alone, but using overflow: hidden is currently the only way
				// to do so, and that causes the layout to shift and prevents the zoom
				// animation from working in some cases because we're unable to account for
				// the layout shift when doing the animation calculations. Instead, here we
				// use JavaScript to prevent and reset the scrolling behavior. In the
				// future, we may be able to use CSS or overflow: hidden instead to not rely
				// on JavaScript, but this seems to be the best approach for now that
				// provides the best visual experience.
				if ( state.scrollDisabled ) {
					// We can't override the scroll behavior on mobile devices
					// because doing so breaks the pinch to zoom functionality, and we
					// want to allow users to zoom in further on the high-res image.
					if ( ! isTouching && Date.now() - lastTouchTime > 450 ) {
						// We are unable to use event.preventDefault() to prevent scrolling
						// because the scroll event can't be canceled, so we reset the position instead.
						window.scrollTo(
							state.scrollLeftReset,
							state.scrollTopReset
						);
					}
				}
			},
		},
		callbacks: {
			setOverlayStyles() {
				// The reference img element lies adjacent to the event target button in
				// the DOM.
				let {
					naturalWidth,
					naturalHeight,
					offsetWidth: originalWidth,
					offsetHeight: originalHeight,
				} = imageRef;
				let { x: screenPosX, y: screenPosY } =
					imageRef.getBoundingClientRect();

				// Natural ratio of the image clicked to open the lightbox.
				const naturalRatio = naturalWidth / naturalHeight;
				// Original ratio of the image clicked to open the lightbox.
				let originalRatio = originalWidth / originalHeight;

				// If it has object-fit: contain, recalculate the original sizes
				// and the screen position without the blank spaces.
				if ( state.currentImage.scaleAttr === 'contain' ) {
					if ( naturalRatio > originalRatio ) {
						const heightWithoutSpace = originalWidth / naturalRatio;
						// Recalculate screen position without the top space.
						screenPosY +=
							( originalHeight - heightWithoutSpace ) / 2;
						originalHeight = heightWithoutSpace;
					} else {
						const widthWithoutSpace = originalHeight * naturalRatio;
						// Recalculate screen position without the left space.
						screenPosX += ( originalWidth - widthWithoutSpace ) / 2;
						originalWidth = widthWithoutSpace;
					}
				}
				originalRatio = originalWidth / originalHeight;

				// Typically, we use the image's full-sized dimensions. If those
				// dimensions have not been set (i.e. an external image with only one size),
				// the image's dimensions in the lightbox are the same
				// as those of the image in the content.
				let imgMaxWidth = parseFloat(
					state.currentImage.targetWidth !== 'none'
						? state.currentImage.targetWidth
						: naturalWidth
				);
				let imgMaxHeight = parseFloat(
					state.currentImage.targetHeight !== 'none'
						? state.currentImage.targetHeight
						: naturalHeight
				);

				// Ratio of the biggest image stored in the database.
				let imgRatio = imgMaxWidth / imgMaxHeight;
				let containerMaxWidth = imgMaxWidth;
				let containerMaxHeight = imgMaxHeight;
				let containerWidth = imgMaxWidth;
				let containerHeight = imgMaxHeight;
				// Check if the target image has a different ratio than the original one (thumbnail).
				// Recalculate the width and height.
				if ( naturalRatio.toFixed( 2 ) !== imgRatio.toFixed( 2 ) ) {
					if ( naturalRatio > imgRatio ) {
						// If the width is reached before the height, we keep the maxWidth
						// and recalculate the height.
						// Unless the difference between the maxHeight and the reducedHeight
						// is higher than the maxWidth, where we keep the reducedHeight and
						// recalculate the width.
						const reducedHeight = imgMaxWidth / naturalRatio;
						if ( imgMaxHeight - reducedHeight > imgMaxWidth ) {
							imgMaxHeight = reducedHeight;
							imgMaxWidth = reducedHeight * naturalRatio;
						} else {
							imgMaxHeight = imgMaxWidth / naturalRatio;
						}
					} else {
						// If the height is reached before the width, we keep the maxHeight
						// and recalculate the width.
						// Unless the difference between the maxWidth and the reducedWidth
						// is higher than the maxHeight, where we keep the reducedWidth and
						// recalculate the height.
						const reducedWidth = imgMaxHeight * naturalRatio;
						if ( imgMaxWidth - reducedWidth > imgMaxHeight ) {
							imgMaxWidth = reducedWidth;
							imgMaxHeight = reducedWidth / naturalRatio;
						} else {
							imgMaxWidth = imgMaxHeight * naturalRatio;
						}
					}
					containerWidth = imgMaxWidth;
					containerHeight = imgMaxHeight;
					imgRatio = imgMaxWidth / imgMaxHeight;

					// Calculate the max size of the container.
					if ( originalRatio > imgRatio ) {
						containerMaxWidth = imgMaxWidth;
						containerMaxHeight = containerMaxWidth / originalRatio;
					} else {
						containerMaxHeight = imgMaxHeight;
						containerMaxWidth = containerMaxHeight * originalRatio;
					}
				}

				// If the image has been pixelated on purpose, keep that size.
				if (
					originalWidth > containerWidth ||
					originalHeight > containerHeight
				) {
					containerWidth = originalWidth;
					containerHeight = originalHeight;
				}

				// Calculate the final lightbox image size and the
				// scale factor. MaxWidth is either the window container
				// (accounting for padding) or the image resolution.
				let horizontalPadding = 0;
				if ( window.innerWidth > 480 ) {
					horizontalPadding = 80;
				} else if ( window.innerWidth > 1920 ) {
					horizontalPadding = 160;
				}
				const verticalPadding = 80;

				const targetMaxWidth = Math.min(
					window.innerWidth - horizontalPadding,
					containerWidth
				);
				const targetMaxHeight = Math.min(
					window.innerHeight - verticalPadding,
					containerHeight
				);
				const targetContainerRatio = targetMaxWidth / targetMaxHeight;

				if ( originalRatio > targetContainerRatio ) {
					// If targetMaxWidth is reached before targetMaxHeight
					containerWidth = targetMaxWidth;
					containerHeight = containerWidth / originalRatio;
				} else {
					// If targetMaxHeight is reached before targetMaxWidth
					containerHeight = targetMaxHeight;
					containerWidth = containerHeight * originalRatio;
				}

				const containerScale = originalWidth / containerWidth;
				const lightboxImgWidth =
					imgMaxWidth * ( containerWidth / containerMaxWidth );
				const lightboxImgHeight =
					imgMaxHeight * ( containerHeight / containerMaxHeight );

				// As of this writing, using the calculations above will render the lightbox
				// with a small, erroneous whitespace on the left side of the image in iOS Safari,
				// perhaps due to an inconsistency in how browsers handle absolute positioning and CSS
				// transformation. In any case, adding 1 pixel to the container width and height solves
				// the problem, though this can be removed if the issue is fixed in the future.
				state.overlayStyles = `
				:root {
					--wp--lightbox-initial-top-position: ${ screenPosY }px;
					--wp--lightbox-initial-left-position: ${ screenPosX }px;
					--wp--lightbox-container-width: ${ containerWidth + 1 }px;
					--wp--lightbox-container-height: ${ containerHeight + 1 }px;
					--wp--lightbox-image-width: ${ lightboxImgWidth }px;
					--wp--lightbox-image-height: ${ lightboxImgHeight }px;
					--wp--lightbox-scale: ${ containerScale };
					--wp--lightbox-scrollbar-width: ${
						window.innerWidth - document.documentElement.clientWidth
					}px;
				}
			`;
			},
			setButtonStyles() {
				const ctx = getContext();
				const { ref } = getElement();
				ctx.imageRef = ref;

				const {
					naturalWidth,
					naturalHeight,
					offsetWidth,
					offsetHeight,
				} = ref;

				// If the image isn't loaded yet, we can't
				// calculate where the button should be.
				if ( naturalWidth === 0 || naturalHeight === 0 ) {
					return;
				}

				const figure = ref.parentElement;
				const figureWidth = ref.parentElement.clientWidth;

				// We need special handling for the height because
				// a caption will cause the figure to be taller than
				// the image, which means we need to account for that
				// when calculating the placement of the button in the
				// top right corner of the image.
				let figureHeight = ref.parentElement.clientHeight;
				const caption = figure.querySelector( 'figcaption' );
				if ( caption ) {
					const captionComputedStyle =
						window.getComputedStyle( caption );
					if (
						! [ 'absolute', 'fixed' ].includes(
							captionComputedStyle.position
						)
					) {
						figureHeight =
							figureHeight -
							caption.offsetHeight -
							parseFloat( captionComputedStyle.marginTop ) -
							parseFloat( captionComputedStyle.marginBottom );
					}
				}

				const buttonOffsetTop = figureHeight - offsetHeight;
				const buttonOffsetRight = figureWidth - offsetWidth;

				// In the case of an image with object-fit: contain, the
				// size of the <img> element can be larger than the image itself,
				// so we need to calculate where to place the button.
				if ( ctx.scaleAttr === 'contain' ) {
					// Natural ratio of the image.
					const naturalRatio = naturalWidth / naturalHeight;
					// Offset ratio of the image.
					const offsetRatio = offsetWidth / offsetHeight;

					if ( naturalRatio >= offsetRatio ) {
						// If it reaches the width first, keep
						// the width and compute the height.
						const referenceHeight = offsetWidth / naturalRatio;
						ctx.imageButtonTop =
							( offsetHeight - referenceHeight ) / 2 +
							buttonOffsetTop +
							16;
						ctx.imageButtonRight = buttonOffsetRight + 16;
					} else {
						// If it reaches the height first, keep
						// the height and compute the width.
						const referenceWidth = offsetHeight * naturalRatio;
						ctx.imageButtonTop = buttonOffsetTop + 16;
						ctx.imageButtonRight =
							( offsetWidth - referenceWidth ) / 2 +
							buttonOffsetRight +
							16;
					}
				} else {
					ctx.imageButtonTop = buttonOffsetTop + 16;
					ctx.imageButtonRight = buttonOffsetRight + 16;
				}
			},
			setOverlayFocus() {
				if ( state.lightboxEnabled ) {
					// Moves the focus to the dialog when it opens.
					const { ref } = getElement();
					ref.focus();
				}
			},
			initTriggerButton() {
				const ctx = getContext();
				const { ref } = getElement();
				ctx.triggerRef = ref;
			},
		},
	},
	{ lock: true }
);
