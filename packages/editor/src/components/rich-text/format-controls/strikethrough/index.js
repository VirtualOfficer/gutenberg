/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { Fill, ToolbarButton } from '@wordpress/components';
import { toggleFormat } from '@wordpress/rich-text';

const Shortcut = () => null;

export const strikethrough = {
	format: 'strikethrough',
	selector: 'del',
	edit( { isActive, value, onChange } ) {
		const onToggle = () => onChange( toggleFormat( value, { type: 'del' } ) );

		return (
			<Fragment>
				<Shortcut
					type="access"
					key="d"
					onUse={ onToggle }
				/>
				<Fill name="RichText.ToolbarControls.strikethrough">
					<ToolbarButton
						icon="editor-strikethrough"
						title={ __( 'Strikethrough' ) }
						onClick={ onToggle }
						isActive={ isActive }
					/>
				</Fill>
			</Fragment>
		);
	},
};
