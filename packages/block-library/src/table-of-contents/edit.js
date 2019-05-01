/**
 * Internal dependencies
 */
import * as Utils from './utils';
import ListLevel from './ListLevel';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { subscribe } from '@wordpress/data';
import {
	IconButton,
	Toolbar,
	PanelBody,
	ToggleControl,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
} from '@wordpress/editor';

class TOCEdit extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			wpDataUnsubscribe: null,
		};

		this.toggleAttribute = this.toggleAttribute.bind( this );
		this.refresh = this.refresh.bind( this );
	}

	toggleAttribute( propName ) {
		const value = this.props.attributes[ propName ];
		const { setAttributes } = this.props;

		setAttributes( { [ propName ]: ! value } );
	}

	refresh() {
		const { setAttributes } = this.props;
		const headings = Utils.getPageHeadings();
		setAttributes( { headings } );
	}

	componentDidMount() {
		const { attributes, setAttributes } = this.props;
		const headings = attributes.headings || [];
		const wpDataUnsubscribe = subscribe( () => {
			const pageHeadings = Utils.getPageHeadings();
			this.setState( { pageHeadings } );
		} );

		setAttributes( { headings } );
		this.setState( { wpDataUnsubscribe } );
	}

	componentWillUnmount() {
		this.state.wpDataUnsubscribe();
	}

	componentDidUpdate( prevProps, prevState ) {
		const { attributes, setAttributes } = this.props;
		const pageHeadings = Utils.getPageHeadings();
		if ( JSON.stringify( pageHeadings ) !== JSON.stringify( prevState.pageHeadings ) ) {
			this.setState( { pageHeadings } );
			if ( attributes.autosync ) {
				setAttributes( { headings: pageHeadings } ); // this is displayed on the page
			}
		}
	}

	render() {
		const { attributes, setAttributes } = this.props;
		const { autosync } = attributes;
		const headings = attributes.headings || [];
		if ( headings.length === 0 ) {
			return ( <p>Start adding headings to generate Table of Contents</p> );
		}

		Utils.updateHeadingBlockAnchors();

		return (
			<div className={ this.props.className }>
				{ ! autosync &&
					<BlockControls>
						<Toolbar>
							<IconButton
								label={ 'Update' }
								aria-pressed={ this.state.isEditing }
								onClick={ this.refresh }
								icon="update"
							/>
						</Toolbar>
					</BlockControls>
				}
				{
					<InspectorControls>
						<PanelBody title={ 'Table of Contents Settings' }>
							<ToggleControl
								label={ 'Auto Sync' }
								checked={ autosync }
								onChange={ () => {
									if ( ! autosync ) {
										this.refresh();
									}
									this.toggleAttribute( 'autosync' );
								} }
							/>
						</PanelBody>
					</InspectorControls>
				}
				<ListLevel
					edit={ true }
					attributes={ attributes }
					setAttributes={ setAttributes }
				>
					{ Utils.linearToNestedList( headings ) }
				</ListLevel>
			</div>
		);
	}
}

export default TOCEdit;
