import { expect, it, vi } from 'vitest';
import PinballTable from './PinballTable';
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
