import React, { Component } from 'react';

/**
 * A solid line segment that guides the ball without awarding points.
 */
class Railing extends Component {
  /**
   * Renders each segment of the railing path.
   */
  render() {
    const segments = this.props.points.slice(1).map((point, index) => {
      const start = this.props.points[index];
      const deltaX = point.x - start.x;
      const deltaY = point.y - start.y;
      const length = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      return (
        <span
          className="railing"
          key={index}
          style={{
            left: `${start.x}px`,
            top: `${start.y - (this.props.thickness / 2)}px`,
            height: `${this.props.thickness}px`,
            width: `${length}px`,
            transform: `rotate(${angle}deg)`
          }}
        />
      );
    });

    return <>{segments}</>;
  }

  /**
   * Checks whether a point is within the railing's thickness.
   *
   * @param x the point's horizontal coordinate
   * @param y the point's vertical coordinate
   * @return whether the point touches the railing
   */
  isPointInBoundary(x, y) {
    return this.props.points.slice(1).some((point, index) => {
      const start = this.props.points[index];
      const deltaX = point.x - start.x;
      const deltaY = point.y - start.y;
      const lengthSquared = (deltaX * deltaX) + (deltaY * deltaY);
      const projection = Math.max(0, Math.min(1,
        (((x - start.x) * deltaX) + ((y - start.y) * deltaY)) / lengthSquared
      ));
      const closestX = start.x + (projection * deltaX);
      const closestY = start.y + (projection * deltaY);

      return Math.hypot(x - closestX, y - closestY) <= this.props.thickness / 2;
    });
  }

  /**
   * Reflects the ball's velocity away from the side of the railing it approached.
   *
   * @param startX the ball center's horizontal coordinate before impact
   * @param startY the ball center's vertical coordinate before impact
   * @param x the collision point's horizontal coordinate
   * @param y the collision point's vertical coordinate
   * @param xspeed the ball's horizontal velocity
   * @param yspeed the ball's vertical velocity
   * @return the ball's reflected horizontal and vertical velocities
   */
  impactOfCollision(startX, startY, x, y, xspeed, yspeed) {
    let closestPoint;
    let closestDistance = Infinity;
    let closestSegment;
    for(let index = 1; index < this.props.points.length; index++) {
      const start = this.props.points[index - 1];
      const end = this.props.points[index];
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const lengthSquared = (deltaX * deltaX) + (deltaY * deltaY);
      const projection = Math.max(0, Math.min(1,
        (((startX - start.x) * deltaX) + ((startY - start.y) * deltaY)) / lengthSquared
      ));
      const point = {
        x: start.x + (projection * deltaX),
        y: start.y + (projection * deltaY)
      };
      const distance = Math.hypot(startX - point.x, startY - point.y);
      if(distance < closestDistance) {
        closestPoint = point;
        closestDistance = distance;
        closestSegment = { deltaX, deltaY };
      }
    }

    let normalX = startX - closestPoint.x;
    let normalY = startY - closestPoint.y;
    let normalLength = Math.hypot(normalX, normalY);

    if(normalLength === 0) {
      normalX = -closestSegment.deltaY;
      normalY = closestSegment.deltaX;
      normalLength = Math.hypot(normalX, normalY);
      if((xspeed * normalX) + (yspeed * normalY) > 0) {
        normalX = -normalX;
        normalY = -normalY;
      }
    }

    normalX /= normalLength;
    normalY /= normalLength;
    const velocityAlongNormal = (xspeed * normalX) + (yspeed * normalY);

    return {
      newXSpeed: xspeed - (2 * velocityAlongNormal * normalX),
      newYSpeed: yspeed - (2 * velocityAlongNormal * normalY)
    };
  }
}

export default Railing;
