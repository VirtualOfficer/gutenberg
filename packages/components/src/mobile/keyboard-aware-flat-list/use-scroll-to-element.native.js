/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/** @typedef {import('@wordpress/element').RefObject} RefObject */
/**
 * Hook to scroll to a specified element by taking into account the Keyboard
 * and the Header.
 *
 * @param {RefObject} scrollViewRef   ScrollView reference.
 * @param {Function}  scrollToSection Function to scroll.
 * @return {Function[]} Function to scroll to an element.
 */
export default function useScrollToElement( scrollViewRef, scrollToSection ) {
	/**
	 * Function to scroll to an element.
	 *
	 * @param {RefObject} elementRef Ref of the element.
	 */
	const scrollToElement = useCallback(
		( elementRef ) => {
			if ( ! scrollViewRef || ! elementRef ) {
				return;
			}

			elementRef.current.measureLayout(
				scrollViewRef.current,
				( _x, y, _width, height ) => {
					if ( height || y ) {
						scrollToSection( Math.round( y ), height );
					}
				},
				() => {}
			);
		},
		[ scrollViewRef, scrollToSection ]
	);

	return [ scrollToElement ];
}
