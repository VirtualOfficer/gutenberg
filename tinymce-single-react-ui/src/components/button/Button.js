import React, { createElement, Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './button.scss';
import cx from 'classnames'

export default class Button extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		let myStyle = this.props.style || styles

		let classMap = {
			ACTIVE: styles.active,
			INACTIVE: styles.inactive,
			DISABLED: styles.disabled
		};

		let buttonClasses = cx(
			styles.button,
			classMap[this.props.status] || styles.inactive
		)

		return (
			<div className={buttonClasses}> { this.props.children } </div>
		)
	}
}