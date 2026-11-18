import React, { Component } from 'react';

/**
 * A circular bumper that reflects the ball away from its center.
 */
class RoundBumper extends Component {
  /**
   * Renders the circular bumper.
   */
  render() {
    const diameter = this.props.radius * 2;
    const bumperStyle = {
      top: `${this.props.ypos}px`,
      left: `${this.props.xpos}px`,
      height: `${diameter}px`,
      width: `${diameter}px`,
      background: this.props.background || 'purple',
      borderRadius: '50%'
    };

    return <span className="round-bumper" style={bumperStyle} />;
  }

  /**
   * Checks whether a point is inside the circular bumper.
   *
   * @param x the point's horizontal coordinate
   * @param y the point's vertical coordinate
   * @return whether the point is inside the bumper
   */
  isPointInBoundary(x, y) {
    const centerX = this.props.xpos + this.props.radius;
    const centerY = this.props.ypos + this.props.radius;
    return Math.hypot(x - centerX, y - centerY) < this.props.radius;
  }

  /**
   * Reflects the ball's velocity around the bumper's surface normal at impact.
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
    const centerX = this.props.xpos + this.props.radius;
    const centerY = this.props.ypos + this.props.radius;
    const normalX = x - centerX;
    const normalY = y - centerY;
    const normalLength = Math.hypot(normalX, normalY);

    if(normalLength === 0) {
      return {
        newXSpeed: -xspeed,
        newYSpeed: -yspeed
      };
    }

    const unitNormalX = normalX / normalLength;
    const unitNormalY = normalY / normalLength;
    const velocityAlongNormal = (xspeed * unitNormalX) + (yspeed * unitNormalY);

    return {
      newXSpeed: xspeed - (2 * velocityAlongNormal * unitNormalX),
      newYSpeed: yspeed - (2 * velocityAlongNormal * unitNormalY)
    };
  }
}

export default RoundBumper;
