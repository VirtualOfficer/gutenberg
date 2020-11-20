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
	Object.keys( metadata ).forEach( ( key ) => {
		if ( get( supports, metadata[ key ].support, false ) ) {
			supportKeys.push( key );
		}
	} );
	return supportKeys;
};

const useContextsFromBlockMetadata = ( metadata ) => {
	const blockTypes = useSelect( ( select ) =>
		select( 'core/blocks' ).getBlockTypes()
	);
	const contexts = {};
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

	return contexts;
};

export default function GlobalStylesProvider( {
	children,
	baseStyles,
	metadata,
} ) {
	const [ content, setContent ] = useGlobalStylesEntityContent();
	const contexts = useContextsFromBlockMetadata( metadata );

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
					metadata[ propertyName ].value
				);
			},
			setStyleProperty: ( context, propertyName, newValue ) => {
				const newContent = { ...userStyles };
				let contextStyles = newContent?.[ context ]?.styles;
				if ( ! contextStyles ) {
					contextStyles = {};
					set( newContent, [ context, 'styles' ], contextStyles );
				}
				set( contextStyles, metadata[ propertyName ].value, newValue );
				setContent( JSON.stringify( newContent ) );
			},
		} ),
		[ contexts, content ]
	);

	const settings = useSelect( ( select ) =>
		select( 'core/edit-site' ).getSettings()
	);
	const { updateSettings } = useDispatch( 'core/edit-site' );

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
	}, [ contexts, mergedStyles, metadata ] );

	return (
		<GlobalStylesContext.Provider value={ nextValue }>
			{ children }
		</GlobalStylesContext.Provider>
	);
}
