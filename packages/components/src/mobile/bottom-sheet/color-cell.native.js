/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import { ColorIndicator } from '@wordpress/components';
/**
 * Internal dependencies
 */
import Cell from './cell';
import styles from './styles.scss';

export default function BottomSheetColorCell( props ) {
	const { color, withColorIndicator = true, ...cellProps } = props;

	return (
		<Cell
			{ ...cellProps }
			accessibilityRole={ 'button' }
			accessibilityHint={
				/* translators: accessibility text (hint for moving to color settings) */
				__( 'Double tap to go to color settings' )
			}
			editable={ false }
			value={ withColorIndicator && ! color && _x( 'Default', 'color' ) }
		>
			{ withColorIndicator && color && (
				<ColorIndicator color={ color } style={ styles.colorCircle } />
			) }
			<Icon icon={ chevronRight }></Icon>
		</Cell>
	);
}
