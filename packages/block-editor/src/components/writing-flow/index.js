/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useMergeRefs, useRefEffect } from '@wordpress/compose';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useMultiSelection from './use-multi-selection';
import useTabNav from './use-tab-nav';
import useArrowNav from './use-arrow-nav';
import useSelectAll from './use-select-all';
import useDragSelection from './use-drag-selection';
import useSelectionObserver from './use-selection-observer';
import useClickSelection from './use-click-selection';
import useInput from './use-input';
import useClipboardHandler from './use-clipboard-handler';
import { store as blockEditorStore } from '../../store';
import { getSelectionRoot } from './utils';

export function useWritingFlow() {
	const [ before, ref, after ] = useTabNav();
	const hasMultiSelection = useSelect(
		( select ) => select( blockEditorStore ).hasMultiSelection(),
		[]
	);

	return [
		before,
		useMergeRefs( [
			ref,
			useClipboardHandler(),
			useInput(),
			useDragSelection(),
			useSelectionObserver(),
			useClickSelection(),
			useMultiSelection(),
			useSelectAll(),
			useArrowNav(),
			useRefEffect(
				( node ) => {
					node.tabIndex = 0;

					if ( ! hasMultiSelection ) {
						return;
					}

					node.classList.add( 'has-multi-selection' );
					node.setAttribute(
						'aria-label',
						__( 'Multiple selected blocks' )
					);

					return () => {
						node.classList.remove( 'has-multi-selection' );
						node.removeAttribute( 'aria-label' );
					};
				},
				[ hasMultiSelection ]
			),
			useRefEffect( ( node ) => {
				function onInput( event ) {
					if ( event.target !== node || event.__isRedirected ) {
						return;
					}

					const { ownerDocument } = node;
					const { defaultView } = ownerDocument;
					const prototype = Object.getPrototypeOf( event );
					const constructorName = prototype.constructor.name;
					const Constructor = defaultView[ constructorName ];
					const root = getSelectionRoot( ownerDocument );

					if ( ! root ) {
						return;
					}

					const init = {};

					for ( const key in event ) {
						init[ key ] = event[ key ];
					}

					init.bubbles = false;

					const newEvent = new Constructor( event.type, init );
					newEvent.__isRedirected = true;
					const cancelled = ! root.dispatchEvent( newEvent );

					if ( cancelled ) {
						event.preventDefault();
					}
				}

				const events = [
					'beforeinput',
					'input',
					'compositionstart',
					'compositionend',
					'compositionupdate',
					'keydown',
				];

				events.forEach( ( eventType ) => {
					node.addEventListener( eventType, onInput );
				} );

				return () => {
					events.forEach( ( eventType ) => {
						node.removeEventListener( eventType, onInput );
					} );
				};
			}, [] ),
		] ),
		after,
	];
}

function WritingFlow( { children, ...props }, forwardedRef ) {
	const [ before, ref, after ] = useWritingFlow();
	return (
		<>
			{ before }
			<div
				{ ...props }
				ref={ useMergeRefs( [ ref, forwardedRef ] ) }
				className={ clsx(
					props.className,
					'block-editor-writing-flow'
				) }
			>
				{ children }
			</div>
			{ after }
		</>
	);
}

/**
 * Handles selection and navigation across blocks. This component should be
 * wrapped around BlockList.
 *
 * @param {Object}  props          Component properties.
 * @param {Element} props.children Children to be rendered.
 */
export default forwardRef( WritingFlow );
