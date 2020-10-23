/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Cropper from './cropper';
import ZoomDropdown from './zoom-dropdown';
import AspectRatioDropdown from './aspect-ratio-dropdown';
import RotationButton from './rotation-button';
import FormControls from './form-controls';

export default function ImageEditor( { url } ) {
	return (
		<>
			<Cropper url={ url } />
			<BlockControls>
				<ToolbarGroup>
					<ZoomDropdown />
					<ToolbarItem>
						{ ( toggleProps ) => (
							<AspectRatioDropdown toggleProps={ toggleProps } />
						) }
					</ToolbarItem>
				</ToolbarGroup>
				<ToolbarGroup>
					<RotationButton />
				</ToolbarGroup>
				<ToolbarGroup>
					<FormControls />
				</ToolbarGroup>
			</BlockControls>
		</>
	);
}

export { default as ImageEditingProvider } from './context';
