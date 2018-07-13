import React, { Component } from 'react';

class Flipper extends Component {

  //Props for this class should be
  //xpos, ypos, length, angle, arc
  constructor(props){
    super(props);
    this.flipperWidth = 5;
    this.positionUpdate = undefined;
    this.state = {
      currentAngle: this.props.angle
    }

  }

  flip(ballX, ballY, ballXSpeed, ballYSpeed, ballRadius) {
    if(this.positionUpdate){
      clearTimeout(this.positionUpdate);
    }
    this.changeFlipperAngle(this.props.angle + this.props.arc);
    //this.positionUpdate = setTimeout(this.checkFlipperAngle, 100);
    setTimeout(this.checkFlipperAngle, 100);

    //for now only checking if the ball is hit from below, but this should result in at least 3 (possibly 5 or more)
    //data points to check
    let ballTouchPoints = this.props.ballTouchPoints();
    let appliedForce = undefined;
    for(let i = 0; i < ballTouchPoints.length; i++){
      appliedForce = this.checkFlipperUpswing(ballTouchPoints[i].ballX, ballTouchPoints[i].ballY, ballXSpeed, ballYSpeed);
      if(appliedForce !== undefined){
        break;
      }
    }

    if(appliedForce === undefined){
      appliedForce = {
        x: 0,
        y: 0
      };
    }
    return appliedForce;
  }

  checkFlipperUpswing(ballX, ballY, ballXSpeed, ballYSpeed){
    let appliedForce = undefined;
    //need to figure out if the ball is within the arc that the flipper is traveling
    //and if so, return an x,y force to apply to the ball
    // this should be checking if the ball is in a cone (triangle with a rounded end)
    // but for now we will use a triangle as a rudimentary check
    let restingEndX, restingEndY, arcEndX, arcEndY;
    let restingFlipperCoords = this.getFlipperCoords(this.props.length, this.props.angle);
    let flippedFlipperCoords = this.getFlipperCoords(this.props.length, this.props.angle + this.props.arc);

    //this assumes a flipper that flips "up" , may need more complicated math in the future if flippers are intended
    //to flip from top to bottom
    restingEndX = restingFlipperCoords.maxX === this.props.xpos ? restingFlipperCoords.minX : restingFlipperCoords.maxX;
    restingEndY = restingFlipperCoords.yBottom;//bottom of the flipper for resting flipper

    arcEndX = flippedFlipperCoords.maxX === this.props.xpos ? flippedFlipperCoords.minX : flippedFlipperCoords.maxX;
    arcEndY = flippedFlipperCoords.yTop;//top of the flipper for flipped flipper

    let flipperTriangleArea = this.areaOfTriangle(this.props.xpos, this.props.ypos,
        Math.floor(restingEndX), Math.floor(restingEndY), Math.floor(arcEndX), Math.floor(arcEndY));

    let bt1 = this.areaOfTriangle(Math.floor(ballX), Math.floor(ballY), this.props.xpos, this.props.ypos,
        Math.floor(restingEndX), Math.floor(restingEndY));
    let bt2 =  this.areaOfTriangle(Math.floor(ballX), Math.floor(ballY),
        Math.floor(restingEndX), Math.floor(restingEndY), Math.floor(arcEndX), Math.floor(arcEndY));
    let bt3 =  this.areaOfTriangle(Math.floor(ballX), Math.floor(ballY), this.props.xpos, this.props.ypos,
        Math.floor(arcEndX), Math.floor(arcEndY));

    if(flipperTriangleArea === (bt1 + bt2 + bt3)){
      //ball is in the area that the flipper includes
      //needs real math below with vectors and stuff...
      appliedForce = {
        x: 0,
        y: -200
      }
    }

    return appliedForce;
  }

  //takes the 3 points of the triangle and calculates the area
  areaOfTriangle( x1 , y1 , x2 , y2 , x3 , y3 ){
    return Math.abs((x1 * (y2-y3) + x2 * (y3-y1) + x3 * (y1-y2)) / 2);
  }

  checkFlipperAngle = () => {
    if(this.state.currentAngle === this.props.angle){
      return this.state.currentAngle;
    } else {
      //flipper was triggered previously and is resetting back to its normal position
      let tempAngle = this.state.currentAngle - (this.props.arc / 10);
      //reset 10% of the arc every 50 milliseconds
      if((this.props.arc > 0 && tempAngle < this.props.angle ) ||
         (this.props.arc < 0 && tempAngle > this.props.angle)){
        //somehow we've added or subtracted too many times!
        tempAngle = this.props.angle;
      }
      this.positionUpdate = setTimeout(() => {
        this.changeFlipperAngle(tempAngle);
        this.checkFlipperAngle();
      }, 50);
      return tempAngle;
    }
  }

