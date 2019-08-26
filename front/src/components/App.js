import React, {useReducer, useState, useEffect} from 'react';
import Nav from './Nav';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import FullHistory from './modules/FullHistory';
import axios from 'axios';
import './App.css';

function App() {
  let initialConfig = {
    timeStart: new Date(2019, 7, 21),
    timeEnd: new Date(2019, 7, 25),
    username: 'zookeeprr',
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);
  const [history, historyDispatch] = useReducer(historyReducer, {});
  const [isUpdating, setIsUpdating] = useState(false);

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
    }
  }, [config]);

  if (!history.history ) {
    return (
      <>
        <ConfigContext.Provider value={{config, configDispatch}}>
          <Nav />
        </ConfigContext.Provider>
      </>
    );
  }
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
