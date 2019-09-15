import React, {useReducer, useState, useEffect} from 'react';
import axios from 'axios';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import Dashboard from './Dashboard';
import Nav from './nav/Nav';
import Footer from './partials/Footer';
import Loading from './Loading';
import UserInfo from './UserInfo';
import FullHistory from './modules/FullHistory';
import SongsByDate from './modules/SongsByDate';
import SongsByDow from './modules/SongsByDow';
import SongsByHour from './modules/SongsByHour';
import './App.scss';

function App() {
  let today = new Date();
  let weekAgo = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  weekAgo.setDate(today.getDate() - 8);
  let initialConfig = {
    timeStart: weekAgo,
    timeEnd: yesterday,
    username: '', //localStorage.getItem('wt-username') || '',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [history, historyDispatch] = useReducer(historyReducer, {});

  if (window.location.href.includes('zookeeprr')) {
    configDispatch({type: 'TIME_START', timeStart: initialConfig.timeStart});
    configDispatch({type: 'TIME_END', timeEnd: initialConfig.timeEnd});
    configDispatch({type: 'USERNAME', username: 'zookeeprr'});
  }

  let [content, setContent] = useState(null);
  let [userInfo, setUserInfo] = useState(null);

  const appIsPopulated =
    config.appState ||
    !config.appState === 'tutorial' ||
    !config.appState === 'updating';

  const footer = appIsPopulated ? <Footer /> : null;

  useEffect(() => {
    if (!config.triggerStateUpdate) {
      return;
    }
    console.log('config.appState');
    console.log(config.appState);
    let requestedState = config.appState;
    setContent(<Loading />);
    setUserInfo(<UserInfo />);
    axios
      .get('/history', {
        params: {
          username: config.username,
          to: config.unixTimeEnd,
          from: config.unixTimeStart,
        },
      })
      .then(data => {
        historyDispatch({history: data.data});
        configDispatch({type: 'APP_STATE', appState: requestedState});
        switch (requestedState) {
          case 'updating':
            setContent(<Loading />);
            break;
          case 'dashboard':
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
        }
        configDispatch({
          type: 'TRIGGER_STATE_UPDATE',
          triggerStateUpdate: false,
        });
      })
      .catch(e => {
        console.error(e);
      });
  }, [
    config.triggerStateUpdate,
    config.appState,
    config.username,
    config.unixTimeEnd,
    config.unixTimeStart,
  ]);

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
              showMessages={!config.appState || config.appState === 'home'}
              showBack={
                config.appState === 'dow' ||
                config.appState === 'date' ||
                config.appState === 'hour' ||
                config.appState === 'history'
              }
            />
          </HistoryContext.Provider>
        </ConfigContext.Provider>
      </main>
      {footer}
    </>
  );
}
export default App;
