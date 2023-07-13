/**
 * WordPress dependencies
 */
import { hasBlockSupport } from '@wordpress/blocks';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function __experimentalUseHasBehaviorsPanel(
	settings,
	name,
	{ blockSupportOnly = false } = {}
) {
	if ( ! settings?.behaviors || ! window?.__experimentalInteractivityAPI ) {
		return false;
	}

	// If every behavior is disabled on block supports, do not show the behaviors inspector control.
	const hasSomeBlockSupport = Object.keys( settings?.behaviors ).some(
		( key ) => hasBlockSupport( name, `behaviors.${ key }` )
	);

	if ( blockSupportOnly ) {
		return hasSomeBlockSupport;
	}

	// If every behavior is disabled, do not show the behaviors inspector control.
	return Object.values( settings?.behaviors ).some(
		( value ) => value === true && hasSomeBlockSupport
	);
}

export default function ( { onChange, value, behaviors } ) {
	const defaultBehaviors = {
		default: {
			value: 'default',
			label: __( 'Default' ),
		},
		noBehaviors: {
			value: '',
			label: __( 'No behaviors' ),
		},
	};

	const behaviorsOptions = Object.entries( behaviors ).map(
		( [ behaviorName ] ) => ( {
			value: behaviorName,
			// Capitalize the first letter of the behavior name.
			label: `${ behaviorName.charAt( 0 ).toUpperCase() }${ behaviorName
				.slice( 1 )
				.toLowerCase() }`,
		} )
	);

	const options = [
		...Object.values( defaultBehaviors ),
		...behaviorsOptions,
	];

	const animations = [
		{
			value: 'zoom',
			label: __( 'Zoom' ),
		},
		{
			value: 'fade',
			label: __( 'Fade' ),
		},
	];
	return (
		<div style={ { marginTop: '2rem' } }>
			<SelectControl
				label={ __( 'Behaviors' ) }
				// At the moment we are only supporting one behavior (Lightbox)
				value={ value }
				options={ options }
				onChange={ onChange }
				hideCancelButton={ true }
				size="__unstable-large"
			/>
			{ value === 'lightbox' && (
				<SelectControl
					label={ __( 'Animation' ) }
					value={
						behaviors?.lightbox.animation
							? behaviors?.lightbox.animation
							: ''
					}
					options={ animations }
					onChange={ onChange }
					hideCancelButton={ false }
					size="__unstable-large"
				/>
			) }
		</div>
	);
}
