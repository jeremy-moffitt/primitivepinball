import React, { Component } from 'react';
import { MOVE_UPDATE_FREQUENCY_SECS } from '../constants.js';


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

  getState = () => {
    return this.state;
  }

  applyForce = (xforce, yforce) => {
    this.setState((prevState) => {

      return {
        xspeed: prevState.xspeed + xforce,
        yspeed: prevState.yspeed + yforce
      }
    }, this.move);
  }

  isAtOrigin = () => {
    if(this.state.xpos === this.props.origin.x - (this.props.size * 2) &&
       this.state.ypos === this.props.origin.y - (this.props.size * 2)){
      return true;
    }
    return false;
  }

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

  //may need to move this up a level to get visibility to other objects
  move = () => {
    let ballLost = false;
    this.setState((prevState) => {
      let updatedState = this.props.ballWantsToMove(prevState.xpos, prevState.ypos, prevState.xspeed, prevState.yspeed);

      if(!this.isAtOrigin() && updatedState.ypos === this.props.floor){
        //ball lost, let the table know
        ballLost = true;
      } else if(updatedState.xspeed !== 0 || updatedState.yspeed !== 0 ||
         updatedState.ypos !== this.props.floor ){
        setTimeout(this.move.bind(this), (MOVE_UPDATE_FREQUENCY_SECS * 100));
      }

      return {
        xpos: updatedState.xpos,
        ypos: updatedState.ypos,
        xspeed: updatedState.xspeed,
        yspeed: updatedState.yspeed
      }

    });

    //need to call this from outside of the setState function to avoid nested setState calls
    if(ballLost){
      this.props.balllost();
    }
  }

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