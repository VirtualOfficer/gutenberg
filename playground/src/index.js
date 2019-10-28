/**
 * External dependencies
 */
import { uniqueId, random } from 'lodash';

/**
 * WordPress dependencies
 */
import { ESCAPE } from '@wordpress/keycodes';
import '@wordpress/editor'; // This shouldn't be necessary

import { render, useState, Fragment } from '@wordpress/element';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
	__experimentalLinkControl,
} from '@wordpress/block-editor';
import {
	Popover,
	SlotFillProvider,
	DropZoneProvider,
} from '@wordpress/components';
import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/format-library';

/**
 * Internal dependencies
 */
import './style.scss';

/* eslint-disable no-restricted-syntax */
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/editor.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/format-library/build-style/style.css';
/* eslint-enable no-restricted-syntax */

const fauxEntitySuggestions = [
	{
		id: uniqueId(),
		title: 'Hello Page',
		type: 'Page',
		url: '/hello-page/',
	},
	{
		id: uniqueId(),
		title: 'Hello Post',
		type: 'Post',
		url: '/hello-post/',
	},
	{
		id: uniqueId(),
		title: 'Hello Another One',
		type: 'Page',
		url: '/hello-another-one/',
	},
	{
		id: uniqueId(),
		title: 'This is another Post with a much longer title just to be really annoying and to try and break the UI',
		type: 'Post',
		url: '/this-is-another-post-with-a-much-longer-title-just-to-be-really-annoying-and-to-try-and-break-the-ui/',
	},
];

function App() {
	const [ blocks, updateBlocks ] = useState( [] );
	const [ link, setLink ] = useState();
	const [ linkSettings, setLinkSettings ] = useState( {
		'new-tab': false,
	} );

	const [ isVisible, setIsVisible ] = useState( true );

	/* eslint-disable @wordpress/react-no-unsafe-timeout */
	const timeout = ( ms ) => {
		return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	};
	/* eslint-enable @wordpress/react-no-unsafe-timeout */

	const fetchFauxEntitySuggestions = async () => {
		// Simulate network
		await timeout( random( 200, 1000 ) );

		return fauxEntitySuggestions;
	};

	const handleOnKeyDownEvent = ( event, suggestion ) => {
		if ( null !== suggestion ) {
		}

		// Do not stop propagation for ESCAPE key
		if ( ESCAPE === event.keyCode ) {
			return;
		}

		event.stopPropagation();
	};

	const handleOnKeyPressEvent = ( event ) => {
		event.stopPropagation();
	};

	return (
		<Fragment>
			<div className="playground__header">
				<h1 className="playground__logo">Gutenberg Playground</h1>
			</div>
			<div className="playground__body">
				<SlotFillProvider>
					<DropZoneProvider>
						<BlockEditorProvider
							value={ blocks }
							onInput={ updateBlocks }
							onChange={ updateBlocks }
						>
							<div className="editor-styles-wrapper">
								<BlockEditorKeyboardShortcuts />
								<WritingFlow>
									<ObserveTyping>
										{ isVisible &&
											<__experimentalLinkControl
												currentLink={ link }
												currentSettings={ linkSettings }
												onLinkChange={ ( theLink ) => {
													setLink( theLink );
												} }
												onSettingsChange={ ( setting, value ) => {
													setLinkSettings( {
														...linkSettings,
														[ setting ]: value,
													} );
												} }
												fetchSearchSuggestions={ fetchFauxEntitySuggestions }
												onKeyDown={ handleOnKeyDownEvent }
												onKeyPress={ handleOnKeyPressEvent }
												onClose={ () => {
													setIsVisible( false );
												} }
											/>
										}
										<BlockList />
									</ObserveTyping>
								</WritingFlow>

							</div>
							<Popover.Slot />
						</BlockEditorProvider>
					</DropZoneProvider>
				</SlotFillProvider>
			</div>
		</Fragment>
	);
}

registerCoreBlocks();
render(
	<App />,
	document.querySelector( '#app' )
);
