import React from 'react';
import Home from './Home';
import App from './App';
import { BrowserRouter as Router, Route} from "react-router-dom";

function AppRouter() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/app" component={App} />
      <Route path="/about" component={Home} />
    </Router>
  );
}

export default AppRouter;
