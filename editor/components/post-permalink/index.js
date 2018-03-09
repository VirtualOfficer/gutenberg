/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, ClipboardButton } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal Dependencies
 */
import './style.scss';
import {
	isCurrentPostPublished,
	getEditedPostAttribute,
	getCurrentPost,
} from '../../store/selectors';
import { editPost } from '../../store/actions';

/**
 * Constants
 */
const REGEXP_NEWLINES = /[\r\n]+/g;

class PostPermalink extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			editingSlug: false,
			isEditable: false,
			showCopyConfirmation: false,
			slug: '',
		};
		this.bindCopyButton = this.bindNode.bind( this, 'copyButton' );
		this.setFocus = this.setFocus.bind( this );
		this.getSlug = this.getSlug.bind( this );
		this.getStoredSlug = this.getStoredSlug.bind( this );
		this.getSlugPrefix = this.getSlugPrefix.bind( this );
		this.getSlugSuffix = this.getSlugSuffix.bind( this );
		this.replaceTags = this.replaceTags.bind( this );
		this.isModified = this.isModified.bind( this );
		this.onChangePermalink = this.onChangePermalink.bind( this );
		this.onEditPermalink = this.onEditPermalink.bind( this );
		this.onSavePermalink = this.onSavePermalink.bind( this );
		this.onCopy = this.onCopy.bind( this );

		this.nodes = {};
	}

	/**
	 * Set the focus on the copy button.
	 *
	 * This seems to be the most useful default for keyboard navigation.
	 */
	setFocus() {
		this.focusCopyButton();
	}

	/**
	 * Focus the test input that constains the editable permalink slug.
	 */
	focusPermalinkInput() {
		const input = document.querySelector( '.editor-post-permalink__slug-input' );
		if ( input ) {
			input.focus();
		}
	}

	/**
	 * Focus the copy button that copies the permalink to the clipboard.
	 */
	focusCopyButton() {
		const copyButton = document.querySelector( '.editor-post-permalink__copy' );
		if ( copyButton ) {
			copyButton.focus();
		}
	}

	/**
	 * Do preliminary, client-side sanitization of the slug so that it represents
	 * a valid URL segment.
	 *
	 * Note: The final sanitization is done at the server-side and can produce
	 * a different result.
	 *
	 * @param {string} slug The slug to sanitize.
	 * @return {string} Sanitized slug.
	 */
	sanitizeSlug( slug ) {
		// TODO: Do complete client-side sanitization of the slug.
		// The final version could be extracted into the '@wordpress/url' package.
		slug = slug.replace( REGEXP_NEWLINES, ' ' );
		slug = slug.split( ' ' ).join( '-' );
		return slug;
	}

	/**
	 * Returns a permalink for a given post slug.
	 *
	 * @param {string} slug The post slug to insert in into the permalink.
	 *
	 * @return {string} The full permalink.
	 */
	getPermalink( slug ) {
		let template = this.props.permalinkStructure;

		// Provide fallback in case pretty permalinks are disabled.
		if ( ! template ) {
			template = '/?p=%post_id%';
		}

		return this.replaceTags( this.props.url + template, slug );
	}

	/**
	 * Returns the currently modified slug for the current post.
	 *
	 * @return {string} The slug.
	 */
	getSlug() {
		let slug = this.getStoredSlug();

		if ( this.state.slug ) {
			slug = this.state.slug;
		}

		return slug;
	}

	/**
	 * Get the prefix for the modifiable permalink.
	 *
	 * This returns everything before a "%postname%" tag.
	 *
	 * @return {string} Prefix up to the "%postname%" tag.
	 */
	getSlugPrefix() {
		return this.props.url + this.props.permalinkStructure.split( '%postname%' )[ 0 ];
	}

	/**
	 * Get the suffix for the modifiable permalink.
	 *
	 * This returns everything after a "%postname%" tag.
	 *
	 * @return {string} Suffix after the "%postname%" tag.
	 */
	getSlugSuffix() {
		return this.props.permalinkStructure.split( '%postname%' )[ 1 ];
	}

	/**
	 * Replace tags in a permalink structure with actual values.
	 *
	 * @param {string} template Permalink structure to replace the tags in.
	 * @param {string} slug Slug to use in replacements
	 *
	 * @return {string} Prepared permalink.
	 */
	replaceTags( template, slug ) {
		let permalink = template;

		if ( this.props.date ) {
			const date = new Date( this.props.date );
			permalink = permalink.replace( '%year%', date.getFullYear() );
			permalink = permalink.replace( '%monthnum%', date.getMonth() );
			permalink = permalink.replace( '%day%', date.getDay() );
			permalink = permalink.replace( '%hour%', date.getHours() );
			permalink = permalink.replace( '%minute%', date.getMinutes() );
			permalink = permalink.replace( '%second%', date.getSeconds() );
		}

		if ( this.props.id ) {
			permalink = permalink.replace( '%post_id%', this.props.id );
		}

		if ( this.props.author ) {
			// TODO: This still needs to convert the user ID in props.author to an
			// actual user slug.
			permalink = permalink.replace( '%author%', this.props.author );
		}

		// TODO: Not implemented yet. This will probably need to be fetched
		// asynchronously.
		permalink = permalink.replace( '%category%', '%category%' );

		permalink = permalink.replace( '%postname%', slug );

		return permalink;
	}

	/**
	 * Returns the stored slug for the current post.
	 *
	 * @return {string} The slug.
	 */
	getStoredSlug() {
		const { actualSlug, samplePermalink } = this.props;
		let storedSlug = '';

		if ( actualSlug ) {
			storedSlug = actualSlug;
		}

		if ( samplePermalink && samplePermalink[ 1 ] ) {
			storedSlug = samplePermalink[ 1 ];
		}

		return storedSlug;
	}

	/**
	 * Check whether the current slug has been modified.
	 *
	 * @return {boolean} Whether the slug was modified.
	 */
	isModified() {
		const storedSlug = this.getStoredSlug();
		return this.getSlug() !== storedSlug ||
			'' === storedSlug;
	}

	/**
	 * Bind a node to the nodes container.
	 *
	 * @param {string} name Name of the node to bind.
	 * @param {Object} node Reference to the node.
	 */
	bindNode( name, node ) {
		this.nodes[ name ] = node;
	}

	/**
	 * Set permalink and slug to their initial state after mounting the component.
	 */
	componentDidMount() {
		this.setState( {
			slug: this.getSlug(),
			isEditable: this.props.permalinkStructure.includes( '%postname%' ),
		} );
	}

	/**
	 * Clear the confirmation display timeout after unmounting.
	 */
	componentWillUnmount() {
		clearTimeout( this.dismissCopyConfirmation );
	}

	/**
	 * Adapt slug and permalink when the props change.
	 */
	componentWillReceiveProps() {
		const slug = this.getSlug();
		this.setState( {
			slug: slug,
		} );
	}

	/**
	 * Adapt the state if the permalink was modified.
	 *
	 * @param {Object} event Change event.
	 */
	onChangePermalink( event ) {
		this.setState( { slug: event.target.value } );
	}

	/**
	 * Initialize editing and focus the permalink input field when the "Edit"
	 * button is clicked.
	 */
	onEditPermalink() {
		this.setState(
			{ editingSlug: true },
			this.focusPermalinkInput
		);
	}

	/**
	 * Adapt state & props and focus the copy button when the permalink is saved.
	 */
	onSavePermalink() {
		const slug = this.sanitizeSlug( this.state.slug );
		this.setState(
			{
				editingSlug: false,
				slug: slug,
			},
			function savePermalink() {
				this.props.onUpdate( slug );
				this.focusCopyButton();
			}
		);
	}

	/**
	 * Show a time-based confirmation when the copy button is clicked.
	 */
	onCopy() {
		this.setState( {
			showCopyConfirmation: true,
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false,
			} );
		}, 4000 );
	}

	render() {
		const { link, samplePermalink } = this.props;
		const { editingSlug, isEditable, showCopyConfirmation } = this.state;
		const slug = this.getSlug();
		const permalink = this.getPermalink( slug );
		let viewLink = link;
		if ( samplePermalink ) {
			viewLink = addQueryArgs( viewLink, { preview: true } );
		}

		return (
			<div className="editor-post-permalink">
				<span className="editor-post-permalink__label">{ __( 'Permalink:' ) }</span>
				{ ! editingSlug &&
					<Button
						className="editor-post-permalink__link"
						href={ viewLink }
						target="_blank"
					>
						<span
							className={ 'editor-post-permalink__permalink' + ( this.isModified() ? ' editor-post-permalink__permalink_modified' : '' ) }>
							{ permalink }
						</span>
					</Button>
				}
				{ editingSlug &&
					<form
						className="editor-post-permalink__slug-form"
						onSubmit={ this.onSavePermalink }>
						<span className="editor-post-permalink__prefix">
							{ this.replaceTags( this.getSlugPrefix() ) }
						</span>
						<input
							type="text"
							className="editor-post-permalink__slug-input"
							defaultValue={ slug }
							onChange={ this.onChangePermalink }
							required
						/>
						<span className="editor-post-permalink__suffix">
							{ this.replaceTags( this.getSlugSuffix() ) }
						</span>
						<Button
							className="editor-post-permalink__save"
							onClick={ this.onSavePermalink }
							isPrimary
						>
							{ __( 'Ok' ) }
						</Button>
					</form>
				}
				{ ! editingSlug &&
					<ClipboardButton
						className="editor-post-permalink__copy button"
						text={ viewLink }
						onCopy={ this.onCopy }
						ref={ this.bindCopyButton }
						isPrimary
					>
						{ showCopyConfirmation ? __( 'Copied!' ) : __( 'Copy' ) }
					</ClipboardButton>
				}
				{ ! editingSlug && isEditable &&
					<Button
						className="editor-post-permalink__edit button"
						onClick={ this.onEditPermalink }
					>
						{ __( 'Edit' ) }
					</Button>
				}
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			isPublished: isCurrentPostPublished( state ),
			link: getEditedPostAttribute( state, 'link' ),
			samplePermalink: getEditedPostAttribute( state, 'sample_permalink' ),
			id: getEditedPostAttribute( state, 'id' ),
			date: getEditedPostAttribute( state, 'date' ),
			author: getEditedPostAttribute( state, 'author' ),
			actualSlug: getCurrentPost( state ).slug,

			// TODO: How should these be fetched?
			url: window.wpApiSettings.schema.url,
			permalinkStructure: window.wpApiSettings.schema.permalink_structure,
		};
	},
	{
		onUpdate( slug ) {
			return editPost( { slug } );
		},
	},
	null,
	{ withRef: true }
)( PostPermalink );

