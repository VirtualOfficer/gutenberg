/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { Guide } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as preferencesStore } from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';

export default function WelcomeGuideTemplate() {
	const { toggle } = useDispatch( preferencesStore );

	const isVisible = useSelect( ( select ) => {
		const isActive = !! select( preferencesStore ).get(
			'core/edit-site',
			'welcomeGuideTemplate'
		);
		const { isPage, hasPageContentFocus } = select( editSiteStore );
		return isActive && isPage() && ! hasPageContentFocus();
	}, [] );

	if ( ! isVisible ) {
		return null;
	}

	const heading = __( 'Editing your template' );

	return (
		<Guide
			className="edit-site-welcome-guide guide-template"
			contentLabel={ heading }
			finishButtonText={ __( 'Continue' ) }
			onFinish={ () =>
				toggle( 'core/edit-site', 'welcomeGuideTemplate' )
			}
			pages={ [
				{
					image: (
						<video
							className="edit-site-welcome-guide__video"
							autoPlay
							loop
							muted
							width="312"
							height="240"
						>
							<source
								src="/wp-content/plugins/gutenberg/editing-your-template.mp4"
								type="video/mp4"
							/>
						</video>
					),
					content: (
						<>
							<h1 className="edit-site-welcome-guide__heading">
								{ heading }
							</h1>
							<p className="edit-site-welcome-guide__text">
								{ __(
									'You’re now editing your page’s template. To switch back to editing your page you can click the back button in the toolbar.'
								) }
							</p>
						</>
					),
				},
			] }
		/>
	);
}
