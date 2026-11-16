import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from './App.jsx';

it('shows the game and its flipper control', () => {
  const { container } = render(<App />);

  expect(screen.getByRole('heading', { name: 'Primitive Pinball' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Flip flippers' })).toBeInTheDocument();
  expect(screen.getByLabelText('Score')).toHaveTextContent('0');
  expect(container.querySelector('.pinball-table')).toBeInTheDocument();
});

it('awards 100 points for each bumper hit', () => {
  const app = new App({});
  app.setState = (update) => {
    app.state = { ...app.state, ...update(app.state) };
  };

  app.awardBumperPoints();
  expect(app.state.score).toBe(100);

  app.awardBumperPoints();
  expect(app.state.score).toBe(200);
});
