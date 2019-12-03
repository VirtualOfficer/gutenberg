export default function Header( { children } ) {
	return (
		<div className="wp-block-global-typography__header">
			<div className="wp-block-global-typography__title">{ children }</div>
		</div>
	);
}
