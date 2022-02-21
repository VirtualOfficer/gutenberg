/**
 * Internal dependencies
 */
import { Context, OmitNevers } from './helpers';

export interface ExtensibleMenuLocation< C extends Context > {
	/**
	 * The name of the menu location.
	 */
	name: string;
	/**
	 * The description of the menu location.
	 */
	description: string;
	/**
	 * The ID of the assigned menu.
	 */
	menu: number;
}

export type MenuLocation< C extends Context > = OmitNevers<
	ExtensibleMenuLocation< C >
>;
