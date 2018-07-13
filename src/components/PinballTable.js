import React, { Component } from 'react';
import Pinball from './Pinball.js';
import Obstacle from './Obstacle.js';
import Draggable from 'react-draggable';

import { MOVE_UPDATE_FREQUENCY_SECS, GRAVITY_Y_PULL } from '../constants.js';

class PinballTable extends Component {

  constructor(props){
    super(props);
    this.pinball = React.createRef();
    this.pinballSize = 8;
    this.floor = this.props.height - (this.pinballSize * 2);
    this.tableElements = [
      {
        type: 'wall',
        xpos: 290,
        ypos: 320,
        width: 60,
        height: 10,
        id: 'wall1'
      },
      {
        type: 'wall',
        xpos: 80,
        ypos: 320,
        width: 60,
        height: 10,
        id: 'wall2'
      },
      {
        type: 'wall',
        xpos: 170,
        ypos: 400,
        width: 60,
        height: 10,
        id: 'wall3'
      },
      {
        type: 'flipper',
        xpos: (this.props.width / 2) - 80,
        ypos: 700,
        length: 70,
        angle: 30,
        arc: -70,
        id: 'leftFlipper1'
      },
      {
        type: 'flipper',
        xpos: (this.props.width / 2) + 80,
        ypos: 700,
        length: 70,
        angle: 150,
        arc: 70,
        id: 'rightFlipper1'
      }
    ];

    for(const obstacle of this.tableElements){
      this[obstacle.id] = React.createRef();
    }
    this.state = {
      plungerKey: 0,
      flipperCollisionsEnabled: true
    }
  }

  plungered = (event, element) => {
    //is the ball at the starting point? if not, don't move it from the plunger applying force
    if(this.pinball.current.isAtOrigin()) {
      this.pinball.current.applyForce(element.y * (-0.25), element.y * (-2.00));
      //for testing left flipper collision uncomment out below and comment out above
      //this.pinball.current.applyForce(-15, -20);

      //for testing right flipper collision uncomment out below and comment out above
      //this.pinball.current.applyForce(-7, -25);
    }
    setTimeout(this.resetPlunger.bind(this), 200);
  }

  resetPlunger = () => {
    //react-draggable will reset a component state if its key changes
    // this is the quickest way to reset its state without learning
    // the inards of the draggable-core library
    this.setState((prevState) => {
      return {
        plungerKey: prevState.plungerKey + 1
      };
    });
  }

  //reset the table, reset the ball to origin
  ballLost = () => {
    this.pinball.current.resetToOrigin();
  }

  triggerFlippers = () => {
    let currentObj, appliedForce;
    let pinball = this.pinball.current.getState();
    for(const obstacle of this.tableElements)
    {
      if(obstacle.type ==='flipper') {
        currentObj = this[obstacle.id].current;//try to get the ref
        appliedForce = currentObj.getActualComponent().flip(pinball.xpos, pinball.ypos,
                                                            pinball.xspeed, pinball.yspeed,
                                                            this.pinballSize);
        if(appliedForce.x !== 0 || appliedForce.y !== 0){
          //need to ignore flipper collisions for some period of time while the force is applied,
          //otherwise the ball intersecting with the flippers will immediately re-collide with them
          this.setFlipperCollisions(false);
          this.pinball.current.applyForce(appliedForce.x, appliedForce.y);
          setTimeout(() => {
            this.setFlipperCollisions(true);
          }, 200);//turn collisions back 200ms later
        }
      }
    }
  }

  setFlipperCollisions = (collisionsEnabled) => {
    this.setState((prevState) => {
      return {
        flipperCollisionsEnabled: collisionsEnabled
      };
    });
  }

