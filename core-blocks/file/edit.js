/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getBlobByURL, revokeBlobURL } from '@wordpress/utils';
import {
	ClipboardButton,
	IconButton,
	Toolbar,
	withNotices,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { Component, compose, Fragment } from '@wordpress/element';
import {
	MediaUpload,
	MediaPlaceholder,
	BlockControls,
	RichText,
	editorMediaUpload,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';
import FileBlockInspector from './inspector';
import FileBlockEditableLink from './editable-link';

class FileEdit extends Component {
	constructor() {
		super( ...arguments );

		const {
			showDownloadButton = true,
			buttonText = __( 'Download' ),
		} = this.props.attributes;

		this.onSelectFile = this.onSelectFile.bind( this );

		// Initialize default values if undefined
		this.props.setAttributes( {
			showDownloadButton,
			buttonText,
		} );

		this.state = {
			showCopyConfirmation: false,
		};
	}

	componentDidMount() {
		const { href } = this.props.attributes;

		// Upload a file drag-and-dropped into the editor
		if ( this.isBlobURL( href ) ) {
			getBlobByURL( href )
				.then( ( file ) => {
					editorMediaUpload( {
						allowedType: '*',
						filesList: [ file ],
						onFileChange: ( [ media ] ) => this.onSelectFile( media ),
					} );
					revokeBlobURL( href );
				} );
		}
	}

	componentDidUpdate( prevProps ) {
		// Reset copy confirmation state when block is deselected
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			this.setState( { showCopyConfirmation: false } );
		}
	}

	onSelectFile( media ) {
		if ( media && media.url ) {
			this.props.setAttributes( {
				href: media.url,
				fileName: media.title,
				textLinkHref: media.url,
				id: media.id,
			} );
		}
	}

	isBlobURL( url = '' ) {
		return url.indexOf( 'blob:' ) === 0;
	}

	render() {
		const {
			fileName,
			href,
			textLinkHref,
			openInNewWindow,
			showDownloadButton,
			buttonText,
			id,
		} = this.props.attributes;
		const {
			className,
			isSelected,
			setAttributes,
			noticeUI,
			noticeOperations,
			media,
		} = this.props;
		const { showCopyConfirmation } = this.state;
		const attachmentPage = media && media.link;

		const classNames = [
			className,
			this.isBlobURL( href ) ? 'is-transient' : '',
		].join( ' ' );

		const confirmCopyURL = () => {
			this.setState( { showCopyConfirmation: true } );
		};
		const resetCopyConfirmation = () => {
			this.setState( { showCopyConfirmation: false } );
		};

		// Choose Media File or Attachment Page (when file is in Media Library)
		const changeLinkDestinationOption = ( newHref ) => {
			setAttributes( { textLinkHref: newHref } );
		};
		const changeOpenInNewWindow = ( newValue ) => {
			setAttributes( {
				openInNewWindow: newValue ? '_blank' : false,
			} );
		};
		const changeShowDownloadButton = ( newValue ) => {
			setAttributes( { showDownloadButton: newValue } );
		};

		if ( ! href ) {
			return (
				<MediaPlaceholder
					icon="media-default"
					labels={ {
						title: __( 'File' ),
						name: __( 'a file' ),
					} }
					onSelect={ this.onSelectFile }
					notices={ noticeUI }
					onError={ noticeOperations.createErrorNotice }
					accept="*"
					type="*"
				/>
			);
		}

		return (
			<Fragment>
				<FileBlockInspector
					hrefs={ { href, textLinkHref, attachmentPage } }
					{ ...{
						openInNewWindow,
						showDownloadButton,
						changeLinkDestinationOption,
						changeOpenInNewWindow,
						changeShowDownloadButton,
					} }
				/>
				<BlockControls>
					<Toolbar>
						<MediaUpload
							onSelect={ this.onSelectFile }
							type="*"
							value={ id }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit file' ) }
									onClick={ open }
									icon="edit"
								/>
							) }
						/>
					</Toolbar>
				</BlockControls>
				<div className={ classNames }>
					<div>
						<FileBlockEditableLink
							className={ className }
							placeholder={ __( 'Write file name…' ) }
							text={ fileName }
							href={ textLinkHref }
							updateFileName={ ( text ) => setAttributes( { fileName: text } ) }
						/>
						{ showDownloadButton &&
							<div className={ `${ className }__button-richtext-wrapper` }>
								<RichText
									tagName="div" // must be block-level or else cursor disappears
									className={ `${ className }__button` }
									value={ buttonText }
									formattingControls={ [] } // disable controls
									placeholder={ __( 'Add text…' ) }
									keepPlaceholderOnFocus
									multiline="false"
									onChange={ ( text ) => setAttributes( { buttonText: text } ) }
								/>
							</div>
						}
					</div>
					{ isSelected &&
						<ClipboardButton
							isDefault
							text={ href }
							className={ `${ className }__copy-url-button` }
							onCopy={ confirmCopyURL }
							onFinishCopy={ resetCopyConfirmation }
						>
							{ showCopyConfirmation ? __( 'Copied!' ) : __( 'Copy URL' ) }
						</ClipboardButton>
					}
				</div>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getMedia } = select( 'core' );
		const { id } = props.attributes;
		return {
			media: id === undefined ? undefined : getMedia( id ),
		};
	} ),
	withNotices,
] )( FileEdit );
