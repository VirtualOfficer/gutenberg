/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { closeSmall } from '@wordpress/icons';
import { useViewportMatch } from '@wordpress/compose';
import { __experimentalTruncate as Truncate } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ComplementaryAreaToggle from '../complementary-area-toggle';

const ComplementaryAreaHeader = ( {
	smallScreenTitle,
	children,
	className,
	toggleButtonProps,
} ) => {
	const isMobileViewport = useViewportMatch( 'medium', '<' );

	const toggleButton = (
		<ComplementaryAreaToggle icon={ closeSmall } { ...toggleButtonProps } />
	);
	return (
		<>
			{ isMobileViewport && smallScreenTitle && (
				<div className="components-panel__header interface-complementary-area-header__small">
					<h2 className="interface-complementary-area-header__small-title">
						<Truncate numberOfLines={ 1 }>
							{ smallScreenTitle }
						</Truncate>
					</h2>
				</div>
			) }
			<div
				className={ clsx(
					'components-panel__header',
					'interface-complementary-area-header',
					className
				) }
				tabIndex={ -1 }
			>
				{ children }
				{ toggleButton }
			</div>
		</>
	);
};

export default ComplementaryAreaHeader;
