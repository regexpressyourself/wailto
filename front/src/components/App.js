import React, {useReducer} from 'react';
import SongFrequencies from './SongFrequencies';
import Nav from './Nav';
import {ConfigContext, configReducer} from '../context/ConfigContext';
import './App.css';

import {useFetch} from '../hooks/fetch';

function App() {
  let initialConfig = {
    timeStart: new Date(2019, 7, 1),
    timeEnd: new Date(2019, 7, 7),
  };

  const [config, configDispatch] = useReducer(configReducer, initialConfig);

  let username = 'zookeeprr';
  let to = Math.round(config.timeEnd.getTime() / 1000);
  let from = Math.round(config.timeStart.getTime() / 1000);

  let historyResponse;

  let historyRequest = `http://localhost:3009/history/?username=${username}&to=${to}&from=${from}`;
  historyResponse = useFetch(historyRequest, {});

  if (!historyResponse || !historyResponse.response) {
    console.log('res no response');
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <ConfigContext.Provider value={{config, configDispatch}}>
        <Nav />
        <SongFrequencies data={historyResponse.response} />
      </ConfigContext.Provider>
    </>
  );
}

export default App;
