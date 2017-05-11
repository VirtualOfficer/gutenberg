/**
 * WordPress dependencies
 */
import { __ } from 'i18n';

/**
 * Block categories.
 *
 * Group blocks together based on common traits
 * The block "inserter" relies on these to present the list blocks
 *
 * @var {Array} categories
 */
const categories = [
	{ slug: 'common', title: __( 'Common Blocks' ) },
	{ slug: 'layout', title: __( 'Layout Blocks' ) },
	{ slug: 'social', title: __( 'Social Media' ) }
];

/**
 * Returns all the block categories
 *
 * @return {Array} Block categories
 */
export function getCategories() {
	return categories;
}
