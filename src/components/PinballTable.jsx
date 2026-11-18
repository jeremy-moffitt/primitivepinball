import React, { Component } from 'react';
import Pinball from './Pinball.jsx';
import Obstacle from './Obstacle.jsx';
import Draggable from 'react-draggable';
import {
  DEFAULT_BALL_SIZE,
  GRAVITY_Y_PULL,
  MOVE_UPDATE_FREQUENCY_SECS
} from '../constants.js';

/**
 * the parent container of the pinball game, the whole table
 */
class PinballTable extends Component {

  /**
   * for props this should have a height and width
   * @prop height the height of the table in pixels
   * @prop width the width of the table in pixels
   */
  constructor(props){
    super(props);
    this.pinball = React.createRef();
    this.plungerRef = React.createRef();
    this.pinballSize = DEFAULT_BALL_SIZE;
    this.floor = this.props.height - (this.pinballSize * 2);
    const flipperLength = 70;
    const flipperAngle = 30;
    const flipperGap = 40;
    const flipperAnchorOffset =
      (flipperLength * Math.cos(flipperAngle * (Math.PI / 180))) + (flipperGap / 2);
    const cornerBumperSpan = this.props.width * 0.25;
    const cornerBumperLength = cornerBumperSpan * Math.SQRT2;

    //the table elements should probably be moved out to a json file or similar
    this.tableElements = [
      {
        type: 'wall',
        xpos: 290,
        ypos: 320,
        width: 60,
        height: 10,
        angle: 12,
        id: 'wall1'
      },
      {
        type: 'wall',
        xpos: 80,
        ypos: 320,
        width: 60,
        height: 10,
        angle: -12,
        id: 'wall2'
      },
      {
        type: 'wall',
        xpos: 0,
        ypos: cornerBumperSpan,
        width: cornerBumperLength,
        height: 10,
        angle: -45,
        id: 'topLeftBumper'
      },
      {
        type: 'wall',
        xpos: this.props.width - cornerBumperSpan,
        ypos: 0,
        width: cornerBumperLength,
        height: 10,
        angle: 45,
        id: 'topRightBumper'
      },
      {
        type: 'round',
        xpos: 182,
        ypos: 387,
        radius: 18,
        id: 'roundBumper3'
      },
      {
        type: 'round',
        xpos: 90,
        ypos: 160,
        radius: 18,
        id: 'roundBumper1'
      },
      {
        type: 'round',
        xpos: 274,
        ypos: 160,
        radius: 18,
        id: 'roundBumper2'
      },
      {
        type: 'flipper',
        side: 'left',
        xpos: (this.props.width / 2) - flipperAnchorOffset,
        ypos: 700,
        length: flipperLength,
        angle: flipperAngle,
        arc: -70,
        id: 'leftFlipper1'
      },
      {
        type: 'flipper',
        side: 'right',
        xpos: (this.props.width / 2) + flipperAnchorOffset,
        ypos: 700,
        length: flipperLength,
        angle: 180 - flipperAngle,
        arc: 70,
        id: 'rightFlipper1'
      }
    ];
    const leftFlipper = this.tableElements.find((element) => element.id === 'leftFlipper1');
    const rightFlipper = this.tableElements.find((element) => element.id === 'rightFlipper1');
    const railingThickness = 8;
    const railingTopY = (this.props.height * 0.7) + (railingThickness / 2);
    const railingEdgeInset = this.props.width * 0.1;
    this.tableElements.push(
      {
        type: 'railing',
        points: [
          { x: railingEdgeInset, y: railingTopY },
          { x: leftFlipper.xpos, y: leftFlipper.ypos }
        ],
        thickness: railingThickness,
        id: 'leftRailing'
      },
      {
        type: 'railing',
        points: [
          { x: this.props.width - railingEdgeInset, y: railingTopY },
          { x: rightFlipper.xpos, y: rightFlipper.ypos }
        ],
        thickness: railingThickness,
        id: 'rightRailing'
      }
    );

    //create refs to each obstacle on the table
    for(const obstacle of this.tableElements){
      this[obstacle.id] = React.createRef();
    }

    //the plugerKey is used to hack dragAndDrop position reset
    //the flipperCollisionEnabled state is because the flippers move faster
    //than the ball does and the math isnt there to bounce them back down
    //when they collide with the ball
    this.state = {
      plungerKey: 0,
      flipperCollisionsEnabled: true
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Routes A, D, and Space key presses to the corresponding flipper or flippers.
   *
   * @param event the keyboard event
   */
  handleKeyDown = (event) => {
    if(event.repeat || (event.target && event.target.isContentEditable)) {
      return;
    }

    if(event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) {
      return;
    }

    const key = event.key.toLowerCase();
    const sideByKey = {
      a: 'left',
      d: 'right',
      ' ': 'both'
    };
    const side = sideByKey[key];
    if(!side) {
      return;
    }

    if(key === ' ') {
      event.preventDefault();
    }
    this.triggerFlippers(side);
  }

  /**
   * triggers the ball to be put into play, the further the plunger has been "pulled" the more force applied to the ball
   * @param event mouse event from the drag and drop
   * @param element the pluger element on the table, its position is used to determine how much force to apply
   */
  plungered = (event, element) => {
    //is the ball at the starting point? if not, don't move it from the plunger applying force
    if(this.pinball.current.isAtOrigin()) {
      this.pinball.current.applyForce(element.y * (-0.15), element.y * (-2.6));
      //for testing left flipper collision uncomment out below and comment out above
      //this.pinball.current.applyForce(-15, -20);

      //for testing right flipper collision uncomment out below and comment out above
      //this.pinball.current.applyForce(-7, -25);
    }
    setTimeout(this.resetPlunger.bind(this), 200);
  }

  /**
   * sets the plunger back to its default position using a hack in react-draggable
   */
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

  /**
   * called when the ball has hit the floor of the table, reset the table, reset the ball to origin
   */
  ballLost = () => {
    this.pinball.current.resetToOrigin();
  }

  /**
   * Moves the requested flipper or flippers and checks whether they hit the ball.
   *
   * @param side which flipper to move: {@code left}, {@code right}, or {@code both}
   */
  triggerFlippers = (side = 'both') => {
    let currentObj, appliedForce;
    let pinball = this.pinball.current.getState();
    for(const obstacle of this.tableElements)
    {
      if(obstacle.type === 'flipper' && (side === 'both' || obstacle.side === side)) {
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

  /**
   * changes whether flippers are checked for ball collisions
   * flipperCollisions get turned off briefly when the flippers hit the ball because currently
   * the ball position is not updated ahead of the flipper position, which causes the collision detection
   * to think that the ball is *inside* of the flipper, causing the ball to get stuck...
   * this is a hack but it mostly works
   */
  setFlipperCollisions = (collisionsEnabled) => {
    this.setState((prevState) => {
      return {
        flipperCollisionsEnabled: collisionsEnabled
      };
    });
  }

  /**
   * this will check collisions and return the new state of the ball
   * @param xpos the x-axis coordinate of the ball
   * @param ypos the y-axis coordinate of the ball
   * @param xspeed the speed along the x-axis of the ball (can be negative)
   * @param yspeed the speed along the y-axis of the ball (can be negative)
   * @return { xpos, ypos, xspeed, yspeed } updated values for the position and speed
   */
  ballWantsToMove = (xpos, ypos, xspeed, yspeed) => {
    let newXPos = xpos;
    let newYPos = ypos;
    let newXSpeed = xspeed;
    let newYSpeed = yspeed;
    let bumperHit = false;

    //check for side wall collisions
    if(xpos + (this.pinballSize * 2) + (xspeed * MOVE_UPDATE_FREQUENCY_SECS) > this.props.width){ //ball hit into right side table wall
      newXPos = this.props.width - (this.pinballSize * 2);
      newXSpeed = -1 * xspeed;
    } else if(xpos + (xspeed * MOVE_UPDATE_FREQUENCY_SECS) < 0) { //ball hit into left side table wall
      newXPos = 0;
      newXSpeed = -1 * xspeed;
    } else {
      //adjust the speed based on how frequently the display is being updated, keeps the movement calculations
      //somewhat constant regardless of draw speed
      newXPos = xpos + (xspeed * MOVE_UPDATE_FREQUENCY_SECS);
    }

    //check for top/bottom of table collisions
    if(ypos + (this.pinballSize * 2) + (yspeed * MOVE_UPDATE_FREQUENCY_SECS) > this.props.height){ //ball hit bottom of table
      newYPos = this.floor;
      newYSpeed = 0;
      } else if(ypos + (yspeed * MOVE_UPDATE_FREQUENCY_SECS) < 0) { //ball hit into ceiling
      newYPos = 0;
      newYSpeed = 0;
    } else {
      newYPos = ypos + (yspeed * MOVE_UPDATE_FREQUENCY_SECS);
      //adjust the speed based on how frequently the display is being updated, keeps the movement calculations
      //somewhat constant regardless of draw speed
      newYSpeed = yspeed + (GRAVITY_Y_PULL * MOVE_UPDATE_FREQUENCY_SECS);
    }

    let collision;
    // check each obstacle against each touchpoint of the ball, if a collision is found,
    // don't allow the ball to move to that spot, and change its speed per the object rules
    let ballTouchPoints = this.getBallTouchPoints();
    for(let i = 0; i < ballTouchPoints.length; i++){
      const touchPoint = ballTouchPoints[i];
      collision = this.checkCollisions(
        touchPoint.ballX,
        touchPoint.ballY,
        touchPoint.ballX + (newXPos - xpos),
        touchPoint.ballY + (newYPos - ypos)
      );

      //if there was a collision, apply the obstacles collision logic to the ball
      if(collision.collisionPoint) {
        //found a collision!
        bumperHit = collision.obstacle.type === 'wall' || collision.obstacle.type === 'round';
        let updatedSpeed = collision.obstacleObj.impactOfCollision(
            xpos + this.pinballSize,
            ypos + this.pinballSize,
            collision.collisionPoint.x,
            collision.collisionPoint.y,
            xspeed,
            yspeed);
        newYSpeed = updatedSpeed.newYSpeed;
        newXSpeed = updatedSpeed.newXSpeed;
        const safePoint = collision.lastSafePoint || collision.collisionPoint;
        newXPos = safePoint.x - touchPoint.offsetX;
        newYPos = safePoint.y - touchPoint.offsetY;
        break;
      }
    }

    return({
      xpos: newXPos,
      ypos: newYPos,
      xspeed: newXSpeed,
      yspeed: newYSpeed,
      bumperHit
    })
  }

  /**
   * Need to check if the ball is going to collide with anything. This will get called for multiple touchpoints
   * of the ball, depending on which direction the ball is moving
   * @param startX the x coordinate of the ball before movement has been applied
   * @param startY the y coordinate of the ball before movement has been applied
   * @param endX the desired end coordinate along the X axis
   * @param endY the desired end coordinate along the Y axis
   * @return { collisionPoint, lastSafePoint, obstacle, obstacleObj } collision data, or undefined values when there
   *  is no collision
   */
  checkCollisions(startX, startY, endX, endY){
    let nearestCollisionPoint = undefined;
    let nearestSafePoint = undefined;
    let nearestCollisionDistance = undefined;
    let collidedWith = undefined;
    let collidedObj = undefined;
    let lengthOfLine = Math.ceil(Math.hypot(endX - startX, endY - startY));
    if(lengthOfLine === 0) {
      return {
        collisionPoint: undefined,
        lastSafePoint: undefined,
        obstacle: undefined,
        obstacleObj: undefined
      };
    }
    let rateOfChangeX = (endX - startX) / lengthOfLine;
    let rateOfChangeY = (endY - startY) / lengthOfLine;
    let currentObj;

    //for each obstacle, walk along the line representing the balls path and see if any point along the line
    //intersects with the obstacle
    for(const obstacle of this.tableElements){
      currentObj = this[obstacle.id];//try to get the ref
      //only check flippers if flipperCollisions haven't been disabled temporarily
      if(obstacle.type !== 'flipper' || this.state.flipperCollisionsEnabled === true) {
        let lastSafePoint = {
          x: startX,
          y: startY
        };
        for (let i = 1; i <= lengthOfLine; i++) {
          const lineX = startX + (i * rateOfChangeX);
          const lineY = startY + (i * rateOfChangeY);
          if (currentObj.current.isPointInBoundary(lineX, lineY)) {
            //found a collision, but is it closer to our point of origin than any previous
            //collisions?
            //only the collision closest to the ball matters, since that collision would happen first as
            //the movement plays out
            let distanceFromStart = Math.hypot(startX - lineX, startY - lineY);
            if (nearestCollisionDistance === undefined ||
                distanceFromStart < nearestCollisionDistance) {
              nearestCollisionDistance = distanceFromStart;
              nearestCollisionPoint = {
                x: lineX,
                y: lineY
              };
              nearestSafePoint = lastSafePoint;
              collidedWith = obstacle;
              collidedObj = currentObj.current;
            }
            break;
          }
          lastSafePoint = {
            x: lineX,
            y: lineY
          };
        }
      }
    }

    return {
      collisionPoint: nearestCollisionPoint,
      lastSafePoint: nearestSafePoint,
      obstacle: collidedWith,
      obstacleObj: collidedObj
    };
  }

  /**
   * get the set of coordinates to check for collisions based on which direction the ball is moving
   * if the ball is moving straight up, there is no need to check any of the bottom half of the ball
   * if the ball is moving down, wthere is no need to check any of the top half of the ball
   * similar for left/right, only check in the direction the ball is moving, the trailing side of the ball
   * is irrelevant and a waste of calculations
   * @return [{ballX, ballY, point, offsetX, offsetY}] ... array of objects, ballX is the x-coordinate of touchpoint
   *  ballY is the y-coordinate of the touchpoint , point is a string rep of which point it is (mostly for debugging)
   *  offsetX is how far off of the center of the ball the touchpoint is along the x-axis
   *  offsetY is how far off of the center of the ball the touchpoint is along the y-axis
   */
  getBallTouchPoints = () =>{
    let ballState = this.pinball.current.getState();
    const radius = this.pinballSize;
    const centerX = ballState.xpos + radius;
    const centerY = ballState.ypos + radius;
    const diagonalOffset = Math.round(radius * Math.SQRT1_2);
    const ballTouchPoints = [];
    const addTouchPoint = (ballX, ballY) => {
      ballTouchPoints.push({
        ballX,
        ballY,
        offsetX: ballX - ballState.xpos,
        offsetY: ballY - ballState.ypos
      });
    };

    if(ballState.xspeed > 0){
      addTouchPoint(centerX + radius, centerY);
      if(ballState.yspeed < 0) {
        addTouchPoint(centerX + diagonalOffset, centerY - diagonalOffset);
      } else if(ballState.yspeed > 0) {
        addTouchPoint(centerX + diagonalOffset, centerY + diagonalOffset);
      }
    } else if(ballState.xspeed < 0){
      addTouchPoint(centerX - radius, centerY);
      if(ballState.yspeed < 0) {
        addTouchPoint(centerX - diagonalOffset, centerY - diagonalOffset);
      } else if(ballState.yspeed > 0) {
        addTouchPoint(centerX - diagonalOffset, centerY + diagonalOffset);
      }
    }

    if(ballState.yspeed > 0) {
      addTouchPoint(centerX, centerY + radius);
    } else if(ballState.yspeed < 0) {
      addTouchPoint(centerX, centerY - radius);
    }

    return ballTouchPoints;
  }

  /**
   * standard reactjs render function
   */
  render() {
    let tableSize = {
      "height": this.props.height + 'px',
      "width" : this.props.width + 'px'
    };
    let gameBoardSize = {
      "height": (this.props.height + 24) + 'px',
      "width": (this.props.width + 24) + 'px'
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
        <div className="game-board" style={ gameBoardSize }>
          <div
            className="pinball-table"
            data-background={this.props.background || 'classic'}
            style={ tableSize }
          >
          {this.props.background === 'stars' && (
            <div className="playfield-stars" aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          )}
            <Pinball origin={pinballOrigin} tableprops={this.props}
                     ref={this.pinball} obstacles={this.tableElements}
                     ballWantsToMove={this.ballWantsToMove}
                     floor={this.floor}
                     size={this.pinballSize}
                     bumperHit={this.props.onBumperHit}
                     balllost={this.ballLost}/>
          { this.tableElements.map(item =>
              <Obstacle {...item} key={item.id} flip={this.state.flip} ref={this[item.id]}
              ballTouchPoints={this.getBallTouchPoints} centerOfTable={(this.props.width / 2)}/> ) }
          </div>
          <Draggable
            nodeRef={this.plungerRef}
            onStop={this.plungered}
            axis="y"
            bounds={{ top: 0, bottom: 80}}
            key={this.state.plungerKey}>
            <div className='plunger' ref={this.plungerRef} style={ plungerStyle }/>
          </Draggable>
          <button className="flipperButton"
            type="button"
            aria-label="Flip both flippers"
            title="Flip both flippers (Space)"
            style={ flipperButtonStyle }
            onClick={() => this.triggerFlippers('both')}/>
        </div>
    )
  }
}

export default PinballTable;