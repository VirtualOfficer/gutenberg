/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { DropdownMenu, MenuGroup, MenuItem, Slot } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';

/*
 * coreDeviceTypes: An array of strings. The strings returned represent
 * deviceType values that belong to the core system. When the deviceType,
 * returned by `__experimentalGetPreviewDeviceType()`, is one of these values,
 * the built in VisualEditor is responsible for rendering a preview of that
 * type.

 * When the deviceType is something other than one of the coreDeviceTypes, we are
 * rendering a custom deviceType registered by the <PluginPreviewMenuItem /> and
 * <PluginPreview /> components, and defer to a <Slot /> filled by the plugin to
 * draw the preview.
 */
export const coreDeviceTypes = [ 'Desktop', 'Tablet', 'Mobile' ];

export default function PreviewOptions( {
	children,
	className,
	isEnabled = true,
	deviceType,
	setDeviceType,
} ) {
	const isMobile = useViewportMatch( 'small', '<' );
	if ( isMobile ) return null;

	const popoverProps = {
		className: classnames(
			className,
			'block-editor-post-preview__dropdown-content'
		),
		position: 'bottom left',
	};
	const toggleProps = {
		variant: 'tertiary',
		className: 'block-editor-post-preview__button-toggle',
		disabled: ! isEnabled,
		/* translators: button label text should, if possible, be under 16 characters. */
		children: __( 'Preview' ),
	};
	return (
		<DropdownMenu
			className="block-editor-post-preview__dropdown"
			popoverProps={ popoverProps }
			toggleProps={ toggleProps }
			icon={ null }
		>
			{ () => (
				<>
					<MenuGroup>
						<MenuItem
							className="block-editor-post-preview__button-resize"
							onClick={ () => setDeviceType( 'Desktop' ) }
							icon={ deviceType === 'Desktop' && check }
						>
							{ __( 'Desktop' ) }
						</MenuItem>
						<MenuItem
							className="block-editor-post-preview__button-resize"
							onClick={ () => setDeviceType( 'Tablet' ) }
							icon={ deviceType === 'Tablet' && check }
						>
							{ __( 'Tablet' ) }
						</MenuItem>
						<MenuItem
							className="block-editor-post-preview__button-resize"
							onClick={ () => setDeviceType( 'Mobile' ) }
							icon={ deviceType === 'Mobile' && check }
						>
							{ __( 'Mobile' ) }
						</MenuItem>
					</MenuGroup>

					<Slot name="core/block-editor/plugin-preview-menu">
						{ ( fills ) =>
							! fills || fills.length === 0 ? null : (
								<MenuGroup>{ fills }</MenuGroup>
							)
						}
					</Slot>

					{ children }
				</>
			) }
		</DropdownMenu>
	);
}
