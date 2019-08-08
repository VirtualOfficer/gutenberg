/**
 * WordPress dependencies
 */
import { getBlockMenuDefaultClassName } from '@wordpress/blocks';
import { withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DownloadableBlockListItem from '../downloadable-block-list-item';

const DOWNLOAD_ERROR_NOTICE_ID = 'block-download-error';
const INSTALL_ERROR_NOTICE_ID = 'block-install-error';

function DownloadableBlocksList( { items, onHover = () => {}, children, downloadAndInstallBlock } ) {
	return (
		/*
		 * Disable reason: The `list` ARIA role is redundant but
		 * Safari+VoiceOver won't announce the list otherwise.
		 */
		/* eslint-disable jsx-a11y/no-redundant-roles */
		<ul role="list" className="block-directory-downloadable-blocks-list">
			{ items && items.map( ( item ) =>
				<DownloadableBlockListItem
					key={ item.id }
					className={ getBlockMenuDefaultClassName( item.id ) }
					icons={ item.icons }
					onClick={ () => {
						downloadAndInstallBlock( item );
						onHover( null );
					} }
					onFocus={ () => onHover( item ) }
					onMouseEnter={ () => onHover( item ) }
					onMouseLeave={ () => onHover( null ) }
					onBlur={ () => onHover( null ) }
					isDisabled={ item.isDisabled }
					item={ item }
				/>
			) }
			{ children }
		</ul>
		/* eslint-enable jsx-a11y/no-redundant-roles */
	);
}

export default compose(
	withDispatch( ( ownDispatch, props ) => {
		const { installBlock, downloadBlock } = ownDispatch( 'core/block-directory' );
		const { createErrorNotice, removeNotice } = ownDispatch( 'core/notices' );
		const { onSelect } = props;

		return {
			downloadAndInstallBlock: ( item ) => {
				const onDownloadError = () => {
					createErrorNotice(
						__( 'Block previews can\'t load.' ),
						{
							id: DOWNLOAD_ERROR_NOTICE_ID,
							actions: [
								{
									label: __( 'Retry' ),
									onClick: () => {
										removeNotice( DOWNLOAD_ERROR_NOTICE_ID );
										downloadBlock( item, onSelect, onDownloadError );
									},
								},
							],
						} );
				};

				const onInstallBlockError = () => {
					createErrorNotice(
						__( 'Block previews can\'t install.' ),
						{
							id: INSTALL_ERROR_NOTICE_ID,
							actions: [
								{
									label: __( 'Retry' ),
									onClick: () => {
										removeNotice( INSTALL_ERROR_NOTICE_ID );
										installBlock( item.id, () => {}, onInstallBlockError );
									},
								},
								{
									label: __( 'Remove' ),
									onClick: () => {
										removeNotice( INSTALL_ERROR_NOTICE_ID );
									},
								},
							],
						}
					);
				};

				downloadBlock( item, () => {
					onSelect();
					installBlock( item.id, () => {}, onInstallBlockError );
				}, onDownloadError );
			},
		};
	} ),
)( DownloadableBlocksList );
