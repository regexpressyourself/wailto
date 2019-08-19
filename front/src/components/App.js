import React, {useReducer, useState, useEffect} from 'react';
import SongFrequencies from './SongFrequencies';
import Nav from './Nav';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import {HistoryContext, historyReducer} from '../context/HistoryContext';
import './App.css';

function App() {
  let initialConfig = {
    timeStart: new Date(2019, 7, 1),
    timeEnd: new Date(2019, 7, 7),
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
      fetch(
        `http://localhost:3009/history/?username=${config.username}&to=${config.unixTimeEnd}&from=${config.unixTimeStart}`,
      )
        .then(results => results.json())
        .then(data => {
          historyDispatch({history: data});
          setIsUpdating(false);
        });
    }
  }, [config]);

  if (!history.history || isUpdating) {
    console.log('res no response');
    console.log(history);
    return (
      <>
        <ConfigContext.Provider value={{config, configDispatch}}>
          <Nav />
          <h1>Loading...</h1>;
        </ConfigContext.Provider>
      </>
    );
  }

  return (
    <>
      <ConfigContext.Provider value={{config, configDispatch}}>
        <Nav />
        <HistoryContext.Provider value={{history, historyDispatch}}>
          <SongFrequencies />
        </HistoryContext.Provider>
      </ConfigContext.Provider>
    </>
  );
}

export default App;
