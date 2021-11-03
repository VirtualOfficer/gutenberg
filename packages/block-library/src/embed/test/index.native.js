/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	fireEvent,
	waitFor,
	within,
} from 'test/helpers';
import { Clipboard, Platform } from 'react-native';

/**
 * WordPress dependencies
 */
import {
	getBlockTypes,
	setDefaultBlockName,
	unregisterBlockType,
} from '@wordpress/blocks';
import fetchRequest from '@wordpress/api-fetch';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch } from '@wordpress/data';
import { requestPreview } from '@wordpress/react-native-bridge';

/**
 * Internal dependencies
 */
import * as paragraph from '../../paragraph';
import * as embed from '..';
import { registerBlock } from '../..';

// Override modal mock to prevent unmounting it when is not visible.
// This is required to be able to trigger onClose and onDismiss events when
// the modal is dismissed.
jest.mock( 'react-native-modal', () => {
	const mockComponent = require( 'react-native/jest/mockComponent' );
	return mockComponent( 'react-native-modal' );
} );
const MODAL_DISMISS_EVENT = Platform.OS === 'ios' ? 'onDismiss' : 'onModalHide';

// oEmbed response mocks
const RICH_TEXT_EMBED_SUCCESS_RESPONSE = {
	url: 'https://twitter.com/notnownikki',
	html: '<p>Mock success response.</p>',
	type: 'rich',
	provider_name: 'Twitter',
	provider_url: 'https://twitter.com',
	version: '1.0',
};
const VIDEO_EMBED_SUCCESS_RESPONSE = {
	url: 'https://www.youtube.com/watch?v=lXMskKTw3Bc',
	html: '<iframe width="16" height="9"></iframe>',
	type: 'video',
	provider_name: 'YouTube',
	provider_url: 'https://youtube.com',
	version: '1.0',
};
const MOCK_EMBED_PHOTO_SUCCESS_RESPONSE = {
	url: 'https://cloudup.com/cQFlxqtY4ob',
	html: '<p>Mock success response.</p>',
	type: 'photo',
	provider_name: 'Cloudup',
	provider_url: 'https://cloudup.com',
	version: '1.0',
};
const MOCK_BAD_WORDPRESS_RESPONSE = {
	code: 'oembed_invalid_url',
	message: 'Not Found',
	data: {
		status: 404,
	},
	html: false,
};
const EMBED_NULL_RESPONSE = null;

// Embed block HTML examples
const EMPTY_EMBED_HTML = '<!-- wp:embed /-->';
const RICH_TEXT_EMBED_HTML = `<!-- wp:embed {"url":"https://twitter.com/notnownikki","type":"rich","providerNameSlug":"twitter","responsive":true} -->
<figure class="wp-block-embed is-type-rich is-provider-twitter wp-block-embed-twitter"><div class="wp-block-embed__wrapper">
https://twitter.com/notnownikki
</div></figure>
<!-- /wp:embed -->`;
const RICH_TEXT_ERROR_EMBED_HTML = `<!-- wp:embed {"url":"https://twitter.com/testing","type":"rich","providerNameSlug":"twitter","responsive":true} -->
<figure class="wp-block-embed is-type-rich is-provider-twitter wp-block-embed-twitter"><div class="wp-block-embed__wrapper">
https://twitter.com/testing
</div></figure>
<!-- /wp:embed -->`;
const PHOTO_EMBED_HTML = `<!-- wp:embed {"url":"https://cloudup.com/cQFlxqtY4ob","type":"photo","providerNameSlug":"cloudup","responsive":true} -->
<figure class="wp-block-embed is-type-photo is-provider-cloudup wp-block-embed-cloudup"><div class="wp-block-embed__wrapper">
https://cloudup.com/cQFlxqtY4ob
</div></figure>
<!-- /wp:embed -->`;
const WP_EMBED_HTML = `<!-- wp:embed {"url":"https://wordpress.org/news/2021/07/tatum/","type":"wp-embed","providerNameSlug":"wordpress-news"} -->
<figure class="wp-block-embed is-type-wp-embed is-provider-wordpress-news wp-block-embed-wordpress-news"><div class="wp-block-embed__wrapper">
https://wordpress.org/news/2021/07/tatum/
</div></figure>
<!-- /wp:embed -->`;

