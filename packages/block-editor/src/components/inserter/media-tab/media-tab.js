/**
 * WordPress dependencies
 */
import { __, isRTL } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { Button } from '@wordpress/components';
import { useCallback, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Icon, chevronRight, chevronLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { MediaCategoryPanel } from './media-panel';
import MediaUploadCheck from '../../media-upload/check';
import MediaUpload from '../../media-upload';
import { useMediaCategories } from './hooks';
import { getBlockAndPreviewFromMedia } from './utils';
import MobileTabNavigation from '../mobile-tab-navigation';

import CategoryTabs from '../category-tabs';
import InserterNoResults from '../no-results';
import { store as blockEditorStore } from '../../../store';

const ALLOWED_MEDIA_TYPES = [ 'image', 'video', 'audio' ];

function MediaTab( {
	rootClientId,
	selectedCategory,
	onSelectCategory,
	onInsert,
	children,
} ) {
	const mediaCategories = useMediaCategories( rootClientId );
	const isMobile = useViewportMatch( 'medium', '<' );
	const baseCssClass = 'block-editor-inserter__media-tabs';
	const { getSettings } = useSelect( blockEditorStore );
	const { imageDefaultSize } = getSettings();
	const onSelectMedia = useCallback(
		( media ) => {
			if ( ! media?.url ) {
				return;
			}
			const [ block ] = getBlockAndPreviewFromMedia(
				media,
				media.type,
				imageDefaultSize
			);
			onInsert( block );
		},
		[ onInsert, imageDefaultSize ]
	);
	const categories = useMemo(
		() =>
			mediaCategories.map( ( mediaCategory ) => ( {
				...mediaCategory,
				label: mediaCategory.labels.name,
			} ) ),
		[ mediaCategories ]
	);

	if ( ! categories.length ) {
		return <InserterNoResults />;
	}

	return (
		<>
			{ ! isMobile && (
				<div className={ `${ baseCssClass }-container` }>
					<CategoryTabs
						categories={ categories }
						selectedCategory={ selectedCategory }
						onSelectCategory={ onSelectCategory }
					>
						{ children }
					</CategoryTabs>
					<MediaUploadCheck>
						<MediaUpload
							multiple={ false }
							onSelect={ onSelectMedia }
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							render={ ( { open } ) => (
								<Button
									// TODO: Switch to `true` (40px size) if possible
									__next40pxDefaultSize={ false }
									onClick={ ( event ) => {
										// Safari doesn't emit a focus event on button elements when
										// clicked and we need to manually focus the button here.
										// The reason is that core's Media Library modal explicitly triggers a
										// focus event and therefore a `blur` event is triggered on a different
										// element, which doesn't contain the `data-unstable-ignore-focus-outside-for-relatedtarget`
										// attribute making the Inserter dialog to close.
										event.target.focus();
										open();
									} }
									className="block-editor-inserter__media-library-button"
									variant="secondary"
									data-unstable-ignore-focus-outside-for-relatedtarget=".media-modal"
								>
									{ __( 'Open Media Library' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
				</div>
			) }
			{ isMobile && (
				<MobileTabNavigation categories={ categories }>
					{ ( category ) => (
						<MediaCategoryPanel
							onInsert={ onInsert }
							rootClientId={ rootClientId }
							category={ category }
						/>
					) }
				</MobileTabNavigation>
			) }
		</>
	);
}

export default MediaTab;
