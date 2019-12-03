export default function Swatch( { color, ...restProps } ) {
	const style = { backgroundColor: color };

	return <div { ...restProps } className="wp-block-global-colors-swatch" style={ style } />;
}
