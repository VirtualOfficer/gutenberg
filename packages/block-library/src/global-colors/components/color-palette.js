/**
 * External dependencies
 */
import colorUtil from 'tinycolor2';

function getStyles( color ) {
	const isLight = colorUtil( color ).isLight();
	const textColor = isLight ? 'black' : 'white';

	return {
		backgroundColor: color,
		color: textColor,
	};
}

function ColorPaletteHeader( { color, name } ) {
	const style = getStyles( color );
	return (
		<div className="wp-block-global-colors-palette__header" style={ style }>
			<div className="wp-block-global-colors-palette__header__content">
				<div className="wp-block-global-colors-palette__header__title">
					{ name }
				</div>
				<div className="wp-block-global-colors-palette__header__meta">
					{ color }
				</div>
			</div>

		</div>
	);
}

function ColorPaletteItem( { color, index } ) {
	const style = {
		...getStyles( color ),
		transitionDelay: `${ index * 20 }ms`,
	};

	const colorIndex = ( index + 1 ) * 100;

	return (
		<div className="wp-block-global-colors-palette__item" style={ style }>
			<div>{ color }</div>
			<div>{ colorIndex }</div>
		</div>
	);
}

export default function ColorPalette( { color, name } ) {
	const shades = generateColorShades( color || '#ccc' );

	return (
		<div className="wp-block-global-colors-palette">
			<ColorPaletteHeader color={ color } name={ name } />
			<div className="wp-block-global-colors-palette__items">
				{ shades.map( ( shade, index ) => (
					<ColorPaletteItem color={ shade } key={ index } index={ index } />
				) ) }
			</div>
		</div>
	);
}

function generateColorShades( color ) {
	const color100 = colorUtil( color )
		.lighten( 20 )
		.toString();
	const color200 = colorUtil( color )
		.lighten( 10 )
		.toString();
	const color300 = colorUtil( color ).toString();
	const color400 = colorUtil( color )
		.darken( 10 )
		.toString();
	const color500 = colorUtil( color )
		.darken( 20 )
		.toString();

	const shades = [ color100, color200, color300, color400, color500 ];

	return shades;
}
