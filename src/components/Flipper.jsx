import React, { Component } from 'react';

/**
 * Flippers are the paddles on the table that can be used to knock the ball around
 */
class Flipper extends Component {

  //Props for this class should be
  //xpos, ypos, length, angle, arc
  /**
   * @prop xpos the x coordinate of the "anchor" of the flipper
   * @prop ypos the y coordinate of the "anchor" of the flipper
   * @prop length the length of the flipper
   * @prop angle the starting angle of the flipper (also determines if its facing left or right)
   * @prop arc the maximum movement arc (in degrees) of the flipper, can be negative
   */
  constructor(props){
    super(props);
    this.flipperWidth = 5;
    this.positionUpdate = undefined;
    this.state = {
      currentAngle: this.props.angle
    }

  }

  /**
   * triggers the flipper to "flip" from its resting position to its "flipped" position
   * based on the arc in its props, if the flipper intersects with the ball, return the force applied to the ball
   *
   * @param ballX the x coordinate of the ball
   * @param ballY the y coordinate of the ball
   * @param ballXSpeed how fast the ball is moving along the X-axis, can be negative
   * @param ballYSpeed how fast the ball is moving along the Y-axis, can be negative
   * @return appliedForce { x: appliedforce along x-axis , y: applied forice along y axis}
   */
  flip(ballX, ballY, ballXSpeed, ballYSpeed, ballRadius) {
    if(this.positionUpdate){
      clearTimeout(this.positionUpdate);
    }
    this.changeFlipperAngle(this.props.angle + this.props.arc);
    //this.positionUpdate = setTimeout(this.checkFlipperAngle, 100);
    setTimeout(this.checkFlipperAngle, 100);

    //check the relevant touchpoints of the ball against the path of the flipper
    let ballTouchPoints = this.props.ballTouchPoints();
    let appliedForce = undefined;
    for(let i = 0; i < ballTouchPoints.length; i++){
      appliedForce = this.checkFlipperUpswing(ballTouchPoints[i].ballX, ballTouchPoints[i].ballY, ballXSpeed, ballYSpeed);
      if(appliedForce !== undefined){
        break;
      }
    }

    //if there was no collision, don't apply any new force
    if(appliedForce === undefined){
      appliedForce = {
        x: 0,
        y: 0
      };
    }
    return appliedForce;
  }

  /**
   * does the calculations for whether the ball intersected with the moving flipper and returns applied force
   *
   * @param ballX the x coordinate of the ball
   * @param ballY the y coordinate of the ball
   * @param ballXSpeed how fast the ball is moving along the X-axis, can be negative
   * @param ballYSpeed how fast the ball is moving along the Y-axis, can be negative
   * @return appliedForce { x: appliedforce along x-axis , y: applied forice along y axis}
   */
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

  /**
   * takes the 3 points of the triangle and calculates the area
   * @param x1 the x coordinate of point1
   * @param y1 the y coordinate of point1
   * @param x2 the x coordinate of point2
   * @param y2 the y coordinate of point2
   * @param x3 the x coordinate of point3
   * @param y3 the y coordinate of point3
   * @return int the area of the triangle
   */
  areaOfTriangle( x1 , y1 , x2 , y2 , x3 , y3 ){
    return Math.abs((x1 * (y2-y3) + x2 * (y3-y1) + x3 * (y1-y2)) / 2);
  }

  /**
   * checks the flippers current position against its resting state, moves it towards the resting state
   * if it is not presently resting
   * @return float the angle in degrees of the flipper in its current state
   */
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

  /**
  * changes the current angle of the flipper
  * @param angle the new angle value in degrees
  */
  changeFlipperAngle = (angle) => {
    this.setState((prevState) => {
      return {
        currentAngle: angle
      };
    });
  }

  /**
   * standard reactJs render function
   */
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

  /**
   * find out where the top and bottom of the flipper are, for a particular spot along its length
   * e.g. if the flipper is 40 pixels long, atlen would be a value between 0..40 and this will return
   * information about the flipper at that specific spot along its length
   * @param atlen integer representing how far along the length of the flipper to check, defaults to the end of the flipper
   * @param angle the angle at which to check for position, defaults to the currentAngle of the flipper
   * @return { yTop, yBottom, minX, maxX } top and bottom of the flipper (top will be a lower number because
   *  in html 0,0 is the top left of the back), and the min and max of X (in absolute page coordinates) at that length
   *  of the flipper
   */
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

  /**
   * determine how the pinball should have its speed changed based on collision with the flipper
   * @param startX the x coordinate of the pinball before its current move calculation started
   * @param startY the y coordinate of the pinball before its current move calculation started
   * @param x the target x coordinate for the pinball based on its present speed
   * @param y the target y coordinate for the pinball based on its present speed
   * @param xspeed the current speed of the ball along the x-axis
   * @param yspeed the current speed of the ball along the y-axis
   * @return { newXSpeed : resulting speed along the x-axis , newYSpeed: resulting speed along the y-axis}
   */
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

  /**
   * determines whether a particular x,y coordinate is within area of the flipper,
   * used to determine collisions
   * @param x the x-coordinate to check against the shape of the flipper
   * @param y the y-coordinate to check against the shape of the flipper
   * @return boolean true if the coordinate is within the flipper area, false if not
   */
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