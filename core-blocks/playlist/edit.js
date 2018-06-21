/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	FormFileUpload,
	IconButton,
	Placeholder,
	ServerSideRender,
	Toolbar,
	CheckboxControl,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import {
	InspectorControls,
	MediaUpload,
	BlockControls,
	editorMediaUpload,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

class PlaylistEdit extends Component {
	constructor() {
		super( ...arguments );

		this.initializePlaylist = this.initializePlaylist.bind( this );
		this.uploadFromFiles = this.uploadFromFiles.bind( this );
		this.addFiles = this.addFiles.bind( this );

		// check for if ids is set to determine edit state
		this.state = {
			editing: ! this.props.attributes.ids,
		};
	}

	initializePlaylist() {
		window.wp.playlist.initialize();
	}

	uploadFromFiles( event ) {
		this.addFiles( event.target.files );
	}

	addFiles( files ) {
		const { setAttributes } = this.props;
		editorMediaUpload( {
			allowedType: 'audio',
			filesList: files,
			onFileChange: ( media ) => {
				const ids = JSON.stringify( media.map( ( item ) => item.id ) );
				setAttributes( { ids, type: 'audio' } );
				this.setState( { editing: false } );
			},
		} );
	}

	render() {
		const { attributes, setAttributes, className } = this.props;
		const { editing } = this.state;
		const { tracklist, artists, images, style } = attributes;
		const styleOptions = [
			{ value: 'light', label: __( 'Light' ) },
			{ value: 'dark', label: __( 'Dark' ) },
		];

		const onSelectMedia = ( media ) => {
			//check if there are returned media items and set attributes when there are
			if ( media && media[ 0 ].url ) {
				const ids = JSON.stringify( media.map( ( item ) => item.id ) );
				setAttributes( { tracklist, artists, images, ids, type: media[ 0 ].type } );
				this.setState( { editing: false } );
			}
		};

		const mediaIds = this.props.attributes.ids && this.props.attributes.ids.replace( /^\[(.+)\]$/, '$1' ).split( ',' );

		const onToggleTracklist = ( newVal ) => {
			setAttributes( { tracklist: newVal } );
		};

		const onToggleArtists = ( newVal ) => {
			setAttributes( { artists: newVal } );
		};

		const onToggleImages = ( newVal ) => {
			setAttributes( { images: newVal } );
		};

		const onToggleStyle = ( newVal ) => {
			setAttributes( { style: newVal } );
		};

		if ( editing ) {
			return (
				<Placeholder
					icon="media-audio"
					label={ __( 'Audio/Video Playlist' ) }
					instructions={ __( 'Select audio or video files from your library, or upload a new ones' ) }
					className={ className }>
					<FormFileUpload
						isLarge
						multiple
						className="wp-block-playlist__upload-button"
						onChange={ this.uploadFromFiles }
						accept="audiovideo"
					>
						{ __( 'Upload' ) }
					</FormFileUpload>
					<MediaUpload
						onSelect={ onSelectMedia }
						type="audio"
						multiple
						playlist
						value={ this.props.attributes.ids }
						render={ ( { open } ) => (
							<IconButton isLarge icon="edit" label={ __( 'Media Library' ) } onClick={ open } />
						) }
					/>
				</Placeholder>
			);
		}

		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<MediaUpload
							onSelect={ onSelectMedia }
							type="audio"
							multiple
							playlist
							value={ mediaIds }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit Playlist' ) }
									icon="edit"
									onClick={ open }
								/>
							) }
						/>
					</Toolbar>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Playback Controls' ) }>
						<CheckboxControl
							label={ __( 'Show Tracklist' ) }
							onChange={ onToggleTracklist }
							checked={ tracklist }
						/>
						<CheckboxControl
							label={ __( 'Show Artist Name in Tracklist' ) }
							onChange={ onToggleArtists }
							checked={ artists }
						/>
						<CheckboxControl
							label={ __( 'Show Images' ) }
							onChange={ onToggleImages }
							checked={ images }
						/>
						<SelectControl
							label={ __( 'Playlist Style' ) }
							value={ style }
							onChange={ onToggleStyle }
							options={ styleOptions }
						/>
					</PanelBody>
				</InspectorControls>
				<figure className={ className }>
					<ServerSideRender
						block="core/playlist"
						attributes={ attributes }
						onChange={ this.initializePlaylist }
					/>
				</figure>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default PlaylistEdit;
