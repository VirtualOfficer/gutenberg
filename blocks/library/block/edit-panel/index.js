/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { Component, Fragment, createRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { keycodes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import './editor.scss';

/**
 * Module constants
 */
const { ESCAPE } = keycodes;

class SharedBlockEditPanel extends Component {
	constructor() {
		super( ...arguments );

		this.titleField = createRef();
		this.editButton = createRef();
		this.handleFormSubmit = this.handleFormSubmit.bind( this );
		this.handleTitleChange = this.handleTitleChange.bind( this );
		this.handleTitleKeyDown = this.handleTitleKeyDown.bind( this );
	}

	componentDidUpdate( prevProps ) {
		// Select the input text only once when the form opens.
		if ( ! prevProps.isEditing && this.props.isEditing ) {
			this.titleField.current.select();
		}
		// Move focus back to the Edit button after pressing the Escape key, Cancel, or Save.
		if ( ( prevProps.isEditing || prevProps.isSaving ) && ! this.props.isEditing && ! this.props.isSaving ) {
			this.editButton.current.focus();
		}
	}

	handleFormSubmit( event ) {
		event.preventDefault();
		this.props.onSave();
	}

	handleTitleChange( event ) {
		this.props.onChangeTitle( event.target.value );
	}

	handleTitleKeyDown( event ) {
		if ( event.keyCode === ESCAPE ) {
			event.stopPropagation();
			this.props.onCancel();
		}
	}

	render() {
		const { isEditing, title, isSaving, onEdit, onCancel } = this.props;

		return (
			<Fragment>
				{ ( ! isEditing && ! isSaving ) && (
					<div className="shared-block-edit-panel">
						<b className="shared-block-edit-panel__info">
							{ title }
						</b>
						<Button
							ref={ this.editButton }
							isLarge
							className="shared-block-edit-panel__button"
							onClick={ onEdit }
						>
							{ __( 'Edit' ) }
						</Button>
					</div>
				) }
				{ ( isEditing || isSaving ) && (
					<form className="shared-block-edit-panel" onSubmit={ this.handleFormSubmit }>
						<input
							ref={ this.titleField }
							type="text"
							disabled={ isSaving }
							className="shared-block-edit-panel__title"
							value={ title }
							onChange={ this.handleTitleChange }
							onKeyDown={ this.handleTitleKeyDown }
						/>
						<Button
							type="submit"
							isPrimary
							isLarge
							isBusy={ isSaving }
							disabled={ ! title || isSaving }
							className="shared-block-edit-panel__button"
						>
							{ __( 'Save' ) }
						</Button>
						<Button
							isLarge
							disabled={ isSaving }
							className="shared-block-edit-panel__button"
							onClick={ onCancel }
						>
							{ __( 'Cancel' ) }
						</Button>
					</form>
				) }
			</Fragment>
		);
	}
}

export default SharedBlockEditPanel;
