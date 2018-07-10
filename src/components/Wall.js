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
}

export default Wall;

export function isPointInBoundary(x, y, wallprops) {
  if(x > wallprops.xpos && x < wallprops.xpos + wallprops.width &&
      y > wallprops.ypos && y < wallprops.ypos + wallprops.height) {
    return true;
  }

  return false;
}