/**
 * External dependencies
 */
import { contextConnect } from '@wp-g2/context';

/**
 * Internal dependencies
 */
import Grid from '../grid';
import View from '../view';
import FormGroupContent from './form-group-content';
import { useFormGroup } from './use-form-group';

/**
 * @param {import('@wp-g2/create-styles').ViewOwnProps<import('./useFormGroup').Props, 'div'>} props
 * @param {import('react').Ref<any>} forwardedRef
 */
function FormGroup( props, forwardedRef ) {
	const { contentProps, horizontal, ...otherProps } = useFormGroup( props );

	if ( horizontal ) {
		return (
			<Grid
				templateColumns="minmax(0, 1fr) 2fr"
				{ ...otherProps }
				ref={ forwardedRef }
			>
				<FormGroupContent { ...contentProps } />
			</Grid>
		);
	}

	return (
		<View { ...otherProps } ref={ forwardedRef }>
			<FormGroupContent { ...contentProps } />
		</View>
	);
}

/**
 * `FormGroup` is a form component that groups a label with a form element (e.g. `Switch` or `TextInput`).
 *
 * @example
 * ```jsx
 * import {
 * 	__experimentalFormGroup as FormGroup,
 * 	__experimentalTextInput as TextInput
 * } from `@wordpress/components`
 *
 * function Example() {
 * 	return (
 * 		<FormGroup label="First name">
 * 			<TextInput />
 * 		</FormGroup>
 * 	)
 * }
 * ```
 */
const ConnectedFormGroup = contextConnect( FormGroup, 'FormGroup' );

export default ConnectedFormGroup;
