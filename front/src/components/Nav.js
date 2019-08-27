import React, {useState, useEffect, useContext} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {ConfigContext} from '../context/ConfigContext';
import {Plus, X} from 'react-feather';
import './daypicker.scss';
import './nav.scss';
import {BrowserRouter as Link} from 'react-router-dom';

let triggerAnimation = () => {
  console.log('triggered');
  let body = document.querySelector('.introduce-message');
  let button = document.querySelector('.nav__toggle-btn');
  if (body) {
    body.classList.add('animated');
  }
  if (button) {
    button.classList.remove('animated');
  }
  document.removeEventListener('mouseover', triggerAnimation);
  document.removeEventListener('scroll', triggerAnimation);
  document.removeEventListener('keydown', triggerAnimation);
  document.removeEventListener('click', triggerAnimation);
};

function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  let [username, setUsername] = useState('');
  let [from, setFrom] = useState(config.timeStart);
  let [to, setTo] = useState(config.timeEnd);
  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessage, setHelpMessage] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);

  document.addEventListener('mouseover', triggerAnimation);
  document.addEventListener('scroll', triggerAnimation);
  document.addEventListener('keydown', triggerAnimation);
  document.addEventListener('click', triggerAnimation);

  if (props.showMessages) {
    if (!isExpanded && !helpMessage) {
      let button = document.querySelector('.nav__toggle-btn');
      console.log(button);
      if (button) {
        button.classList.add('animated');
      }
      setHelpMessage(
        <div className="introduce-message">
          <p className="help-title">Let's Get Started!</p>
          <p>Click the bottom-left button to start:</p>
          <p className="help-subtext">
            For more info,{' '}
            <Link to="/about">
              <span id="about-link" className="clickable">
              click here
            </span>
            </Link>
          </p>
        </div>,
      );
    }
  }

  useEffect(() => {
    console.log('isExpanded');
    console.log(isExpanded);
    if (isExpanded) {
      setButtonText(<X />);
      document.querySelector('.nav').classList.remove('nav--collapsed');
      document.querySelector('.nav').classList.add('nav--uncollapsed');
      if (props.showMessages) {
        setHelpMessage(
          <div>
            <p className="help-title">Look up LastFM data</p>
            <p className="help-link">
              Not on LastFM?{' '}
              <span
                className="clickable"
                onClick={e => {
                  configDispatch({type: 'TIME_START', timeStart: from});
                  configDispatch({type: 'TIME_END', timeEnd: to});
                  configDispatch({type: 'USERNAME', username: 'zookeeprr'});
                }}>
                Check out mine!
              </span>
            </p>
          </div>,
        );
      }
    } else if (isExpanded !== null) {
      setButtonText(<Plus />);
      document.querySelector('.nav').classList.add('nav--collapsed');
      document.querySelector('.nav').classList.remove('nav--uncollapsed');
      if (props.showMessages) {
        setHelpMessage(
          <div>
            <p className="help-title">Let's Get Started!</p>
            <p>Click the bottom-left button to start:</p>
          </div>,
        );
      }
    }
  }, [isExpanded]);

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <nav className="nav">
          <div className="nav__username input-wrapper">
            <label className="nav__heading" htmlFor="username">
              Username
            </label>
            <span className="required-reminder">
              &nbsp;&mdash;&nbsp;please enter a username
            </span>
            <input
              name="username"
              className="username-input"
              placeholder="LastFM username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <label className="nav__heading">From:</label>
            <DayPickerInput
              style={{width: '100%'}}
              dayPickerProps={{selectedDays: from}}
              placeholder="Start of date range"
              onDayClick={e => {
                setFrom(e);
              }}
            />
          </div>
          <div className="input-wrapper">
            <label className="nav__heading">To:</label>
            <DayPickerInput
              style={{width: '100%'}}
              dayPickerProps={{selectedDays: to}}
              placeholder="End of date range"
              onDayClick={e => {
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
            }}>
            Submit
          </button>
        </nav>
        <div className="main-header__bottom">
          {helpMessage}
          <button
            className="nav__toggle-btn"
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
