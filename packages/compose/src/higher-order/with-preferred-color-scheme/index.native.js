/**
 * Internal dependencies
 */
import createHigherOrderComponent from '../../utils/create-higher-order-component';
import usePreferredColorScheme from '../../hooks/use-preferred-color-scheme';

const withPreferredColorScheme = createHigherOrderComponent(
	( WrappedComponent ) => ( props ) => {
		const colorScheme = usePreferredColorScheme();
		const isDarkMode = colorScheme === 'dark';

		const getStyles = ( lightStyles, darkStyles ) => {
			const finalDarkStyles = {
				...lightStyles,
				...darkStyles,
			};

			return isDarkMode ? finalDarkStyles : lightStyles;
		};

		const getDynamicStyles = ( styles, append = true ) => {
			if ( ! isDarkMode ) {
				return styles;
			}

			const classNames = Object.keys( styles );
			const dynamicClassNames = classNames.filter( key => classNames.includes( key + 'Dark' ) );

			return classNames.reduce( ( result, key ) => {
				if ( key.endsWith( 'Dark' ) && classNames.includes( key.slice( 0, -4 ) ) ) {
					return result;
				} else if ( dynamicClassNames.includes( key ) ) {
					const lightStyle = styles[ key ];
					const darkStyle = styles[ key + 'Dark' ];
					return Object.assign( result, {
						[ key ]: append ? { ...lightStyle, ...darkStyle } : darkStyle,
					} );
				}
			}, {} );
		};

		return (
			<WrappedComponent
				preferredColorScheme={ colorScheme }
				getStylesFromColorScheme={ getStyles }
				getDynamicStyles={ getDynamicStyles }
				{ ...props }
			/>
		);
	},
	'withPreferredColorScheme'
);

export default withPreferredColorScheme;
