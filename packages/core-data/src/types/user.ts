/**
 * Internal dependencies
 */
import { AvatarUrls, Context, ContextualField, WithoutNevers } from './common';

interface FullUser< C extends Context > {
	/**
	 * Unique identifier for the user.
	 */
	id: number;
	/**
	 * Login name for the user.
	 */
	username: ContextualField< string, 'edit', C >;
	/**
	 * Display name for the user.
	 */
	name: string;
	/**
	 * First name for the user.
	 */
	first_name: ContextualField< string, 'edit', C >;
	/**
	 * Last name for the user.
	 */
	last_name: ContextualField< string, 'edit', C >;
	/**
	 * The email address for the user.
	 */
	email: ContextualField< string, 'edit', C >;
	/**
	 * URL of the user.
	 */
	url: string;
	/**
	 * Description of the user.
	 */
	description: string;
	/**
	 * Author URL of the user.
	 */
	link: string;
	/**
	 * Locale for the user.
	 */
	locale: ContextualField< '' | 'en_US', 'edit', C >;
	/**
	 * The nickname for the user.
	 */
	nickname: ContextualField< string, 'edit', C >;
	/**
	 * An alphanumeric identifier for the user.
	 */
	slug: string;
	/**
	 * Registration date for the user.
	 */
	registered_date: ContextualField< string, 'edit', C >;
	/**
	 * Roles assigned to the user.
	 */
	roles: ContextualField< string[], 'edit', C >;
	/**
	 * Password for the user (never included).
	 */
	password: string;
	/**
	 * All capabilities assigned to the user.
	 */
	capabilities: ContextualField< Record< string, string >, 'edit', C >;
	/**
	 * Any extra capabilities assigned to the user.
	 */
	extra_capabilities: ContextualField< Record< string, string >, 'edit', C >;
	/**
	 * Avatar URLs for the user.
	 */
	avatar_urls: AvatarUrls;
	/**
	 * Meta fields.
	 */
	meta: ContextualField< Record< string, string >, 'view' | 'edit', C >;
}

export type User< C extends Context > = WithoutNevers< FullUser< C > >;
export interface EditedUser extends User< 'edit' > {}
