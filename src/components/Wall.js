import React, { Component } from 'react';

/**
 * a Wall is a non-moving rectangular obstacle
 */
class Wall extends Component {

  //Props for this class should be
  //xpos, ypos, width, height

  /**
   * standard reactJs render function
   */
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

  /**
   * determine how the pinball should have its speed changed based on collision with the wall
   * @param startX the x coordinate of the pinball before its current move calculation started
   * @param startY the y coordinate of the pinball before its current move calculation started
   * @param x the target x coordinate for the pinball based on its present speed
   * @param y the target y coordinate for the pinball based on its present speed
   * @param xspeed the current speed of the ball along the x-axis
   * @param yspeed the current speed of the ball along the y-axis
   * @return { newXSpeed : resulting speed along the x-axis , newYSpeed: resulting speed along the y-axis}
   */
  impactOfCollision(startX, startY, x, y, xspeed, yspeed){
    let newXSpeed, newYSpeed;
    //need to figure out which side it hit from
    //this should be broken down into more possibilities
    //for now, its either horizontal or vertical
    // diagonal should be accounted for though too
    if(this.isPointInBoundary(x, startY)){
      //horizontal collision
      newXSpeed = xspeed * -1;
      if(this.isPointInBoundary(startX, y)){
        //verticalCollision too!
        newYSpeed = yspeed * -1;
      } else {
        newYSpeed = yspeed;
      }
    } else {
      newYSpeed = yspeed * -1;
      if(xspeed === 0 && newYSpeed > 0){
        //roll towards the middle if stuck on a wall
        if(x > this.props.centerOfTable) {
          newXSpeed = -5;
        } else {
          newXSpeed = 5;
        }
      } else {
        newXSpeed = xspeed;
      }
    }

    return {
      newXSpeed: newXSpeed,
      newYSpeed: newYSpeed
    }
  }

  /**
   * determines whether a particular x,y coordinate is within area of the wall,
   * used to determine collisions
   * @param x the x-coordinate to check against the shape of the wall
   * @param y the y-coordinate to check against the shape of the wall
   * @return boolean true if the coordinate is within the wall area, false if not
   */
  isPointInBoundary(x, y) {
    if(x > this.props.xpos && x < (this.props.xpos + this.props.width) &&
        y > this.props.ypos && y < (this.props.ypos + this.props.height)) {
      return true;
    }

    return false;
  }

}

export default Wall;
