import React, {useState, useEffect, useContext} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {ConfigContext} from '../context/ConfigContext';
import {Plus, X, ChevronLeft} from 'react-feather';
import './daypicker.scss';
import './nav.scss';
import {Link} from 'react-router-dom';

function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  let [username, setUsername] = useState(config.username);
  let [from, setFrom] = useState(config.timeStart);
  let [to, setTo] = useState(config.timeEnd);
  let [fromString, setFromString] = useState(config.timeStart);
  let [toString, setToString] = useState(config.timeEnd);
  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessage, setHelpMessage] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(false);

  if (props.showMessages) {
    if (!isExpanded && !helpMessage) {
      setButtonAnimation(true);
      setHelpMessage(
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
        </div>,
      );
    }
  }

  useEffect(() => {
    setUsername(config.username);
  }, [config.username]);

  useEffect(() => {
    if (!isExpanded) {
      setHelpMessage(null);
    } else {
      if (props.showMessages) {
        setHelpMessage(
          <div>
            <p className="help-title">Look up Last.fm data</p>
            <p className="help-link">
              Not on Last.fm?{' '}
              <span
                className="clickable"
                onClick={e => {
                  document
                    .querySelector('.nav__heading--username')
                    .classList.add('atn--font-color');
                  document
                    .querySelector('.username-input')
                    .classList.add('atn--border-color');
                  setFromString(props.defaultStart);
                  setToString(props.defaultEnd);

                  let zookeeprr = 'zookeeprr';
                  for (let i = 1; i <= zookeeprr.length; i++) {
                    setTimeout(() => {
                      setUsername(zookeeprr.substring(0, i));
                    }, 50 * i);
                  }
                }}>
                Use mine!
              </span>
            </p>
            <p className="help-subtext">
              <Link to="/">
                <span id="about-link" className="clickable">
                  &mdash;&nbsp;More info&nbsp;&mdash;
                </span>
              </Link>
            </p>
          </div>,
        );
      }
    }
  }, [props.showMessages, props.defaultStart, props.defaultEnd, isExpanded]);
  useEffect(() => {
    if (username === 'zookeeprr') {
      document
        .querySelector('.nav__heading--username')
        .classList.add('atn--font-color');
      document
        .querySelector('.username-input')
        .classList.add('atn--border-color');
    } else if (!'zookeeprr'.includes(username)) {
      document
        .querySelector('.nav__heading--username')
        .classList.remove('atn--font-color');
      document
        .querySelector('.username-input')
        .classList.remove('atn--border-color');
    }
  }, [username]);

  useEffect(() => {
    if (isExpanded) {
      setButtonText(<X />);
      document.querySelector('.nav').classList.remove('nav--collapsed');
      document.querySelector('.nav').classList.add('nav--uncollapsed');
      if (document.querySelector('.recharts-wrapper')) {
        document.querySelector('.recharts-wrapper').style.zIndex = '-1';
      }
    } else if (isExpanded !== null) {
      setButtonText(<Plus />);
      if (document.querySelector('.recharts-wrapper')) {
        document.querySelector('.recharts-wrapper').style.zIndex = '1';
      }
      document.querySelector('.nav').classList.add('nav--collapsed');
      document.querySelector('.nav').classList.remove('nav--uncollapsed');
      if (props.showMessages) {
        setHelpMessage(
          <div>
            <p className="help-title">Let's Get Started!</p>
            <p className="help-link">Click the button to start:</p>
            <p className="help-subtext">
              <Link to="/">
                <span id="about-link" className="clickable">
                  &mdash;&nbsp;More info&nbsp;&mdash;
                </span>
              </Link>
            </p>
          </div>,
        );
      }
    }
  }, [
    isExpanded,
    from,
    to,
    config.username,
    props.showMessages,
    props.defaultStart,
    props.defaultEnd,
  ]);

  const backButton = props.showBack ? (
    <button
      className="nav__back-btn"
      onClick={e => {
        configDispatch({type: 'APP_STATE', appState: 'dashboard'});
      }}>
      <ChevronLeft />
    </button>
  ) : null;

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <nav className="nav">
          <div className="nav__username input-wrapper">
            <label
              className="nav__heading nav__heading--username"
              htmlFor="username">
              Username&nbsp;
              <a
                href="https://www.last.fm/join"
                rel="noopener noreferrer"
                target="_blank">
                <span className="clickable header-help-link">
                  (Need a username?)
                </span>
              </a>
            </label>
            <span className="required-reminder">
              &nbsp;&mdash;&nbsp;please enter a username
            </span>
            <input
              name="username"
              className="username-input"
              placeholder="Last.fm username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="input-wrapper input-wrapper--start-date">
            <label className="nav__heading">Start date:</label>
            <DayPickerInput
              style={{width: '100%'}}
              dayPickerProps={{selectedDays: from}}
              value={fromString}
              placeholder="YYYY-M-D"
              onDayChange={e => {
                setFrom(e);
              }}
            />
          </div>
          <div className="input-wrapper input-wrapper--end-date">
            <label className="nav__heading">End date:</label>
            <DayPickerInput
              style={{width: '100%'}}
              dayPickerProps={{selectedDays: to}}
              value={toString}
              placeholder="YYYY-M-D"
              onDayChange={e => {
                setTo(e);
              }}
            />
          </div>
          <button
            className="submit-btn"
            onClick={e => {
              if (!username) {
                document
                  .querySelector('.nav__username')
                  .classList.add('nav__username--invalid');
              } else {
                document
                  .querySelector('.nav__username')
                  .classList.remove('nav__username--invalid');
              }

              configDispatch({type: 'TIME_START', timeStart: from});
              configDispatch({type: 'TIME_END', timeEnd: to});
              configDispatch({type: 'USERNAME', username: username});
              setIsExpanded(false);
            }}>
            What Am I Listening to?
          </button>
        </nav>
        <div className="main-header__bottom">
          <div>{helpMessage ? helpMessage : backButton}</div>
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
