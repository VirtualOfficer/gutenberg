/**
 * Internal dependencies
 */
import Alphabet from './alphabet';
import TypeScale from './type-scale';
import Section from './section';

export default function GlobalTypographyMarkup( {
	fontFamilyBase,
	fontFamilyHeading,
	fontSizeBase,
	fontSizes,
	typeScale,
	lineHeightBase,
	lineHeightHeading,
} ) {
	return (
		<div className="wp-block-global-typography">
			<Section title="Type Scale" className="wp-block-global-typography__type-scale">
				<TypeScale
					{ ...{
						fontSizeBase,
						fontSizes,
						lineHeightBase,
						lineHeightHeading,
						typeScale,
					} }
				/>
			</Section>
			<Section title="Fonts" className="wp-block-global-typography__font">
				<div className="wp-block-global-typography__font-content">
					<Alphabet
						title="Heading"
						style={ { fontFamily: fontFamilyHeading } }
					/>
					<Alphabet
						title="Body"
						style={ { fontFamily: fontFamilyBase } }
					/>
				</div>
			</Section>
			<Section title="Font Example">
				<h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h2>
				<p>
					Duis blandit nulla lorem, vitae elementum lacus tempor sed.
					Mauris iaculis est et ligula fermentum, efficitur bibendum
					leo volutpat. Proin sagittis commodo arcu, vel pharetra
					mauris luctus ut. Proin condimentum a lorem et varius. Nam
					congue nec magna eget viverra. Etiam dignissim orci dui, in
					lobortis sapien volutpat quis. Nulla a tristique orci. Nam
					maximus, sapien sed mattis egestas, elit magna aliquam
					ligula, in pharetra urna libero non ligula.
				</p>
				<h3>Maecenas tincidunt pulvinar nibh</h3>
				<p>
					Proin mauris lectus, feugiat sed est at, interdum efficitur
					nulla. Nullam odio libero, efficitur quis volutpat sed,
					pellentesque finibus felis. Nam sed est luctus, tempor nulla
					sit amet, lobortis elit. Sed ut molestie purus. Maecenas vel
					est dolor. Sed sodales elementum mi sed pharetra. Mauris
					eget purus id erat convallis dapibus.
				</p>
			</Section>
		</div>
	);
}
