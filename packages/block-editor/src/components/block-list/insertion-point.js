/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { Popover } from '@wordpress/components';
import { placeCaretAtVerticalEdge } from '@wordpress/dom';
import { isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Inserter from '../inserter';
import { getClosestTabbable } from '../writing-flow';
import { getBlockDOMNode } from '../../utils/dom';

function InsertionPointInserter( {
	clientId,
	setIsInserterForced,
	containerRef,
} ) {
	const ref = useRef();

	function focusClosestTabbable( event ) {
		const { clientX, clientY, target } = event;

		// Only handle click on the wrapper specifically, and not an event
		// bubbled from the inserter itself.
		if ( target !== ref.current ) {
			return;
		}

		const { ownerDocument } = containerRef.current;
		const targetRect = target.getBoundingClientRect();
		const isReverse = clientY < targetRect.top + targetRect.height / 2;
		const blockNode = getBlockDOMNode( clientId, ownerDocument );
		const container = isReverse ? containerRef.current : blockNode;
		const closest =
			getClosestTabbable( blockNode, true, container ) || blockNode;
		const rect = new window.DOMRect( clientX, clientY, 0, 16 );

		placeCaretAtVerticalEdge( closest, isReverse, rect, false );
	}

	return (
		/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
		<div
			ref={ ref }
			onFocus={ () => setIsInserterForced( true ) }
			onBlur={ () => setIsInserterForced( false ) }
			onClick={ focusClosestTabbable }
			// While ideally it would be enough to capture the
			// bubbling focus event from the Inserter, due to the
			// characteristics of click focusing of `button`s in
			// Firefox and Safari, it is not reliable.
			//
			// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
			tabIndex={ -1 }
			className={ classnames(
				'block-editor-block-list__insertion-point-inserter'
			) }
		>
			<Inserter
				position="bottom center"
				clientId={ clientId }
				__experimentalIsQuick
			/>
		</div>
	);
}

function InsertionPointPopover( {
	clientId,
	rootClientId,
	isInserterShown,
	isInserterForced,
	setIsInserterForced,
	containerRef,
	showInsertionPoint,
} ) {
	const { previousElement, nextElement, orientation, isHidden } = useSelect(
		( select ) => {
			const {
				getBlockOrder,
				getBlockRootClientId,
				getBlockListSettings,
				getMultiSelectedBlockClientIds,
				getSelectedBlockClientId,
				hasMultiSelection,
				getSettings,
			} = select( 'core/block-editor' );
			const { ownerDocument } = containerRef.current;
			const targetRootClientId = clientId
				? getBlockRootClientId( clientId )
				: rootClientId;
			const blockOrder = getBlockOrder( targetRootClientId );
			if ( blockOrder.length < 2 ) {
				return {};
			}
			const next = clientId
				? clientId
				: blockOrder[ blockOrder.length - 1 ];
			const previous = blockOrder[ blockOrder.indexOf( next ) - 1 ];
			const { hasReducedUI } = getSettings();
			const multiSelectedBlockClientIds = getMultiSelectedBlockClientIds();
			const selectedBlockClientId = getSelectedBlockClientId();
			const blockOrientation =
				getBlockListSettings( targetRootClientId )?.orientation ||
				'vertical';

			return {
				previousElement: getBlockDOMNode( previous, ownerDocument ),
				nextElement: getBlockDOMNode( next, ownerDocument ),
				isHidden: hasMultiSelection()
					? ! hasReducedUI &&
					  multiSelectedBlockClientIds.includes( clientId )
					: ! hasReducedUI &&
					  blockOrientation === 'vertical' &&
					  clientId === selectedBlockClientId,
				orientation: blockOrientation,
			};
		},
		[ clientId, rootClientId ]
	);

	const getAnchorRect = useCallback( () => {
		const previousRect = previousElement.getBoundingClientRect();
		const nextRect = nextElement.getBoundingClientRect();
		if ( orientation === 'vertical' ) {
			const center =
				previousRect.bottom +
				( nextRect.top - previousRect.bottom ) / 2;
			return {
				top: center,
				left: previousRect.left,
				right: previousRect.right,
				bottom: center,
			};
		}
		const center =
			( isRTL() ? previousRect.left : previousRect.right ) +
			Math.abs( nextRect.left - previousRect.right ) / 2;
		return {
			top: previousRect.top,
			left: center,
			right: center,
			bottom: previousRect.bottom,
		};
	}, [ previousElement, nextElement ] );

	if ( ! previousElement || isHidden ) {
		return null;
	}

	const className = classnames(
		'block-editor-block-list__insertion-point',
		'is-' + orientation
	);

	return (
		<Popover
			noArrow
			animate={ false }
			getAnchorRect={ getAnchorRect }
			focusOnMount={ false }
			className="block-editor-block-list__insertion-point-popover"
			__unstableSlotName="block-toolbar"
		>
			<div
				className={ className }
				style={
					orientation === 'vertical'
						? { width: previousElement.offsetWidth }
						: { height: previousElement.offsetHeight }
				}
			>
				{ ( showInsertionPoint ||
					isInserterShown ||
					isInserterForced ) && (
					<div
						className={
							'block-editor-block-list__insertion-point-indicator'
						}
					/>
				) }
				{ ( isInserterShown || isInserterForced ) && (
					<InsertionPointInserter
						clientId={ clientId }
						setIsInserterForced={ setIsInserterForced }
						containerRef={ containerRef }
					/>
				) }
			</div>
		</Popover>
	);
}

export default function useInsertionPoint( ref ) {
	const [ isInserterShown, setIsInserterShown ] = useState( false );
	const [ isInserterForced, setIsInserterForced ] = useState( false );
	const [ inserterClientId, setInserterClientId ] = useState( null );
	const {
		isMultiSelecting,
		isInserterVisible,
		selectedClientId,
		selectedRootClientId,
		getBlockListSettings,
	} = useSelect( ( select ) => {
		const {
			isMultiSelecting: _isMultiSelecting,
			isBlockInsertionPointVisible,
			getBlockInsertionPoint,
			getBlockOrder,
			getBlockListSettings: _getBlockListSettings,
		} = select( 'core/block-editor' );

		const insertionPoint = getBlockInsertionPoint();
		const order = getBlockOrder( insertionPoint.rootClientId );

		return {
			getBlockListSettings: _getBlockListSettings,
			isMultiSelecting: _isMultiSelecting(),
			isInserterVisible: isBlockInsertionPointVisible(),
			selectedClientId: order[ insertionPoint.index ],
			selectedRootClientId: insertionPoint.rootClientId,
		};
	}, [] );

	const onMouseMove = useCallback(
		( event ) => {
			event.stopPropagation();
			if (
				! event.target.classList.contains(
					'block-editor-block-list__layout'
				)
			) {
				if ( isInserterShown ) {
					setIsInserterShown( false );
				}
				return;
			}

			const rootClientId = event.target.getAttribute( 'data-block' );
			const orientation =
				getBlockListSettings( rootClientId )?.orientation || 'vertical';
			const rect = event.target.getBoundingClientRect();
			const offsetTop = event.clientY - rect.top;
			const offsetLeft = event.clientX - rect.left;
			let element = Array.from( event.target.children ).find(
				( blockEl ) => {
					return (
						( orientation === 'vertical' &&
							blockEl.offsetTop > offsetTop ) ||
						( orientation === 'horizontal' &&
							blockEl.offsetLeft > offsetLeft )
					);
				}
			);

			if ( ! element ) {
				return;
			}

			// The block may be in an alignment wrapper, so check the first direct
			// child if the element has no ID.
			if ( ! element.id ) {
				element = element.firstElementChild;

				if ( ! element ) {
					return;
				}
			}

			const clientId = element.id.slice( 'block-'.length );

			if ( ! clientId ) {
				return;
			}

			const elementRect = element.getBoundingClientRect();

			if (
				( orientation === 'horizontal' &&
					( event.clientY > elementRect.bottom ||
						event.clientY < elementRect.top ) ) ||
				( orientation === 'vertical' &&
					( event.clientX > elementRect.right ||
						event.clientX < elementRect.left ) )
			) {
				if ( isInserterShown ) {
					setIsInserterShown( false );
				}
				return;
			}

			setIsInserterShown( true );
			setInserterClientId( clientId );
		},
		[ isInserterShown, setIsInserterShown, setInserterClientId ]
	);

	const enableMouseMove = ! isInserterForced && ! isMultiSelecting;

	useEffect( () => {
		if ( ! enableMouseMove ) {
			return;
		}

		ref.current.addEventListener( 'mousemove', onMouseMove );

		return () => {
			ref.current.removeEventListener( 'mousemove', onMouseMove );
		};
	}, [ enableMouseMove, onMouseMove ] );

	const isVisible = isInserterShown || isInserterForced || isInserterVisible;

	return (
		! isMultiSelecting &&
		isVisible && (
			<InsertionPointPopover
				clientId={
					isInserterVisible ? selectedClientId : inserterClientId
				}
				rootClientId={ selectedRootClientId }
				isInserterShown={ isInserterShown }
				isInserterForced={ isInserterForced }
				setIsInserterForced={ setIsInserterForced }
				containerRef={ ref }
				showInsertionPoint={ isInserterVisible }
			/>
		)
	);
}
