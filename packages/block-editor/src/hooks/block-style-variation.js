/**
 * WordPress dependencies
 */
import { getBlockTypes, store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { useContext, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	GlobalStylesContext,
	toStyles,
	getBlockSelectors,
} from '../components/global-styles';
import { useStyleOverride } from './utils';
import { store as blockEditorStore } from '../store';
import { globalStylesDataKey } from '../store/private-keys';

function getVariationNameFromClass( className ) {
	const match = className?.match( /\bis-style-(?!default)(\S+)\b/ );
	return match ? match[ 1 ] : null;
}

function useBlockSyleVariation( name, variation, clientId ) {
	// Prefer global styles data in GlobalStylesContext, which are available
	// if in the site editor. Otherwise fall back to whatever is in the
	// editor settings and available in the post editor.
	const { merged: mergedConfig } = useContext( GlobalStylesContext );
	const { globalSettings, globalStyles } = useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		return {
			globalSettings: settings.__experimentalFeatures,
			globalStyles: settings[ globalStylesDataKey ],
		};
	}, [] );

	return useMemo( () => {
		const styles = mergedConfig?.styles ?? globalStyles;
		const variationStyles =
			styles?.blocks?.[ name ]?.variations?.[ variation ];

		return {
			settings: mergedConfig?.settings ?? globalSettings,
			// The variation style data is all that is needed to generate
			// the styles for the current application to a block. The variation
			// name is updated to match the instance specific class name.
			styles: {
				blocks: {
					[ name ]: {
						variations: {
							[ `${ variation }-${ clientId }` ]: variationStyles,
						},
					},
				},
			},
		};
	}, [
		mergedConfig,
		globalSettings,
		globalStyles,
		variation,
		clientId,
		name,
	] );
}

// Rather than leveraging `useInstanceId` here, the `clientId` is used.
// This is so that the variation style override's ID is predictable
// when the order of applied style variations changes.
function useBlockProps( { name, className, clientId } ) {
	const variation = getVariationNameFromClass( className );
	const variationClass = `is-style-${ variation }-${ clientId }`;

	const { getBlockStyles } = useSelect( blocksStore );

	const { settings, styles } = useBlockSyleVariation(
		name,
		variation,
		clientId
	);

	const variationStyles = useMemo( () => {
		if ( ! variation ) {
			return;
		}

		const variationConfig = { settings, styles };
		const blockSelectors = getBlockSelectors(
			getBlockTypes(),
			getBlockStyles,
			clientId
		);
		const hasBlockGapSupport = false;
		const hasFallbackGapSupport = true;
		const disableLayoutStyles = true;
		const isTemplate = true;

		return toStyles(
			variationConfig,
			blockSelectors,
			hasBlockGapSupport,
			hasFallbackGapSupport,
			disableLayoutStyles,
			isTemplate,
			{
				blockGap: false,
				blockStyles: true,
				layoutStyles: false,
				marginReset: false,
				presets: false,
				rootPadding: false,
			}
		);
	}, [ variation, settings, styles, getBlockStyles, clientId ] );

	useStyleOverride( {
		id: `variation-${ clientId }`,
		css: variationStyles,
		__unstableType: 'variation',
		// The clientId will be stored with the override and used to ensure
		// the order of overrides matches the order of blocks so that the
		// correct CSS cascade is maintained.
		clientId,
	} );

	return variation ? { className: variationClass } : {};
}

export default {
	hasSupport: () => true,
	attributeKeys: [ 'className' ],
	useBlockProps,
};
