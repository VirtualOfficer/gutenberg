/**
 * WordPress dependencies
 */
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { mergeBaseAndUserConfigs } from '../global-styles-provider';
import { default as GlobalStylesUIComponent } from '../ui';
import { unlock } from '../../../private-apis';

const { GlobalStylesContext, ExperimentalBlockEditorProvider } = unlock(
	blockEditorPrivateApis
);

export default { title: 'EditSite/GlobalStylesUI' };

const BASE_SETTINGS = {
	settings: {
		appearanceTools: false,
		useRootPaddingAwareAlignments: true,
		border: {
			color: true,
			radius: true,
			style: true,
			width: true,
		},
		color: {
			background: true,
			custom: true,
			customDuotone: true,
			customGradient: true,
			defaultDuotone: true,
			defaultGradients: true,
			defaultPalette: true,
			duotone: {
				default: [
					{
						name: 'Dark grayscale',
						colors: [ '#000000', '#7f7f7f' ],
						slug: 'dark-grayscale',
					},
					{
						name: 'Grayscale',
						colors: [ '#000000', '#ffffff' ],
						slug: 'grayscale',
					},
					{
						name: 'Purple and yellow',
						colors: [ '#8c00b7', '#fcff41' ],
						slug: 'purple-yellow',
					},
					{
						name: 'Blue and red',
						colors: [ '#000097', '#ff4747' ],
						slug: 'blue-red',
					},
					{
						name: 'Midnight',
						colors: [ '#000000', '#00a5ff' ],
						slug: 'midnight',
					},
					{
						name: 'Magenta and yellow',
						colors: [ '#c7005a', '#fff278' ],
						slug: 'magenta-yellow',
					},
					{
						name: 'Purple and green',
						colors: [ '#a60072', '#67ff66' ],
						slug: 'purple-green',
					},
					{
						name: 'Blue and orange',
						colors: [ '#1900d8', '#ffa96b' ],
						slug: 'blue-orange',
					},
				],
			},
			gradients: {
				default: [
					{
						name: 'Vivid cyan blue to vivid purple',
						gradient:
							'linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)',
						slug: 'vivid-cyan-blue-to-vivid-purple',
					},
					{
						name: 'Light green cyan to vivid green cyan',
						gradient:
							'linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)',
						slug: 'light-green-cyan-to-vivid-green-cyan',
					},
					{
						name: 'Luminous vivid amber to luminous vivid orange',
						gradient:
							'linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%)',
						slug: 'luminous-vivid-amber-to-luminous-vivid-orange',
					},
					{
						name: 'Luminous vivid orange to vivid red',
						gradient:
							'linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%)',
						slug: 'luminous-vivid-orange-to-vivid-red',
					},
					{
						name: 'Very light gray to cyan bluish gray',
						gradient:
							'linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)',
						slug: 'very-light-gray-to-cyan-bluish-gray',
					},
					{
						name: 'Cool to warm spectrum',
						gradient:
							'linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)',
						slug: 'cool-to-warm-spectrum',
					},
					{
						name: 'Blush light purple',
						gradient:
							'linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%)',
						slug: 'blush-light-purple',
					},
					{
						name: 'Blush bordeaux',
						gradient:
							'linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%)',
						slug: 'blush-bordeaux',
					},
					{
						name: 'Luminous dusk',
						gradient:
							'linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%)',
						slug: 'luminous-dusk',
					},
					{
						name: 'Pale ocean',
						gradient:
							'linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%)',
						slug: 'pale-ocean',
					},
					{
						name: 'Electric grass',
						gradient:
							'linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%)',
						slug: 'electric-grass',
					},
					{
						name: 'Midnight',
						gradient:
							'linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)',
						slug: 'midnight',
					},
				],
			},
			link: true,
			palette: {
				default: [
					{
						name: 'Black',
						slug: 'black',
						color: '#000000',
					},
					{
						name: 'Cyan bluish gray',
						slug: 'cyan-bluish-gray',
						color: '#abb8c3',
					},
					{
						name: 'White',
						slug: 'white',
						color: '#ffffff',
					},
					{
						name: 'Pale pink',
						slug: 'pale-pink',
						color: '#f78da7',
					},
					{
						name: 'Vivid red',
						slug: 'vivid-red',
						color: '#cf2e2e',
					},
					{
						name: 'Luminous vivid orange',
						slug: 'luminous-vivid-orange',
						color: '#ff6900',
					},
					{
						name: 'Luminous vivid amber',
						slug: 'luminous-vivid-amber',
						color: '#fcb900',
					},
					{
						name: 'Light green cyan',
						slug: 'light-green-cyan',
						color: '#7bdcb5',
					},
					{
						name: 'Vivid green cyan',
						slug: 'vivid-green-cyan',
						color: '#00d084',
					},
					{
						name: 'Pale cyan blue',
						slug: 'pale-cyan-blue',
						color: '#8ed1fc',
					},
					{
						name: 'Vivid cyan blue',
						slug: 'vivid-cyan-blue',
						color: '#0693e3',
					},
					{
						name: 'Vivid purple',
						slug: 'vivid-purple',
						color: '#9b51e0',
					},
				],
				theme: [
					{
						color: '#ffffff',
						name: 'Base',
						slug: 'base',
					},
					{
						color: '#000000',
						name: 'Contrast',
						slug: 'contrast',
					},
					{
						color: '#9DFF20',
						name: 'Primary',
						slug: 'primary',
					},
					{
						color: '#345C00',
						name: 'Secondary',
						slug: 'secondary',
					},
					{
						color: '#F6F6F6',
						name: 'Tertiary',
						slug: 'tertiary',
					},
				],
			},
			text: true,
		},
		shadow: {
			defaultPresets: true,
			presets: {
				default: [
					{
						name: 'Natural',
						slug: 'natural',
						shadow: '6px 6px 9px rgba(0, 0, 0, 0.2)',
					},
					{
						name: 'Deep',
						slug: 'deep',
						shadow: '12px 12px 50px rgba(0, 0, 0, 0.4)',
					},
					{
						name: 'Sharp',
						slug: 'sharp',
						shadow: '6px 6px 0px rgba(0, 0, 0, 0.2)',
					},
					{
						name: 'Outlined',
						slug: 'outlined',
						shadow: '6px 6px 0px -3px rgba(255, 255, 255, 1), 6px 6px rgba(0, 0, 0, 1)',
					},
					{
						name: 'Crisp',
						slug: 'crisp',
						shadow: '6px 6px 0px rgba(0, 0, 0, 1)',
					},
				],
			},
		},
		layout: {
			contentSize: '650px',
			wideSize: '1200px',
		},
		spacing: {
			blockGap: true,
			margin: true,
			padding: true,
			customSpacingSize: true,
			units: [ '%', 'px', 'em', 'rem', 'vh', 'vw' ],
			spacingScale: {
				operator: '*',
				increment: 1.5,
				steps: 0,
				mediumStep: 1.5,
				unit: 'rem',
			},
			spacingSizes: {
				theme: [
					{
						size: 'clamp(1.5rem, 5vw, 2rem)',
						slug: '30',
						name: '1',
					},
					{
						size: 'clamp(1.8rem, 1.8rem + ((1vw - 0.48rem) * 2.885), 3rem)',
						slug: '40',
						name: '2',
					},
					{
						size: 'clamp(2.5rem, 8vw, 4.5rem)',
						slug: '50',
						name: '3',
					},
					{
						size: 'clamp(3.75rem, 10vw, 7rem)',
						slug: '60',
						name: '4',
					},
					{
						size: 'clamp(5rem, 5.25rem + ((1vw - 0.48rem) * 9.096), 8rem)',
						slug: '70',
						name: '5',
					},
					{
						size: 'clamp(7rem, 14vw, 11rem)',
						slug: '80',
						name: '6',
					},
				],
			},
		},
		typography: {
			customFontSize: true,
			dropCap: false,
			fontSizes: {
				default: [
					{
						name: 'Small',
						slug: 'small',
						size: '13px',
					},
					{
						name: 'Medium',
						slug: 'medium',
						size: '20px',
					},
					{
						name: 'Large',
						slug: 'large',
						size: '36px',
					},
					{
						name: 'Extra Large',
						slug: 'x-large',
						size: '42px',
					},
				],
			},
			fontStyle: true,
			fontWeight: true,
			letterSpacing: true,
			lineHeight: true,
			textColumns: false,
			textDecoration: true,
			textTransform: true,
			fluid: true,
			fontFamilies: {
				theme: [
					{
						fontFamily:
							'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
						name: 'System Font',
						slug: 'system-font',
					},
				],
			},
		},
		dimensions: {
			minHeight: true,
		},
		position: {
			fixed: true,
			sticky: true,
		},
	},
	styles: {
		blocks: {},
		elements: {},
	},
};

export const GlobalStylesUI = () => {
	const [ userGlobalStyles, setUserStyles ] = useState( {
		settings: {},
		styles: {},
	} );
	const context = useMemo( () => {
		return {
			isReady: true,
			user: userGlobalStyles,
			base: BASE_SETTINGS,
			merged: mergeBaseAndUserConfigs( BASE_SETTINGS, userGlobalStyles ),
			setUserConfig: setUserStyles,
		};
	}, [ userGlobalStyles, setUserStyles ] );
	const wrapperStyle = {
		width: 280,
	};
	return (
		<ExperimentalBlockEditorProvider>
			<GlobalStylesContext.Provider value={ context }>
				<div style={ wrapperStyle }>
					<GlobalStylesUIComponent
						isStyleBookOpened={ false }
						onCloseStyleBook={ () => {} }
					/>
				</div>
			</GlobalStylesContext.Provider>
		</ExperimentalBlockEditorProvider>
	);
};
