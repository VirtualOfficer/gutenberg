/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';

const { Fill: PinnedPlugins, Slot } = createSlotFill( 'PinnedPlugins' );

PinnedPlugins.Slot = ( { fillProps } ) => (
	<Slot fillProps={ fillProps }>
		{ ( fills ) => ! isEmpty( fills ) && (
			<div className="edit-post-pinned-plugins">
				{ fills }
			</div>
		) }
	</Slot>
);

export default PinnedPlugins;
