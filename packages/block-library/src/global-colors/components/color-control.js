/**
 * External dependencies
 */
import { noop } from 'lodash';
/**
 * WordPress dependencies
 */
import { withState } from '@wordpress/compose';
import { ColorPicker, Popover } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Swatch from './swatch';

function ColorControl( { color, isOpen, onUpdateColor = noop, setState, name, slug } ) {
	const openPopover = () => setState( { isOpen: true } );
	const closePopover = () => setState( { isOpen: false } );
	const updateColor = ( { hex } ) => onUpdateColor( { color: hex, slug } );

	return (
		<div className="wp-block-global-colors-color-control">
			<div>
				{ isOpen && (
					<Popover onClose={ closePopover }>
						<ColorPicker color={ color } onChangeComplete={ updateColor } />
					</Popover>
				) }
				<Swatch color={ color } onClick={ openPopover } />
			</div>
			<div>
				<div className="wp-block-global-colors-color-control__title">
					{ name }
				</div>
				<div className="wp-block-global-colors-color-control__meta">
					{ color }
				</div>
			</div>
		</div>
	);
}

export default withState( { isOpen: false } )( ColorControl );
