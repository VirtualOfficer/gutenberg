/**
 * WordPress dependencies
 */
import { Composite } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MediaPreview } from './media-preview';

const useCompositeStore = Composite.useStore;

function MediaList( {
	mediaList,
	category,
	onClick,
	label = __( 'Media List' ),
} ) {
	const compositeStore = useCompositeStore();
	return (
		<Composite.Root
			store={ compositeStore }
			role="listbox"
			className="block-editor-inserter__media-list"
			aria-label={ label }
		>
			{ mediaList.map( ( media, index ) => (
				<MediaPreview
					key={ media.id || media.sourceId || index }
					media={ media }
					category={ category }
					onClick={ onClick }
				/>
			) ) }
		</Composite.Root>
	);
}

export default MediaList;