const EMPTY_PARAGRAPH_HTML =
	'<!-- wp:paragraph --><p></p><!-- /wp:paragraph -->';

const MOST_USED_PROVIDERS = embed.settings.variations.filter( ( { name } ) =>
	[ 'youtube', 'twitter', 'wordpress', 'vimeo' ].includes( name )
);

// Return specified mocked responses for the oembed endpoint.
const mockEmbedResponses = ( mockedResponses ) => {
	fetchRequest.mockImplementation( ( { path } ) => {
		if ( path.startsWith( '/wp/v2/themes' ) ) {
			return Promise.resolve( [
				{ theme_supports: { 'responsive-embeds': true } },
			] );
		}

		const matchedEmbedResponse = mockedResponses.find(
			( mockedResponse ) =>
				path ===
				`/oembed/1.0/proxy?url=${ encodeURIComponent(
					mockedResponse.url
				) }`
		);
		return Promise.resolve( matchedEmbedResponse || {} );
	} );
};

const insertEmbedBlock = async ( blockTitle = 'Embed' ) => {
	const editor = await initializeEditor( {
		initialHtml: '',
	} );
	const { getByA11yLabel, getByText } = editor;

	// Open inserter menu
	fireEvent.press( await waitFor( () => getByA11yLabel( 'Add block' ) ) );

	// Insert embed block
	fireEvent.press( await waitFor( () => getByText( blockTitle ) ) );

	// Return the embed block
	const block = await waitFor( () =>
		getByA11yLabel( /Embed Block\. Row 1/ )
	);

	return { ...editor, block };
};

const initializeWithEmbedBlock = async ( initialHtml, selectBlock = true ) => {
	const editor = await initializeEditor( { initialHtml } );
	const { getByA11yLabel } = editor;

	const block = await waitFor( () =>
		getByA11yLabel( /Embed Block\. Row 1/ )
	);

	if ( selectBlock ) {
		// Select block
		fireEvent.press( block );
	}

	return { ...editor, block };
};

beforeAll( () => {
	// Paragraph block needs to be registered because by default a paragraph
	// block is added to empty posts.
	registerBlock( paragraph );
	registerBlock( embed );
	setDefaultBlockName( paragraph.name );
} );

beforeEach( () => {
	// Invalidate embed preview resolutions
	dispatch( coreStore ).invalidateResolutionForStoreSelector(
		'getEmbedPreview'
	);
	// Mock embed responses
	mockEmbedResponses( [
		RICH_TEXT_EMBED_SUCCESS_RESPONSE,
		VIDEO_EMBED_SUCCESS_RESPONSE,
		MOCK_EMBED_PHOTO_SUCCESS_RESPONSE,
	] );
} );

