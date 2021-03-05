/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../../store';

function NavigationToggle( { icon, isOpen } ) {
	const { isActive, isRequestingSiteIcon, siteIconUrl } = useSelect(
		( select ) => {
			const { isFeatureActive } = select( editSiteStore );
			const { getEntityRecord } = select( 'core' );
			const { isResolving } = select( 'core/data' );
			const siteData =
				getEntityRecord( 'root', '__unstableBase', undefined ) || {};

			return {
				isActive: isFeatureActive( 'fullscreenMode' ),
				isRequestingSiteIcon: isResolving( 'core', 'getEntityRecord', [
					'root',
					'__unstableBase',
					undefined,
				] ),
				siteIconUrl: siteData.site_icon_url,
			};
		},
		[]
	);

	const { setIsNavigationPanelOpened } = useDispatch( editSiteStore );

	function closeOnEscape( event ) {
		if ( event.keyCode === ESCAPE ) {
			event.stopPropagation();
			setIsNavigationPanelOpened( false );
		}
	}

	if ( ! isActive ) {
		return null;
	}

	let buttonIcon = <Icon size="36px" icon={ wordpress } />;

	if ( siteIconUrl ) {
		buttonIcon = (
			<img
				alt={ __( 'Site Icon' ) }
				className="edit-site-navigation-toggle__site-icon"
				src={ siteIconUrl }
			/>
		);
	} else if ( isRequestingSiteIcon ) {
		buttonIcon = null;
	} else if ( icon ) {
		buttonIcon = <Icon size="36px" icon={ icon } />;
	}

	return (
		<div
			className={
				'edit-site-navigation-toggle' + ( isOpen ? ' is-open' : '' )
			}
			onKeyDown={ closeOnEscape }
		>
			<Button
				className="edit-site-navigation-toggle__button has-icon"
				label={ __( 'Toggle navigation' ) }
				onClick={ () => setIsNavigationPanelOpened( ! isOpen ) }
				showTooltip
			>
				{ buttonIcon }
			</Button>
		</div>
	);
}

export default NavigationToggle;
