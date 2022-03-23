/**
 * External dependencies
 */
import { Dimensions } from 'react-native';
import {
	useSharedValue,
	useAnimatedRef,
	scrollTo,
	useAnimatedReaction,
	withTiming,
	withRepeat,
	cancelAnimation,
	Easing,
} from 'react-native-reanimated';

/**
 * Internal dependencies
 */
import { useBlockListContext } from '../block-list/block-list-context';

const SCROLL_INACTIVE_DISTANCE_PX = 50;
const SCROLL_INTERVAL_MS = 1000;
const VELOCITY_MULTIPLIER = 5000;

export default function useScrollWhenDragging() {
	const { scrollRef } = useBlockListContext();
	const animatedScrollRef = useAnimatedRef();
	animatedScrollRef( scrollRef );

	const windowHeight = Dimensions.get( 'window' ).height;

	const velocityY = useSharedValue( 0 );
	const offsetY = useSharedValue( 0 );
	const dragStartY = useSharedValue( 0 );
	const animationTimer = useSharedValue( 0 );
	const isAnimationTimerActive = useSharedValue( false );
	const isScrollActive = useSharedValue( false );

	const scroll = {
		offsetY: useSharedValue( 0 ),
		maxOffsetY: useSharedValue( 0 ),
	};
	const scrollHandler = ( event ) => {
		'worklet';
		const { contentSize, contentOffset, layoutMeasurement } = event;
		scroll.offsetY.value = contentOffset.y;
		scroll.maxOffsetY.value = contentSize.height - layoutMeasurement.height;
	};

	const stopScrolling = () => {
		'worklet';
		isAnimationTimerActive.value = false;
		isScrollActive.value = false;
		velocityY.value = 0;
	};

	const startScrolling = ( y ) => {
		'worklet';
		stopScrolling();
		offsetY.value = scroll.offsetY.value;
		dragStartY.value = y;

		animationTimer.value = 0;
		animationTimer.value = withRepeat(
			withTiming( 1, {
				duration: SCROLL_INTERVAL_MS,
				easing: Easing.linear,
			} ),
			-1,
			true
		);
		isAnimationTimerActive.value = true;
	};

	const scrollOnDragOver = ( y ) => {
		'worklet';
		const dragDistance = Math.max(
			Math.abs( y - dragStartY.value ) - SCROLL_INACTIVE_DISTANCE_PX,
			0
		);
		const distancePercentage = dragDistance / windowHeight;

		if ( ! isScrollActive.value ) {
			isScrollActive.value = dragDistance > 0;
		} else if ( y > dragStartY.value ) {
			// User is dragging downwards.
			velocityY.value = VELOCITY_MULTIPLIER * distancePercentage;
		} else if ( y < dragStartY.value ) {
			// User is dragging upwards.
			velocityY.value = -VELOCITY_MULTIPLIER * distancePercentage;
		} else {
			velocityY.value = 0;
		}
	};

	useAnimatedReaction(
		() => animationTimer.value,
		( value, previous ) => {
			const delta = Math.abs( value - previous );
			let newOffset = offsetY.value + delta * velocityY.value;

			if ( scroll.maxOffsetY.value !== 0 ) {
				newOffset = Math.max(
					0,
					Math.min( scroll.maxOffsetY.value, newOffset )
				);
			} else {
				// Scroll values are empty until receiving the first scroll event.
				// In that case, the max offset is unknown and we can't clamp the
				// new offset value.
				newOffset = Math.max( 0, newOffset );
			}
			offsetY.value = newOffset;

			if ( velocityY.value !== 0 ) {
				scrollTo( animatedScrollRef, 0, offsetY.value, false );
			} else if ( ! isAnimationTimerActive.value ) {
				cancelAnimation( animationTimer );
			}
		}
	);

	return [ startScrolling, scrollOnDragOver, stopScrolling, scrollHandler ];
}
