import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import PinballTable from './PinballTable';
import RoundBumper from './RoundBumper';
import Wall from './Wall';

function createTable() {
  return new PinballTable({ height: 800, width: 400 });
}

it('checks collisions along the ball movement path', () => {
  const table = createTable();
  table.getBallTouchPoints = () => [{
    ballX: 12,
    ballY: 14,
    offsetX: 4,
    offsetY: 5
  }];
  table.checkCollisions = vi.fn(() => ({ collisionPoint: undefined }));

  const nextState = table.ballWantsToMove(100, 200, 20, 40);

  expect(table.checkCollisions).toHaveBeenCalledWith(12, 14, 13, 16);
  expect(nextState).toMatchObject({ xpos: 101, ypos: 202 });
});

it('places two round bumpers in the top half without intersecting existing bumpers', () => {
  const table = createTable();
  const roundBumpers = table.tableElements.filter((element) => element.type === 'round');
  const rectangularBumpers = table.tableElements.filter((element) => element.type === 'wall');

  expect(roundBumpers).toHaveLength(2);
  expect(roundBumpers.every((bumper) => bumper.ypos + (bumper.radius * 2) < 400)).toBe(true);

  const [first, second] = roundBumpers;
  expect(Math.hypot(
    (first.xpos + first.radius) - (second.xpos + second.radius),
    (first.ypos + first.radius) - (second.ypos + second.radius)
  )).toBeGreaterThan(first.radius + second.radius);

  for(const circle of roundBumpers) {
    for(const rectangle of rectangularBumpers) {
      const angle = rectangle.angle * (Math.PI / 180);
      const deltaX = circle.xpos + circle.radius - rectangle.xpos;
      const deltaY = circle.ypos + circle.radius - rectangle.ypos;
      const localX = (deltaX * Math.cos(angle)) + (deltaY * Math.sin(angle));
      const localY = (-deltaX * Math.sin(angle)) + (deltaY * Math.cos(angle));
      const closestX = Math.max(0, Math.min(rectangle.width, localX));
      const closestY = Math.max(0, Math.min(rectangle.height, localY));

      expect(Math.hypot(localX - closestX, localY - closestY)).toBeGreaterThan(circle.radius);
    }
  }
});

it('renders a purple circular bumper and reflects the ball away from its surface', () => {
  const bumper = new RoundBumper({ xpos: 10, ypos: 20, radius: 15 });
  const { container } = render(createElement(RoundBumper, {
    xpos: 10,
    ypos: 20,
    radius: 15
  }));
  const element = container.querySelector('.round-bumper');

  expect(element.style.background).toBe('purple');
  expect(element.style.borderRadius).toBe('50%');
  expect(bumper.isPointInBoundary(25, 35)).toBe(true);
  expect(bumper.isPointInBoundary(10, 20)).toBe(false);
  expect(bumper.impactOfCollision(25, 25, 25, 20, 0, 10))
    .toEqual({ newXSpeed: 0, newYSpeed: -10 });
});

it('counts round bumper collisions as scoring hits', () => {
  const table = createTable();
  table.getBallTouchPoints = () => [{
    ballX: 116,
    ballY: 216,
    offsetX: 16,
    offsetY: 16
  }];
  table.checkCollisions = vi.fn(() => ({
    collisionPoint: { x: 117, y: 218 },
    lastSafePoint: { x: 116, y: 216 },
    obstacle: { type: 'round' },
    obstacleObj: {
      impactOfCollision: () => ({ newXSpeed: -20, newYSpeed: -40 })
    }
  }));

  expect(table.ballWantsToMove(100, 200, 20, 40).bumperHit).toBe(true);
});

it('positions both flippers as exact mirrors with the existing tip gap', () => {
  const table = createTable();
  const [left, right] = table.tableElements.filter((element) => element.type === 'flipper');
  const angleRadians = left.angle * (Math.PI / 180);
  const leftTipX = left.xpos + (left.length * Math.cos(angleRadians));
  const rightTipX = right.xpos - (right.length * Math.cos(angleRadians));

  expect(left.side).toBe('left');
  expect(right.side).toBe('right');
  expect(left.xpos + right.xpos).toBe(400);
  expect(left.ypos).toBe(right.ypos);
  expect(left.length).toBe(right.length);
  expect(left.angle + right.angle).toBe(180);
  expect(left.arc + right.arc).toBe(0);
  expect(rightTipX - leftTipX).toBeCloseTo(40);
});

it('maps A, D, and Space to left, right, and both flippers', () => {
  const table = createTable();
  table.triggerFlippers = vi.fn();
  const preventDefault = vi.fn();

  table.handleKeyDown({ key: 'a', repeat: false, preventDefault });
  table.handleKeyDown({ key: 'D', repeat: false, preventDefault });
  table.handleKeyDown({ key: ' ', repeat: false, preventDefault });

  expect(table.triggerFlippers.mock.calls).toEqual([
    ['left'],
    ['right'],
    ['both']
  ]);
  expect(preventDefault).toHaveBeenCalledOnce();
});

