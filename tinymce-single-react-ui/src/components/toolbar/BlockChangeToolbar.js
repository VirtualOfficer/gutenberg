import React, { createElement, Component } from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames';

import * as Icons from '../../external/dashicons'
import Button from '../button/Button'
import styles from './blocktoolbar.scss'
import { blockIconMap, blockList } from '../../utils/tag'

export default class BlockChangeToolbar extends React.Component {
  constructor(props){
    super(props)
    this.state = {
		  open: false
	  }
  }


	toggleMenu = () => {
		this.setState( {
			open: ! this.state.open
		} );
	}

  getDropdownButtons() {
    return blockList.filter((item) => {
      return item !== this.props.selected
    })
  }

  getActiveButton() {
    return blockList.filter((item) => {
      return item === this.props.selected
    })
  }

  render() {

    return this.props.isOpen ? (
      <div className={styles.horizontal} onClick={ this.toggleMenu } >

       {this.getActiveButton().map((choice, index) => (
          <Button key={index}
            status={'ACTIVE'}>
            {blockIconMap[choice]}
          </Button>
        )
        )}


        {this.state.open && this.getDropdownButtons().map((choice, index) => (
          <Button key={index}
            status={'INACTIVE'}>
            {blockIconMap[choice]}
          </Button>
        )
        )}
      </div>
    ) : null;
  }

}


