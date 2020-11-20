/**
 * External dependencies
 */
import { set, get, mapValues, mergeWith } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { default as getGlobalStyles } from './global-styles-renderer';

const EMPTY_CONTENT = '{}';

const GlobalStylesContext = createContext( {
	/* eslint-disable no-unused-vars */
	getSetting: ( context, path ) => {},
	setSetting: ( context, path, newValue ) => {},
	getStyleProperty: ( context, propertyName, origin ) => {},
	setStyleProperty: ( context, propertyName, newValue ) => {},
	contexts: {},
	/* eslint-enable no-unused-vars */
} );

const mergeTreesCustomizer = ( objValue, srcValue ) => {
	// We only pass as arrays the presets,
	// in which case we want the new array of values
	// to override the old array (no merging).
	if ( Array.isArray( srcValue ) ) {
		return srcValue;
	}
};

export const useGlobalStylesContext = () => useContext( GlobalStylesContext );

const useGlobalStylesEntityContent = () => {
	return useEntityProp( 'postType', 'wp_global_styles', 'content' );
};

export const useGlobalStylesReset = () => {
	const [ content, setContent ] = useGlobalStylesEntityContent();
	const canRestart = !! content && content !== EMPTY_CONTENT;
	return [
		canRestart,
		useCallback( () => setContent( EMPTY_CONTENT ), [ setContent ] ),
	];
};

const extractSupportKeys = ( supports, metadata ) => {
	const supportKeys = [];
	Object.keys( metadata.properties ).forEach( ( name ) => {
		if ( get( supports, metadata.properties[ name ].support, false ) ) {
			supportKeys.push( name );
		}
	} );
	return supportKeys;
};

const getContexts = ( blockTypes, metadata ) => {
	const contexts = {};

	// Add contexts from block metadata.
	blockTypes.forEach( ( blockType ) => {
		const blockName = blockType.name;
		const blockSelector = blockType?.supports?.__experimentalSelector;
		const supports = extractSupportKeys( blockType?.supports, metadata );
		const hasSupport = supports.length > 0;

		if ( hasSupport && typeof blockSelector === 'string' ) {
			contexts[ blockName ] = {
				selector: blockSelector,
				supports,
				blockName,
			};
		} else if ( hasSupport && typeof blockSelector === 'object' ) {
			Object.keys( blockSelector ).forEach( ( key ) => {
				contexts[ key ] = {
					selector: blockSelector[ key ].selector,
					supports,
					blockName,
					title: blockSelector[ key ].title,
					attributes: blockSelector[ key ].attributes,
				};
			} );
		} else if ( hasSupport ) {
			const suffix = blockName.replace( 'core/', '' ).replace( '/', '-' );
			contexts[ blockName ] = {
				selector: '.wp-block-' + suffix,
				supports,
				blockName,
			};
		}
	} );

	// Add contexts provided by the metadata.
	Object.keys( metadata.contexts ).forEach( ( key ) => {
		contexts[ key ] = metadata.contexts[ key ];
	} );

	return contexts;
};

export default function GlobalStylesProvider( {
	children,
	baseStyles,
	metadata,
} ) {
	const [ content, setContent ] = useGlobalStylesEntityContent();
	const { blockTypes, settings } = useSelect( ( select ) => {
		return {
			blockTypes: select( 'core/blocks' ).getBlockTypes(),
			settings: select( 'core/edit-site' ).getSettings(),
		};
	} );
	const { updateSettings } = useDispatch( 'core/edit-site' );

	const contexts = getContexts( blockTypes, metadata );

	const { userStyles, mergedStyles } = useMemo( () => {
		const newUserStyles = content ? JSON.parse( content ) : {};
		const newMergedStyles = mergeWith(
			{},
			baseStyles,
			newUserStyles,
			mergeTreesCustomizer
		);

		return {
			userStyles: newUserStyles,
			mergedStyles: newMergedStyles,
		};
	}, [ content ] );

	const nextValue = useMemo(
		() => ( {
			contexts,
			getSetting: ( context, path ) =>
				get( userStyles?.[ context ]?.settings, path ),
			setSetting: ( context, path, newValue ) => {
				const newContent = { ...userStyles };
				let contextSettings = newContent?.[ context ]?.settings;
				if ( ! contextSettings ) {
					contextSettings = {};
					set( newContent, [ context, 'settings' ], contextSettings );
				}
				set( contextSettings, path, newValue );
				setContent( JSON.stringify( newContent ) );
			},
			getStyleProperty: ( context, propertyName, origin = 'merged' ) => {
				const styles = 'user' === origin ? userStyles : mergedStyles;

				return get(
					styles?.[ context ]?.styles,
					metadata.properties[ propertyName ].value
				);
			},
			setStyleProperty: ( context, propertyName, newValue ) => {
				const newContent = { ...userStyles };
				let contextStyles = newContent?.[ context ]?.styles;
				if ( ! contextStyles ) {
					contextStyles = {};
					set( newContent, [ context, 'styles' ], contextStyles );
				}
				set(
					contextStyles,
					metadata.properties[ propertyName ].value,
					newValue
				);
				setContent( JSON.stringify( newContent ) );
			},
		} ),
		[ content, mergedStyles ]
	);

	useEffect( () => {
		const newStyles = settings.styles.filter(
			( style ) => ! style.isGlobalStyles
		);
		updateSettings( {
			...settings,
			styles: [
				...newStyles,
				{
					css: getGlobalStyles( contexts, mergedStyles, metadata ),
					isGlobalStyles: true,
				},
			],
			__experimentalFeatures: mapValues(
				mergedStyles,
				( value ) => value?.settings || {}
			),
		} );
	}, [ mergedStyles ] );

	return (
		<GlobalStylesContext.Provider value={ nextValue }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}
