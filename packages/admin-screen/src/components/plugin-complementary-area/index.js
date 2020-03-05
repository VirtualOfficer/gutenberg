/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	Animate,
	Button,
	Panel,
	Slot,
	Fill,
	withFocusReturn,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { withPluginContext } from '@wordpress/plugins';
import { starEmpty, starFilled } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import PluginComplementaryAreaHeader from '../plugin-complementary-area-header';
import PinnedItems from '../pinned-items';

function PluginComplementaryAreaSlot( { scope, ...props } ) {
	return <Slot name={ `PluginComplementaryArea/${ scope }` } { ...props } />;
}

function PluginComplementaryAreaFill( { scope, ...props } ) {
	return <Fill name={ `PluginComplementaryArea/${ scope }` } { ...props } />;
}

/**
 * Renders a complementary area with its content.
 *
 * @return {Object} The rendered complementary area.
 */
function RawComplementaryArea( { children, className } ) {
	return <div className={ className }>{ children }</div>;
}

const ComplementaryAreaWithFocusReturn = withFocusReturn( {
	onFocusReturn( props ) {
		const elementToFocus =
			props.focusReturnSelect && document.querySelector( props );
		if ( elementToFocus ) {
			elementToFocus.focus();
			return false;
		}
	},
} )( RawComplementaryArea );

function ComplementaryArea( { scope, ...props } ) {
	return (
		<PluginComplementaryAreaFill scope={ scope }>
			<Animate type="slide-in" options={ { origin: 'left' } }>
				{ () => <ComplementaryAreaWithFocusReturn { ...props } /> }
			</Animate>
		</PluginComplementaryAreaFill>
	);
}

function PluginComplementaryArea( {
	className,
	complementaryAreaName,
	toggleComplementaryAreaShortcut,
	children,
	headerClassName,
	panelClassName,
	icon,
	isPinnable = true,
	title,
	scope,
	header,
	smallScreenTitle,
	closeLabel,
	elementToFocus,
} ) {
	const { isActive, isPinned } = useSelect(
		( select ) => {
			const { getSingleActiveArea, isMultipleActiveAreaActive } = select(
				'core/admin-screen'
			);
			return {
				isActive:
					getSingleActiveArea( scope ) === complementaryAreaName,
				isPinned: isMultipleActiveAreaActive(
					scope,
					complementaryAreaName
				),
			};
		},
		[ complementaryAreaName, scope ]
	);
	const { setSingleActiveArea } = useDispatch( 'core/admin-screen' );
	const { setMultipleActiveAreaEnableState } = useDispatch(
		'core/admin-screen'
	);
	return (
		<>
			{ isPinned && (
				<PinnedItems scope={ scope }>
					<Button
						icon={ icon }
						label={ title }
						onClick={ () =>
							isActive
								? setSingleActiveArea( scope )
								: setSingleActiveArea(
										scope,
										complementaryAreaName
								  )
						}
						isPressed={ isActive }
						aria-expanded={ isActive }
					/>
				</PinnedItems>
			) }
			{ isActive && (
				<ComplementaryArea
					elementToFocus={ elementToFocus }
					className={ classnames(
						'admin-screen-plugin-complementary-area',
						className
					) }
					scope={ scope }
				>
					<PluginComplementaryAreaHeader
						className={ headerClassName }
						closeLabel={ closeLabel || __( 'Close plugin' ) }
						closeComplementaryArea={ () =>
							setSingleActiveArea( scope )
						}
						smallScreenTitle={ smallScreenTitle }
						toggleComplementaryAreaShortcut={
							toggleComplementaryAreaShortcut
						}
					>
						{ header || (
							<>
								<strong>{ title }</strong>
								{ isPinnable && (
									<Button
										icon={
											isPinned ? starFilled : starEmpty
										}
										label={
											isPinned
												? __( 'Unpin from toolbar' )
												: __( 'Pin to toolbar' )
										}
										onClick={ () =>
											setMultipleActiveAreaEnableState(
												scope,
												complementaryAreaName,
												! isPinned
											)
										}
										isPressed={ isPinned }
										aria-expanded={ isPinned }
									/>
								) }
							</>
						) }
					</PluginComplementaryAreaHeader>
					<Panel className={ panelClassName }>{ children }</Panel>
				</ComplementaryArea>
			) }
		</>
	);
}

const PluginComplementaryAreaWrapped = withPluginContext(
	( context, ownProps ) => {
		return {
			icon: ownProps.icon || context.icon,
			complementaryAreaName:
				ownProps.complementaryAreaName ||
				`${ context.name }/${ ownProps.name }`,
		};
	}
)( PluginComplementaryArea );

PluginComplementaryAreaWrapped.Slot = PluginComplementaryAreaSlot;

export default PluginComplementaryAreaWrapped;
