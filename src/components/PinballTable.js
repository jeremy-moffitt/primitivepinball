import React, { Component } from 'react';
import Pinball from './Pinball.js';

class PinballTable extends Component {

  render() {
    let tableSize = {
      "height": this.props.height + 'px',
      "width" : this.props.width + 'px'
    };
    let pinballOrigin = {
      x: this.props.width,
      y: this.props.height
    }
    return (
        <div className='pinball-table' style={ tableSize }>
          <Pinball origin={pinballOrigin} />
        </div>
    )
  }
}

export default PinballTable;