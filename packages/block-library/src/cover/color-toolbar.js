/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { DOWN } from '@wordpress/keycodes';
import { Button, Dropdown, ToolbarGroup } from '@wordpress/components';

export function ColorToolbar( props ) {
	const { label = __( 'Color' ), children } = props;

	const icon = <Icon icon={ wordpress } />;
	const className = 'block-editor-block-color-toolbar';
	const popoverClassName = `${ className }__popover`;

	return (
		<Dropdown
			position="bottom right"
			className={ className }
			popoverProps={ { className: popoverClassName } }
			renderToggle={ ( { onToggle, isOpen } ) => {
				const openOnArrowDown = ( event ) => {
					if ( ! isOpen && event.keyCode === DOWN ) {
						event.preventDefault();
						event.stopPropagation();
						onToggle();
					}
				};

				return (
					<ToolbarGroup>
						<Button
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							onKeyDown={ openOnArrowDown }
							label={ label }
							icon={ icon }
							showTooltip
						/>
					</ToolbarGroup>
				);
			} }
			renderContent={ () => <>{ children }</> }
		/>
	);
}

export default ColorToolbar;
