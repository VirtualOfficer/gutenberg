/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import './style.scss';
import { __ } from 'i18n';
import { Component } from 'element';
import { IconButton } from 'components';

class UrlInput extends Component {
	constructor() {
		super( ...arguments );
		this.expand = this.expand.bind( this );
		this.state = {
			expanded: false,
		};
	}

	expand() {
		this.setState( { expanded: ! this.state.expanded } );
	}

	render() {
		const { url, onChange } = this.props;
		const { expanded } = this.state;

		return (
			<li className="components-url-input">
				<IconButton
					icon="admin-links"
					onClick={ this.expand }
					className={ classnames( 'components-toolbar__control', {
						'is-active': expanded,
					} ) }
					/>
				{ ( expanded || url ) &&
					<form
						className="editable-format-toolbar__link-modal"
						onSubmit={ ( event ) => event.preventDefault() }>
						<IconButton className="components-url-input__back" icon="arrow-left-alt" type="button" onClick={ this.expand } />
						<input
							className="editable-format-toolbar__link-input"
							type="url"
							required
							value={ url }
							onChange={ onChange }
							placeholder={ __( 'Paste URL or type' ) }
						/>
						<IconButton icon="editor-break" type="submit" />
					</form>
				}
			</li>
		);
	}
}

export default UrlInput;
