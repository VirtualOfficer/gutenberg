/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * Internal dependencies
 */
import type { WordPressComponentProps } from '../context';
import { contextConnect } from '../context';
import { View } from '../view';
import { useHeading } from './hook';
import type { HeadingProps as HeadingBaseProps } from './types';

export type HeadingProps = WordPressComponentProps< HeadingBaseProps, 'h1' >;

function UnconnectedHeading(
	props: HeadingProps,
	forwardedRef: ForwardedRef< any >
) {
	const headerProps = useHeading( props );

	return <View { ...headerProps } ref={ forwardedRef } />;
}

/**
 * `Heading` renders headings and titles using the library's typography system.
 *
 * ```jsx
 * import { __experimentalHeading as Heading } from "@wordpress/components";
 *
 * function Example() {
 *   return <Heading>Code is Poetry</Heading>;
 * }
 * ```
 */
export const Heading = contextConnect( UnconnectedHeading, 'Heading' );

export default Heading;
