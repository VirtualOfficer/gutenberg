/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

/**
 * Component for checking if the post type supports page attributes.
 *
 * @param {Object}  props          - The component props.
 * @param {Element} props.children - The child components to render.
 *
 * @return {Element|null} The rendered child components or null if page attributes are not supported.
 */
export function PageAttributesCheck( { children } ) {
	const supportsPageAttributes = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( editorStore );
		const { getPostType } = select( coreStore );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );

		return !! postType?.supports?.[ 'page-attributes' ];
	}, [] );

	// Only render fields if post type supports page attributes or available templates exist.
	if ( ! supportsPageAttributes ) {
		return null;
	}

	return children;
}

export default PageAttributesCheck;
