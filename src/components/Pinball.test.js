import { expect, it, vi } from 'vitest';
import Pinball from './Pinball';

it('notifies the game once after committing a bumper collision', () => {
  const bumperHit = vi.fn();
  const nextState = {
    xpos: 100,
    ypos: 100,
    xspeed: 5,
    yspeed: 5,
    bumperHit: true
  };
  const pinball = new Pinball({
    origin: { x: 400, y: 800 },
    size: 8,
    floor: 784,
    ballWantsToMove: vi.fn(() => nextState),
    balllost: vi.fn(),
    bumperHit
  });
  pinball.setState = (update, callback) => {
    update(pinball.state);
    pinball.state = { ...pinball.state, ...update(pinball.state) };
    callback();
  };
  const timer = vi.spyOn(globalThis, 'setTimeout').mockReturnValue(0);

  try {
    pinball.move();
    expect(bumperHit).toHaveBeenCalledOnce();
  } finally {
    timer.mockRestore();
  }
});
