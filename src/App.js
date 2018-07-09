import React, { Component } from 'react';
import './App.css';
import PinballTable from './components/PinballTable.js';

class App extends Component {
  render() {
    return (
      <PinballTable height="800" width="400" />
    );
  }
}

export default App;