it('ignores repeated keydown events and typing into editable fields', () => {
  const table = createTable();
  table.triggerFlippers = vi.fn();

  table.handleKeyDown({ key: 'a', repeat: true, target: { tagName: 'BODY' } });
  table.handleKeyDown({ key: 'd', repeat: false, target: { tagName: 'INPUT' } });
  table.handleKeyDown({
    key: ' ',
    repeat: false,
    target: { tagName: 'DIV', isContentEditable: true }
  });

  expect(table.triggerFlippers).not.toHaveBeenCalled();
});

it('only activates the requested flipper', () => {
  const table = createTable();
  const leftFlip = vi.fn(() => ({ x: 0, y: 0 }));
  const rightFlip = vi.fn(() => ({ x: 0, y: 0 }));
  table.pinball.current = {
    getState: () => ({ xpos: 0, ypos: 0, xspeed: 0, yspeed: 0 })
  };
  table.tableElements = [
    { type: 'flipper', side: 'left', id: 'leftFlipper' },
    { type: 'flipper', side: 'right', id: 'rightFlipper' }
  ];
  table.leftFlipper = { current: { getActualComponent: () => ({ flip: leftFlip }) } };
  table.rightFlipper = { current: { getActualComponent: () => ({ flip: rightFlip }) } };

  table.triggerFlippers('left');

  expect(leftFlip).toHaveBeenCalledOnce();
  expect(rightFlip).not.toHaveBeenCalled();
});

it('wires A and D to separate flippers and the button to both', () => {
  const { container } = render(createElement(PinballTable, { height: 800, width: 400 }));
  const flippers = container.querySelectorAll('.flipper');

  fireEvent.keyDown(window, { key: 'a' });
  expect(flippers[0].style.transform).toBe('rotate(-40deg)');
  expect(flippers[1].style.transform).toBe('rotate(150deg)');

  fireEvent.keyDown(window, { key: 'd' });
  expect(flippers[0].style.transform).toBe('rotate(-40deg)');
  expect(flippers[1].style.transform).toBe('rotate(220deg)');

  fireEvent.click(screen.getByRole('button', { name: 'Flip both flippers' }));
  expect(flippers[0].style.transform).toBe('rotate(-40deg)');
  expect(flippers[1].style.transform).toBe('rotate(220deg)');
});

it('samples from the ball toward the bumper and keeps the last safe point', () => {
  const table = createTable();
  const bumper = {
    isPointInBoundary: (x, y) => x > 5 && x < 10 && y > 5 && y < 10
  };
  const obstacle = { type: 'wall', id: 'bumper' };
  table.tableElements = [obstacle];
  table.bumper = { current: bumper };

  const collision = table.checkCollisions(1, 7, 10, 7);

  expect(collision.collisionPoint).toEqual({ x: 6, y: 7 });
  expect(collision.lastSafePoint).toEqual({ x: 5, y: 7 });
  expect(collision.obstacle).toBe(obstacle);
  expect(collision.obstacleObj).toBe(bumper);
});

it('moves the ball back to the last safe point after a collision', () => {
  const table = createTable();
  const obstacle = {
    impactOfCollision: vi.fn(() => ({ newXSpeed: -20, newYSpeed: -40 }))
  };
  const touchPoint = { ballX: 116, ballY: 216, offsetX: 16, offsetY: 16 };
  table.getBallTouchPoints = () => [touchPoint];
  table.checkCollisions = vi.fn(() => ({
    collisionPoint: { x: 117, y: 218 },
    lastSafePoint: { x: 116, y: 216 },
    obstacle: { type: 'wall' },
    obstacleObj: obstacle
  }));

  const nextState = table.ballWantsToMove(100, 200, 20, 40);

  expect(nextState).toMatchObject({
    xpos: 100,
    ypos: 200,
    xspeed: -20,
    yspeed: -40,
    bumperHit: true
  });
});

it('does not award bumper points for a flipper collision', () => {
  const table = createTable();
  table.getBallTouchPoints = () => [{
    ballX: 116,
    ballY: 216,
    offsetX: 16,
    offsetY: 16
  }];
  table.checkCollisions = vi.fn(() => ({
    collisionPoint: { x: 117, y: 218 },
    lastSafePoint: { x: 116, y: 216 },
    obstacle: { type: 'flipper' },
    obstacleObj: {
      impactOfCollision: () => ({ newXSpeed: -20, newYSpeed: -40 })
    }
  }));

  const nextState = table.ballWantsToMove(100, 200, 20, 40);

  expect(nextState.bumperHit).toBe(false);
});

