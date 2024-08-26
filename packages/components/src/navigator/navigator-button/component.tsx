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
import { useNavigatorButton } from './hook';
import type { NavigatorButtonProps } from '../types';

function UnconnectedNavigatorButton(
	props: WordPressComponentProps< NavigatorButtonProps, 'button' >,
	forwardedRef: ForwardedRef< any >
) {
	const navigatorButtonProps = useNavigatorButton( props );

	return <View ref={ forwardedRef } { ...navigatorButtonProps } />;
}

/**
 * The `Navigator.Button` component can be used to navigate to a screen and
 * should be used in combination with the `Navigator`, the `Navigator.Screen`
 * and the `Navigator.BackButton` components, and the `useNavigator` hook.
 *
 * @example
 * ```jsx
 * import { Navigator } from '@wordpress/components';
 *
 * const MyNavigation = () => (
 *   <Navigator initialPath="/">
 *     <Navigator.Screen path="/">
 *       <p>This is the home screen.</p>
 *        <Navigator.Button path="/child">
 *          Navigate to child screen.
 *       </Navigator.Button>
 *     </Navigator.Screen>
 *
 *     <Navigator.Screen path="/child">
 *       <p>This is the child screen.</p>
 *       <Navigator.BackButton>
 *         Go back
 *       </Navigator.BackButton>
 *     </Navigator.Screen>
 *   </Navigator>
 * );
 * ```
 */
export const NavigatorButton = contextConnect(
	UnconnectedNavigatorButton,
	'NavigatorButton'
);

export default NavigatorButton;
