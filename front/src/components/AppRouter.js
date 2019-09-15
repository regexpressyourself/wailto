import React from 'react';
import App from './App';
import Home from './Home';
import {BrowserRouter as Router, Route} from 'react-router-dom';

function AppRouter() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/(app|zookeeprr)" component={App} />
    </Router>
  );
}

export default AppRouter;