it('bounces off a bumper and continues moving away from it', () => {
  const table = createTable();
  const bumper = new Wall({
    xpos: 10,
    ypos: 120,
    width: 60,
    height: 10,
    centerOfTable: 40
  });
  table.tableElements = [{ type: 'wall', id: 'bumper' }];
  table.bumper = { current: bumper };

  let ballState = { xpos: 30, ypos: 100, xspeed: 0, yspeed: 400 };
  table.pinball.current = { getState: () => ballState };

  const afterImpact = table.ballWantsToMove(
    ballState.xpos,
    ballState.ypos,
    ballState.xspeed,
    ballState.yspeed
  );
  ballState = afterImpact;
  const nextFrame = table.ballWantsToMove(
    ballState.xpos,
    ballState.ypos,
    ballState.xspeed,
    ballState.yspeed
  );

  expect(afterImpact.yspeed).toBe(-400);
  expect(afterImpact.bumperHit).toBe(true);
  expect(afterImpact.ypos).toBe(104);
  expect(nextFrame.ypos).toBeLessThan(afterImpact.ypos);
  expect(nextFrame.yspeed).toBeLessThan(0);
  expect(nextFrame.bumperHit).toBe(false);
});

it('pushes the ball along a slanted bumper instead of trapping it on top', () => {
  const table = createTable();
  const bumper = new Wall({
    xpos: 10,
    ypos: 120,
    width: 60,
    height: 10,
    angle: 12,
    centerOfTable: 40
  });
  table.tableElements = [{ type: 'wall', id: 'bumper' }];
  table.bumper = { current: bumper };

  let ballState = { xpos: 30, ypos: 100, xspeed: 0, yspeed: 300 };
  table.pinball.current = { getState: () => ballState };

  const afterImpact = table.ballWantsToMove(
    ballState.xpos,
    ballState.ypos,
    ballState.xspeed,
    ballState.yspeed
  );
  ballState = afterImpact;
  const nextFrame = table.ballWantsToMove(
    ballState.xpos,
    ballState.ypos,
    ballState.xspeed,
    ballState.yspeed
  );

  expect(afterImpact.bumperHit).toBe(true);
  expect(afterImpact.xspeed).toBeGreaterThan(0);
  expect(afterImpact.yspeed).toBeLessThan(0);
  expect(nextFrame.xpos).toBeGreaterThan(afterImpact.xpos);
  expect(nextFrame.ypos).toBeLessThan(afterImpact.ypos);
});

it('places collision touchpoints on the ball edge', () => {
  const table = createTable();
  table.pinball.current = {
    getState: () => ({ xpos: 100, ypos: 200, xspeed: 5, yspeed: 3 })
  };

  expect(table.getBallTouchPoints()[0]).toEqual({
    ballX: 116,
    ballY: 208,
    offsetX: 16,
    offsetY: 8
  });
});

it('returns no collision for a stationary point', () => {
  const table = createTable();

  expect(table.checkCollisions(10, 20, 10, 20)).toEqual({
    collisionPoint: undefined,
    obstacle: undefined,
    obstacleObj: undefined
  });
});

it('reflects velocity off the wall face the ball approached', () => {
  const wall = new Wall({
    xpos: 10,
    ypos: 20,
    width: 50,
    height: 10,
    centerOfTable: 35
  });

  expect(wall.impactOfCollision(30, 15, 30, 21, -3, 5))
    .toEqual({ newXSpeed: -3, newYSpeed: -5 });
  expect(wall.impactOfCollision(5, 25, 11, 25, 5, 2))
    .toEqual({ newXSpeed: -5, newYSpeed: 2 });
  expect(wall.impactOfCollision(5, 15, 11, 21, 5, 5))
    .toEqual({ newXSpeed: -5, newYSpeed: -5 });
});

it('slants every existing bumper by at least ten degrees', () => {
  const table = createTable();
  const bumpers = table.tableElements.filter((element) => element.type === 'wall');
  const rightmostBumper = bumpers.reduce((rightmost, bumper) =>
    bumper.xpos > rightmost.xpos ? bumper : rightmost
  );

  expect(bumpers).toHaveLength(3);
  expect(bumpers.every((bumper) => Math.abs(bumper.angle) >= 10)).toBe(true);
  expect(rightmostBumper.angle).toBe(12);
});

it('uses the rotated bumper shape for collision checks and bounce direction', () => {
  const angle = 12 * (Math.PI / 180);
  const wall = new Wall({
    xpos: 100,
    ypos: 100,
    width: 60,
    height: 10,
    angle: 12,
    centerOfTable: 130
  });
  const toWorld = (localX, localY) => ({
    x: 100 + (localX * Math.cos(angle)) - (localY * Math.sin(angle)),
    y: 100 + (localX * Math.sin(angle)) + (localY * Math.cos(angle))
  });
  const insidePoint = toWorld(30, 5);
  const pointAboveFace = toWorld(30, -1);
  const start = toWorld(30, -5);
  const hit = toWorld(30, 1);

  expect(wall.isPointInBoundary(insidePoint.x, insidePoint.y)).toBe(true);
  expect(wall.isPointInBoundary(pointAboveFace.x, pointAboveFace.y)).toBe(false);

  const bounce = wall.impactOfCollision(start.x, start.y, hit.x, hit.y, 0, 10);

  expect(bounce.newXSpeed).toBeGreaterThan(0);
  expect(bounce.newYSpeed).toBeLessThan(0);
});