  changeFlipperAngle = (angle) => {
    this.setState((prevState) => {
      return {
        currentAngle: angle
      };
    });
  }

  render() {
    let background = this.props.background || 'red';

    let flipperStyle = {
      "top": this.props.ypos + 'px',
      "left": this.props.xpos + 'px',
      "height": this.flipperWidth + 'px',
      "width": this.props.length + 'px',
      "background": background,
      "transform": 'rotate(' + this.state.currentAngle + 'deg)',
      "transformOrigin": '0% 0%'
    };
    return (
        <span className="flipper"  style={ flipperStyle } />
        )
  }

  // atlen is how far along the length of the flipper
  getFlipperCoords(atlen = this.props.length, angle = this.state.currentAngle){
    let yTop, yBottom, minX, maxX;

    //figure out top and bottom boundaries for the flipper
    //the line for each should be
    // y = x * sin(angle)
    // so the top of the bar should be:
    // y = this.props.ypos + ((x - this.props.xpos) * sin(this.state.currentAngle))
    // and the bottom bar should be:
    // y = this.props.ypos + this.flipperWidth + ((x - this.props.xpos) * sin(this.state.currentAngle))
    // mod out to between 0-90 degrees, we only care about the length of the opposite side
    // and sin values for >90 don't produce a useful result
    let workingAngle = Math.abs(angle % 90);

    let oppositeLen = atlen * Math.sin(workingAngle) * -1;
    let quadrant = Math.floor(angle / 90) % 4;
    switch(quadrant) {
      case 3:
        oppositeLen = atlen * Math.sin(angle);
        yTop = this.props.ypos + oppositeLen;
        yBottom = this.props.ypos + oppositeLen + this.flipperWidth;
        break;
      case 2:
        oppositeLen = atlen * Math.sin(angle % 180);
        yTop = this.props.ypos - oppositeLen - this.flipperWidth;
        yBottom = this.props.ypos - oppositeLen;
        break;
      case 1:
        oppositeLen = atlen * Math.sin(180 - workingAngle);
      default:
        yBottom = this.props.ypos + oppositeLen + this.flipperWidth;
        yTop = this.props.ypos + oppositeLen;
        break;
    }

    if((Math.floor(this.props.angle / 90) % 2) === 1){
      //if the flipper opens left
      minX = this.props.xpos - this.props.length;
      maxX = this.props.xpos;
    } else {
      //if the flipper opens right
      minX = this.props.xpos;
      maxX = this.props.xpos + this.props.length;
    }

    return ({
      yTop: yTop,
      yBottom: yBottom,
      minX: minX,
      maxX: maxX
    })
  }

  impactOfCollision(startX, startY, x, y, xspeed, yspeed){
    let newXSpeed;
    let newYSpeed = yspeed;

    //have this.state.currentAngle for the current angle of the flipper
    // need to figure out what angle the ball is coming in at
    // triangle would be (startX,startY) , (x,y), (x, startY)
    // (or alternately (startX, startY), (x,y), (startX, y)
    // start by getting the angle of approach to the X-axis of the ball
    // A = arccos( (b^2 + c^2 - a^2) / 2bc ) where a is the opposite side length
    // a = abs(yspeed)
    // c = abs(xspeed)
    // b = sqrt(a^2 + b^2)
    let a = Math.abs(yspeed);
    let c = Math.abs(xspeed);
    let b = Math.sqrt(Math.pow(a,2) + Math.pow(c,2));
    let A = Math.acos((Math.pow(b,2) + Math.pow(c,2) - Math.pow(a,2)) / (2 * b * c));
    A = A * (180 / Math.PI);//convert radians to degrees

    let angleDifference = Math.abs(A - this.state.currentAngle);
    let outBoundAngle = this.state.currentAngle + 180 - angleDifference;
    let netSpeed = Math.sqrt(Math.pow(yspeed, 2) + Math.pow(xspeed,2));
    //using the outbound angle, figure out new speeds, same momentum different direction
    newYSpeed = netSpeed * Math.sin(outBoundAngle % 90);
    newXSpeed = netSpeed * Math.cos(outBoundAngle % 90);

    return {
      newXSpeed: newXSpeed,
      newYSpeed: newYSpeed
    }
  }

  isPointInBoundary(x, y) {
    let flipperCoords = this.getFlipperCoords(Math.abs(x - this.props.xpos));

    if(flipperCoords.yBottom > y && y > flipperCoords.yTop
       && x > flipperCoords.minX && x < flipperCoords.maxX){
      return true;
    }

    return false;
  }

}

export default Flipper;