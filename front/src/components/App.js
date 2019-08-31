import React, {useReducer, useState, useEffect} from 'react';
import axios from 'axios';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import Dashboard from './Dashboard';
import Nav from './Nav';
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
    username: '',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [history, historyDispatch] = useReducer(historyReducer, {});

  let [appState, setAppState] = useState(config.appState);
  let [content, setContent] = useState(null);
  let [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    setAppState(config.appState);
  }, [config.appState]);

  useEffect(() => {
    configDispatch({type: 'APP_STATE', appState: 'updating'});
    if (config.username && config.unixTimeEnd && config.unixTimeStart) {
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
    } else {
      configDispatch({type: 'APP_STATE', appState: 'tutorial'});
    }
  }, [config.username, config.unixTimeEnd, config.unixTimeStart]);

  useEffect(() => {
    switch (appState) {
      case 'updating':
        setContent(<Loading />);
        break;
      case 'dashboard':
        setAppState('updating');
        //setContent(<Dashboard />);
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
        setAppState('updating');
    }
  }, [appState]);

  return (
    <main
      className={`app ${
        appState === 'tutorial' || appState === 'updating'
          ? 'app--unpopulated'
          : null
      }`}>
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
  );
}

export default App;
