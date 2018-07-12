import React, { Component } from 'react';

class Wall extends Component {

  //Props for this class should be
  //xpos, ypos, width, height

  render() {
    let background = this.props.background || 'green';
    let wallStyle = {
      "top": this.props.ypos + 'px',
      "left": this.props.xpos + 'px',
      "height": this.props.height + 'px',
      "width": this.props.width + 'px',
      "background": background
    }
    return (
      <span className="wall"  style={ wallStyle } />
    )
  }


  isPointInBoundary(x, y) {
    if(x > this.props.xpos && x < this.props.xpos + this.props.width &&
        y > this.props.ypos && y < this.props.ypos + this.props.height) {
      return true;
    }

    return false;
  }

}

export default Wall;
