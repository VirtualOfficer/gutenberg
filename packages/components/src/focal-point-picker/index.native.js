/**
 * External dependencies
 */
import { Animated, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Image, RangeControl } from '@wordpress/components';
import { Path, SVG } from '@wordpress/primitives';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const MIN_POSITION_VALUE = 0;
const MAX_POSITION_VALUE = 100;

export default function FocalPointPicker( props ) {
	const { focalPoint, onChange, shouldEnableBottomSheetScroll, url } = props;

	const [ containerSize, setContainerSize ] = useState( null );

	// TODO(David): Need to round the value placed into state at some point, to
	// avoid floats in sliders. Maybe do it in the slider?
	function setPosition( { x, y } ) {
		onChange( ( prevState ) => ( {
			...prevState,
			...( x ? { x } : {} ),
			...( y ? { y } : {} ),
		} ) );
	}

	const _touchX = new Animated.Value(
		focalPoint.x * containerSize?.width || 1
	);
	const _touchY = new Animated.Value(
		focalPoint.y * containerSize?.height || 1
	);

	function onHandlerStateChange( { nativeEvent } ) {
		switch ( nativeEvent.state ) {
			case State.BEGAN:
				shouldEnableBottomSheetScroll( false );
				break;
			case State.ACTIVE:
				shouldEnableBottomSheetScroll( false );
				break;
			default:
				shouldEnableBottomSheetScroll( true );
				break;
		}
	}

	return (
		<View style={ styles.container }>
			<View style={ [ styles.media ] }>
				{ /* TODO(David): Add TapGestureHandler to allow tapping to set focal point. */ }
				<PanGestureHandler
					minDist={ 1 }
					onHandlerStateChange={ onHandlerStateChange }
					onGestureEvent={ Animated.event(
						[ { nativeEvent: { x: _touchX, y: _touchY } } ],
						{
							useNativeDriver: true,
							listener: ( { nativeEvent } ) => {
								const { x, y } = nativeEvent;
								setPosition( {
									x: x / containerSize?.width,
									y: y / containerSize?.height,
								} );
							},
						}
					) }
				>
					<Animated.View
						onLayout={ ( event ) => {
							const { height, width } = event.nativeEvent.layout;

							if (
								width !== 0 &&
								height !== 0 &&
								( containerSize?.width !== width ||
									containerSize?.height !== height )
							) {
								setContainerSize( { width, height } );
							}
						} }
					>
						<Image url={ url } width={ styles.image.width } />
					</Animated.View>
				</PanGestureHandler>
				<Animated.View
					style={ [
						styles.focalPointWrapper,
						{
							transform: [
								{
									translateX: _touchX.interpolate( {
										inputRange: [
											0,
											containerSize?.width || 0,
										],
										outputRange: [
											0,
											containerSize?.width || 0,
										],
										extrapolate: 'clamp',
									} ),
								},
								{
									translateY: _touchY.interpolate( {
										inputRange: [
											0,
											containerSize?.height || 0,
										],
										outputRange: [
											0,
											containerSize?.height || 0,
										],
										extrapolate: 'clamp',
									} ),
								},
							],
						},
					] }
				>
					<SVG
						style={ styles.focalPointIcon }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 30 30"
					>
						<Path
							style={ styles.focalPointIconPathOutline }
							d="M15 1C7.3 1 1 7.3 1 15s6.3 14 14 14 14-6.3 14-14S22.7 1 15 1zm0 22c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
						/>
						<Path
							style={ styles.focalPointIconPathFill }
							d="M15 3C8.4 3 3 8.4 3 15s5.4 12 12 12 12-5.4 12-12S21.6 3 15 3zm0 22C9.5 25 5 20.5 5 15S9.5 5 15 5s10 4.5 10 10-4.5 10-10 10z"
						/>
					</SVG>
				</Animated.View>
			</View>
			{ /* TODO(David): RangeControl is uncontrolled, how might I set its value via the pan gesture? */ }
			<RangeControl
				value={ focalPoint.x * 100 }
				label={ __( 'X-Axis Position' ) }
				min={ MIN_POSITION_VALUE }
				max={ MAX_POSITION_VALUE }
				initialPosition={ 50 }
				allowReset
				onChange={ ( x ) => setPosition( { x: x / 100 } ) }
			/>
			<RangeControl
				value={ focalPoint.y * 100 }
				label={ __( 'Y-Axis Position' ) }
				min={ MIN_POSITION_VALUE }
				max={ MAX_POSITION_VALUE }
				initialPosition={ 50 }
				allowReset
				onChange={ ( y ) => setPosition( { y: y / 100 } ) }
			/>
		</View>
	);
}
