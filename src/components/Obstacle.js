import React, { Component } from 'react';
import Wall from './Wall.js';
import Flipper from './Flipper.js';

class Obstacle extends Component {

  constructor(props){
    super(props);
    this.myActualComponent = React.createRef();
  }

  isPointInBoundary(x, y, obstacleprops){
    return this.myActualComponent.current.isPointInBoundary(x , y , obstacleprops);
  }

  getActualComponent(){
    return this.myActualComponent.current;
  }

  render() {
    if(this.props.type === 'wall'){
      return(
          <Wall {...this.props} ref={this.myActualComponent}/>
      )
    } else if (this.props.type === 'flipper'){
      return(
          <Flipper {...this.props} ref={this.myActualComponent}/>
      )
    }
  }
}

export default Obstacle;
