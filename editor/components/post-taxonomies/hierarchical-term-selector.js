/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get, unescape as unescapeString, without, map, repeat, find, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import { Component, compose } from '@wordpress/element';
import { withInstanceId, withSpokenMessages } from '@wordpress/components';
import { buildTermsTree } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import { getEditedPostAttribute } from '../../store/selectors';
import { editPost, addTaxonomyTerm } from '../../store/actions';

class HierarchicalTermSelector extends Component {
	constructor() {
		super( ...arguments );
		this.findTerm = this.findTerm.bind( this );
		this.onChange = this.onChange.bind( this );
		this.onChangeFormName = this.onChangeFormName.bind( this );
		this.onChangeFormParent = this.onChangeFormParent.bind( this );
		this.onAddTerm = this.onAddTerm.bind( this );
		this.onToggleForm = this.onToggleForm.bind( this );
		this.state = {
			adding: false,
			formName: '',
			formParent: '',
			showForm: false,
		};
	}

	onChange( event ) {
		const { onUpdateTerms, terms = [], restBase } = this.props;
		const termId = parseInt( event.target.value, 10 );
		const hasTerm = terms.indexOf( termId ) !== -1;
		const newTerms = hasTerm ?
			without( terms, termId ) :
			[ ...terms, termId ];
		onUpdateTerms( newTerms, restBase );
	}

	onChangeFormName( event ) {
		const newValue = event.target.value.trim() === '' ? '' : event.target.value;
		this.setState( { formName: newValue } );
	}

	onChangeFormParent( event ) {
		this.setState( { formParent: event.target.value } );
	}

	onToggleForm() {
		this.setState( ( state ) => ( {
			showForm: ! state.showForm,
		} ) );
	}

	findTerm( terms, parent, name ) {
		return find( terms, term => {
			return ( ( ! term.parent && ! parent ) || parseInt( term.parent ) === parseInt( parent ) ) &&
				term.name === name;
		} );
	}

	onAddTerm( event ) {
		event.preventDefault();
		const { formName, formParent, adding } = this.state;
		const { taxonomy, terms, availableTerms, restBase, onUpdateTerms } = this.props;
		if ( formName === '' || adding ) {
			return;
		}

		// check if the term we are adding already exists
		const existingTerm = this.findTerm( availableTerms, formParent, formName );
		if ( existingTerm ) {
			// if the term we are adding exists but is not selected select it
			if ( ! some( terms, term => term === existingTerm.id ) ) {
				onUpdateTerms( [ ...terms, existingTerm.id ], restBase );
			}
			this.setState( {
				formName: '',
				formParent: '',
			} );
			return;
		}

		// TODO: Check if term exists on server, retrieve it and add it if so.

		const parent = formParent ? parseInt( formParent ) : null;
		this.props.addTaxonomyTerm( taxonomy.slug, taxonomy.rest_base, formName, parent );

		// TODO: Speak() when term has been added in correct lifecycle-method.
		// ComponentWillReceiveProps?

		/*
		event.preventDefault();
		const { onUpdateTerms, restBase, terms, slug, availableTerms } = this.props;
		const { formName, formParent, adding } = this.state;
		if ( formName === '' || adding ) {
			return;
		}

		// check if the term we are adding already exists
		const existingTerm = this.findTerm( availableTerms, formParent, formName );
		if ( existingTerm ) {
			// if the term we are adding exists but is not selected select it
			if ( ! some( terms, term => term === existingTerm.id ) ) {
				onUpdateTerms( [ ...terms, existingTerm.id ], restBase );
			}
			this.setState( {
				formName: '',
				formParent: '',
			} );
			return;
		}

		const findOrCreatePromise = new Promise( ( resolve, reject ) => {
			this.setState( {
				adding: true,
			} );
			// Tries to create a term or fetch it if it already exists
			const Model = wp.api.getTaxonomyModel( this.props.slug );
			this.addRequest = new Model( {
				name: formName,
				parent: formParent ? formParent : undefined,
			} ).save();
			this.addRequest
				.then( resolve, ( xhr ) => {
					const errorCode = xhr.responseJSON && xhr.responseJSON.code;
					if ( errorCode === 'term_exists' ) {
						// search the new category created since last fetch
						this.addRequest = new Model().fetch(
							{ data: { ...DEFAULT_QUERY, parent: formParent || 0, search: formName } }
						);
						return this.addRequest.then( searchResult => {
							resolve( this.findTerm( searchResult, formParent, formName ) );
						}, reject );
					}
					reject( xhr );
				} );
		} );
		findOrCreatePromise
			.then( ( term ) => {
				const termAddedMessage = sprintf(
					_x( '%s added', 'term' ),
					get(
						this.props.taxonomy,
						[ 'data', 'labels', 'singular_name' ],
						slug === 'category' ? __( 'Category' ) : __( 'Term' )
					)
				);
				this.props.speak( termAddedMessage, 'assertive' );
				this.setState( {
					adding: false,
					formName: '',
					formParent: '',
				} );
				onUpdateTerms( [ ...terms, term.id ], restBase );
			}, ( xhr ) => {
				if ( xhr.statusText === 'abort' ) {
					return;
				}
				this.setState( {
					adding: false,
				} );
			} );
			*/
	}

