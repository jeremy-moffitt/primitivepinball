import React, { Component } from 'react';

class Flipper extends Component {

  constructor(props){
    super(props);
    this.flipperWidth = 5;
    this.state = {
      currentAngle: this.props.angle
    }
  }

  //Props for this class should be
  //xpos, ypos, length, angle, arc

  checkFlipperAngle = () => {
    if(this.props.flip === false && this.state.currentAngle === this.props.angle){
      return this.state.currentAngle;
    } else if(this.props.flip === false){
      //flipper was triggered previously and is resetting back to its normal position
      let tempAngle = this.state.currentAngle - (this.props.arc / 10);
      //reset 10% of the arc every 100 milliseconds
      if((this.props.arc > 0 && tempAngle < this.props.angle ) ||
         (this.props.arc < 0 && tempAngle > this.props.angle)){
        //somehow we've added or subtracted too many times!
        tempAngle = this.props.angle;
      }
      setTimeout(() => {
        this.changeFlipperAngle(tempAngle)
      }, 100);
      return tempAngle;
    } else {
      console.log('flip is true!');
      //flipper was just flipped
      setTimeout(() => {
        this.changeFlipperAngle(this.props.angle + this.props.arc)
      }, 100);
      return this.props.angle + this.props.arc;
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
    let flipperAngle = this.checkFlipperAngle();

    let flipperStyle = {
      "top": this.props.ypos + 'px',
      "left": this.props.xpos + 'px',
      "height": this.flipperWidth + 'px',
      "width": this.props.length + 'px',
      "background": background,
      "transform": 'rotate(' + flipperAngle + 'deg)',
      "transformOrigin": '0% 0%'
    };
    return (
        <span className="flipper"  style={ flipperStyle } />
        )
  }
}

export default Flipper;

export function isPointInBoundary(x, y, flipperprops) {
  //figure out top and bottom boundaries for the flipper
  //the line for each should be
  // y = x * sin(angle)
  // so the top of the bar should be:
  // y = this.props.ypos + ((x - this.props.xpos) * sin(this.state.currentAngle))
  // and the bottom bar should be:
  // y = this.props.ypos + this.flipperWidth + ((x - this.props.xpos) * sin(this.state.currentAngle))
  //let yTop = this.props.ypos + ((x - this.props.xpos) * Math.sin(this.state.currentAngle));
  //let yBottom = this.props.ypos + this.flipperWidth + ((x - this.props.xpos) * Math.sin(this.state.currentAngle));
  //TODO - refactor so isPointInBoundary can be called on the class itself, otherwise it wont have access
  // to the current state information, which is a problem for moving elements like the flippers

  //need to invert the Math.sin result (times -1) because Math.sin assumes counter-clockwise degree counting
  //but css degrees are clockwise
  let yTop, yBottom, minX, maxX;
  if((Math.floor(flipperprops.angle / 90) % 2) === 1){
    //if the flipper opens left
    yTop = flipperprops.ypos + (Math.abs(x - flipperprops.xpos) * -1 * Math.sin(flipperprops.angle));
    yBottom = flipperprops.ypos + 5 + (Math.abs(x - flipperprops.xpos) * -1 * Math.sin(flipperprops.angle));
    minX = flipperprops.xpos - flipperprops.length;
    maxX = flipperprops.xpos;
  } else {
    //if the flipper opens right
    yTop = flipperprops.ypos + (Math.abs(x - flipperprops.xpos) * -1 * Math.sin(flipperprops.angle));
    yBottom = flipperprops.ypos + 5 + (Math.abs(x - flipperprops.xpos) * -1 * Math.sin(flipperprops.angle));
    minX = flipperprops.xpos;
    maxX = flipperprops.xpos + flipperprops.length;
  }

  if(yBottom > y && y > yTop
     && x > minX && x < maxX){
    return true;
  }

  return false;
}