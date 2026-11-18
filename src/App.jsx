import React, { Component } from 'react';
import './App.css';
import PinballTable from './components/PinballTable.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
  }

  awardBumperPoints = () => {
    this.setState((previousState) => ({
      score: previousState.score + 100
    }));
  }

  render() {
    return (
      <main className="app">
        <header className="app-header">
          <h1>Primitive Pinball</h1>
          <p>Drag the plunger down to launch. Press A for left, D for right, or Space for both flippers.</p>
        </header>
        <div className="scoreboard" aria-live="polite">
          <span>Score</span>
          <output aria-label="Score">{this.state.score}</output>
        </div>
        <div className="game-scroll">
          <PinballTable
            height={800}
            width={400}
            onBumperHit={this.awardBumperPoints}
          />
        </div>
      </main>
    );
  }
}

export default App;
