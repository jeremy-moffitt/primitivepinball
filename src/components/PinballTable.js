import React, { Component } from 'react';
import Pinball from './Pinball.js';
import Obstacle from './Obstacle.js';
import Draggable from 'react-draggable';

class PinballTable extends Component {

  constructor(props){
    super(props);
    this.pinball = React.createRef();
    //this.leftFlipper = React.createRef();
    //this.rightFlipper = React.createRef();
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
        ypos: 720,
        length: 70,
        angle: 30,
        arc: -70,
        id: 'leftFlipper1'
      },
      {
        type: 'flipper',
        xpos: (this.props.width / 2) + 80,
        ypos: 720,
        length: 70,
        angle: 150,
        arc: 70,
        id: 'rightFlipper1'
      }
    ]
    this.state = {
      plungerKey: 0,
      flip: false
    }
  }

  plungered = (event, element) => {
    //is the ball at the starting point? if not, don't move it from the plunger applying force
    if(this.pinball.current.isAtOrigin()) {
      this.pinball.current.applyForce(element.y * (-0.15), element.y * (-2.00));
      //for testing left flipper collision uncomment out below and comment out above
      //this.pinball.current.applyForce(-15, -20);
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

  clearFlip = () => {
    this.setState((prevState) => {
      return {
        flip: false
      };
    });
  }

  triggerFlippers = () => {
    console.log('flippers triggered');
    //this.leftFlipper.current.triggerFlip();
    //this.rightFlipper.current.triggerFlip();
    this.setState((prevState) => {
      return {
        flip: true
      };
    }, this.clearFlip);
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
    }

    return (
        <div>
          <div className='pinball-table' style={ tableSize }>
            <Pinball origin={pinballOrigin} tableprops={this.props}
                     ref={this.pinball} obstacles={this.tableElements}
                     balllost={this.ballLost}/>
          { this.tableElements.map(item =>
              <Obstacle {...item} key={item.id} flip={this.state.flip} /> ) }
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