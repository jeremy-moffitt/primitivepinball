import React, { Component } from 'react';
import Pinball from './Pinball.js';

class PinballTable extends Component {

  constructor(props){
    super(props);
    this.pinball = React.createRef();
  }

  plungered = () => {
    this.pinball.current.applyForce(0, -10);
  }

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
        <div>
          <div className='pinball-table' style={ tableSize }>
            <Pinball origin={pinballOrigin} tableprops={this.props}
                     ref={this.pinball} />
          </div>
          <div className='plunger'>
            <button onClick={this.plungered}>start game</button>
          </div>
        </div>
    )
  }
}

export default PinballTable;