  //this will check collisions and return the new state of the ball
  ballWantsToMove = (xpos, ypos, xspeed, yspeed) => {
    let newXPos = xpos;
    let newYPos = ypos;
    let newXSpeed = xspeed;
    let newYSpeed = yspeed;
    if(xpos + (this.pinballSize * 2) + (xspeed * MOVE_UPDATE_FREQUENCY_SECS) > this.props.width){ //ball hit into right side table wall
      newXPos = this.props.width - (this.pinballSize * 2);
      newXSpeed = -1 * xspeed;
    } else if(xpos + (xspeed * MOVE_UPDATE_FREQUENCY_SECS) < 0) { //ball hit into left side table wall
      newXPos = 0;
      newXSpeed = -1 * xspeed;
    } else {
      newXPos = xpos + (xspeed * MOVE_UPDATE_FREQUENCY_SECS);
    }

    if(ypos + (this.pinballSize * 2) + (yspeed * MOVE_UPDATE_FREQUENCY_SECS) > this.props.height){ //ball hit bottom of table
      newYPos = this.floor;
      newYSpeed = 0;
      } else if(ypos + (yspeed * MOVE_UPDATE_FREQUENCY_SECS) < 0) { //ball hit into ceiling
      newYPos = 0;
      newYSpeed = 0;
    } else {
      newYPos = ypos + (yspeed * MOVE_UPDATE_FREQUENCY_SECS);
      newYSpeed = yspeed + (GRAVITY_Y_PULL * MOVE_UPDATE_FREQUENCY_SECS);
    }

    let collision;
    // check each obstacle against each touchpoint of the ball, if a collision is found,
    // don't allow the ball to move to that spot, and change its speed per the object rules
    let ballTouchPoints = this.getBallTouchPoints();
    for(let i = 0; i < ballTouchPoints.length; i++){
      collision = this.checkCollisions(ballTouchPoints[i].ballX, ballTouchPoints[i].ballY,
          ballTouchPoints[i].ballX + newXSpeed, ballTouchPoints[i].ballY, + newYSpeed);
      if(collision.collisionPoint) {
        //found a collision!
        let updatedSpeed = collision.obstacleObj.impactOfCollision(
            xpos,
            ypos,
            ballTouchPoints[i].x,
            ballTouchPoints[i].y,
            xspeed,
            yspeed);
        newYSpeed = updatedSpeed.newYSpeed;
        newXSpeed = updatedSpeed.newXSpeed;
        newXPos = xpos - ballTouchPoints[i].offsetX;
        newYPos = ypos - ballTouchPoints[i].offsetY;
        break;
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
    let nearestCollisionPoint = undefined, nearestCollisionDistance = undefined, collidedWith = undefined, collidedObj = undefined;
    let lengthOfLine = Math.round(Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2)));
    let rateOfChangeX = (startX - endX) / lengthOfLine;
    let rateOfChangeY = (startY - endY) / lengthOfLine;
    let lineX = startX, lineY = startY;
    let currentObj;
    for(const obstacle of this.tableElements){
      currentObj = this[obstacle.id];//try to get the ref
      if(obstacle.type !== 'flipper' || this.state.flipperCollisionsEnabled === true) {
        for (let i = 0; i < lengthOfLine; i++) {
          lineX = startX + (i * rateOfChangeX);
          lineY = startY + (i * rateOfChangeY);
          if (currentObj.current.isPointInBoundary(lineX, lineY, obstacle)) {
            //found a collision, but is it closer to our point of origin than any previous
            //collisions?
            let distanceFromStart = Math.round(Math.sqrt(Math.pow(startX - lineX, 2) + Math.pow(startY - lineY, 2)));
            if (nearestCollisionDistance === undefined ||
                distanceFromStart < nearestCollisionDistance) {
              nearestCollisionDistance = distanceFromStart;
              nearestCollisionPoint = {
                x: lineX,
                y: lineY
              };
              collidedWith = obstacle;
              collidedObj = currentObj.current;
            }
          }
        }
      }
    }

    return {
      collisionPoint: nearestCollisionPoint,
      obstacle: collidedWith,
      obstacleObj: collidedObj
    };
  }

