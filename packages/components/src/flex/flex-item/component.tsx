/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * Internal dependencies
 */
import type { WordPressComponentProps } from '../../context';
import { contextConnect } from '../../context';
import { View } from '../../view';
import { useFlexItem } from './hook';
import type { FlexItemProps as FlexItemBaseProps } from '../types';

export type FlexItemProps = WordPressComponentProps< FlexItemBaseProps, 'div' >;

function UnconnectedFlexItem(
	props: FlexItemProps,
	forwardedRef: ForwardedRef< any >
) {
	const flexItemProps = useFlexItem( props );

	return <View { ...flexItemProps } ref={ forwardedRef } />;
}

/**
 * `FlexItem` is a primitive layout component that aligns content within layout
 * containers like `Flex`.
 *
 * ```jsx
 * import { Flex, FlexItem } from '@wordpress/components';
 *
 * function Example() {
 *   return (
 *     <Flex>
 *       <FlexItem>...</FlexItem>
 *     </Flex>
 *   );
 * }
 * ```
 */
export const FlexItem = contextConnect( UnconnectedFlexItem, 'FlexItem' );

export default FlexItem;
