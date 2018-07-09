import React, { Component } from 'react';

const MOVE_UPDATE_FREQUENCY_SECS = 0.25

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
      let updatedState = this.ballWantsToMove(prevState.xpos, prevState.ypos, prevState.xspeed, prevState.yspeed, this.size);

      if(updatedState.xspeed !== 0 || updatedState.yspeed !== 0){
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
  ballWantsToMove(xpos, ypos, xspeed, yspeed, radius, timespan = MOVE_UPDATE_FREQUENCY_SECS) {
    let newXPos = xpos;
    let newYPos = ypos;
    let newXSpeed = xspeed;
    let newYSpeed = yspeed;
    if(xpos + radius + (xspeed * timespan) > this.props.tableprops.width){ //ball hit into right side table wall
      newXPos = this.props.tableprops.width - (radius * 2);
      newXSpeed = 0;
    } else if(xpos + (xspeed * timespan) < 0) { //ball hit into left side table wall
      newXPos = radius;
      newXSpeed = 0;
    } else {
      newXPos = xpos + (xspeed * timespan);
    }

    if(ypos + radius + (yspeed * timespan) > this.props.tableprops.height){ //ball hit bottom of table
      newYPos = this.props.tableprops.height - (radius * 2);
      newYSpeed = 0;
    } else if(ypos + (yspeed * timespan) < 0) { //ball hit into ceiling
      newYPos = radius;
      newYSpeed = 0;
    } else {
      newYPos = ypos + (yspeed * timespan);
    }

    return({
      xpos: newXPos,
      ypos: newYPos,
      xspeed: newXSpeed,
      yspeed: newYSpeed
    })
  }

  render() {
    let ballStyle = {
      "top": this.state.ypos,
      "left": this.state.xpos,
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