/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty, concat, differenceBy, find, isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import {
	BaseControl,
	PanelBody,
	SelectControl,
	ToggleControl,
	withNotices,
	RangeControl,
	Spinner,
} from '@wordpress/components';
import {
	store as blockEditorStore,
	MediaPlaceholder,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { Platform, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';
import { View } from '@wordpress/primitives';
import { createBlock } from '@wordpress/blocks';
import { createBlobURL } from '@wordpress/blob';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { sharedIcon } from './shared-icon';
import { defaultColumnsNumber, pickRelevantMediaFiles } from './shared';
import { getHrefAndDestination } from './utils';
import {
	getUpdatedLinkTargetSettings,
	getImageSizeAttributes,
} from '../image/utils';
import Gallery from './gallery';
import {
	LINK_DESTINATION_ATTACHMENT,
	LINK_DESTINATION_MEDIA,
	LINK_DESTINATION_NONE,
} from './constants';
import useImageSizes from './use-image-sizes';
import useShortCodeTransform from './use-short-code-transform';

const MAX_COLUMNS = 8;
const linkOptions = [
	{ value: LINK_DESTINATION_ATTACHMENT, label: __( 'Attachment Page' ) },
	{ value: LINK_DESTINATION_MEDIA, label: __( 'Media File' ) },
	{ value: LINK_DESTINATION_NONE, label: __( 'None' ) },
];
const ALLOWED_MEDIA_TYPES = [ 'image' ];

const PLACEHOLDER_TEXT = Platform.select( {
	web: __(
		'Drag images, upload new ones or select files from your library.'
	),
	native: __( 'ADD MEDIA' ),
} );

const MOBILE_CONTROL_PROPS_RANGE_CONTROL = Platform.select( {
	web: {},
	native: { type: 'stepper' },
} );

const DEFAULT_GUTTER_SIZE = 16;
const MAX_GUTTER_SIZE = 100;
const MIN_GUTTER_SIZE = 0;

function GalleryEdit( props ) {
	const {
		setAttributes,
		attributes,
		className,
		clientId,
		noticeOperations,
		isSelected,
		noticeUI,
		insertBlocksAfter,
	} = props;

	const {
		imageCount,
		columns = defaultColumnsNumber( imageCount ),
		gutterSize,
		imageCrop,
		linkTarget,
		linkTo,
		shortCodeTransforms,
		sizeSlug,
	} = attributes;

	const {
		__unstableMarkNextChangeAsNotPersistent,
		replaceInnerBlocks,
		updateBlockAttributes,
	} = useDispatch( blockEditorStore );
	const { createSuccessNotice } = useDispatch( noticesStore );

	const { getBlock, getSettings, preferredStyle } = useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		const preferredStyleVariations =
			settings.__experimentalPreferredStyleVariations;
		return {
			getBlock: select( blockEditorStore ).getBlock,
			getSettings: select( blockEditorStore ).getSettings,
			preferredStyle: preferredStyleVariations?.value?.[ 'core/image' ],
		};
	}, [] );

	const innerBlockImages = useSelect(
		( select ) => {
			return select( blockEditorStore ).getBlock( clientId )?.innerBlocks;
		},
		[ clientId ]
	);

	const images = useSelect(
		( select ) => {
			if ( ! innerBlockImages?.length ) {
				return images;
			}

			// Avoid running the getMedia calls for images we already
			// have the data for.
			const existingImages =
				images?.length > 0
					? images.filter( ( image ) =>
							innerBlockImages.find(
								( imageBlock ) =>
									image.id === imageBlock.attributes.id
							)
					  )
					: [];

			const getMedia = select( coreStore ).getMedia;

			// Only populate the newImages array with images
			// that have an id and return data from getMedia call.
			const newImages = innerBlockImages
				.filter(
					( imageBlock ) =>
						imageBlock.attributes.id &&
						! images?.find(
							( img ) => img.id === imageBlock.attributes.id
						)
				)
				.map( ( imageBlock ) => {
					return {
						blockId: imageBlock.clientId,
						id: imageBlock.attributes.id,
						url: imageBlock.attributes.url,
						attributes: imageBlock.attributes,
						data: getMedia( imageBlock.attributes.id ),
					};
				} )
				.filter( ( img ) => img.data );

			if ( newImages.length > 0 ) {
				return [ ...existingImages, ...newImages ];
			}
			return isEqual( images, existingImages ) ? images : existingImages;
		},
		[ innerBlockImages ]
	);

	const shortCodeImages = useShortCodeTransform( shortCodeTransforms );

	useEffect( () => {
		if ( ! shortCodeTransforms || ! shortCodeImages ) {
			return;
		}
		updateImages( shortCodeImages );
		setAttributes( { shortCodeTransforms: undefined } );
	}, [ shortCodeTransforms, shortCodeImages ] );

	useEffect( () => {
		if ( ! innerBlockImages?.length ) {
			setAttributes( { imageCount: undefined } );
			return;
		}

		if ( images.length !== imageCount ) {
			setAttributes( { imageCount: innerBlockImages.length } );
		}
	}, [ images ] );

	const imageSizeOptions = useImageSizes( images, isSelected, getSettings );

	/**
	 * Determines the image attributes that should be applied to an image block
	 * after the gallery updates.
	 *
	 * The gallery will receive the full collection of images when a new image
	 * is added. As a result we need to reapply the image's original settings if
	 * it already existed in the gallery. If the image is in fact new, we need
	 * to apply the gallery's current settings to the image.
	 *
	 * @param  {Object} existingBlock Existing Image block that still exists after gallery update.
	 * @param  {Object} image         Media object for the actual image.
	 * @return {Object}               Attributes to set on the new image block.
	 */
	function buildImageAttributes( existingBlock, image ) {
		if ( existingBlock ) {
			return existingBlock.attributes;
		}
		return {
			...pickRelevantMediaFiles( image, sizeSlug ),
			...getHrefAndDestination( image, linkTo ),
			...getUpdatedLinkTargetSettings( linkTarget, attributes ),
			className: preferredStyle
				? `is-style-${ preferredStyle }`
				: undefined,
			sizeSlug,
		};
	}

	function updateImages( selectedImages ) {
		const newFileUploads =
			Object.prototype.toString.call( selectedImages ) ===
			'[object FileList]';

		const imageArray = newFileUploads
			? Array.from( selectedImages ).map( ( file ) => {
					if ( ! file.url ) {
						return pickRelevantMediaFiles( {
							url: createBlobURL( file ),
						} );
					}

					return file;
			  } )
			: selectedImages;

		const processedImages = imageArray
			.filter(
				( file ) => file.url || file.type?.indexOf( 'image/' ) === 0
			)
			.map( ( file ) => {
				if ( ! file.url ) {
					return pickRelevantMediaFiles( {
						url: createBlobURL( file ),
					} );
				}

				return file;
			} );

		const existingImageBlocks = ! newFileUploads
			? innerBlockImages.filter( ( block ) =>
					processedImages.find(
						( img ) => img.url === block.attributes.url
					)
			  )
			: innerBlockImages;

		const newImages = differenceBy( processedImages, images, 'url' );

		const newBlocks = newImages.map( ( image ) => {
			return createBlock( 'core/image', {
				...buildImageAttributes( false, image ),
				url: image.url,
				id: image.id,
			} );
		} );

		replaceInnerBlocks(
			clientId,
			concat( existingImageBlocks, newBlocks )
		);
	}

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	function setLinkTo( value ) {
		setAttributes( { linkTo: value } );
		getBlock( clientId ).innerBlocks.forEach( ( block ) => {
			const image = block.attributes.id
				? find( images, { id: block.attributes.id } )
				: null;
			updateBlockAttributes( block.clientId, {
				...getHrefAndDestination( image.data, value ),
			} );
		} );

		const linkToText = [ ...linkOptions ].find(
			( linkType ) => linkType.value === value
		);

		createSuccessNotice(
			sprintf(
				/* translators: %s: image size settings */
				__( 'All gallery image links updated to: %s' ),
				linkToText.label
			),
			{
				type: 'snackbar',
			}
		);
	}

	function setColumnsNumber( value ) {
		setAttributes( { columns: value } );
	}

	function toggleImageCrop() {
		setAttributes( { imageCrop: ! imageCrop } );
	}

	function getImageCropHelp( checked ) {
		return checked
			? __( 'Thumbnails are cropped to align.' )
			: __( 'Thumbnails are not cropped.' );
	}

	function toggleOpenInNewTab( openInNewTab ) {
		const newLinkTarget = openInNewTab ? '_blank' : undefined;
		setAttributes( { linkTarget: newLinkTarget } );
		getBlock( clientId ).innerBlocks.forEach( ( block ) => {
			updateBlockAttributes( block.clientId, {
				...getUpdatedLinkTargetSettings(
					newLinkTarget,
					block.attributes
				),
			} );
		} );
		const noticeText = openInNewTab
			? __( 'All gallery images updated to open in new tab' )
			: __( 'All gallery images updated to not open in new tab' );
		createSuccessNotice( noticeText, {
			type: 'snackbar',
		} );
	}

	function updateImagesSize( newSizeSlug ) {
		setAttributes( { sizeSlug: newSizeSlug } );
		getBlock( clientId ).innerBlocks.forEach( ( block ) => {
			const image = block.attributes.id
				? find( images, { id: block.attributes.id } )
				: null;
			updateBlockAttributes( block.clientId, {
				...getImageSizeAttributes( image.data, newSizeSlug ),
			} );
		} );

		const imageSize = imageSizeOptions.find(
			( size ) => size.value === newSizeSlug
		);

		createSuccessNotice(
			sprintf(
				/* translators: %s: image size settings */
				__( 'All gallery image sizes updated to: %s' ),
				imageSize.label
			),
			{
				type: 'snackbar',
			}
		);
	}

	useEffect( () => {
		// linkTo attribute must be saved so blocks don't break when changing image_default_link_type in options.php
		if ( ! linkTo ) {
			__unstableMarkNextChangeAsNotPersistent();
			setAttributes( {
				linkTo:
					window?.wp?.media?.view?.settings?.defaultProps?.link ||
					LINK_DESTINATION_NONE,
			} );
		}
	}, [ linkTo ] );

	const hasImages = !! innerBlockImages?.length;

	const mediaPlaceholder = (
		<MediaPlaceholder
			addToGallery={ hasImages }
			handleUpload={ false }
			isAppender={ hasImages }
			disableMediaButtons={ hasImages && ! isSelected }
			icon={ ! hasImages && sharedIcon }
			labels={ {
				title: ! hasImages && __( 'Gallery' ),
				instructions: ! hasImages && PLACEHOLDER_TEXT,
			} }
			onSelect={ updateImages }
			accept="image/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			multiple
			value={ images }
			onError={ onUploadError }
			notices={ hasImages ? undefined : noticeUI }
		/>
	);

	const blockProps = useBlockProps( {
		className: classnames( className, 'has-nested-images' ),
		style: {
			'--gallery-block--gutter-size':
				gutterSize !== undefined ? `${ gutterSize }px` : undefined,
		},
	} );

	if ( ! hasImages ) {
		return <View { ...blockProps }>{ mediaPlaceholder }</View>;
	}

	const shouldShowSizeOptions = ! isEmpty( imageSizeOptions );
	const hasLinkTo = linkTo && linkTo !== 'none';

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery settings' ) }>
					{ images.length > 1 && (
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ setColumnsNumber }
							min={ 1 }
							max={ Math.min( MAX_COLUMNS, images.length ) }
							{ ...MOBILE_CONTROL_PROPS_RANGE_CONTROL }
							required
						/>
					) }
					<RangeControl
						label={ __( 'Gutter size' ) }
						value={ gutterSize }
						onChange={ ( newGutterSize ) =>
							setAttributes( { gutterSize: newGutterSize } )
						}
						initialPosition={ DEFAULT_GUTTER_SIZE }
						min={ MIN_GUTTER_SIZE }
						max={ MAX_GUTTER_SIZE }
						{ ...MOBILE_CONTROL_PROPS_RANGE_CONTROL }
						resetFallbackValue={ DEFAULT_GUTTER_SIZE }
						allowReset
					/>
					<ToggleControl
						label={ __( 'Crop images' ) }
						checked={ !! imageCrop }
						onChange={ toggleImageCrop }
						help={ getImageCropHelp }
					/>
					<SelectControl
						label={ __( 'Link to' ) }
						value={ linkTo }
						onChange={ setLinkTo }
						options={ linkOptions }
					/>
					{ hasLinkTo && (
						<ToggleControl
							label={ __( 'Open in new tab' ) }
							checked={ linkTarget === '_blank' }
							onChange={ toggleOpenInNewTab }
						/>
					) }
					{ shouldShowSizeOptions ? (
						<SelectControl
							label={ __( 'Image size' ) }
							value={ sizeSlug }
							options={ imageSizeOptions }
							onChange={ updateImagesSize }
						/>
					) : (
						<BaseControl className={ 'gallery-image-sizes' }>
							<BaseControl.VisualLabel>
								{ __( 'Image size' ) }
							</BaseControl.VisualLabel>
							<View className={ 'gallery-image-sizes__loading' }>
								<Spinner />
								{ __( 'Loading options…' ) }
							</View>
						</BaseControl>
					) }
				</PanelBody>
			</InspectorControls>
			{ noticeUI }
			<Gallery
				{ ...props }
				images={ images }
				mediaPlaceholder={ mediaPlaceholder }
				blockProps={ blockProps }
				insertBlocksAfter={ insertBlocksAfter }
			/>
		</>
	);
}
export default compose( [
	withNotices,
	withViewportMatch( { isNarrow: '< small' } ),
] )( GalleryEdit );
