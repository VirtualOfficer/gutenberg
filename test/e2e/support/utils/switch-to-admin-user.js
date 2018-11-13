/**
 * Internal dependencies
 */
import { goToWPPath } from './go-to-wp-path';
import { login } from './login';

const WP_ADMIN_USER = {
	username: 'admin',
	password: 'password',
};

const {
	WP_USERNAME = WP_ADMIN_USER.username,
} = process.env;

/**
 * Switches the current user to the admin user (if the user
 * running the test is not already the admin user).
 */
export async function switchToAdminUser() {
	if ( WP_USERNAME === WP_ADMIN_USER.username ) {
		return;
	}
	await goToWPPath( 'wp-login.php' );
	await login( WP_ADMIN_USER.username, WP_ADMIN_USER.password );
}
