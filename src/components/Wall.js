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

  isPointInBoundary(x, y) {
    /*if((y - 9) < (this.props.ypos + this.props.height)) {
      console.log('x,y is:' + x + ' , ' + y);
      console.log('is x between: ' + this.props.xpos + ' - ' + (this.props.xpos + this.props.width) + '--' + (x > this.props.xpos && x < (this.props.xpos + this.props.width)));
      console.log('is y between: ' + this.props.ypos + ' - ' + (this.props.ypos + this.props.height) + '--' + (y > this.props.ypos && y < (this.props.ypos + this.props.height)));
    }*/
    if(x > this.props.xpos && x < (this.props.xpos + this.props.width) &&
        y > this.props.ypos && y < (this.props.ypos + this.props.height)) {
      return true;
    }

    return false;
  }

}

export default Wall;
