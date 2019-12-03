/**
 * Internal dependencies
 */
import ColorPalette from './color-palette';
import Grid from './grid';
import GridItem from './grid-item';
import Section from '../../global-typography/components/section';

export default function Markup( { colors = [] } ) {
	return (
		<Section title="Colors">
			<Grid>
				{ colors.map( ( color ) => (
					<GridItem key={ color.slug }>
						<ColorPalette { ...color } />
					</GridItem>
				) ) }
			</Grid>
		</Section>
	);
}
