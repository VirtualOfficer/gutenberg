/**
 * WordPress dependencies
 */
import { createRoot, StrictMode } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PostsApp from './components/posts-app';

/**
 * Initializes the "Posts Dashboard"
 * @param {string} id DOM element id.
 */
export function initializePostsDashboard( id ) {
	if ( ! globalThis.IS_GUTENBERG_PLUGIN ) {
		return;
	}
	const target = document.getElementById( id );
	const root = createRoot( target );

	root.render(
		<StrictMode>
			<PostsApp />
		</StrictMode>
	);

	return root;
}
