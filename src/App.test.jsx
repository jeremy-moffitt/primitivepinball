import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from './App.jsx';

it('shows the game and its flipper control', () => {
  const { container } = render(<App />);

  expect(screen.getByRole('heading', { name: 'Primitive Pinball' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Flip both flippers' })).toBeInTheDocument();
  expect(screen.getByLabelText('Score')).toHaveTextContent('0');
  expect(screen.getByRole('combobox', { name: 'Playfield background' })).toHaveValue('stars');
  expect(container.querySelector('.pinball-table')).toBeInTheDocument();
});

it('offers four playfield themes and applies the selected background', () => {
  const { container } = render(<App />);
  const backgroundControl = screen.getByRole('combobox', { name: 'Playfield background' });
  const playfield = container.querySelector('.pinball-table');

  expect(backgroundControl.options).toHaveLength(4);
  expect(playfield).toHaveAttribute('data-background', 'stars');
  expect(container.querySelectorAll('.playfield-stars span')).toHaveLength(12);

  fireEvent.change(backgroundControl, { target: { value: 'gradient' } });
  expect(playfield).toHaveAttribute('data-background', 'gradient');

  fireEvent.change(backgroundControl, { target: { value: 'stars' } });
  expect(playfield).toHaveAttribute('data-background', 'stars');
  expect(container.querySelectorAll('.playfield-stars span')).toHaveLength(12);
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
