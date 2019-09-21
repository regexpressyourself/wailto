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
import './nav.scss';

const disableButton = disabled => {
  if (disabled) {
    document
      .querySelector('.nav__username')
      .classList.add('nav__username--invalid');
    document
      .querySelector('.nav__heading--username')
      .classList.add('atn--font-color');
    document
      .querySelector('.username-input')
      .classList.add('atn--border-color');
    setTimeout(() => {
      document
        .querySelector('.nav__heading--username')
        .classList.remove('atn--font-color');
      document
        .querySelector('.username-input')
        .classList.remove('atn--border-color');
    }, 1000);
    return;
  } else {
    if (
      document
        .querySelector('.nav__username')
        .classList.contains('nav__username--invalid')
    ) {
      document
        .querySelector('.nav__username')
        .classList.remove('nav__username--invalid');
    }
  }
};

const expandNav = expanded => {
  if (expanded) {
    document.querySelector('.nav').classList.remove('nav--collapsed');
    document.querySelector('.nav').classList.add('nav--uncollapsed');
    if (document.querySelector('.recharts-wrapper')) {
      document.querySelector('.recharts-wrapper').style.zIndex = '-1';
    }
  } else {
    if (document.querySelector('.recharts-wrapper')) {
      document.querySelector('.recharts-wrapper').style.zIndex = '1';
    }
    if (document.querySelector('.nav').classList.contains('nav--uncollapsed')) {
      document.querySelector('.nav').classList.remove('nav--uncollapsed');
      document.querySelector('.nav').classList.add('nav--collapsed');
    }
  }
};

const Nav = ({history, showMessages, showBack, defaultStart, defaultEnd}) => {
  const {config, configDispatch} = useContext(ConfigContext);

  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessageType, setHelpMessageType] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(false);

  useEffect(() => {
    let messageType = false;

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
              history.push('/dashboard');
            }}>
            What Am I Listening to?
          </button>
        </nav>
        <div className="main-header__bottom">
          <HelpMessage
            defaultStart={defaultStart}
            defaultEnd={defaultEnd}
            message={helpMessageType}
          />
          {showBack ? <BackButton /> : <span />}
          <button
            className={`nav__toggle-btn ${buttonAnimation ? 'animated' : ''}`}
            onClick={e => {
              setIsExpanded(!isExpanded);
            }}>
            {buttonText}
          </button>
        </div>
      </div>
    </header>
  );
};

export default withRouter(Nav);
