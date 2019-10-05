import React, {useState, useEffect, useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {Plus, X} from 'react-feather';
import {ConfigContext} from '../../context/ConfigContext';
import BackButton from './BackButton';
import HelpMessage from './HelpMessage';
import Username from './Username';
import Dates from './Dates';
import Genre from './Genre';
import './daypicker.scss';
import './Nav.scss';
import {disableButton, expandNav} from './navControls';

const Nav = ({history, showMessages, showBack, defaultStart, defaultEnd}) => {
  const {config, configDispatch} = useContext(ConfigContext);

  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessageType, setHelpMessageType] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(!localStorage.getItem('wt-username'));

  useEffect(() => {
    if (isExpanded) {
      setButtonText(<X />);
      expandNav(true);
      setHelpMessageType(showMessages ? 'tutorial' : null);
    } else {
      setButtonText(<Plus />);
      expandNav(false);
      setHelpMessageType(showMessages ? 'default' : null);
    }
  }, [isExpanded, showMessages, defaultStart, defaultEnd]);

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <nav className="nav">
          <Username />
          <Dates />
          <Genre />
          <button
            className="submit-btn"
            onClick={e => {
              if (!config.username) {
                disableButton(true); // check for username
                return;
              }
              setIsExpanded(false);
              if (window.location.href.includes('dashboard')) {
                configDispatch({type: 'APP_STATE', appState: config.appState});
              } else {
                history.push('/dashboard');
              }
              configDispatch({
                type: 'TRIGGER_STATE_UPDATE',
                triggerStateUpdate: true,
              });
            }}>
            What Am I Listening to?
          </button>
        </nav>
        <div className="main-header__bottom">
          <HelpMessage
            defaultStart={defaultStart}
            defaultEnd={defaultEnd}
            message={helpMessageType}
            history={history}
          />
          {showBack ? <BackButton /> : <span />}
          <button
            className={`nav__toggle-btn ${buttonAnimation ? 'animated' : ''}`}
            onClick={e => {
              setIsExpanded(!isExpanded);
              setButtonAnimation(false);
            }}>
            {buttonText}
          </button>
        </div>
      </div>
    </header>
  );
};

export default withRouter(Nav);
