import React, { Component } from 'react';
import Wall, { isPointInBoundary as isPointInWallBoundary } from './Wall.js';

class Obstacle extends Component {

  render() {
    if(this.props.type === 'wall'){
      return(
          <Wall {...this.props}/>
      )
    }
  }
}

export default Obstacle;

export function isPointInBoundary(x, y, obstacleprops) {
  if(obstacleprops.type === 'wall'){
    return isPointInWallBoundary(x,y, obstacleprops);
  }
}