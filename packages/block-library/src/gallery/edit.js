/**
 * External dependencies
 */
import { toString, isEqual, isEmpty, find } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import {
	Button,
	PanelBody,
	SelectControl,
	ToggleControl,
	withNotices,
	RangeControl,
} from '@wordpress/components';
import { MediaPlaceholder, InspectorControls } from '@wordpress/block-editor';
import { Platform, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { withViewportMatch } from '@wordpress/viewport';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { sharedIcon } from './shared-icon';
import { defaultColumnsNumber, pickRelevantMediaFiles } from './shared';
import { getHrefAndDestination, getImageSizeAttributes } from './utils';
import { getUpdatedLinkTargetSettings } from '../image/utils';
import Gallery from './gallery';
import {
	LINK_DESTINATION_ATTACHMENT,
	LINK_DESTINATION_MEDIA,
	LINK_DESTINATION_NONE,
} from './constants';
import useImageSizes from './use-image-sizes';

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

function GalleryEdit( props ) {
	const {
		setAttributes,
		attributes,
		clientId,
		noticeOperations,
		className,
		isSelected,
		noticeUI,
		insertBlocksAfter,
	} = props;

	const {
		linkTarget,
		linkTo,
		columns = defaultColumnsNumber( images ),
		sizeSlug,
		imageUploads,
		imageCrop,
	} = attributes;

	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch(
		'core/block-editor'
	);

	const currentImageOptions = { linkTarget, linkTo, sizeSlug };

	const [ images, setImages ] = useState( [] );
	const [ imageSettings, setImageSettings ] = useState( currentImageOptions );
	const [ dirtyImageOptions, setDirtyImageOptions ] = useState( false );

	useEffect( () => {
		const currentOptionsState = ! isEqual(
			currentImageOptions,
			imageSettings
		);
		if ( currentOptionsState !== dirtyImageOptions ) {
			setDirtyImageOptions( currentOptionsState );
		}
	}, [ currentImageOptions, imageSettings ] );

	const { getBlock, getMedia, getSettings } = useSelect( ( select ) => {
		return {
			getBlock: select( 'core/block-editor' ).getBlock,
			getSettings: select( 'core/block-editor' ).getSettings,
			getMedia: select( 'core' ).getMedia,
		};
	}, [] );

	const imageSizeOptions = useImageSizes( images, isSelected, getSettings );

	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(
		'core/block-editor'
	);

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
			sizeSlug,
		};
	}

	function onSelectImages( newImages ) {
		const newBlocks = newImages.map( ( image ) => {
			const existingBlock = find(
				images,
				( img ) => img.id === image.id
			);

			return createBlock( 'core/image', {
				...buildImageAttributes( existingBlock, image ),
				id: image.id,
			} );
		} );

		setImages(
			newImages.map( ( newImage ) => ( {
				id: toString( newImage.id ),
				url: newImage.url,
			} ) )
		);
		replaceInnerBlocks( clientId, newBlocks );
	}

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	function setLinkTo( value ) {
		setAttributes( { linkTo: value } );
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

	function toggleOpenInNewTab() {
		setAttributes( { linkTarget: linkTarget ? undefined : '_blank' } );
	}

	function applyImageOptions() {
		getBlock( clientId ).innerBlocks.forEach( ( block ) => {
			const image = block.attributes.id
				? find( images, { id: block.attributes.id } )
				: null;

			updateBlockAttributes( block.clientId, {
				...getHrefAndDestination( image.imageData, linkTo ),
				...getUpdatedLinkTargetSettings( linkTarget, block.attributes ),
				...getImageSizeAttributes( image.imageData, sizeSlug ),
			} );
		} );
		setDirtyImageOptions( false );
		setImageSettings( currentImageOptions );
	}

	function cancelImageOptions() {
		setAttributes( imageSettings );
	}

	function updateImagesSize( newSizeSlug ) {
		setAttributes( { sizeSlug: newSizeSlug } );
	}

	useEffect( () => {
		if (
			Platform.OS === 'web' &&
			imageUploads &&
			imageUploads.length > 0
		) {
			onSelectImages( imageUploads );
			setAttributes( { imageUploads: undefined } );
		}
	}, [ imageUploads ] );

	useEffect( () => {
		const newImages = getBlock( clientId ).innerBlocks.map( ( block ) => {
			return {
				id: block.attributes.id,
				url: block.attributes.url,
				attributes: block.attributes,
				imageData: getMedia( block.attributes.id ),
			};
		} );

		if ( ! isEqual( newImages, images ) ) {
			setImages( newImages );
		}
	} );

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

	const hasImages = !! images.length;

	const mediaPlaceholder = (
		<MediaPlaceholder
			addToGallery={ hasImages }
			isAppender={ hasImages }
			className={ className }
			disableMediaButtons={ hasImages && ! isSelected }
			icon={ ! hasImages && sharedIcon }
			labels={ {
				title: ! hasImages && __( 'Gallery' ),
				instructions: ! hasImages && PLACEHOLDER_TEXT,
			} }
			onSelect={ onSelectImages }
			accept="image/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			multiple
			value={ images }
			onError={ onUploadError }
			notices={ hasImages ? undefined : noticeUI }
		/>
	);

	if ( ! hasImages ) {
		return mediaPlaceholder;
	}

	const shouldShowSizeOptions = hasImages && ! isEmpty( imageSizeOptions );
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
					{ shouldShowSizeOptions && (
						<SelectControl
							label={ __( 'Image size' ) }
							value={ sizeSlug }
							options={ imageSizeOptions }
							onChange={ updateImagesSize }
						/>
					) }
					{ dirtyImageOptions && (
						<div className={ 'gallery-settings-buttons' }>
							<Button isPrimary onClick={ applyImageOptions }>
								{ __( 'Apply to all images' ) }
							</Button>
							<Button
								className={ 'cancel-apply-to-images' }
								isLink
								onClick={ cancelImageOptions }
							>
								{ __( 'Cancel' ) }
							</Button>
						</div>
					) }
				</PanelBody>
			</InspectorControls>
			{ noticeUI }
			<Gallery
				{ ...props }
				images={ images }
				mediaPlaceholder={ mediaPlaceholder }
				insertBlocksAfter={ insertBlocksAfter }
			/>
		</>
	);
}
export default compose( [
	withNotices,
	withViewportMatch( { isNarrow: '< small' } ),
] )( GalleryEdit );
