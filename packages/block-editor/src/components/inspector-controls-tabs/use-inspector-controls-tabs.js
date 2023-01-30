/**
 * WordPress dependencies
 */
import { __experimentalUseSlotFills as useSlotFills } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InspectorControlsGroups from '../inspector-controls/groups';
import useIsListViewTabDisabled from './use-is-list-view-tab-disabled';
import { InspectorAdvancedControls } from '../inspector-controls';
import { TAB_LIST_VIEW, TAB_SETTINGS, TAB_STYLES } from './utils';
import { store as blockEditorStore } from '../../store';

const EMPTY_ARRAY = [];

function getShowTabs( blockName, tabSettings = {} ) {
	// Block specific setting takes precedence over generic default.
	if ( tabSettings[ blockName ] !== undefined ) {
		return tabSettings[ blockName ];
	}

	// Use generic default if set over the Gutenberg experiment option.
	if ( tabSettings.default !== undefined ) {
		return tabSettings.default;
	}

	return true;
}

export default function useInspectorControlsTabs( blockName ) {
	const tabs = [];
	const {
		border: borderGroup,
		color: colorGroup,
		default: defaultGroup,
		dimensions: dimensionsGroup,
		list: listGroup,
		position: positionGroup,
		typography: typographyGroup,
	} = InspectorControlsGroups;

	// List View Tab: If there are any fills for the list group add that tab.
	const listViewDisabled = useIsListViewTabDisabled( blockName );
	const listFills = useSlotFills( listGroup.Slot.__unstableName );

	if ( ! listViewDisabled && !! listFills && listFills.length ) {
		tabs.push( TAB_LIST_VIEW );
	}

	// Styles Tab: Add this tab if there are any fills for block supports
	// e.g. border, color, spacing, typography, etc.
	const styleFills = [
		...( useSlotFills( borderGroup.Slot.__unstableName ) || [] ),
		...( useSlotFills( colorGroup.Slot.__unstableName ) || [] ),
		...( useSlotFills( dimensionsGroup.Slot.__unstableName ) || [] ),
		...( useSlotFills( typographyGroup.Slot.__unstableName ) || [] ),
	];

	if ( styleFills.length ) {
		tabs.push( TAB_STYLES );
	}

	// Settings Tab: If we don't already have multiple tabs to display
	// (i.e. both list view and styles), check only the default and position
	// InspectorControls slots. If we have multiple tabs, we'll need to check
	// the advanced controls slot as well to ensure they are rendered.
	const advancedFills =
		useSlotFills( InspectorAdvancedControls.slotName ) || [];

	const settingsFills = [
		...( useSlotFills( defaultGroup.Slot.__unstableName ) || [] ),
		...( useSlotFills( positionGroup.Slot.__unstableName ) || [] ),
		...( tabs.length > 1 ? advancedFills : [] ),
	];

	if ( settingsFills.length ) {
		tabs.push( TAB_SETTINGS );
	}

	const tabSettings = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().blockInspectorTabs;
	}, [] );

	const showTabs = getShowTabs( blockName, tabSettings );

	return showTabs ? tabs : EMPTY_ARRAY;
}
