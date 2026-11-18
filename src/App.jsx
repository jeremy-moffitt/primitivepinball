import React, { Component } from 'react';
import './App.css';
import PinballTable from './components/PinballTable.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0, background: 'stars' };
  }

  awardBumperPoints = () => {
    this.setState((previousState) => ({
      score: previousState.score + 100
    }));
  }

  changeBackground = (event) => {
    this.setState({ background: event.target.value });
  }

  render() {
    return (
      <main className="app">
        <header className="app-header">
          <h1>Primitive Pinball</h1>
          <p>Drag the plunger down to launch. Press A for left, D for right, or Space for both flippers.</p>
        </header>
        <div className="game-controls">
          <div className="scoreboard" aria-live="polite">
            <span>Score</span>
            <output aria-label="Score">{this.state.score}</output>
          </div>
          <label className="background-control">
            <span>Playfield background</span>
            <select
              aria-label="Playfield background"
              onChange={this.changeBackground}
              value={this.state.background}
            >
              <option value="classic">Classic white</option>
              <option value="blue">Solid blue</option>
              <option value="gradient">Blue gradient</option>
              <option value="stars">Starry blue</option>
            </select>
          </label>
        </div>
        <div className="game-scroll">
          <PinballTable
            height={800}
            width={400}
            background={this.state.background}
            onBumperHit={this.awardBumperPoints}
          />
        </div>
      </main>
    );
  }
}

export default App;
