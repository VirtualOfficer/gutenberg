/**
 * External dependencies
 */
import {
	Animated,
	Easing,
	Text,
	TouchableWithoutFeedback,
	View,
	Dimensions,
} from 'react-native';

/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const Notice = ( { onNoticeHidden, content, id } ) => {
	const [ width, setWidth ] = useState( Dimensions.get( 'window' ).width );
	const [ visible, setVisible ] = useState( true );

	const animationValue = useRef( new Animated.Value( 1 ) ).current;
	const timer = useRef( null );

	const onDimensionsChange = () => {
		setWidth( Dimensions.get( 'window' ).width );
	};

	useEffect( () => {
		Dimensions.addEventListener( 'change', onDimensionsChange );
		return () => {
			Dimensions.removeEventListener( 'change', onDimensionsChange );
		};
	}, [] );

	useEffect( () => {
		startAnimation();
		return () => {
			clearTimeout( timer?.current );
		};
	}, [ visible ] );

	const onHide = () => {
		setVisible( false );
	};

	const startAnimation = () => {
		Animated.timing( animationValue, {
			toValue: visible ? 1 : 0,
			duration: visible ? 300 : 150,
			useNativeDriver: true,
			easing: Easing.out( Easing.quad ),
		} ).start( () => {
			if ( visible && onNoticeHidden ) {
				timer.current = setTimeout( () => {
					onHide();
				}, 3000 );
			}

			if ( ! visible && onNoticeHidden ) {
				onNoticeHidden( id );
			}
		} );
	};

	return (
		<>
			<Animated.View
				style={ {
					transform: [
						{
							translateY: animationValue.interpolate( {
								inputRange: [ 0, 1 ],
								outputRange: [ -30, 0 ],
							} ),
						},
					],
				} }
			>
				<TouchableWithoutFeedback onPress={ onHide }>
					<View
						style={ [
							styles.notice,
							{
								width,
								shadowColor: styles.noticeShadow.color,
								shadowOffset: {
									width: 0,
									height: 2,
								},
								shadowOpacity: 0.25,
								shadowRadius: 2,
								elevation: 2,
							},
						] }
					>
						<Text style={ styles.text }>{ content }</Text>
					</View>
				</TouchableWithoutFeedback>
			</Animated.View>
		</>
	);
};

export default Notice;
