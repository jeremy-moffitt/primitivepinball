import React, { Component } from 'react';
import Wall, { isPointInBoundary as isPointInWallBoundary } from './Wall.js';
import Flipper, { isPointInBoundary as isPointInFlipperBoundary } from './Flipper.js';

class Obstacle extends Component {

  render() {
    if(this.props.type === 'wall'){
      return(
          <Wall {...this.props}/>
      )
    } else if (this.props.type === 'flipper'){
      return(
          <Flipper {...this.props}/>
      )
    }
  }
}

export default Obstacle;

export function isPointInBoundary(x, y, obstacleprops) {
  if(obstacleprops.type === 'wall'){
    return isPointInWallBoundary(x,y, obstacleprops);
  } else if (obstacleprops.type === 'flipper'){
    return isPointInFlipperBoundary(x,y, obstacleprops);
  }
}