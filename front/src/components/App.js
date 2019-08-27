import React, {useReducer, useState, useEffect} from 'react';
import axios from 'axios';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import FullHistory from './modules/FullHistory';
import Nav from './Nav';
import './App.css';

function App() {
  let today = new Date();
  let weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  let initialConfig = {
    timeStart: weekAgo,
    timeEnd: today,
    username: 'zookeeprr',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [history, historyDispatch] = useReducer(historyReducer, {});
  const [isUpdating, setIsUpdating] = useState(false);
  console.log(isUpdating);

  useEffect(() => {
    console.log('config');
    console.log(config);
    setIsUpdating(true);
    if (config.username && config.unixTimeEnd && config.unixTimeStart) {
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
          setIsUpdating(false);
        });
    } else {
      setIsUpdating(false);
    }
  }, [config]);

  if (isUpdating) {
    return (
      <>
        <ConfigContext.Provider value={{config, configDispatch}}>
          <Nav />
          <h1>Loading...</h1>
        </ConfigContext.Provider>
      </>
    );
  }
  if (!history.history) {
    return (
      <div className="home">
        <ConfigContext.Provider value={{config, configDispatch}}>
          <Nav showMessages={!!config.username.length}/>
        </ConfigContext.Provider>
      </div>
    );
  }

  return (
    <>
      <ConfigContext.Provider value={{config, configDispatch}}>
        <Nav />
        <HistoryContext.Provider value={{history, historyDispatch}}>
          <FullHistory />
        </HistoryContext.Provider>
      </ConfigContext.Provider>
    </>
  );
}

export default App;
