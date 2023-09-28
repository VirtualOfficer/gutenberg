/**
 * External dependencies
 */
import type { Component, MutableRefObject, ReactNode } from 'react';

export type SlotKey = string | symbol;

export type SlotComponentProps = {
	/**
	 * If true, events will bubble to their parents on the DOM hierarchy (native event bubbling).
	 */
	bubblesVirtually?: boolean;

	/**
	 * Slot name.
	 */
	name: SlotKey;
	/**
	 * props to pass from `Slot` to `Fill`.
	 *
	 * @default {}
	 */
	fillProps?: any;

	/**
	 * A function that returns nodes to be rendered.
	 * Not supported when bubblesVirtually is true.
	 *
	 * @param fills
	 */
	children?: ( fills: ReactNode ) => ReactNode;
};

export type FillComponentProps = {
	/**
	 * Slot name.
	 */
	name: SlotKey;

	/**
	 * Children elements.
	 */
	children: ReactNode | ( ( fillProps: any ) => ReactNode );
};

export type SlotFillProviderProps = {
	/**
	 * The children elements.
	 */
	children: ReactNode;
};

export type BubblesVirtuallySlotFillContext = {
	slots: Map<
		SlotKey,
		{
			ref: MutableRefObject< HTMLElement | undefined >;
			fillProps: any;
		}
	>;
	fills: Map< SlotKey, MutableRefObject< { rerender: () => void } >[] >;
	registerSlot: (
		name: SlotKey,
		ref: MutableRefObject< HTMLElement | undefined >,
		fillProps: any
	) => void;
	unregisterSlot: (
		name: SlotKey,
		ref: MutableRefObject< HTMLElement | undefined >
	) => void;
	updateSlot: ( name: SlotKey, fillProps: any ) => void;
	registerFill: (
		name: SlotKey,
		ref: MutableRefObject< { rerender: () => void } >
	) => void;
	unregisterFill: (
		name: SlotKey,
		ref: MutableRefObject< { rerender: () => void } >
	) => void;
};

export type BaseSlotFillContext = {
	registerSlot: (
		name: SlotKey,
		slot: Component< BaseSlotComponentProps >
	) => void;
	unregisterSlot: (
		name: SlotKey,
		slot: Component< BaseSlotComponentProps >
	) => void;
	registerFill: ( name: SlotKey, instance: FillComponentProps ) => void;
	unregisterFill: ( name: SlotKey, instance: FillComponentProps ) => void;
	getSlot: (
		name: SlotKey
	) => Component< BaseSlotComponentProps > | undefined;
	getFills: (
		name: SlotKey,
		slotInstance: Component< BaseSlotComponentProps >
	) => FillComponentProps[];
	subscribe: ( listener: () => void ) => () => void;
};

export type BaseSlotComponentProps = Pick<
	BaseSlotFillContext,
	'registerSlot' | 'unregisterSlot' | 'getFills'
> &
	Omit< SlotComponentProps, 'bubblesVirtually' >;
