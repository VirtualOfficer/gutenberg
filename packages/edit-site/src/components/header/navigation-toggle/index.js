/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';

function NavigationToggle( { icon, isOpen, onClick } ) {
	const {
		isActive,
		isRequestingSiteIcon,
		siteIconUrl,
		siteTitle,
	} = useSelect( ( select ) => {
		const { isFeatureActive } = select( 'core/edit-site' );
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
			siteTitle: siteData.name,
		};
	}, [] );

	if ( ! isActive ) {
		return null;
	}

	let buttonIcon = <Icon size="32px" icon={ wordpress } />;

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
		buttonIcon = <Icon size="32px" icon={ icon } />;
	}

	return (
		<div
			className={
				'edit-site-navigation-toggle' + ( isOpen ? ' is-open' : '' )
			}
		>
			<Button
				className="edit-site-navigation-toggle__button has-icon"
				label={ __( 'Toggle navigation' ) }
				onClick={ onClick }
				showTooltip
			>
				{ buttonIcon }
			</Button>

			{ isOpen && (
				<div className="edit-site-navigation-toggle__site-title">
					{ siteTitle }
				</div>
			) }
		</div>
	);
}

export default NavigationToggle;
