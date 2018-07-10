import React, { Component } from 'react';
import { isPointInBoundary } from './Obstacle.js';

const MOVE_UPDATE_FREQUENCY_SECS = 0.1;
const GRAVITY_Y_PULL = 2;

class Pinball extends Component {

  constructor(props)
  {
    super(props);

    this.size = 8 //radius in pixels
    this.state = {
      xpos: this.props.origin.x - (this.size * 2),
      ypos: this.props.origin.y - (this.size * 2),
      xspeed: 0,
      yspeed: 0
    }
    this.floor = this.props.origin.y - (this.size * 2);
  }

  applyForce = (xforce, yforce) => {
    this.setState((prevState) => {

      return {
        xspeed: prevState.xspeed + xforce,
        yspeed: prevState.yspeed + yforce
      }
    }, this.move);
  }

  //may need to move this up a level to get visibility to other objects
  move = () => {
    this.setState((prevState) => {
      let updatedState = this.ballWantsToMove(prevState.xpos, prevState.ypos, prevState.xspeed, prevState.yspeed);

      if(updatedState.xspeed !== 0 || updatedState.yspeed !== 0 ||
         updatedState.ypos !== this.floor ){
        setTimeout(this.move.bind(this), (MOVE_UPDATE_FREQUENCY_SECS * 100));
      }

      return {
        xpos: updatedState.xpos,
        ypos: updatedState.ypos,
        xspeed: updatedState.xspeed,
        yspeed: updatedState.yspeed
      }

    });
  }

  //this will check collisions and return the new state of the ball
  ballWantsToMove(xpos, ypos, xspeed, yspeed, radius=this.size, timespan = MOVE_UPDATE_FREQUENCY_SECS) {
    let newXPos = xpos;
    let newYPos = ypos;
    let newXSpeed = xspeed;
    let newYSpeed = yspeed;
    if(xpos + (radius * 2) + (xspeed * timespan) > this.props.tableprops.width){ //ball hit into right side table wall
      newXPos = this.props.tableprops.width - (radius * 2);
      newXSpeed = 0;
    } else if(xpos + (xspeed * timespan) < 0) { //ball hit into left side table wall
      newXPos = 0;
      newXSpeed = 0;
    } else {
      newXPos = xpos + (xspeed * timespan);
    }

    if(ypos + (radius * 2) + (yspeed * timespan) > this.props.tableprops.height){ //ball hit bottom of table
      newYPos = this.floor;
      newYSpeed = 0;
    } else if(ypos + (yspeed * timespan) < 0) { //ball hit into ceiling
      newYPos = 0;
      newYSpeed = 0;
    } else {
      newYPos = ypos + (yspeed * timespan);
      newYSpeed = yspeed + (GRAVITY_Y_PULL * timespan);
    }

    let collisionPoint;
    if(newYSpeed > 0) {//ball is traveling downward
      collisionPoint = this.checkCollisions(xpos, ypos + radius, newXPos, newYPos + radius);
      if(collisionPoint) {
        //found a collision!
        newYPos = collisionPoint.y - (2 * radius);
        newYSpeed = 0;
      }
    } else if (newYSpeed < 0){//ball is traveling upwards
      collisionPoint = this.checkCollisions(xpos, ypos - radius, newXPos, newYPos - radius);
      if(collisionPoint) {
        //found a collision!
        newYPos = collisionPoint.y + (2 * radius);
        newYSpeed = 0;
      }
    }

    if(newXSpeed > 0) {//ball is traveling right
      collisionPoint = this.checkCollisions(xpos + radius, newYPos, newXPos + radius);
      if(collisionPoint) {
        //found a collision!
        newXPos = collisionPoint.x - (2 * radius);
        newXSpeed = 0;
      }
    } else if (newXSpeed < 0){//ball is traveling left
      collisionPoint = this.checkCollisions(xpos - radius, newYPos, newXPos - radius, newYPos);
      if(collisionPoint) {
        //found a collision!
        newXPos = collisionPoint.x + (2 * radius);
        newXSpeed = 0;
      }
    }

    return({
      xpos: newXPos,
      ypos: newYPos,
      xspeed: newXSpeed,
      yspeed: newYSpeed
    })
  }

  //Need to check if the ball is going to collide with anything
  checkCollisions(startX, startY, endX, endY){
    let nearestCollisionPoint = undefined, nearestCollisionDistance = undefined;
    let lengthOfLine = Math.round(Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2)));
    let rateOfChangeX = (startX - endX) / lengthOfLine;
    let rateOfChangeY = (startY - endY) / lengthOfLine;
    let lineX = startX, lineY = startY;
    for(const obstacle of this.props.obstacles){
      for(let i = 0; i < lengthOfLine; i++){
        lineX = Math.round(startX + (i * rateOfChangeX));
        lineY = Math.round(startY + (i * rateOfChangeY));
        if(isPointInBoundary(lineX, lineY, obstacle)){
          //found a collision, but is it closer to our point of origin than any previous
          //collisions?
          let distanceFromStart = Math.round(Math.sqrt(Math.pow(startX - lineX, 2) + Math.pow(startY - lineY, 2)));
          if(nearestCollisionDistance === undefined ||
              distanceFromStart < nearestCollisionDistance) {
            nearestCollisionDistance = distanceFromStart;
            nearestCollisionPoint = {
              x: lineX,
              y: lineY
            }
          }
        }
      }
    }

    return nearestCollisionPoint;
  }

  render() {
    let ballStyle = {
      "top": this.state.ypos + 'px',
      "left": this.state.xpos  + 'px',
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