/**
 * Internal dependencies
 */
import registerDirectives from './directives';
import { init } from './init';

export { store } from './store';
export { directive, getContext, getElement } from './hooks';
export {
	useWatch,
	useInit,
	useEffect,
	useLayoutEffect,
	useCallback,
	useMemo,
} from './utils';

export { h as createElement, cloneElement } from 'preact';
export { useContext, useState, useRef } from 'preact/hooks';
export { deepSignal } from 'deepsignal';

document.addEventListener( 'DOMContentLoaded', async () => {
	registerDirectives();
	await init();
} );
