import React, { Component } from 'react';
import Pinball from './Pinball.js';
import Obstacle from './Obstacle.js';
import Draggable from 'react-draggable';

class PinballTable extends Component {

  constructor(props){
    super(props);
    this.pinball = React.createRef();
    this.tableElements = [
      {
        type: 'wall',
        xpos: 260,
        ypos: 400,
        width: 30,
        height: 10,
        id: 'wall1'
      },
      {
        type: 'wall',
        xpos: 110,
        ypos: 400,
        width: 30,
        height: 10,
        id: 'wall2'
      }
    ]
    this.state = {
      plungerKey: 0
    }
  }

  plungered = (event, element) => {
    //is the ball at the starting point? if not, don't move it from the plunger applying force
    if(this.pinball.current.isAtOrigin()) {
      this.pinball.current.applyForce(-65, -200);
    }
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

    return (
        <div>
          <div className='pinball-table' style={ tableSize }>
            <Pinball origin={pinballOrigin} tableprops={this.props}
                     ref={this.pinball} obstacles={this.tableElements}
                     balllost={this.ballLost}/>
          { this.tableElements.map(item =>
              <Obstacle {...item} key={item.id} /> ) }
          </div>
          <Draggable
            onStop={this.plungered}
            axis="y"
            bounds={{ top: 0, bottom: 80}}
            key={this.state.plungerKey}>
            <div className='plunger' style={ plungerStyle }/>
          </Draggable>
        </div>
    )
  }
}

export default PinballTable;