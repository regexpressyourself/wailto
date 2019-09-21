import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {ConfigContext} from '../../context/ConfigContext';

const HelpMessage = ({defaultStart, defaultEnd, message}) => {
  const {configDispatch} = useContext(ConfigContext);

  const defaultMessage = (
    <div className="introduce-message">
      <p className="help-title">Let's Get Started!</p>
      <p className="help-link">Click the button to start:</p>
      <p className="help-subtext">
        <Link to="/">
          <span id="about-link" className="clickable">
            &mdash;&nbsp;More info&nbsp;&mdash;
          </span>
        </Link>
      </p>
    </div>
  );
  const tutorialMessage = (
    <div>
      <p className="help-title">Look up Last.fm data</p>
      <p className="help-link">
        <span
          className="clickable use-mine"
          onClick={e => {
            document
              .querySelector('.nav__heading--username')
              .classList.add('atn--font-color');
            document
              .querySelector('.username-input')
              .classList.add('atn--border-color');

            configDispatch({type: 'TIME_START', timeStart: defaultStart});
            configDispatch({type: 'TIME_END', timeEnd: defaultEnd});
            configDispatch({type: 'USERNAME', username: 'zookeeprr'});
          }}>
          Or see mine!
        </span>
      </p>
      <p className="help-subtext">
        <Link to="/">
          <span id="about-link" className="clickable">
            &mdash;&nbsp;More info&nbsp;&mdash;
          </span>
        </Link>
      </p>
    </div>
  );

  switch (message) {
    case 'tutorial':
      return tutorialMessage;
    case 'default':
      return defaultMessage;
    default:
      return null;
  }
};
export default HelpMessage;
