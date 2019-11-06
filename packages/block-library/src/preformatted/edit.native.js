/**
 * External dependencies
 */
import { View } from 'react-native';
/**
 * WordPress dependencies
 */
import { withPreferredColorScheme } from '@wordpress/compose';
/**
 * Internal dependencies
 */
import WebPreformattedEdit from './edit.js';
import stylesheet from './styles.scss';

function PreformattedEdit( props ) {
	const { getDynamicStyles } = props;
	const styles = getDynamicStyles( stylesheet );
	const propsWithStyle = {
		...props,
		style: styles.wpRichText,
	};
	return (
		<View style={ styles.wpBlockPreformatted } >
			<WebPreformattedEdit
				{ ...propsWithStyle }
			/>
		</View>
	);
}

export default withPreferredColorScheme( PreformattedEdit );
