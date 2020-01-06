/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from '../spinner';
import VisuallyHidden from '../visually-hidden';

function BaseControl( {
	id,
	isLoading = false,
	label,
	hideLabelFromVision,
	help,
	className,
	children,
} ) {
	const classes = classnames(
		'components-base-control',
		isLoading && 'is-loading',
		className
	);

	const helpId = `${ id }-help`;

	return (
		<div className={ classes } aria-busy={ isLoading }>
			<div className="components-base-control__field">
				{ label &&
					id &&
					( hideLabelFromVision ? (
						<VisuallyHidden as="label" htmlFor={ id }>
							{ label }
						</VisuallyHidden>
					) : (
						<label
							className="components-base-control__label"
							htmlFor={ id }
						>
							{ label }
						</label>
					) ) }
				{ label &&
					! id &&
					( hideLabelFromVision ? (
						<VisuallyHidden as="label">{ label }</VisuallyHidden>
					) : (
						<BaseControl.VisualLabel>
							{ label }
						</BaseControl.VisualLabel>
					) ) }
				<div className="components-base-control__field-content">
					{ children }
					{ isLoading && <Spinner /> }
				</div>
			</div>
			{ !! help && (
				<p id={ helpId } className="components-base-control__help">
					{ help }
				</p>
			) }
		</div>
	);
}

BaseControl.VisualLabel = ( { className, children } ) => {
	className = classnames( 'components-base-control__label', className );
	return <span className={ className }>{ children }</span>;
};

export default BaseControl;
