/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Header from './header';

export default function Section( props ) {
	const { children, className, title, ...restProps } = props;
	const classes = classnames(
		'wp-block-global-typography__section',
		className
	);

	return (
		<div { ...restProps } className={ classes }>
			<Header>{ title }</Header>
			{ children }
		</div>
	);
}
