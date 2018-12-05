/**
 * External dependencies
 */
import { View, Text } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PlainText } from '@wordpress/editor';
import styles from './editor.scss';

export default class MoreEdit extends Component {
	constructor() {
		super( ...arguments );
		this.onChangeInput = this.onChangeInput.bind( this );

		this.state = {
			defaultText: __( 'Read more' ),
		};
	}

	onChangeInput( newValue ) {
		// Set defaultText to an empty string, allowing the user to clear/replace the input field's text
		this.setState( {
			defaultText: '',
		} );
		const value = newValue.length === 0 ? undefined : newValue;
		this.props.setAttributes( { customText: value } );
	}

	render() {
		const { attributes, onFocus, onBlur } = this.props;
		const { customText } = attributes;
		const defaultText = __( 'Read more' );
		const value = customText !== undefined ? customText : defaultText;

		return (
			<View style={ styles[ 'block-library-more__container' ] }>
				<View style={ styles[ 'block-library-more__sub-container' ] }>
					<Text style={ styles[ 'block-library-more__left-marker' ] }>&lt;!--</Text>
					<PlainText
						style={ styles[ 'block-library-more__plain-text' ] }
						value={ value }
						multiline={ true }
						underlineColorAndroid="transparent"
						onChange={ this.onChangeInput }
						placeholder={ defaultText }
						isSelected={ this.props.isSelected }
						onFocus={ onFocus }
						onBlur={ onBlur }
					/>
					<Text style={ styles[ 'block-library-more__right-marker' ] }>--&gt;</Text>
				</View>
			</View>
		);
	}
}
