import React from 'react';
import App from './App';
import Home from './Home';
import About from './About';
import {BrowserRouter as Router, Route} from 'react-router-dom';

function AppRouter() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/app" component={App} />
      <Route path="/about" component={About} />
    </Router>
  );
}

export default AppRouter;
