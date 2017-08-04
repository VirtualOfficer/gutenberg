/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Editable from '../../editable';
import BlockControls from '../../block-controls';
import { Toolbar, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function execCommand( command ) {
	return ( editor ) => {
		if ( editor ) {
			editor.execCommand( command );
		}
	};
}

const TABLE_CONTROLS = [
	{
		icon: 'table-row-before',
		title: __( 'Insert Row Before' ),
		onClick: execCommand( 'mceTableInsertRowBefore' ),
	},
	{
		icon: 'table-row-after',
		title: __( 'Insert Row After' ),
		onClick: execCommand( 'mceTableInsertRowAfter' ),
	},
	{
		icon: 'table-row-delete',
		title: __( 'Delete Row' ),
		onClick: execCommand( 'mceTableDeleteRow' ),
	},
	{
		icon: 'table-col-before',
		title: __( 'Insert Column Before' ),
		onClick: execCommand( 'mceTableInsertColBefore' ),
	},
	{
		icon: 'table-col-after',
		title: __( 'Insert Column After' ),
		onClick: execCommand( 'mceTableInsertColAfter' ),
	},
	{
		icon: 'table-col-delete',
		title: __( 'Delete Column' ),
		onClick: execCommand( 'mceTableDeleteCol' ),
	},
];

export default class TableBlock extends wp.element.Component {
	constructor() {
		super();
		this.handleSetup = this.handleSetup.bind( this );
		this.state = {
			editor: null,
		};
	}

	clearSelectionHandling() {
		const cellSelectionPlugin = get(
			this.state,
			'editor.plugins.table.cellSelection'
		);
		if ( cellSelectionPlugin && cellSelectionPlugin.clear ) {
			cellSelectionPlugin.clear();
		}
	}

	handleSetup( editor, focus ) {
		editor.on( 'init', () => {
			const cell = editor.getBody().querySelector( 'td,th' );
			if ( cell && focus ) {
				// Select the end of the first table cell.
				cell.focus();
				editor.selection.select( cell, true );
				editor.selection.collapse( false );
			} else if ( ! focus ) {
				// Work around a bug in the TinyMCE table plugin that leaves
				// selection handling enabled when it shouldn't.  Unfortunately
				// we need a `setTimeout` here because the `cellSelection`
				// plugin is not initialized until a later TinyMCE `init` event
				// callback.
				setTimeout( () => this.clearSelectionHandling(), 0 );
			}
		} );
		this.setState( { editor } );
	}

	render() {
		const { content, focus, onFocus, onChange, className } = this.props;

		return [
			<Editable
				key="editor"
				tagName="table"
				className={ className }
				getSettings={ ( settings ) => ( {
					...settings,
					plugins: ( settings.plugins || [] ).concat( 'table' ),
					table_tab_navigation: false,
				} ) }
				onSetup={ ( editor ) => this.handleSetup( editor, focus ) }
				onChange={ onChange }
				value={ content }
				focus={ focus }
				onFocus={ onFocus }
			/>,
			focus && (
				<BlockControls key="menu">
					<Toolbar>
						<li>
							<DropdownMenu
								icon="editor-table"
								label={ __( 'Edit Table' ) }
								controls={
									TABLE_CONTROLS.map( ( control ) => ( {
										...control,
										onClick: () => control.onClick( this.state.editor ),
									} ) ) }
							/>
						</li>
					</Toolbar>
				</BlockControls>
			),
		];
	}
}
