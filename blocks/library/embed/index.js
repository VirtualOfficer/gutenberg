/**
 * External dependencies
 */
import { parse } from 'url';
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Button, Placeholder, Spinner, SandBox } from '@wordpress/components';
// TODO: This is a circular dependency between editor and blocks. This must be
// updated, eventually to depend on published `@wordpress/url`
import { addQueryArgs } from '../../../editor/utils/url';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlockType, query } from '../../api';
import Editable from '../../editable';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';

const { attr, children } = query;

// These embeds do not work in sandboxes
const HOSTS_NO_PREVIEWS = [ 'facebook.com' ];

function getEmbedBlockSettings( { title, icon, category = 'embed' } ) {
	return {
		title: __( title ),

		icon,

		category,

		attributes: {
			title: attr( 'iframe', 'title' ),
			caption: children( 'figcaption' ),
		},

		getEditWrapperProps( attributes ) {
			const { align } = attributes;
			if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
				return { 'data-align': align };
			}
		},

		edit: class extends Component {
			constructor() {
				super( ...arguments );
				this.doServerSideRender = this.doServerSideRender.bind( this );
				this.state = {
					html: '',
					type: '',
					error: false,
					fetching: false,
				};
			}

			componentWillMount() {
				if ( this.props.attributes.url ) {
					// if the url is already there, we're loading a saved block, so we need to render
					// a different thing, which is why this doesn't use 'fetching', as that
					// is for when the user is putting in a new url on the placeholder form
					this.setState( { fetching: true } );
					this.doServerSideRender();
				}
			}

			componentWillUnmount() {
				// can't abort the fetch promise, so let it know we will unmount
				this.unmounting = true;
			}

			getPhotoHtml( photo ) {
				// 100% width for the preview so it fits nicely into the document, some "thumbnails" are
				// acually the full size photo.
				const photoPreview = <p><img src={ photo.thumbnail_url } alt={ photo.title } width="100%" /></p>;
				return wp.element.renderToString( photoPreview );
			}

			doServerSideRender( event ) {
				if ( event ) {
					event.preventDefault();
				}
				const { url } = this.props.attributes;
				const apiURL = addQueryArgs( wpApiSettings.root + 'oembed/1.0/proxy', {
					url: url,
					_wpnonce: wpApiSettings.nonce,
				} );

				this.setState( { error: false, fetching: true } );
				window.fetch( apiURL, {
					credentials: 'include',
				} ).then(
					( response ) => {
						if ( this.unmounting ) {
							return;
						}
						response.json().then( ( obj ) => {
							const { html, type } = obj;
							if ( html ) {
								this.setState( { html, type } );
							} else if ( 'photo' === type ) {
								this.setState( { html: this.getPhotoHtml( obj ), type } );
							} else {
								this.setState( { error: true } );
							}
							this.setState( { fetching: false } );
						} );
					}
				);
			}

			render() {
				const { html, type, error, fetching } = this.state;
				const { align, url, caption } = this.props.attributes;
				const { setAttributes, focus, setFocus } = this.props;
				const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );

				const controls = (
					focus && (
						<BlockControls key="controls">
							<BlockAlignmentToolbar
								value={ align }
								onChange={ updateAlignment }
							/>
						</BlockControls>
					)
				);

				if ( fetching ) {
					return [
						controls,
						<div key="loading" className="wp-block-embed is-loading">
							<Spinner />
							<p>{ __( 'Embedding…' ) }</p>
						</div>,
					];
				}

				if ( ! html ) {
					const label = sprintf( __( 'Embed %s' ), title );
					const embedFromLabel = sprintf( __( 'You can embed %s from ' ), title.toLowerCase() );

					return [
						controls,
						<Placeholder key="placeholder" icon={ icon } label={ label } className="wp-block-embed">
							<form onSubmit={ this.doServerSideRender }>
								<input
									type="url"
									value={ url || '' }
									className="components-placeholder__input"
									aria-label={ label }
									placeholder={ __( 'Enter URL to embed here…' ) }
									onChange={ ( event ) => setAttributes( { url: event.target.value } ) } />
								<Button
									isLarge
									type="submit">
									{ __( 'Embed' ) }
								</Button>
								{ embedFromLabel }
								<p>
								<a href="">domains.com</a> <a href="">get.com</a> <a href="">listed.com</a> <a href="">here.com</a>
								</p>
								{ error && <p className="components-placeholder__error">{ __( 'Sorry, we could not embed that content.' ) }</p> }
							</form>
						</Placeholder>,
					];
				}

				const parsedUrl = parse( url );
				const cannotPreview = includes( HOSTS_NO_PREVIEWS, parsedUrl.host.replace( /^www\./, '' ) );
				const iframeTitle = sprintf( __( 'Embedded content from %s' ), parsedUrl.host );
				let typeClassName = 'wp-block-embed';
				if ( 'video' === type ) {
					typeClassName += ' is-video';
				}

				return [
					controls,
					<figure key="embed" className={ typeClassName }>
						{ ( cannotPreview ) ? (
							<Placeholder icon={ icon } label={ __( 'Embed URL' ) }>
								<p className="components-placeholder__error"><a href={ url }>{ url }</a></p>
								<p className="components-placeholder__error">{ __( 'Previews for this are unavailable in the editor, sorry!' ) }</p>
							</Placeholder>
						) : (
							<div className="wp-block-embed__wrapper">
								<SandBox html={ html } title={ iframeTitle } type={ type } />
							</div>
						) }
						{ ( caption && caption.length > 0 ) || !! focus ? (
							<Editable
								tagName="figcaption"
								placeholder={ __( 'Write caption…' ) }
								value={ caption }
								focus={ focus }
								onFocus={ setFocus }
								onChange={ ( value ) => setAttributes( { caption: value } ) }
								inlineToolbar
							/>
						) : null }
					</figure>,
				];
			}
		},

		save( { attributes } ) {
			const { url, caption = [], align } = attributes;

			return (
				<figure className={ align && `align${ align }` }>
					{ `\n${ url }\n` /* URL needs to be on its own line. */ }
					{ caption.length > 0 && <figcaption>{ caption }</figcaption> }
				</figure>
			);
		},
	};
}

registerBlockType(
	'core/embed-video',
	getEmbedBlockSettings( {
		title: 'Videos',
		icon: 'video-alt3',
	} )
);

registerBlockType(
	'core/embed-audio',
	getEmbedBlockSettings( {
		title: 'Audio',
		icon: 'format-audio',
	} )
);

registerBlockType(
	'core/embed-images',
	getEmbedBlockSettings( {
		title: 'Images',
		icon: 'format-image',
	} )
);


registerBlockType(
	'core/embed-social',
	getEmbedBlockSettings( {
		title: 'Social Media',
		icon: 'share',
	} )
);

registerBlockType(
	'core/embed-docs',
	getEmbedBlockSettings( {
		title: 'Documents',
		icon: 'book-alt',
	} )
);
