/**
 * External dependencies
 */
import React from 'react';
/**
 * WordPress dependencies
 */
import {
	PanelBody,
	MissingControl,
	createSlotFill,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MissingInspectorControls } from '../missing-inspector-controls';
import NotificationSheet from '../../../../block-library/src/missing/notificationSheet';

const { Slot, Fill } = createSlotFill( 'NotificationInspectorControls' );

function NotificationInspectorControls( { children } ) {
	return (
		<Fill>
			{ ( { openNotificationSheet, ...fillProps } ) => {
				return (
					[
						<NotificationSheet { ...fillProps } />,
						<MissingInspectorControls>
							<PanelBody title={ __( 'Color Settings' ) } >
								<MissingControl
									label={ __( 'Coming Soon' ) }
									onPress={ openNotificationSheet }
									separatorType="none"
								/>
							</PanelBody>
						</MissingInspectorControls>,
					]
				);
			} }
		</Fill>
	);
}

NotificationInspectorControls.Slot = Slot;

function Notification( { isVisible, onClose, openNotificationSheet } ) {
	const fillProps = { title: 'Color Settings', isVisible, onClose, type: 'plural', openNotificationSheet };
	return (
		<>
			<NotificationInspectorControls />
			<NotificationInspectorControls.Slot fillProps={ fillProps } />
		</>
	);
}

export default Notification;
