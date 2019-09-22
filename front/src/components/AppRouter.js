import React from 'react';
import App from './App';
import Home from './Home';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const AppRouter = () => {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route exact path="/(app|zookeeprr)" render={props => <App {...props} />} />
      <Route exact path="/dashboard" render={props => <App {...props} appState='dashboard' />} />
      <Route exact path="/dashboard/dow" render={props => <App {...props} appState='dow' />} />
      <Route exact path="/dashboard/date" render={props => <App {...props} appState='date' />} />
      <Route exact path="/dashboard/hour" render={props => <App {...props} appState='hour' />} />
      <Route exact path="/dashboard/week" render={props => <App {...props} appState='week' />} />
      <Route exact path="/dashboard/history" render={props => <App {...props} appState='history' />} />
    </Router>
  );
}

export default AppRouter;
