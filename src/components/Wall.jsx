import React, { Component } from 'react';

/**
 * a Wall is a non-moving rectangular obstacle
 */
class Wall extends Component {

  //Props for this class should be
  //xpos, ypos, width, height

  /**
   * standard reactJs render function
   */
  render() {
    let background = this.props.background || 'green';
    let wallStyle = {
      "top": this.props.ypos + 'px',
      "left": this.props.xpos + 'px',
      "height": this.props.height + 'px',
      "width": this.props.width + 'px',
      "background": background,
      "transform": `rotate(${this.props.angle || 0}deg)`,
      "transformOrigin": '0 0'
    }
    return (
      <span className="wall"  style={ wallStyle } />
    )
  }

  /**
   * determine how the pinball should have its speed changed based on collision with the wall
   * @param startX the x coordinate of the pinball before its current move calculation started
   * @param startY the y coordinate of the pinball before its current move calculation started
   * @param x the target x coordinate for the pinball based on its present speed
   * @param y the target y coordinate for the pinball based on its present speed
   * @param xspeed the current speed of the ball along the x-axis
   * @param yspeed the current speed of the ball along the y-axis
   * @return { newXSpeed : resulting speed along the x-axis , newYSpeed: resulting speed along the y-axis}
   */
  impactOfCollision(startX, startY, x, y, xspeed, yspeed){
    const angle = (this.props.angle || 0) * (Math.PI / 180);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const toLocal = (pointX, pointY) => {
      const deltaX = pointX - this.props.xpos;
      const deltaY = pointY - this.props.ypos;
      return {
        x: (deltaX * cosine) + (deltaY * sine),
        y: (-deltaX * sine) + (deltaY * cosine)
      };
    };
    const localStart = toLocal(startX, startY);
    const localImpact = toLocal(x, y);
    const outsideX = localStart.x <= 0 || localStart.x >= this.props.width;
    const outsideY = localStart.y <= 0 || localStart.y >= this.props.height;
    let hitX = outsideX && !outsideY;
    let hitY = outsideY && !outsideX;

    if(outsideX && outsideY) {
      hitX = true;
      hitY = true;
    } else if(!outsideX && !outsideY) {
      const distanceToXEdge = Math.min(
        Math.abs(localImpact.x),
        Math.abs(this.props.width - localImpact.x)
      );
      const distanceToYEdge = Math.min(
        Math.abs(localImpact.y),
        Math.abs(this.props.height - localImpact.y)
      );
      hitX = distanceToXEdge <= distanceToYEdge;
      hitY = distanceToYEdge <= distanceToXEdge;
    }

    let newXSpeed = xspeed;
    let newYSpeed = yspeed;
    if(hitX) {
      const dotProduct = (newXSpeed * cosine) + (newYSpeed * sine);
      newXSpeed -= 2 * dotProduct * cosine;
      newYSpeed -= 2 * dotProduct * sine;
    }
    if(hitY) {
      const normalX = -sine;
      const normalY = cosine;
      const dotProduct = (newXSpeed * normalX) + (newYSpeed * normalY);
      newXSpeed -= 2 * dotProduct * normalX;
      newYSpeed -= 2 * dotProduct * normalY;
    }
    if(hitY && angle === 0 && xspeed === 0 && newYSpeed > 0){
      newXSpeed = x > this.props.centerOfTable ? -5 : 5;
    }

    return {
      newXSpeed: newXSpeed,
      newYSpeed: newYSpeed
    }
  }

  /**
   * determines whether a particular x,y coordinate is within area of the wall,
   * used to determine collisions
   * @param x the x-coordinate to check against the shape of the wall
   * @param y the y-coordinate to check against the shape of the wall
   * @return boolean true if the coordinate is within the wall area, false if not
   */
  isPointInBoundary(x, y) {
    const angle = (this.props.angle || 0) * (Math.PI / 180);
    const deltaX = x - this.props.xpos;
    const deltaY = y - this.props.ypos;
    const localX = (deltaX * Math.cos(angle)) + (deltaY * Math.sin(angle));
    const localY = (-deltaX * Math.sin(angle)) + (deltaY * Math.cos(angle));

    return localX > 0 && localX < this.props.width &&
      localY > 0 && localY < this.props.height;
  }

}

export default Wall;
