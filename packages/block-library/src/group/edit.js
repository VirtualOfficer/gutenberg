/**
 * External dependencies
 */
import { get, filter, map, last, omit, pick, noop } from 'lodash';
/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL, revokeBlobURL } from '@wordpress/blob';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	BlockIcon,
	InnerBlocks,
	InspectorControls,
	MediaPlaceholder,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { image as icon } from '@wordpress/icons';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { createUpgradedEmbedBlock } from '../embed/util';

export const MIN_SIZE = 20;
export const LINK_DESTINATION_NONE = 'none';
export const LINK_DESTINATION_MEDIA = 'media';
export const LINK_DESTINATION_ATTACHMENT = 'attachment';
export const LINK_DESTINATION_CUSTOM = 'custom';
export const NEW_TAB_REL = [ 'noreferrer', 'noopener' ];
export const ALLOWED_MEDIA_TYPES = [ 'image' ];
export const DEFAULT_SIZE_SLUG = 'large';

function GroupEdit( {
	attributes,
	className,
	clientId,
	onReplace = noop,
	setAttributes,
} ) {
	const hasInnerBlocks = useSelect(
		( select ) => {
			const { getBlock } = select( 'core/block-editor' );
			const block = getBlock( clientId );
			return !! ( block && block.innerBlocks.length );
		},
		[ clientId ]
	);
	const BlockWrapper = Block[ attributes.tagName ];

	const { id, url, alt, linkDestination } = attributes;

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			setAttributes( {
				url: undefined,
				alt: undefined,
				id: undefined,
				title: undefined,
				caption: undefined,
			} );
			return;
		}

		let mediaAttributes = pickRelevantMediaFiles( media );

		// If the current image is temporary but an alt text was meanwhile written by the user,
		// make sure the text is not overwritten.
		if ( isTemporaryImage( id, url ) ) {
			if ( alt ) {
				mediaAttributes = omit( mediaAttributes, [ 'alt' ] );
			}
		}

		let additionalAttributes;
		// Reset the dimension attributes if changing to a different image.
		if ( ! media.id || media.id !== id ) {
			additionalAttributes = {
				width: undefined,
				height: undefined,
				sizeSlug: DEFAULT_SIZE_SLUG,
			};
		} else {
			// Keep the same url when selecting the same file, so "Image Size" option is not changed.
			additionalAttributes = { url };
		}

		// Check if the image is linked to it's media.
		if ( linkDestination === LINK_DESTINATION_MEDIA ) {
			// Update the media link.
			mediaAttributes.href = media.url;
		}

		// Check if the image is linked to the attachment page.
		if ( linkDestination === LINK_DESTINATION_ATTACHMENT ) {
			// Update the media link.
			mediaAttributes.href = media.link;
		}

		setAttributes( {
			...mediaAttributes,
			...additionalAttributes,
		} );
	};
	const isExternal = isExternalImage( id, url );
	const src = isExternal ? url : undefined;
	const mediaPreview = !! url && (
		<img
			alt={ __( 'Edit image' ) }
			title={ __( 'Edit image' ) }
			className={ 'edit-image-preview' }
			src={ url }
		/>
	);

	const onSelectURL = ( newURL ) => {
		if ( newURL !== url ) {
			setAttributes( {
				url: newURL,
				id: undefined,
				sizeSlug: DEFAULT_SIZE_SLUG,
			} );
		}
	};

	const onUploadError = ( message ) => {};

	const mediaPlaceholder = (
		<MediaPlaceholder
			icon={ <BlockIcon icon={ icon } /> }
			onSelect={ onSelectImage }
			onSelectURL={ onSelectURL }
			onError={ onUploadError }
			accept="image/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			value={ { id, src } }
			mediaPreview={ mediaPreview }
			disableMediaButtons={ url }
		/>
	);

	const img = (
		// Disable reason: Image itself is not meant to be interactive, but
		// should direct focus to block.
		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
		<>
			<img src={ url } />
		</>
		/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
	);

	return (
		<BlockWrapper className={ className }>
			<div
				className="wp-block-group__inner-container"
				style={ { background: url ? `url(${ url })` : null } }
			>
				<InnerBlocks
					renderAppender={
						hasInnerBlocks
							? undefined
							: () => <InnerBlocks.ButtonBlockAppender />
					}
				/>
			</div>
			<InspectorControls>
				<PanelBody title="Background">
					<div style={ { position: 'relative' } }>
						{ img }
						{ mediaPlaceholder }
					</div>
				</PanelBody>
			</InspectorControls>
		</BlockWrapper>
	);
}

export const pickRelevantMediaFiles = ( image ) => {
	const imageProps = pick( image, [ 'alt', 'id', 'link', 'caption' ] );
	imageProps.url =
		get( image, [ 'sizes', 'large', 'url' ] ) ||
		get( image, [ 'media_details', 'sizes', 'large', 'source_url' ] ) ||
		image.url;
	return imageProps;
};

/**
 * Is the URL a temporary blob URL? A blob URL is one that is used temporarily
 * while the image is being uploaded and will not have an id yet allocated.
 *
 * @param {number=} id The id of the image.
 * @param {string=} url The url of the image.
 *
 * @return {boolean} Is the URL a Blob URL
 */
const isTemporaryImage = ( id, url ) => ! id && isBlobURL( url );

/**
 * Is the url for the image hosted externally. An externally hosted image has no id
 * and is not a blob url.
 *
 * @param {number=} id  The id of the image.
 * @param {string=} url The url of the image.
 *
 * @return {boolean} Is the url an externally hosted url?
 */
const isExternalImage = ( id, url ) => url && ! id && ! isBlobURL( url );

export default GroupEdit;
