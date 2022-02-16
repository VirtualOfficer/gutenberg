/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * Internal dependencies
 */
import { contextConnect, WordPressComponentProps } from '../../ui/context';
import { View } from '../../view';
import { useNavigatorBackLink } from './hook';
import type { NavigatorBackLinkProps } from '../types';

function NavigatorBackLink(
	props: WordPressComponentProps< NavigatorBackLinkProps, 'button' >,
	forwardedRef: ForwardedRef< any >
) {
	const navigatorBackLinkProps = useNavigatorBackLink( props );

	return <View ref={ forwardedRef } { ...navigatorBackLinkProps } />;
}

/**
 * The `NavigatorBackLink` component can be used to navigate to a screen and
 * should be used in combination with the `NavigatorProvider`, the
 * `NavigatorScreen` and the `NavigatorLink` components (or the `useNavigator`
 * hook).
 *
 * @example
 * ```jsx
 * import {
 *   __experimentalNavigatorProvider as NavigatorProvider,
 *   __experimentalNavigatorScreen as NavigatorScreen,
 *   __experimentalNavigatorLink as NavigatorLink,
 *   __experimentalNavigatorBackLink as NavigatorBackLink,
 * } from '@wordpress/components';
 *
 * const MyNavigation = () => (
 *   <NavigatorProvider initialPath="/">
 *     <NavigatorScreen path="/">
 *       <p>This is the home screen.</p>
 *        <NavigatorLink path="/child">
 *          Navigate to child screen.
 *       </NavigatorLink>
 *     </NavigatorScreen>
 *
 *     <NavigatorScreen path="/child">
 *       <p>This is the child screen.</p>
 *       <NavigatorBackLink>
 *         Go back
 *       </NavigatorBackLink>
 *     </NavigatorScreen>
 *   </NavigatorProvider>
 * );
 * ```
 */
const ConnectedNavigatorBackLink = contextConnect(
	NavigatorBackLink,
	'NavigatorBackLink'
);

export default ConnectedNavigatorBackLink;
