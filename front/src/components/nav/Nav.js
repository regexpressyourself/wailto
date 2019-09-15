import React, {useState, useEffect, useContext} from 'react';
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
    document
      .querySelector('.nav__username')
      .classList.remove('nav__username--invalid');
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
    document.querySelector('.nav').classList.add('nav--collapsed');
    document.querySelector('.nav').classList.remove('nav--uncollapsed');
  }
};

function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessage, setHelpMessage] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(false);

  if (props.showMessages) {
    if (!isExpanded && !helpMessage) {
      setButtonAnimation(true);
      setHelpMessage(
        <HelpMessage
          defaultStart={props.defaultStart}
          defaultEnd={props.defaultEnd}
          message="default"
        />,
      );
    }
  }

  useEffect(() => {
    let messageType = isExpanded ? 'tutorial' : 'default';
    if (props.showMessages) {
      setHelpMessage(
        <HelpMessage
          defaultStart={props.defaultStart}
          defaultEnd={props.defaultEnd}
          message={messageType}
        />,
      );
    } else {
      setHelpMessage(null);
    }
  }, [props.showMessages, props.defaultStart, props.defaultEnd, isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      setButtonText(<X />);
      expandNav(true);
    } else if (isExpanded !== null) {
      setButtonText(<Plus />);
      expandNav(false);
      if (props.showMessages) {
        setHelpMessage(
          <HelpMessage
            defaultStart={props.defaultStart}
            defaultEnd={props.defaultEnd}
            message="default"
          />,
        );
      }
    }
  }, [isExpanded, props.showMessages, props.defaultStart, props.defaultEnd]);

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
              disableButton(!config.username); // check for username
              configDispatch({type: 'APP_STATE', appState: 'dashboard'});
              configDispatch({
                type: 'TRIGGER_STATE_UPDATE',
                triggerStateUpdate: true,
              });
              setIsExpanded(false);
            }}>
            What Am I Listening to?
          </button>
        </nav>
        <div className="main-header__bottom">
          <div>{helpMessage}</div>
          {props.showBack ? <BackButton /> : null}
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
}

export default Nav;
