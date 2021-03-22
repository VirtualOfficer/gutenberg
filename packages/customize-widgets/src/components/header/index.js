/**
 * WordPress dependencies
 */
import { createPortal, forwardRef } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { Button, ToolbarItem } from '@wordpress/components';
import { NavigableToolbar } from '@wordpress/block-editor';
import { plus } from '@wordpress/icons';

/**
 * External dependencies
 */
import { DialogDisclosure } from 'reakit/Dialog';

/**
 * Internal dependencies
 */
import Inserter from '../inserter';
import { inserterContainer } from '../inserter/inserter-outer-section';

const DialogDisclosureButton = forwardRef( ( props, ref ) => (
	<DialogDisclosure as={ Button } { ...props } ref={ ref } />
) );

function Header( { inserter } ) {
	return (
		<>
			<div className="customize-widgets-header">
				<NavigableToolbar
					className="customize-widgets-header-toolbar"
					aria-label={ __( 'Document tools' ) }
				>
					<ToolbarItem
						as={ DialogDisclosureButton }
						className="customize-widgets-header-toolbar__inserter-toggle"
						isPressed={ inserter.visible }
						isPrimary
						icon={ plus }
						label={ _x(
							'Add block',
							'Generic label for block inserter button'
						) }
						onClick={ () => {
							if ( inserter.expanded() ) {
								inserter.collapse();
							} else {
								inserter.expand();
							}
						} }
					/>
				</NavigableToolbar>
			</div>

			{ createPortal(
				<Inserter inserter={ inserter } />,
				inserterContainer
			) }
		</>
	);
}

export default Header;
