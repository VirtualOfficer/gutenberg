/**
 * Internal dependencies
 */
import { config } from './config';
import { generateFontSizes } from './utils';
export * from './utils';

export const defaultConfig = {
	color: {
		accent: '#cd2653',
		primary: '#000000',
		secondary: '#6d6d6d',
		subtleBackground: '#dcd7ca',
		background: '#f5efe0',
	},
	typography: {
		fontFamilyBase:
			'NonBreakingSpaceOverride, "Hoefler Text", Garamond, "Times New Roman", serif',
		fontFamilyHeading:
			'"Inter var", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif',
		fontSizeBase: 16,
		typeScale: 1.25,
		lineHeightBase: 1.5,
		lineHeightHeading: 1.25,
	},
	button: {
		backgroundColor: '#32373c',
		padding: '12px 24px',
		textColor: 'white',
	},
};

const enhanceConfig = ( baseConfig ) => {
	const nextConfig = { ...baseConfig };
	const fontSizes = generateFontSizes( nextConfig.typography.fontSizeBase );

	// Generate font sizes
	// TODO: Potentially replace with REM based solution
	Object.keys( fontSizes ).forEach( ( key ) => {
		const value = fontSizes[ key ];
		const fontKey = `fontSize${ key.toUpperCase() }`;
		nextConfig.typography[ fontKey ] = `${ value }px`;
	} );

	return nextConfig;
};

config.apply( enhanceConfig( defaultConfig ) );

window.globalBlockStyles = {
	config,
};

export * from './config';
