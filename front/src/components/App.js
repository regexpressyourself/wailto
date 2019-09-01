import React, {useReducer, useState, useEffect} from 'react';
import axios from 'axios';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import Dashboard from './Dashboard';
import Nav from './Nav';
import Footer from './Footer';
import Loading from './Loading';
import FullHistory from './modules/FullHistory';
import SongsByDate from './modules/SongsByDate';
import SongsByDow from './modules/SongsByDow';
import SongsByHour from './modules/SongsByHour';
import './App.scss';
import {accessibleJsTime} from './dateMappers';

function App() {
  let today = new Date();
  let weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  let initialConfig = {
    timeStart: weekAgo,
    timeEnd: today,
    username: localStorage.getItem('wt-username') || '',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [history, historyDispatch] = useReducer(historyReducer, {});

  let [appState, setAppState] = useState(config.appState);
  let [content, setContent] = useState(null);
  let [userInfo, setUserInfo] = useState(null);

  const appIsPopulated =
    appState || !appState === 'tutorial' || !appState === 'updating';
  const footer = appIsPopulated ? <Footer /> : null;

  useEffect(() => {
    if (window.location.href.includes('zookeeprr')) {
      configDispatch({type: 'TIME_START', timeStart: initialConfig.timeStart});
      configDispatch({type: 'TIME_END', timeEnd: initialConfig.timeEnd});
      configDispatch({type: 'USERNAME', username: 'zookeeprr'});
    }
  }, []);

  useEffect(() => {
    setAppState(config.appState);
  }, [config.appState]);

  useEffect(() => {
    if (!(config.username && config.unixTimeEnd && config.unixTimeStart)) {
      return;
    }
    configDispatch({type: 'APP_STATE', appState: 'updating'});
    if (config.username === 'zookeeprr') {
      setUserInfo(
        <section className="user-info">
          <p className="user-info__username">{config.username}</p>
          <div>
            <p className="user-info__dates">
              {accessibleJsTime(config.timeStart).date}
              &nbsp; &mdash; &nbsp;
              {accessibleJsTime(config.timeEnd).date}
            </p>
          </div>
          <div className="user-info__zookeeprr-info">
            <p>
              Welcome to my dashboard! That's me, <strong>zookeeprr</strong>.
            </p>
            <p>
              Check out some of my own music trends and history over the last
              week.
            </p>
            <p className="judgement-free">
              Remember, this is a judgement free zone.
              <br />
              <span className="shh">
                Yup, there will never be any Jonas Brothers on here. Definitely
                not.{' '}
                <span aria-label="see no evil" role="img">
                  🙈
                </span>
              </span>
            </p>
          </div>
        </section>,
      );
    } else {
      setUserInfo(
        <section className="user-info">
          <p className="user-info__username">{config.username}</p>
          <div>
            <p className="user-info__dates">
              {accessibleJsTime(config.timeStart).date}
              &nbsp; &mdash; &nbsp;
              {accessibleJsTime(config.timeEnd).date}
            </p>
          </div>
        </section>,
      );
    }
    axios
      .get('http://localhost:3009/history/', {
        params: {
          username: config.username,
          to: config.unixTimeEnd,
          from: config.unixTimeStart,
        },
      })
      .then(data => {
        historyDispatch({history: data.data});
        configDispatch({type: 'APP_STATE', appState: 'dashboard'});
      });
  }, [config.username, config.unixTimeEnd, config.unixTimeStart]);

  useEffect(() => {
    switch (appState) {
      case 'updating':
        setContent(<Loading />);
        break;
      case 'dashboard':
        //setAppState('updating');
        setContent(<Dashboard />);
        break;
      case 'dow':
        setContent(<SongsByDow />);
        break;
      case 'date':
        setContent(<SongsByDate />);
        break;
      case 'hour':
        setContent(<SongsByHour />);
        break;
      case 'history':
        setContent(<FullHistory />);
        break;
      case 'tutorial':
      default:
        setContent(null);
      //setAppState('updating');
    }
  }, [appState]);

  return (
    <>
      <main className={`app ${!appIsPopulated ? 'app--unpopulated' : ''}`}>
        <ConfigContext.Provider value={{config, configDispatch}}>
          <HistoryContext.Provider value={{history, historyDispatch}}>
            {userInfo}
            {content}
            <Nav
              defaultStart={initialConfig.timeStart}
              defaultEnd={initialConfig.timeEnd}
              showMessages={!config.username.length}
              showBack={!!content && appState !== 'dashboard'}
            />
          </HistoryContext.Provider>
        </ConfigContext.Provider>
      </main>
      {footer}
    </>
  );
}
export default App;
