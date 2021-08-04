/**
 * WordPress dependencies
 */
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { Platform } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getBlockSupport } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InspectorControls from '../components/inspector-controls';
import {
	MarginEdit,
	hasMarginSupport,
	hasMarginValue,
	resetMargin,
	useIsMarginDisabled,
} from './margin';
import {
	PaddingEdit,
	hasPaddingSupport,
	hasPaddingValue,
	resetPadding,
	useIsPaddingDisabled,
} from './padding';
import { store as blockEditorStore } from '../store';
import { cleanEmptyObject } from './utils';

export const SPACING_SUPPORT_KEY = 'spacing';

/**
 * Inspector controls for dimensions support.
 *
 * @param {Object} props Block props.
 *
 * @return {WPElement} Inspector controls for spacing support features.
 */
export function DimensionsPanel( props ) {
	const { clientId, setAttributes } = props;
	const isPaddingDisabled = useIsPaddingDisabled( props );
	const isMarginDisabled = useIsMarginDisabled( props );
	const isDisabled = useIsDimensionsDisabled( props );
	const isSupported = hasDimensionsSupport( props.name );

	const getBlock = useSelect(
		( select ) => select( blockEditorStore ).getBlock,
		[ clientId ]
	);

	if ( isDisabled || ! isSupported ) {
		return null;
	}

	const defaultSpacingControls = getBlockSupport( props.name, [
		SPACING_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	// Attributes updated via the reset functions need to be freshly retrieved
	// to avoid attribute values being cached within the callbacks passed
	// through the from ToolsPanelItems into the parent ToolsPanel state when
	// they register.

	// Callback to reset all block support attributes controlled via this panel.
	const resetAll = () => {
		const { attributes } = getBlock( props.clientId );

		props.setAttributes( {
			style: cleanEmptyObject( {
				...attributes.style,
				spacing: {
					...attributes.style?.spacing,
					margin: undefined,
					padding: undefined,
				},
			} ),
		} );
	};

	const resetPaddingValue = () => {
		const { attributes } = getBlock( props.clientId );
		resetPadding( { attributes, setAttributes } );
	};

	const resetMarginValue = () => {
		const { attributes } = getBlock( props.clientId );
		resetMargin( { attributes, setAttributes } );
	};

	return (
		<InspectorControls key="dimensions">
			<ToolsPanel
				label={ __( 'Dimensions options' ) }
				header={ __( 'Dimensions' ) }
				resetAll={ resetAll }
			>
				{ ! isPaddingDisabled && (
					<ToolsPanelItem
						hasValue={ () => hasPaddingValue( props ) }
						label={ __( 'Padding' ) }
						onDeselect={ resetPaddingValue }
						isShownByDefault={ defaultSpacingControls?.padding }
					>
						<PaddingEdit { ...props } />
					</ToolsPanelItem>
				) }
				{ ! isMarginDisabled && (
					<ToolsPanelItem
						hasValue={ () => hasMarginValue( props ) }
						label={ __( 'Margin' ) }
						onDeselect={ resetMarginValue }
						isShownByDefault={ defaultSpacingControls?.margin }
					>
						<MarginEdit { ...props } />
					</ToolsPanelItem>
				) }
			</ToolsPanel>
		</InspectorControls>
	);
}

/**
 * Determine whether there is dimensions related block support.
 *
 * @param {string} blockName Block name.
 *
 * @return {boolean} Whether there is support.
 */
export function hasDimensionsSupport( blockName ) {
	if ( Platform.OS !== 'web' ) {
		return false;
	}

	return hasPaddingSupport( blockName ) || hasMarginSupport( blockName );
}

/**
 * Determines whether dimensions support has been disabled.
 *
 * @param {Object} props Block properties.
 *
 * @return {boolean} If spacing support is completely disabled.
 */
const useIsDimensionsDisabled = ( props = {} ) => {
	const paddingDisabled = useIsPaddingDisabled( props );
	const marginDisabled = useIsMarginDisabled( props );

	return paddingDisabled && marginDisabled;
};

/**
 * Custom hook to retrieve which padding/margin is supported
 * e.g. top, right, bottom or left.
 *
 * Sides are opted into by default. It is only if a specific side is set to
 * false that it is omitted.
 *
 * @param {string} blockName Block name.
 * @param {string} feature   The feature custom sides relate to e.g. padding or margins.
 *
 * @return {Object} Sides supporting custom margin.
 */
export function useCustomSides( blockName, feature ) {
	const support = getBlockSupport( blockName, SPACING_SUPPORT_KEY );

	// Skip when setting is boolean as theme isn't setting arbitrary sides.
	if ( typeof support[ feature ] === 'boolean' ) {
		return;
	}

	return support[ feature ];
}
