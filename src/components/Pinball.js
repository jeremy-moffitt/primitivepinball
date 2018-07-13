import React, { Component } from 'react';
import { MOVE_UPDATE_FREQUENCY_SECS } from '../constants.js';

/**
 * Pinball is the primary moving object in the pinball game
 * this class handles its display and some of its movement
 */
class Pinball extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      xpos: this.props.origin.x - (this.props.size * 2),
      ypos: this.props.origin.y - (this.props.size * 2),
      xspeed: 0,
      yspeed: 0
    };
  }

  /**
   * gets the state of the ball
   * @return {StateObj}
   */
  getState = () => {
    return this.state;
  }

  /**
   * applies force to the ball, updating its state with new speed values (the previous speed modified by the
   * force parameters)
   * @param float xforce - the force to apply to the ball along the x-axis
   * @param float yforce - the force to apply to the ball along the y-axis
   */
  applyForce = (xforce, yforce) => {
    this.setState((prevState) => {

      return {
        xspeed: prevState.xspeed + xforce,
        yspeed: prevState.yspeed + yforce
      }
    }, this.move);
  }

  /**
   * checks to see if the ball is presently at its origin point
   * @return boolean true if the ball is at its origin, false otherwise
   */
  isAtOrigin = () => {
    if(this.state.xpos === this.props.origin.x - (this.props.size * 2) &&
       this.state.ypos === this.props.origin.y - (this.props.size * 2)){
      return true;
    }
    return false;
  }

  /**
   * moves the ball back to its origin point
   */
  resetToOrigin = () => {
    this.setState((prevState) => {
      return {
        xpos: this.props.origin.x - (this.props.size * 2),
        ypos: this.props.origin.y - (this.props.size * 2),
        xspeed: 0,
        yspeed: 0
      }
    });
  }

  /**
   * causes the ball to move, based on its present speed and position
   * xpos: the new x-axis coordinate of the ball
   * ypos: the new y-axis coordinate of the ball
   * xspeed: the new speed of the ball along the x-axis, may be negative
   * yspeed: the new speed of the ball along the y-axis, may be negative
   * @return {xpos, ypos, xspeed, yspeed}
   */
  move = () => {
    let ballLost = false;
    var updatedState;
    this.setState((prevState) => {
      updatedState = this.props.ballWantsToMove(prevState.xpos, prevState.ypos, prevState.xspeed, prevState.yspeed);
      if(!this.isAtOrigin() && updatedState.ypos === this.props.floor){
        //ball lost, let the table know
        ballLost = true;
      }

      return {
        xpos: updatedState.xpos,
        ypos: updatedState.ypos,
        xspeed: updatedState.xspeed,
        yspeed: updatedState.yspeed
      }

    }, () =>{
      if(!ballLost && updatedState &&
        (updatedState.xspeed !== 0 || updatedState.yspeed !== 0 ||
         updatedState.ypos !== this.props.floor)){
        setTimeout(this.move.bind(this), (MOVE_UPDATE_FREQUENCY_SECS * 100));
      }

      //need to call this from outside of the setState function to avoid nested setState calls
      if(ballLost){
        this.props.balllost();
      }
    });
  }

  /**
   * standard reactJs render function
   */
  render() {
    let ballStyle = {
      "top": this.state.ypos + 'px',
      "left": this.state.xpos  + 'px',
      "height": (this.props.size * 2) + 'px',
      "width": (this.props.size * 2) + 'px',
      "borderRadius": this.props.size + 'px'
    }
    return (
        <span className="pinball"  style={ ballStyle } />
    )
  }
}

export default Pinball;