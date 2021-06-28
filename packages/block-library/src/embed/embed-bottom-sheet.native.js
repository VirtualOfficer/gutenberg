/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	LinkSettingsNavigation,
	FooterMessageLink,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { isURL } from '@wordpress/url';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const linkSettingsOptions = {
	url: {
		label: __( 'Embed link' ),
		placeholder: __( 'Add link' ),
		autoFocus: true,
		autoFill: true,
	},
	footer: {
		label: (
			<FooterMessageLink
				href={ __( 'https://wordpress.org/support/article/embeds/' ) }
				value={ __( 'Learn more about embeds' ) }
			/>
		),
		separatorType: 'topFullWidth',
	},
};

const EmbedBottomSheet = ( { value, onClose, isVisible } ) => {
	const [ url, setUrl ] = useState( value );
	const { createErrorNotice } = useDispatch( noticesStore );

	function onCloseWithUrl() {
		if ( isURL( url ) ) {
			onClose( { url } );
		} else {
			createErrorNotice( __( 'Invalid URL. Please enter a valid URL.' ) );
			onClose( {} );
		}
	}

	return (
		<LinkSettingsNavigation
			isVisible={ isVisible }
			url={ url }
			setAttributes={ ( attributes ) => setUrl( attributes.url ) }
			onClose={ onCloseWithUrl }
			options={ linkSettingsOptions }
			withBottomSheet
			showIcon
		/>
	);
};

export default EmbedBottomSheet;
