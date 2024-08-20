/**
 * Internal dependencies
 */
import { Composite } from './composite';
import { useCompositeStore } from './composite/store';
import { positionToPlacement as __experimentalPopoverLegacyPositionToPlacement } from './popover/utils';
import { createPrivateSlotFill } from './slot-fill';
import { DropdownMenuV2 } from './dropdown-menu-v2';
import { ComponentsContext } from './context/context-system-provider';
import Theme from './theme';
import Tabs from './tabs';
import { kebabCase } from './utils/strings';
import { lock } from './lock-unlock';

export const privateApis = {};
lock( privateApis, {
	CompositeV2: Composite,
	CompositeGroupV2: Composite.Group,
	CompositeItemV2: Composite.Item,
	CompositeRowV2: Composite.Row,
	useCompositeStoreV2: useCompositeStore,
	__experimentalPopoverLegacyPositionToPlacement,
	createPrivateSlotFill,
	ComponentsContext,
	Tabs,
	Theme,
	DropdownMenuV2,
	DropdownMenuGroupV2: DropdownMenuV2.Group,
	DropdownMenuItemV2: DropdownMenuV2.Item,
	DropdownMenuCheckboxItemV2: DropdownMenuV2.CheckboxItem,
	DropdownMenuRadioItemV2: DropdownMenuV2.RadioItem,
	DropdownMenuSeparatorV2: DropdownMenuV2.Separator,
	DropdownMenuItemLabelV2: DropdownMenuV2.ItemLabel,
	DropdownMenuItemHelpTextV2: DropdownMenuV2.ItemHelpText,
	kebabCase,
} );
