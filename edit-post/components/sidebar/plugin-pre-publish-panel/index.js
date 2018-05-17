/**
 * WordPress dependencies
 */
import { createSlotFill, PanelBody } from '@wordpress/components';

const { Fill, Slot } = createSlotFill( 'PluginPrePublishPanel' );

const PluginPrePublishPanel = ( { children, title, initialOpen = false } ) => (
	<Fill>
		<PanelBody initialOpen={ initialOpen || ! title } title={ title }>
			{ children }
		</PanelBody>
	</Fill>
);

PluginPrePublishPanel.Slot = Slot;

export default PluginPrePublishPanel;
