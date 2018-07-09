import React, { Component } from 'react';

class Pinball extends Component {
  constructor(props)
  {
    super(props);

    this.size = 8 //radius in pixels
    this.state = {
      xpos: this.props.origin.x,
      ypos: this.props.origin.y,
    }
  }

  render() {
    let ballStyle = {
      "top": this.state.ypos - (this.size * 2),
      "left": this.state.xpos - (this.size * 2),
      "height": (this.size * 2) + 'px',
      "width": (this.size * 2) + 'px',
      "borderRadius": this.size + 'px'
    }
    return (
        <span className="pinball"  style={ ballStyle } />
    )
  }
}

export default Pinball;