/**
 * Internal dependencies
 */
import { Navigator as NavigatorProvider } from './navigator';
import { NavigatorScreen } from './navigator-screen';
import { NavigatorButton } from './navigator-button';
import { NavigatorBackButton } from './navigator-back-button';
export { useNavigator } from './use-navigator';

export const Navigator = Object.assign( NavigatorProvider, {
	dislayName: 'Navigator',
	Screen: Object.assign( NavigatorScreen, {
		displayName: 'Navigator.Screen',
	} ),
	Button: Object.assign( NavigatorButton, {
		displayName: 'Navigator.Button',
	} ),
	BackButton: Object.assign( NavigatorBackButton, {
		displayName: 'Navigator.BackButton',
	} ),
} );
