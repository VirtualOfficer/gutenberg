/**
 * External dependencies
 */
import { useStoreState } from '@ariakit/react';

/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Composite } from '../composite';
import Tooltip from '../tooltip';
import { VisuallyHidden } from '../visually-hidden';
import { ALIGNMENT_LABEL } from './utils';
import {
	Cell as CellView,
	Point,
} from './styles/alignment-matrix-control-styles';
import type { AlignmentMatrixControlCellProps } from './types';
import type { WordPressComponentProps } from '../context';

export default function Cell( {
	id,
	value,
	...props
}: WordPressComponentProps< AlignmentMatrixControlCellProps, 'span', false > ) {
	const tooltipText = ALIGNMENT_LABEL[ value ];

	const compositeContext = useContext( Composite.Context );

	const activeId = useStoreState( compositeContext?.store, 'activeId' );

	return (
		<Tooltip text={ tooltipText }>
			<Composite.Item
				id={ id }
				render={ <CellView { ...props } role="gridcell" /> }
			>
				{ /* VoiceOver needs a text content to be rendered within grid cell,
			otherwise it'll announce the content as "blank". So we use a visually
			hidden element instead of aria-label. */ }
				<VisuallyHidden>{ value }</VisuallyHidden>
				<Point
					isActive={ activeId !== undefined && activeId === id }
					role="presentation"
				/>
			</Composite.Item>
		</Tooltip>
	);
}