	componentWillUnmount() {
		if ( this.fetchRequest ) {
			this.fetchRequest.abort();
		}

		if ( this.addRequest ) {
			this.addRequest.abort();
		}
	}

	renderTerms( renderedTerms ) {
		const { terms = [] } = this.props;
		return renderedTerms.map( ( term ) => {
			const id = `editor-post-taxonomies-hierarchical-term-${ term.id }`;
			return (
				<div key={ term.id } className="editor-post-taxonomies__hierarchical-terms-choice">
					<input
						id={ id }
						className="editor-post-taxonomies__hierarchical-terms-input"
						type="checkbox"
						checked={ terms.indexOf( term.id ) !== -1 }
						value={ term.id }
						onChange={ this.onChange }
					/>
					<label htmlFor={ id }>{ unescapeString( term.name ) }</label>
					{ !! term.children.length && (
						<div className="editor-post-taxonomies__hierarchical-terms-subchoices">
							{ this.renderTerms( term.children ) }
						</div>
					) }
				</div>
			);
		} );
	}

	renderParentSelectorOptions( terms, level = 0 ) {
		return map( terms, ( term ) => ( [
			<option key={ term.id } value={ term.id }>
				{ repeat( '\u00A0', level * 3 ) + unescapeString( term.name ) }
			</option>,
			...this.renderParentSelectorOptions( term.children, level + 1 ),
		] ) );
	}

	render() {
		const { label, slug, taxonomy, instanceId, availableTermsTree, availableTerms } = this.props;
		const { formName, formParent, loading, showForm } = this.state;
		const labelWithFallback = ( labelProperty, fallbackIsCategory, fallbackIsNotCategory ) => get(
			taxonomy,
			[ 'data', 'labels', labelProperty ],
			slug === 'category' ? fallbackIsCategory : fallbackIsNotCategory
		);
		const newTermButtonLabel = labelWithFallback(
			'add_new_item',
			__( 'Add new category' ),
			__( 'Add new term' )
		);
		const newTermLabel = labelWithFallback(
			'new_item_name',
			__( 'Add new category' ),
			__( 'Add new term' )
		);
		const parentSelectLabel = labelWithFallback(
			'parent_item',
			__( 'Parent Category' ),
			__( 'Parent Term' )
		);
		const noParentOption = `— ${ parentSelectLabel } —`;
		const newTermSubmitLabel = newTermButtonLabel;
		const inputId = `editor-post-taxonomies__hierarchical-terms-input-${ instanceId }`;
		const selectId = `editor-post-taxonomies__hierarchical-terms-select-${ instanceId }`;

		/* eslint-disable jsx-a11y/no-onchange */
		return (
			<div className="editor-post-taxonomies__hierarchical-terms-selector">
				<h3 className="editor-post-taxonomies__hierarchical-terms-selector-title">{ label }</h3>
				{ this.renderTerms( availableTermsTree ) }
				{ ! loading &&
					<button
						onClick={ this.onToggleForm }
						className="button-link editor-post-taxonomies__hierarchical-terms-add"
						aria-expanded={ showForm }
					>
						{ newTermButtonLabel }
					</button>
				}
				{ showForm &&
					<form onSubmit={ this.onAddTerm }>
						<label
							htmlFor={ inputId }
							className="editor-post-taxonomies__hierarchical-terms-label"
						>
							{ newTermLabel }
						</label>
						<input
							type="text"
							id={ inputId }
							className="editor-post-taxonomies__hierarchical-terms-input"
							value={ formName }
							onChange={ this.onChangeFormName }
							required
						/>
						{ !! availableTerms.length &&
							<div>
								<label
									htmlFor={ selectId }
									className="editor-post-taxonomies__hierarchical-terms-label"
								>
									{ parentSelectLabel }
								</label>
								<select
									id={ selectId }
									className="editor-post-taxonomies__hierarchical-terms-input"
									value={ formParent }
									onChange={ this.onChangeFormParent }
								>
									<option value="">{ noParentOption }</option>
									{ this.renderParentSelectorOptions( availableTermsTree ) }
								</select>
							</div>
						}
						<button
							type="submit"
							className="button editor-post-taxonomies__hierarchical-terms-submit"
						>
							{ newTermSubmitLabel }
						</button>
					</form>
				}
			</div>
		);
		/* eslint-enable jsx-a11y/no-onchange */
	}
}

const applyConnect = connect(
	( state, ownProps ) => {
		const availableTerms = get( state, `taxonomyTerms.data.${ ownProps.slug }`, [] );
		return {
			terms: getEditedPostAttribute( state, ownProps.restBase ),
			loading: get( state, `taxonomyTerms.fetchStatus.${ ownProps.slug }.requesting`, true ),
			availableTerms: availableTerms,
			availableTermsTree: buildTermsTree( availableTerms ),
		};
	},
	{
		onUpdateTerms( terms, restBase ) {
			return editPost( { [ restBase ]: terms } );
		},
		addTaxonomyTerm,
	}
);

export default compose(
	applyConnect,
	withSpokenMessages,
	withInstanceId
)( HierarchicalTermSelector );
