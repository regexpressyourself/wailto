import React, {useState, useEffect, useContext} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {Plus, X} from 'react-feather';
import {ConfigContext} from '../../context/ConfigContext';
import BackButton from './BackButton';
import HelpMessage from './HelpMessage';
import Username from './Username';
import './daypicker.scss';
import './nav.scss';
import {GENRELIST} from '../../GENRELIST';
import Select from 'react-select';

const formatDate = date => {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  let [genre, setGenre] = useState(config.genre);
  let [from, setFrom] = useState(config.timeStart);
  let [to, setTo] = useState(config.timeEnd);
  let [isExpanded, setIsExpanded] = useState(null);
  let [helpMessage, setHelpMessage] = useState(null);
  let [buttonText, setButtonText] = useState(<Plus />);
  let [buttonAnimation, setButtonAnimation] = useState(false);

  let genreSelectionOptions = GENRELIST.map(genre => {
    return {
      value: genre,
      label: genre,
    };
  });
  genreSelectionOptions.unshift({value: 'any', label: 'any genre'});

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
          <HelpMessage
            defaultStart={props.defaultStart}
            defaultEnd={props.defaultEnd}
            message="default"
          />,
        );
      }
    }
  }, [
    isExpanded,
    from,
    to,
    props.showMessages,
    props.defaultStart,
    props.defaultEnd,
  ]);

  return (
    <header className="main-header">
      <div className="main-header__inner">
        <nav className="nav">
          <Username />
          <div className="nav__date-pickers">
            <div className="input-wrapper input-wrapper--start-date">
              <label className="nav__heading">Start date:</label>
              <DayPickerInput
                style={{width: '100%'}}
                dayPickerProps={{
                  selectedDays: from,
                  disabledDays: day =>
                    day > to ||
                    day < new Date().setDate(new Date().getDate() - 62),
                }}
                value={formatDate(from)}
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
                dayPickerProps={{
                  selectedDays: to,
                  disabledDays: day => day > new Date() || day < from,
                }}
                value={formatDate(to)}
                placeholder="YYYY-M-D"
                onDayChange={e => {
                  setTo(e);
                }}
              />
            </div>
          </div>
          <div className="input-wrapper input-wrapper--horizontal">
            <label className="nav__heading">Genre: (optional)</label>
            <Select
              onChange={e => {
                setGenre(e.value);
              }}
              options={genreSelectionOptions}
            />
          </div>
          <button
            className="submit-btn"
            onClick={e => {
              if (!config.username) {
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

              configDispatch({type: 'APP_STATE', appState: 'dashboard'});
              configDispatch({type: 'TIME_START', timeStart: from});
              configDispatch({type: 'TIME_END', timeEnd: to});
              configDispatch({type: 'GENRE', genre: genre});
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
