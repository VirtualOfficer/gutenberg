/**
 * External dependencies
 */
import {
	Platform,
	AccessibilityInfo,
	findNodeHandle,
	TextInput,
	View,
	PixelRatio,
	AppState,
} from 'react-native';
import Slider from '@react-native-community/slider';

/**
 * WordPress dependencies
 */
import { _x, __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withPreferredColorScheme } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import Cell from './cell';
import styles from './range-cell.scss';
import borderStyles from './borderStyles.scss';

class BottomSheetRangeCell extends Component {
	constructor( props ) {
		super( props );
		this.handleToggleFocus = this.handleToggleFocus.bind( this );
		this.handleChange = this.handleChange.bind( this );
		this.handleValueSave = this.handleValueSave.bind( this );
		this.onChangeValue = this.onChangeValue.bind( this );
		this.onCellPress = this.onCellPress.bind( this );
		this.handleChangePixelRatio = this.handleChangePixelRatio.bind( this );

		const initialValue = this.validateInput(
			props.value || props.defaultValue || props.minimumValue
		);
		const fontScale = this.getFontScale();

		this.state = {
			accessible: true,
			sliderValue: initialValue,
			initialValue,
			hasFocus: false,
			fontScale,
		};
	}

	componentDidMount() {
		AppState.addEventListener( 'change', this.handleChangePixelRatio );
	}

	componentWillUnmount() {
		this.handleToggleFocus();
		AppState.removeEventListener( 'change', this.handleChangePixelRatio );
	}

	toFixed( num ) {
		const { toFixed = 0 } = this.props;
		const fixed = Math.pow( 10, toFixed );
		return Math.floor( num * fixed ) / fixed;
	}

	getFontScale() {
		return PixelRatio.getFontScale() < 1 ? 1 : PixelRatio.getFontScale();
	}

	handleChangePixelRatio( nextAppState ) {
		if ( nextAppState === 'active' ) {
			this.setState( { fontScale: this.getFontScale() } );
		}
	}

	handleChange( text ) {
		text =
			typeof text === 'number'
				? this.toFixed( text )
				: text.replace( ',', '.' );

		if ( ! isNaN( Number( text ) ) ) {
			this.setState( {
				sliderValue: text,
			} );
			this.announceCurrentValue( text );
		}
	}

	handleToggleFocus( validateInput = true ) {
		const newState = { hasFocus: ! this.state.hasFocus };

		if ( validateInput ) {
			const sliderValue = this.validateInput( this.state.sliderValue );
			this.handleValueSave( this.toFixed( sliderValue ) );
		}

		this.setState( newState );
	}

	validateInput( text ) {
		const { minimumValue, maximumValue } = this.props;
		if ( ! text ) {
			return minimumValue;
		}
		if ( typeof text === 'number' ) {
			return Math.min( Math.max( text, minimumValue ), maximumValue );
		}
		return Math.min(
			Math.max( text.replace( /[^0-9.]/g, '' ), minimumValue ),
			maximumValue
		);
	}

	handleValueSave( text ) {
		if ( ! isNaN( Number( text ) ) ) {
			const value = this.toFixed( text );
			this.onChangeValue( value );
			this.setState( { sliderValue: value } );
			this.announceCurrentValue( value );
		}
	}

	onChangeValue( initialValue ) {
		const { minimumValue, maximumValue, onChange } = this.props;

		let sliderValue = initialValue;
		if ( sliderValue < minimumValue ) {
			sliderValue = minimumValue;
		} else if ( sliderValue > maximumValue ) {
			sliderValue = maximumValue;
		}
		onChange( sliderValue );
	}

	onCellPress() {
		this.setState( { accessible: false } );
		if ( this.sliderRef ) {
			const reactTag = findNodeHandle( this.sliderRef );
			AccessibilityInfo.setAccessibilityFocus( reactTag );
		}
	}

	announceCurrentValue( value ) {
		/* translators: %s: current cell value. */
		const announcement = sprintf( __( 'Current value is %s' ), value );
		AccessibilityInfo.announceForAccessibility( announcement );
	}

	render() {
		const isIOS = Platform.OS === 'ios';
		const {
			value,
			defaultValue,
			minimumValue = 0,
			maximumValue = 10,
			disabled,
			step = 1,
			preferredColorScheme,
			minimumTrackTintColor = preferredColorScheme === 'light'
				? '#00669b'
				: '#5198d9',
			maximumTrackTintColor = isIOS ? '#e9eff3' : '#909090',
			thumbTintColor = ! isIOS && '#00669b',
			getStylesFromColorScheme,
			rangePreview,
			cellContainerStyle,
			shouldDisplayTextInput = true,
			...cellProps
		} = this.props;

		const { hasFocus, sliderValue, accessible, fontScale } = this.state;

		const accessibilityLabel = sprintf(
			/* translators: accessibility text. Inform about current value. %1$s: Control label %2$s: Current value. */
			_x(
				'%1$s. Current value is %2$s',
				'Slider for picking a number inside a range'
			),
			cellProps.label,
			value
		);

		const defaultSliderStyle = getStylesFromColorScheme(
			styles.sliderTextInput,
			styles.sliderDarkTextInput
		);

		const cellRowContainerStyle = [
			styles.cellRowStyles,
			isIOS ? styles.cellRowStylesIOS : styles.cellRowStylesAndroid,
		];

		return (
			<Cell
				{ ...cellProps }
				cellContainerStyle={ [
					styles.cellContainerStyles,
					cellContainerStyle,
				] }
				cellRowContainerStyle={ cellRowContainerStyle }
				accessibilityRole={ 'none' }
				value={ '' }
				editable={ false }
				activeOpacity={ 1 }
				accessible={ accessible }
				onPress={ this.onCellPress }
				accessibilityLabel={ accessibilityLabel }
				accessibilityHint={
					/* translators: accessibility text (hint for focusing a slider) */
					__( 'Double tap to change the value using slider' )
				}
			>
				<View style={ styles.container }>
					{ rangePreview }
					<Slider
						value={ this.validateInput( sliderValue ) }
						defaultValue={ defaultValue }
						disabled={ disabled }
						step={ step }
						minimumValue={ minimumValue }
						maximumValue={ maximumValue }
						minimumTrackTintColor={ minimumTrackTintColor }
						maximumTrackTintColor={ maximumTrackTintColor }
						thumbTintColor={ thumbTintColor }
						onValueChange={ this.handleChange }
						onSlidingComplete={ this.handleValueSave }
						ref={ ( slider ) => {
							this.sliderRef = slider;
						} }
						style={ styles.slider }
						accessibilityRole={ 'adjustable' }
					/>
					{ shouldDisplayTextInput && (
						<TextInput
							style={ [
								defaultSliderStyle,
								borderStyles.borderStyle,
								hasFocus && borderStyles.isSelected,
								{ width: 40 * fontScale },
							] }
							onChangeText={ this.handleChange }
							onFocus={ this.handleToggleFocus }
							onBlur={ this.handleToggleFocus }
							keyboardType="numeric"
							returnKeyType="done"
							value={ `${ sliderValue }` }
						/>
					) }
				</View>
			</Cell>
		);
	}
}

export default withPreferredColorScheme( BottomSheetRangeCell );
