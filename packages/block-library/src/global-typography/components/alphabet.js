export default function Alphabet( { style, title } ) {
	return (
		<div className="wp-block-global-typography__alphabet">
			<div className="wp-block-global-typography__alphabet-title">{ title }</div>
			<p style={ style }>
				<strong>ABCDEFGHIJKLMNOPQRSTUVWXYZ</strong>
				<br />
				abcdefghijklmnopqrstuvwxyz
				<br />
				{ '1234567890!@#$%^&*()_+=' }
				<br />
			</p>
		</div>
	);
}
