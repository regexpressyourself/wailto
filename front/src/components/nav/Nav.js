import React, {useState, useRef, useEffect, useContext} from 'react';
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
import {expandNav, formIsValid} from './navControls';

const Nav = ({history, showMessages, showBack, defaultStart, defaultEnd}) => {
  const {config, configDispatch} = useContext(ConfigContext);

  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessageType, setHelpMessageType] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(!localStorage.getItem('wt-username'));

  const navToggleBtn = useRef(null);
  const nav = useRef(null);
  const navSubmitBtn = useRef(null);

  const setOutsideClickListener = (e) => {
    if (e.target && !e.target.closest('nav') && !e.target.closest('button')) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', setOutsideClickListener);

    return () => {
      document.removeEventListener('click', setOutsideClickListener);
    };
  }, []);

  useEffect(() => {
    if (window.location.href.includes('dashboard') && !formIsValid(config)) {
      setIsExpanded(true);
    }

    const clickSubmitOnEnter = ({keyCode}) => {
      if (keyCode === 13) {
        navSubmitBtn.current.click();
      }
    };

    if (!nav) {
      nav.current.removeEventListener('keydown', clickSubmitOnEnter);
      return;
    }
    nav.current.addEventListener('keydown', clickSubmitOnEnter);
  }, [nav, config]);

  const triggerUpdate = () => {
    if (!formIsValid(config)) {
      setIsExpanded(true);
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

    return true;
  };

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
  }, [isExpanded, showMessages]);

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <div className="main-header__bottom">
          <HelpMessage
            defaultStart={defaultStart}
            defaultEnd={defaultEnd}
            message={helpMessageType}
            history={history}
          />
          {showBack ? <BackButton /> : <span />}
          <button
            tabIndex="0"
            ref={navToggleBtn}
            className={`nav__toggle-btn ${buttonAnimation ? 'animated' : ''}`}
            onClick={(e) => {
              setIsExpanded(!isExpanded);
              setButtonAnimation(false);
            }}>
            {buttonText}
          </button>
        </div>
        <nav ref={nav} className="nav">
          <Username />
          <Dates />
          <Genre />
          <button
            tabIndex="0"
            ref={navSubmitBtn}
            className="submit-btn"
            onClick={(e) => {
              triggerUpdate();
            }}>
            What Am I Listening to?
          </button>
        </nav>
      </div>
    </header>
  );
};

export default withRouter(Nav);