  getBallTouchPoints = () =>{
    let ballState = this.pinball.current.getState();
    let ballTouchPoints = [];
    if(ballState.xspeed > 0){
      ballTouchPoints.push({//right
        ballX: ballState.xpos + this.pinballSize,
        ballY: ballState.ypos,
        point: 'right',
        offsetX: this.pinballSize,
        offsetY: 0
      });
      if(ballState.yspeed < 0) {
        ballTouchPoints.push({//top right
          ballX: ballState.xpos + Math.round(Math.sin(45) * this.pinballSize),
          ballY: ballState.ypos - Math.round(Math.cos(45) * this.pinballSize),
          point: 'top-right',
          offsetX: Math.round(Math.sin(45) * this.pinballSize),
          offsetY: (-1 * Math.round(Math.cos(45) * this.pinballSize))
        });
      } else {
        ballTouchPoints.push({//bottom right
          ballX: ballState.xpos + Math.round(Math.sin(45) * this.pinballSize),
          ballY: ballState.ypos + Math.round(Math.cos(45) * this.pinballSize),
          point: 'bottom-right',
          offsetX: Math.round(Math.sin(45) * this.pinballSize),
          offsetY:  Math.round(Math.cos(45) * this.pinballSize)
        });
      }
    } else if(ballState.xspeed < 0){
      ballTouchPoints.push({ //left
        ballX: ballState.xpos - this.pinballSize,
        ballY: ballState.ypos,
        point: 'left',
        offsetX: (-1 * this.pinballSize),
        offsetY: 0
      });
      if(ballState.yspeed < 0) {
        ballTouchPoints.push({ //top left
          ballX: ballState.xpos - Math.round(Math.sin(45) * this.pinballSize),
          ballY: ballState.ypos - Math.round(Math.cos(45) * this.pinballSize),
          point: 'top-left',
          offsetX: (-1 *  Math.round(Math.sin(45) * this.pinballSize)),
          offsetY: (-1 *  Math.round(Math.cos(45) * this.pinballSize))
        });
      } else {
        ballTouchPoints.push({ //bottom left
          ballX: ballState.xpos - Math.round(Math.sin(45) * this.pinballSize),
          ballY: ballState.ypos + Math.round(Math.cos(45) * this.pinballSize),
          point: 'bottom left',
          offsetX: (-1 * Math.round(Math.sin(45) * this.pinballSize)),
          offsetY: Math.round(Math.cos(45) * this.pinballSize)
        });
      }
    }

    if(ballState.yspeed > 0) {
      ballTouchPoints.push({//bottom of the ball
        ballX: ballState.xpos,
        ballY: ballState.ypos + this.pinballSize,
        point: 'bottom',
        offsetX: 0,
        offsetY: this.pinballSize
      });
    } else if(ballState.yspeed < 0) {
      ballTouchPoints.push({//top of the ball
        ballX: ballState.xpos,
        ballY: ballState.ypos - this.pinballSize,
        point: 'top',
        offsetX: 0,
        offsetY: (-1 * this.pinballSize)
      });
    }

    return ballTouchPoints;
  }


  render() {
    let tableSize = {
      "height": this.props.height + 'px',
      "width" : this.props.width + 'px'
    };
    let pinballOrigin = {
      x: this.props.width,
      y: this.props.height
    };

    let plungerStyle = {
      "left": (this.props.width - 20) + 'px',
      "top": (this.props.height - 80) + 'px'
    };

    let flipperButtonStyle = {
      "left": this.props.width + 'px',
      "top": (this.props.height - 70) + 'px'
    };

    return (
        <div>
          <div className='pinball-table' style={ tableSize }>
            <Pinball origin={pinballOrigin} tableprops={this.props}
                     ref={this.pinball} obstacles={this.tableElements}
                     ballWantsToMove={this.ballWantsToMove}
                     floor={this.floor}
                     size={this.pinballSize}
                     balllost={this.ballLost}/>
          { this.tableElements.map(item =>
              <Obstacle {...item} key={item.id} flip={this.state.flip} ref={this[item.id]}
              ballTouchPoints={this.getBallTouchPoints} centerOfTable={(this.props.width / 2)}/> ) }
          </div>
          <Draggable
            onStop={this.plungered}
            axis="y"
            bounds={{ top: 0, bottom: 80}}
            key={this.state.plungerKey}>
            <div className='plunger' style={ plungerStyle }/>
          </Draggable>
          <button className="flipperButton"
            style={ flipperButtonStyle }
            onClick={this.triggerFlippers}/>
        </div>
    )
  }
}

export default PinballTable;