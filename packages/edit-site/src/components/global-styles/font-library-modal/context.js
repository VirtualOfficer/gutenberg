/**
 * WordPress dependencies
 */
import { createContext, useState, useEffect } from '@wordpress/element';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	useEntityRecord,
	useEntityRecords,
	store as coreStore,
} from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import {
	fetchGetFontFamilyBySlug,
	fetchInstallFontFamily,
	fetchUninstallFonts,
	fetchFontCollections,
	fetchFontCollection,
} from './resolvers';
import { unlock } from '../../../lock-unlock';
const { useGlobalSetting } = unlock( blockEditorPrivateApis );
import {
	setUIValuesNeeded,
	mergeFontFamilies,
	loadFontFaceInBrowser,
	getDisplaySrcFromFontFace,
	makeFontFacesFormData,
	makeFontFamilyFormData,
	batchInstallFontFaces,
} from './utils';
import { toggleFont } from './utils/toggleFont';

export const FontLibraryContext = createContext( {} );

function FontLibraryProvider( { children } ) {
	const { __experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits } =
		useDispatch( coreStore );
	const { globalStylesId } = useSelect( ( select ) => {
		const { __experimentalGetCurrentGlobalStylesId } = select( coreStore );
		return { globalStylesId: __experimentalGetCurrentGlobalStylesId() };
	} );

	const globalStyles = useEntityRecord(
		'root',
		'globalStyles',
		globalStylesId
	);
	const fontFamiliesHasChanges =
		!! globalStyles?.edits?.settings?.typography?.fontFamilies;

	const [ isInstalling, setIsInstalling ] = useState( false );
	const [ refreshKey, setRefreshKey ] = useState( 0 );

	const refreshLibrary = () => {
		setRefreshKey( Date.now() );
	};

	const {
		records: libraryPosts = [],
		isResolving: isResolvingLibrary,
		hasResolved: hasResolvedLibrary,
	} = useEntityRecords( 'postType', 'wp_font_family', {
		refreshKey,
		_embed: true,
	} );

	const libraryFonts =
		( libraryPosts || [] ).map( ( post ) => {
			post.font_family_settings.fontFace =
				post?._embedded?.font_faces.map(
					( face ) => face.font_face_settings
				) || [];
			return post.font_family_settings;
		} ) || [];

	// Global Styles (settings) font families
	const [ fontFamilies, setFontFamilies ] = useGlobalSetting(
		'typography.fontFamilies'
	);
	// theme.json file font families
	const [ baseFontFamilies ] = useGlobalSetting(
		'typography.fontFamilies',
		undefined,
		'base'
	);

	// Save font families to the global styles post in the database.
	const saveFontFamilies = () => {
		saveSpecifiedEntityEdits( 'root', 'globalStyles', globalStylesId, [
			'settings.typography.fontFamilies',
		] );
	};

	// Library Fonts
	const [ modalTabOpen, setModalTabOpen ] = useState( false );
	const [ libraryFontSelected, setLibraryFontSelected ] = useState( null );

	const baseThemeFonts = baseFontFamilies?.theme
		? baseFontFamilies.theme
				.map( ( f ) => setUIValuesNeeded( f, { source: 'theme' } ) )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) )
		: [];

	const themeFonts = fontFamilies?.theme
		? fontFamilies.theme
				.map( ( f ) => setUIValuesNeeded( f, { source: 'theme' } ) )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) )
		: [];

	const customFonts = fontFamilies?.custom
		? fontFamilies.custom
				.map( ( f ) => setUIValuesNeeded( f, { source: 'custom' } ) )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) )
		: [];

	const baseCustomFonts = libraryFonts
		? libraryFonts
				.map( ( f ) => setUIValuesNeeded( f, { source: 'custom' } ) )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) )
		: [];

	useEffect( () => {
		if ( ! modalTabOpen ) {
			setLibraryFontSelected( null );
		}
	}, [ modalTabOpen ] );

	const handleSetLibraryFontSelected = ( font ) => {
		// If font is null, reset the selected font
		if ( ! font ) {
			setLibraryFontSelected( null );
			return;
		}

		const fonts =
			font.source === 'theme' ? baseThemeFonts : baseCustomFonts;

		// Tries to find the font in the installed fonts
		const fontSelected = fonts.find( ( f ) => f.slug === font.slug );
		// If the font is not found (it is only defined in custom styles), use the font from custom styles
		setLibraryFontSelected( {
			...( fontSelected || font ),
			source: font.source,
		} );
	};

	const toggleModal = ( tabName ) => {
		setModalTabOpen( tabName || null );
	};

	// Demo
	const [ loadedFontUrls ] = useState( new Set() );

	// Theme data
	const { site, currentTheme } = useSelect( ( select ) => {
		return {
			site: select( coreStore ).getSite(),
			currentTheme: select( coreStore ).getCurrentTheme(),
		};
	} );
	const themeUrl =
		site?.url + '/wp-content/themes/' + currentTheme?.stylesheet;

	const getAvailableFontsOutline = ( availableFontFamilies ) => {
		const outline = availableFontFamilies.reduce( ( acc, font ) => {
			const availableFontFaces = Array.isArray( font?.fontFace )
				? font?.fontFace.map(
						( face ) => `${ face.fontStyle + face.fontWeight }`
				  )
				: [ 'normal400' ]; // If the font doesn't have fontFace, we assume it is a system font and we add the defaults: normal 400

			acc[ font.slug ] = availableFontFaces;
			return acc;
		}, {} );
		return outline;
	};

	const getActivatedFontsOutline = ( source ) => {
		switch ( source ) {
			case 'theme':
				return getAvailableFontsOutline( themeFonts );
			case 'custom':
			default:
				return getAvailableFontsOutline( customFonts );
		}
	};

	const isFontActivated = ( slug, style, weight, source ) => {
		if ( ! style && ! weight ) {
			return !! getActivatedFontsOutline( source )[ slug ];
		}
		return !! getActivatedFontsOutline( source )[ slug ]?.includes(
			style + weight
		);
	};

	const getFontFacesActivated = ( slug, source ) => {
		return getActivatedFontsOutline( source )[ slug ] || [];
	};

	async function installFont( font ) {
		setIsInstalling( true );
		try {
			// Get the ID of the font family post, if it is already installed.
			let installedFontFamily = await fetchGetFontFamilyBySlug(
				font.slug
			)
				.then( ( response ) => {
					if ( ! response || response.length === 0 ) {
						return null;
					}
					const fontFamilyPost = response[ 0 ];
					return {
						id: fontFamilyPost.id,
						...fontFamilyPost.font_family_settings,
						fontFace:
							fontFamilyPost?._embedded?.font_faces.map(
								( face ) => face.font_face_settings
							) || [],
					};
				} )
				.catch( ( e ) => {
					// eslint-disable-next-line no-console
					console.error( e );
					return null;
				} );

			// Otherwise, install it.
			if ( ! installedFontFamily ) {
				const fontFamilyFormData = makeFontFamilyFormData( font );
				// Prepare font family form data to install.
				installedFontFamily = await fetchInstallFontFamily(
					fontFamilyFormData
				)
					.then( ( response ) => {
						return {
							id: response.id,
							...response.font_face_settings,
							fontFace: [],
						};
					} )
					.catch( ( e ) => {
						throw Error( e.message );
					} );
			}

			// Filter Font Faces that have already been installed
			// We determine that by comparing the fontWeight and fontStyle
			font.fontFace = font.fontFace.filter( ( fontFaceToInstall ) => {
				return (
					-1 ===
					installedFontFamily.fontFace.findIndex(
						( installedFontFace ) => {
							return (
								installedFontFace.fontWeight ===
									fontFaceToInstall.fontWeight &&
								installedFontFace.fontStyle ===
									fontFaceToInstall.fontStyle
							);
						}
					)
				);
			} );

			if ( font.fontFace.length === 0 ) {
				// Looks like we're only trying to install fonts that are already installed.
				// Let's not do that.
				// TODO: Exit with an error message?
				return {
					errors: [ 'All font faces are already installed' ],
				};
			}

			// Prepare font faces form data to install.
			const fontFacesFormData = makeFontFacesFormData( font );

			// Install the fonts (upload the font files to the server and create the post in the database).
			const response = await batchInstallFontFaces(
				installedFontFamily.id,
				fontFacesFormData
			);

			const fontFacesInstalled = response?.successes || [];

			// Rebuild fontFace settings
			font.fontFace =
				fontFacesInstalled.map( ( face ) => {
					return face.font_face_settings;
				} ) || [];

			// Activate the font family (add the font family to the global styles).
			activateCustomFontFamilies( [ font ] );
			// Save the global styles to the database.
			saveSpecifiedEntityEdits( 'root', 'globalStyles', globalStylesId, [
				'settings.typography.fontFamilies',
			] );
			refreshLibrary();

			return response;
		} catch ( error ) {
			return {
				errors: [ error ],
			};
		} finally {
			setIsInstalling( false );
		}
	}

	async function uninstallFont( font ) {
		try {
			// Uninstall the font (remove the font files from the server and the post from the database).
			const response = await fetchUninstallFonts( [ font ] );
			// Deactivate the font family (remove the font family from the global styles).
			if ( 0 === response.errors.length ) {
				deactivateFontFamily( font );
				// Save the global styles to the database.
				await saveSpecifiedEntityEdits(
					'root',
					'globalStyles',
					globalStylesId,
					[ 'settings.typography.fontFamilies' ]
				);
			}
			// Refresh the library (the the library font families from database).
			refreshLibrary();
			return response;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
			return {
				errors: [ error ],
			};
		}
	}

	const deactivateFontFamily = ( font ) => {
		// If the user doesn't have custom fonts defined, include as custom fonts all the theme fonts
		// We want to save as active all the theme fonts at the beginning
		const initialCustomFonts = fontFamilies?.[ font.source ] ?? [];
		const newCustomFonts = initialCustomFonts.filter(
			( f ) => f.slug !== font.slug
		);
		setFontFamilies( {
			...fontFamilies,
			[ font.source ]: newCustomFonts,
		} );
	};

	const activateCustomFontFamilies = ( fontsToAdd ) => {
		// Merge the existing custom fonts with the new fonts.
		const newCustomFonts = mergeFontFamilies(
			fontFamilies?.custom,
			fontsToAdd
		);
		// Activate the fonts by set the new custom fonts array.
		setFontFamilies( {
			...fontFamilies,
			custom: newCustomFonts,
		} );
		// Add custom fonts to the browser.
		fontsToAdd.forEach( ( font ) => {
			if ( font.fontFace ) {
				font.fontFace.forEach( ( face ) => {
					// Load font faces just in the iframe because they already are in the document.
					loadFontFaceInBrowser(
						face,
						getDisplaySrcFromFontFace( face.src ),
						'iframe'
					);
				} );
			}
		} );
	};

	const toggleActivateFont = ( font, face ) => {
		// If the user doesn't have custom fonts defined, include as custom fonts all the theme fonts
		// We want to save as active all the theme fonts at the beginning
		const initialFonts = fontFamilies?.[ font.source ] ?? [];
		// Toggles the received font family or font face
		const newFonts = toggleFont( font, face, initialFonts );
		// Updates the font families activated in global settings:
		setFontFamilies( {
			...fontFamilies,
			[ font.source ]: newFonts,
		} );
	};

	const loadFontFaceAsset = async ( fontFace ) => {
		// If the font doesn't have a src, don't load it.
		if ( ! fontFace.src ) return;
		// Get the src of the font.
		const src = getDisplaySrcFromFontFace( fontFace.src, themeUrl );
		// If the font is already loaded, don't load it again.
		if ( ! src || loadedFontUrls.has( src ) ) return;
		// Load the font in the browser.
		loadFontFaceInBrowser( fontFace, src, 'document' );
		// Add the font to the loaded fonts list.
		loadedFontUrls.add( src );
	};

	// Font Collections
	const [ collections, setFontCollections ] = useState( [] );
	const getFontCollections = async () => {
		const response = await fetchFontCollections();
		setFontCollections( response );
	};
	const getFontCollection = async ( id ) => {
		try {
			const hasData = !! collections.find(
				( collection ) => collection.id === id
			)?.data;
			if ( hasData ) return;
			const response = await fetchFontCollection( id );
			const updatedCollections = collections.map( ( collection ) =>
				collection.id === id
					? { ...collection, data: { ...response?.data } }
					: collection
			);
			setFontCollections( updatedCollections );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( e );
			throw e;
		}
	};

	useEffect( () => {
		getFontCollections();
	}, [] );

	return (
		<FontLibraryContext.Provider
			value={ {
				libraryFontSelected,
				handleSetLibraryFontSelected,
				themeFonts,
				baseThemeFonts,
				customFonts,
				baseCustomFonts,
				isFontActivated,
				getFontFacesActivated,
				loadFontFaceAsset,
				installFont,
				uninstallFont,
				toggleActivateFont,
				getAvailableFontsOutline,
				modalTabOpen,
				toggleModal,
				refreshLibrary,
				saveFontFamilies,
				fontFamiliesHasChanges,
				isResolvingLibrary,
				hasResolvedLibrary,
				isInstalling,
				collections,
				getFontCollection,
			} }
		>
			{ children }
		</FontLibraryContext.Provider>
	);
}

export default FontLibraryProvider;