afterAll( () => {
	// Clean up registered blocks
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Embed block', () => {
	describe( 'insertion', () => {
		it( 'inserts generic embed block', async () => {
			const { block } = await insertEmbedBlock();

			const blockName = within( block ).getByText( 'Embed' );

			expect( blockName ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		MOST_USED_PROVIDERS.forEach( ( { title } ) =>
			it( `inserts ${ title } embed block`, async () => {
				const { block } = await insertEmbedBlock( title );
				const blockName = within( block ).getByText( title );

				expect( blockName ).toBeDefined();
				expect( getEditorHtml() ).toMatchSnapshot();
			} )
		);
	} );

	describe( 'set URL upon block insertion', () => {
		it( 'sets empty URL when dismissing edit URL modal', async () => {
			const { getByTestId } = await insertEmbedBlock();

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'sets a valid URL when dismissing edit URL modal', async () => {
			const expectedURL = 'https://twitter.com/notnownikki';

			const {
				getByA11yLabel,
				getByPlaceholderText,
				getByTestId,
			} = await insertEmbedBlock();

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Set an URL
			const linkTextInput = getByPlaceholderText( 'Add link' );
			fireEvent( linkTextInput, 'focus' );
			fireEvent.changeText( linkTextInput, expectedURL );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			// Wait for block settings button to be present
			const settingsButton = await waitFor( () =>
				getByA11yLabel( 'Open Settings' )
			);

			expect( settingsButton ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'auto-pastes the URL from clipboard', async () => {
			const clipboardURL = 'https://twitter.com/notnownikki';

			// Mock clipboard
			Clipboard.getString.mockResolvedValue( clipboardURL );

			const {
				getByA11yLabel,
				getByTestId,
				getByText,
			} = await insertEmbedBlock();

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Get embed link
			const embedLink = await waitFor( () => getByText( clipboardURL ) );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			// Wait for block settings button to be present
			const settingsButton = await waitFor( () =>
				getByA11yLabel( 'Open Settings' )
			);

			expect( embedLink ).toBeDefined();
			expect( settingsButton ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();

			Clipboard.getString.mockReset();
		} );
	} );

	describe( 'set URL when empty block', () => {
		it( 'sets empty URL when dismissing edit URL modal', async () => {
			const { getByTestId, getByText } = await initializeWithEmbedBlock(
				EMPTY_EMBED_HTML
			);

			// Edit URL
			fireEvent.press( await waitFor( () => getByText( 'ADD LINK' ) ) );

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'sets a valid URL when dismissing edit URL modal', async () => {
			const expectedURL = 'https://twitter.com/notnownikki';

			const {
				getByA11yLabel,
				getByPlaceholderText,
				getByTestId,
				getByText,
			} = await initializeWithEmbedBlock( EMPTY_EMBED_HTML );

			// Edit URL
			fireEvent.press( getByText( 'ADD LINK' ) );

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Set an URL
			const linkTextInput = getByPlaceholderText( 'Add link' );
			fireEvent( linkTextInput, 'focus' );
			fireEvent.changeText( linkTextInput, expectedURL );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			// Wait for block settings button to be present
			const settingsButton = await waitFor( () =>
				getByA11yLabel( 'Open Settings' )
			);

			expect( settingsButton ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'auto-pastes the URL from clipboard', async () => {
			const clipboardURL = 'https://twitter.com/notnownikki';

			// Mock clipboard
			Clipboard.getString.mockResolvedValue( clipboardURL );

			const {
				getByA11yLabel,
				getByTestId,
				getByText,
			} = await initializeWithEmbedBlock( EMPTY_EMBED_HTML );

			// Edit URL
			fireEvent.press( getByText( 'ADD LINK' ) );

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Get embed link
			const embedLink = await waitFor( () => getByText( clipboardURL ) );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			// Wait for block settings button to be present
			const settingsButton = await waitFor( () =>
				getByA11yLabel( 'Open Settings' )
			);

			expect( embedLink ).toBeDefined();
			expect( settingsButton ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();

			Clipboard.getString.mockReset();
		} );
	} );

	describe( 'edit URL', () => {
		it( 'keeps the previous URL if no URL is set', async () => {
			const {
				getByA11yLabel,
				getByTestId,
			} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

			// Edit URL
			fireEvent.press(
				await waitFor( () => getByA11yLabel( 'Edit URL' ) )
			);

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'replaces URL', async () => {
			const initialURL = 'https://twitter.com/notnownikki';
			const expectedURL = 'https://www.youtube.com/watch?v=lXMskKTw3Bc';

			const {
				getByA11yLabel,
				getByDisplayValue,
				getByTestId,
			} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

			// Edit URL
			fireEvent.press(
				await waitFor( () => getByA11yLabel( 'Edit URL' ) )
			);

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Start editing link
			fireEvent.press(
				getByA11yLabel( `Twitter link, ${ initialURL }` )
			);

			// Replace URL
			const linkTextInput = getByDisplayValue( initialURL );
			fireEvent( linkTextInput, 'focus' );
			fireEvent.changeText( linkTextInput, expectedURL );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			// Get YouTube link field
			const youtubeLinkField = await waitFor( () =>
				getByA11yLabel( `YouTube link, ${ expectedURL }` )
			);

			expect( youtubeLinkField ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'keeps the previous URL if an invalid URL is set', async () => {
			const previousURL = 'https://twitter.com/notnownikki';
			const invalidURL = 'http://';

			const {
				getByA11yLabel,
				getByDisplayValue,
				getByTestId,
				getByText,
			} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

			// Edit URL
			fireEvent.press(
				await waitFor( () => getByA11yLabel( 'Edit URL' ) )
			);

			// Wait for edit URL modal to be visible
			const embedEditURLModal = getByTestId( 'embed-edit-url-modal' );
			await waitFor( () => embedEditURLModal.props.isVisible );

			// Start editing link
			fireEvent.press(
				getByA11yLabel( `Twitter link, ${ previousURL }` )
			);

			// Replace URL
			const linkTextInput = getByDisplayValue( previousURL );
			fireEvent( linkTextInput, 'focus' );
			fireEvent.changeText( linkTextInput, invalidURL );

			// Dismiss the edit URL modal
			fireEvent( embedEditURLModal, 'backdropPress' );
			fireEvent( embedEditURLModal, MODAL_DISMISS_EVENT );

			const errorNotice = await waitFor( () =>
				getByText( 'Invalid URL. Please enter a valid URL.' )
			);

			expect( errorNotice ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );
	} );

	describe( 'alignment options', () => {
		[
			'Align left',
			'Align center',
			'Align right',
			'Wide width',
			'Full width',
		].forEach( ( alignmentOption ) =>
			it( `sets ${ alignmentOption } option`, async () => {
				const {
					getByA11yLabel,
					getByText,
				} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

				// Open alignment options
				fireEvent.press(
					await waitFor( () => getByA11yLabel( 'Align' ) )
				);

				// Select alignment option
				fireEvent.press(
					await waitFor( () => getByText( alignmentOption ) )
				);

				expect( getEditorHtml() ).toMatchSnapshot();
			} )
		);
	} );

	describe( 'retry', () => {
		it( 'retries loading the preview if initial request failed', async () => {
			// Return bad response for the first request to oembed endpoint
			// and success response for the rest of requests.
			let isFirstEmbedRequest = true;
			fetchRequest.mockImplementation( ( { path } ) => {
				let response = {};
				const isEmbedRequest = path.startsWith( '/oembed/1.0/proxy' );
				if ( isEmbedRequest ) {
					if ( isFirstEmbedRequest ) {
						isFirstEmbedRequest = false;
						response = MOCK_BAD_WORDPRESS_RESPONSE;
					} else {
						response = RICH_TEXT_EMBED_SUCCESS_RESPONSE;
					}
				}
				return Promise.resolve( response );
			} );

			const {
				getByA11yLabel,
				getByText,
			} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

			// Retry request
			fireEvent.press( getByText( 'More options' ) );
			fireEvent.press( getByText( 'Retry' ) );

			// Wait for edit URL button to be present
			const editURLButton = await waitFor( () =>
				getByA11yLabel( 'Edit URL' )
			);

			expect( editURLButton ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );
		it( 'converts to link if preview request failed', async () => {
			// Return bad response for requests to oembed endpoint.
			fetchRequest.mockImplementation( ( { path } ) => {
				const isEmbedRequest = path.startsWith( '/oembed/1.0/proxy' );
				return Promise.resolve(
					isEmbedRequest ? MOCK_BAD_WORDPRESS_RESPONSE : {}
				);
			} );

			const {
				getByA11yLabel,
				getByText,
			} = await initializeWithEmbedBlock( RICH_TEXT_EMBED_HTML );

			// Convert embed to link
			fireEvent.press( getByText( 'More options' ) );
			fireEvent.press( getByText( 'Convert to link' ) );

			// Get paragraph block where the link is created
			const paragraphBlock = await waitFor( () =>
				getByA11yLabel( /Paragraph Block\. Row 1/ )
			);

			expect( paragraphBlock ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );
	} );

	describe( 'preview coming soon', () => {
		it( 'previews post for providers which embed preview is not available yet', async () => {
			const { getByText, getByTestId } = await initializeWithEmbedBlock(
				PHOTO_EMBED_HTML
			);

			// Try to preview the post
			fireEvent.press( getByText( 'PREVIEW POST' ) );

			// Wait for no preview modal to be visible
			const noPreviewModal = getByTestId( 'embed-no-preview-modal' );
			await waitFor( () => noPreviewModal.props.isVisible );

			// Preview post
			fireEvent.press( getByText( 'Preview post' ) );

			// Dismiss the no preview modal
			fireEvent( noPreviewModal, 'backdropPress' );
			fireEvent( noPreviewModal, MODAL_DISMISS_EVENT );

			expect( requestPreview ).toHaveBeenCalled();
		} );

		it( 'dismisses no preview modal', async () => {
			const { getByText, getByTestId } = await initializeWithEmbedBlock(
				PHOTO_EMBED_HTML
			);

			// Try to preview the post
			fireEvent.press( getByText( 'PREVIEW POST' ) );

			// Wait for no preview modal to be visible
			const noPreviewModal = getByTestId( 'embed-no-preview-modal' );
			await waitFor( () => noPreviewModal.props.isVisible );

			// Dismiss modal
			fireEvent.press( getByText( 'Dismiss' ) );

			// Wait for no preview modal to be not visible
			await waitFor( () => ! noPreviewModal.props.isVisible );

			expect( requestPreview ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'create by pasting URL', () => {
		it( 'creates embed block when pasting URL in paragraph block', async () => {
			const expectedURL = 'https://www.youtube.com/watch?v=lXMskKTw3Bc';

			const {
				getByA11yLabel,
				getByPlaceholderText,
				getByTestId,
				getByText,
			} = await initializeEditor( {
				initialHtml: EMPTY_PARAGRAPH_HTML,
			} );

			// Paste URL in paragraph block
			const paragraphText = getByPlaceholderText( 'Start writing…' );
			fireEvent( paragraphText, 'focus' );
			fireEvent( paragraphText, 'paste', {
				preventDefault: jest.fn(),
				nativeEvent: {
					eventCount: 1,
					target: undefined,
					files: [],
					pastedHtml: expectedURL,
					pastedText: expectedURL,
				},
			} );

			// Wait for embed handler picker to be visible
			await waitFor(
				() => getByTestId( 'embed-handler-picker' ).props.isVisible
			);

			// Select create embed option
			fireEvent.press( getByText( 'Create embed' ) );

			// Get the created embed block
			const embedBlock = await waitFor( () =>
				getByA11yLabel( /Embed Block\. Row 1/ )
			);

			expect( embedBlock ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'creates link when pasting URL in paragraph block', async () => {
			const expectedURL = 'https://www.youtube.com/watch?v=lXMskKTw3Bc';

			const {
				getByDisplayValue,
				getByPlaceholderText,
				getByTestId,
				getByText,
			} = await initializeEditor( {
				initialHtml: EMPTY_PARAGRAPH_HTML,
			} );

			// Paste URL in paragraph block
			const paragraphText = getByPlaceholderText( 'Start writing…' );
			fireEvent( paragraphText, 'focus' );
			fireEvent( paragraphText, 'paste', {
				preventDefault: jest.fn(),
				nativeEvent: {
					eventCount: 1,
					target: undefined,
					files: [],
					pastedHtml: expectedURL,
					pastedText: expectedURL,
				},
			} );

			// Wait for embed handler picker to be visible
			await waitFor(
				() => getByTestId( 'embed-handler-picker' ).props.isVisible
			);

			// Select create link option
			fireEvent.press( getByText( 'Create link' ) );

			// Get the link text
			const linkText = await waitFor( () =>
				getByDisplayValue(
					`<p><a href="${ expectedURL }">${ expectedURL }</a></p>`
				)
			);

			expect( linkText ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );
	} );

	describe( 'insert via slash inserter', () => {
		it( 'insert generic embed block', async () => {
			const embedBlockSlashInserter = '/Embed';
			const {
				getByPlaceholderText,
				getByA11yLabel,
				getByText,
			} = await initializeEditor( { initialHtml: EMPTY_PARAGRAPH_HTML } );

			const paragraphText = getByPlaceholderText( 'Start writing…' );
			fireEvent( paragraphText, 'focus' );
			// Trigger onSelectionChange to update both the current text and text selection.
			// This event is required by the autocompleter, as it only displays the slash inserter
			// if the text selection is located at the end of the text, for this reason,
			// the start and end arguments match the text length.
			fireEvent(
				paragraphText,
				'onSelectionChange',
				embedBlockSlashInserter.length,
				embedBlockSlashInserter.length,
				embedBlockSlashInserter,
				{
					nativeEvent: {
						eventCount: 1,
						target: undefined,
						text: embedBlockSlashInserter,
					},
				}
			);

			fireEvent.press( await waitFor( () => getByText( 'Embed' ) ) );

			const block = await waitFor( () =>
				getByA11yLabel( /Embed Block\. Row 1/ )
			);

			const blockName = within( block ).getByText( 'Embed' );

			expect( blockName ).toBeDefined();
			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		MOST_USED_PROVIDERS.forEach( ( { title } ) =>
			it( `inserts ${ title } embed block`, async () => {
				const embedBlockSlashInserter = `/${ title }`;
				const {
					getByPlaceholderText,
					getByA11yLabel,
					getByText,
				} = await initializeEditor( {
					initialHtml: EMPTY_PARAGRAPH_HTML,
				} );

				const paragraphText = getByPlaceholderText( 'Start writing…' );
				fireEvent( paragraphText, 'focus' );
				// Trigger onSelectionChange to update both the current text and text selection.
				// This event is required by the autocompleter, as it only displays the slash inserter
				// if the text selection is located at the end of the text, for this reason,
				// the start and end arguments match the text length.
				fireEvent(
					paragraphText,
					'onSelectionChange',
					embedBlockSlashInserter.length,
					embedBlockSlashInserter.length,
					embedBlockSlashInserter,
					{
						nativeEvent: {
							eventCount: 1,
							target: undefined,
							text: embedBlockSlashInserter,
						},
					}
				);

				fireEvent.press( await waitFor( () => getByText( title ) ) );

				const block = await waitFor( () =>
					getByA11yLabel( /Embed Block\. Row 1/ )
				);

				const blockName = within( block ).getByText( title );

				expect( blockName ).toBeDefined();
				expect( getEditorHtml() ).toMatchSnapshot();
			} )
		);
	} );

	it( 'sets block caption', async () => {
		const expectedCaption = 'Caption';

		const waitForElement = ( { getByA11yLabel } ) =>
			getByA11yLabel( /Embed Block\. Row 1/ );
		const {
			element,
			getByPlaceholderText,
			getByDisplayValue,
		} = await initializeEditor(
			{ initialHtml: RICH_TEXT_EMBED_HTML },
			{ waitForElement }
		);

		// Select block
		fireEvent.press( element );

		// Set a caption
		const captionField = getByPlaceholderText( 'Add caption' );
		fireEvent( captionField, 'focus' );
		fireEvent( captionField, 'onChange', {
			nativeEvent: {
				eventCount: 1,
				target: undefined,
				text: expectedCaption,
			},
		} );

		// Get current caption
		const caption = await waitFor( () =>
			getByDisplayValue( `<p>${ expectedCaption }</p>` )
		);

		expect( caption ).toBeDefined();
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'displays cannot embed on the placeholder if preview data is null', async () => {
		// Return null response for requests to oembed endpoint.
		fetchRequest.mockImplementation( ( { path } ) => {
			const isEmbedRequest = path.startsWith( '/oembed/1.0/proxy' );
			return Promise.resolve( isEmbedRequest ? EMBED_NULL_RESPONSE : {} );
		} );

		const initialHtml = RICH_TEXT_ERROR_EMBED_HTML;

		const waitForElement = ( { getByA11yLabel } ) =>
			getByA11yLabel( /Embed Block\. Row 1/ );
		const { element, getByText } = await initializeEditor(
			{
				initialHtml,
			},
			{ waitForElement }
		);

		// Select block
		fireEvent.press( element );

		const cannotEmbedText = getByText( 'Unable to embed media' );

		expect( cannotEmbedText ).toBeDefined();
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	describe( 'block settings', () => {
		it( 'toggles resize for smaller devices media settings', async () => {
			const waitForElement = ( { getByA11yLabel } ) =>
				getByA11yLabel( /Embed Block\. Row 1/ );
			const {
				element,
				getByA11yLabel,
				getByText,
			} = await initializeEditor(
				{ initialHtml: RICH_TEXT_EMBED_HTML },
				{ waitForElement }
			);

			// Select block
			fireEvent.press( element );

			fireEvent.press(
				await waitFor( () => getByA11yLabel( 'Open Settings' ) )
			);

			fireEvent.press(
				await waitFor( () => getByText( /Resize for smaller devices/ ) )
			);

			expect( getEditorHtml() ).toMatchSnapshot();
		} );

		it( 'does not show settings button if responsive is not supported', async () => {
			const waitForElement = ( { getByA11yLabel } ) =>
				getByA11yLabel( /Embed Block\. Row 1/ );
			const { element, getByA11yLabel } = await initializeEditor(
				{ initialHtml: WP_EMBED_HTML },
				{ waitForElement }
			);

			// Select block
			fireEvent.press( element );

			let settingsButton;
			try {
				settingsButton = await waitFor( () =>
					getByA11yLabel( 'Open Settings' )
				);
			} catch ( e ) {
				// NOOP
			}

			expect( settingsButton ).not.toBeDefined();
		} );
	} );
} );
