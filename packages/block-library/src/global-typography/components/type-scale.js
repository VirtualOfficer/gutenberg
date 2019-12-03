/**
 * Internal dependencies
 */
import { generateFontSizes } from '../utils';

function TypeScaleItem( { children, fontSize = 16, lineHeight = 1.25 } ) {
	return (
		<li className="wp-block-global-typography__type-scale-list-item">
			<div>{ children }</div>
			<div>
				{ Math.round( fontSize ) }px / { Math.round( fontSize * lineHeight ) }px
			</div>
		</li>
	);
}

export default function TypeScale( {
	fontSizes,
	fontSizeBase,
	lineHeightBase,
	lineHeightHeading,
	typeScale,
} ) {
	const sizes = generateFontSizes( fontSizeBase, typeScale, fontSizes );

	return (
		<div className="wp-block-global-typography__type-scale">
			<ul className="wp-block-global-typography__type-scale-list">
				<TypeScaleItem
					fontSizeLabel="H1"
					fontSize={ sizes.H1 }
					lineHeight={ lineHeightHeading }
				>
					<h1>Heading One</h1>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="H2"
					fontSize={ sizes.H2 }
					lineHeight={ lineHeightHeading }
				>
					<h2>Heading Two</h2>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="H3"
					fontSize={ sizes.H3 }
					lineHeight={ lineHeightHeading }
				>
					<h3>Heading Three</h3>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="H4"
					fontSize={ sizes.H4 }
					lineHeight={ lineHeightHeading }
				>
					<h4>Heading Four</h4>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="H5"
					fontSize={ sizes.H5 }
					lineHeight={ lineHeightHeading }
				>
					<h5>Heading Five</h5>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="H6"
					fontSize={ sizes.H6 }
					lineHeight={ lineHeightHeading }
				>
					<h6>Heading Six</h6>
				</TypeScaleItem>
				<TypeScaleItem
					fontSizeLabel="Body"
					fontSize={ sizes.Body }
					lineHeight={ lineHeightBase }
				>
					<p>Body</p>
				</TypeScaleItem>
			</ul>
		</div>
	);
}
