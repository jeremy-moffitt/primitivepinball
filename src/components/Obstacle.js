import React, { Component } from 'react';
import Wall from './Wall.js';
import Flipper from './Flipper.js';

/**
 * the obstacle class is basically an interface for more specific obstacle types
 */
class Obstacle extends Component {

  /**
   * the props here area just passed on to the child, so they may vary from one obstacle type
   * to another
   */
  constructor(props){
    super(props);
    this.myActualComponent = React.createRef();
  }

  /**
   * determines whether a particular x,y coordinate is within area of the obstacle,
   * used to determine collisions
   * @param x the x-coordinate to check against the shape of the obstacle
   * @param y the y-coordinate to check against the shape of the obstacle
   * @return boolean true if the coordinate is within the obstacle area, false if not
   */
  isPointInBoundary(x, y){
    return this.myActualComponent.current.isPointInBoundary(x , y);
  }

  /**
   * determine how the pinball should have its speed changed based on collision with the obstacle
   * @param startX the x coordinate of the pinball before its current move calculation started
   * @param startY the y coordinate of the pinball before its current move calculation started
   * @param x the target x coordinate for the pinball based on its present speed
   * @param y the target y coordinate for the pinball based on its present speed
   * @param xspeed the current speed of the ball along the x-axis
   * @param yspeed the current speed of the ball along the y-axis
   * @return { newXSpeed : resulting speed along the x-axis , newYSpeed: resulting speed along the y-axis}
   */
  impactOfCollision(startX, startY, x, y, xspeed, yspeed){
    return this.myActualComponent.current.impactOfCollision(startX, startY, x, y, xspeed, yspeed);
  }

  /**
   * since Obstacle is just a proxy/interface for some other component, there are times when the real component
   * is needed for an operation, this returns the actual underlying component
   * @return Obstacle the underlying component (from the ref setup in the constructor)
   */
  getActualComponent(){
    return this.myActualComponent.current;
  }

  render() {
    if(this.props.type === 'wall'){
      return(
          <Wall {...this.props} ref={this.myActualComponent}/>
      )
    } else if (this.props.type === 'flipper'){
      return(
          <Flipper {...this.props} ref={this.myActualComponent}/>
      )
    }
  }
}

export default Obstacle;
