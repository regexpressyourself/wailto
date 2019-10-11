import React, {useReducer, useState, useEffect} from 'react';
import axios from 'axios';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {SongHistoryContext, songHistoryReducer} from '../context/SongHistoryContext';
import Dashboard from './Dashboard';
import Nav from './nav/Nav';
import Footer from './partials/Footer';
import Loading from './Loading';
import UserInfo from './UserInfo';
import FullSongHistory from './modules/FullSongHistory';
import SongsByDate from './modules/SongsByDate';
import SongsByDow from './modules/SongsByDow';
import SongsByHour from './modules/SongsByHour';
import Error from './Error';
import './App.scss';

const App = ({appState, history}) => {
  window.scrollTo(0, 0);
  let today = new Date();
  let weekAgo = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  weekAgo.setDate(today.getDate() - 8);
  let genre2 =
    localStorage.getItem('wt-genre2') === 'null' ? null : localStorage.getItem('wt-genre2');

  let initialConfig = {
    prevTimeStart: localStorage.getItem('wt-prevTimeStart') || null,
    timeStart: localStorage.getItem('wt-timeStart') || weekAgo,
    timeEnd: localStorage.getItem('wt-timeEnd') || yesterday,
    username: localStorage.getItem('wt-username') || '',
    genre: localStorage.getItem('wt-genre') || '',
    genre2: genre2 || '',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [songHistory, songHistoryDispatch] = useReducer(songHistoryReducer, {});

  if (window.location.href.includes('zookeeprr')) {
    configDispatch({type: 'PREV_TIME_START', prevTimeStart: initialConfig.prevTimeStart});
    configDispatch({type: 'TIME_START', timeStart: initialConfig.timeStart});
    configDispatch({type: 'TIME_END', timeEnd: initialConfig.timeEnd});
    configDispatch({type: 'GENRE', genre: initialConfig.genre});
    configDispatch({type: 'USERNAME', username: 'zookeeprr'});
    configDispatch({type: 'APP_STATE', appState: 'dashboard'});
    configDispatch({
      type: 'TRIGGER_STATE_UPDATE',
      triggerStateUpdate: true,
    });
    history.replace('/dashboard');
  }

  let [content, setContent] = useState(null);
  let [userInfo, setUserInfo] = useState(null);

  const appIsPopulated =
    config.appState || !config.appState === 'tutorial' || !config.appState === 'updating';

  const footer = appIsPopulated ? <Footer /> : null;

  useEffect(() => {
    if (appState && appState !== config.appState) {
      configDispatch({type: 'APP_STATE', appState: appState});
      configDispatch({
        type: 'TRIGGER_STATE_UPDATE',
        triggerStateUpdate: true,
      });
    }

    if (!config.triggerStateUpdate || !config.username) {
      return;
    }

    setContent(<Loading />);
    setUserInfo(<UserInfo />);
    let historyRequests = [];
    historyRequests.push(
      axios.get('/history', {
        params: {
          username: config.username,
          from: config.unixTimeStart,
          to: config.unixTimeEnd,
        },
      }),
    );
    if (config.unixPrevTimeStart) {
      historyRequests.push(
        axios.get('/history', {
          params: {
            username: config.username,
            from: config.unixPrevTimeStart,
            to: config.unixTimeStart,
          },
        }),
      );
    }

    Promise.all(historyRequests)
      .then(([data, prevData]) => {
        songHistoryDispatch({type: 'SONG_HISTORY', songHistory: data.data});
        if (prevData) {
          songHistoryDispatch({type: 'PREV_SONG_HISTORY', prevSongHistory: prevData.data});
        }

        switch (config.appState) {
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
            setContent(<FullSongHistory />);
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
        try {
          document.querySelector('footer').style.display = 'none';
          document.querySelector('.main-header').style.display = 'none';
          document.querySelector('.user-info').style.display = 'none';
        } catch (e) {}
        if (e.response.status !== 502) {
          setContent(
            <Error errorMessage={"Actually we have no idea. Our bad. Maybe the server's down?"} />,
          );
        } else {
          setContent(<Error errorMessage={e.response.data} />);
        }
      });
  }, [
    appState,
    config.triggerStateUpdate,
    config.appState,
    config.username,
    config.unixTimeEnd,
    config.unixPrevTimeStart,
    config.unixTimeStart,
  ]);

  return (
    <>
      <main className={`app ${!appIsPopulated ? 'app--unpopulated' : ''}`}>
        <ConfigContext.Provider value={{config, configDispatch}}>
          <SongHistoryContext.Provider value={{songHistory, songHistoryDispatch}}>
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
          </SongHistoryContext.Provider>
        </ConfigContext.Provider>
      </main>
      {footer}
    </>
  );
};
export default App;
