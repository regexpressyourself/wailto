import React, {useReducer} from 'react';
import SongFrequencies from './SongFrequencies';
import Nav from './Nav';
import { ConfigContext, configReducer} from '../context/ConfigContext';
import './App.css';

import {useFetch} from '../hooks/fetch';
//import songs from './songs'; // UNCOMMENT TO USE FAKE DATA

function App() {

  let initialConfig = {timeStart: new Date(2019, 8, 1), timeEnd: new Date(2019, 8, 7)};

  const [config, configDispatch] = useReducer(configReducer, initialConfig)

  //const res = {response: songs()}; // UNCOMMENT TO USE FAKE DATA
  let username = 'zookeeprr';
  let to = 1565308800;
  let from = 1564617600;
  const res = useFetch(
  `http://localhost:3009/history/?username=${username}&to=${to}&from=${from}`,
  {},
  );

  if (res.error) {
    return <>'Oops! Something went wront getting your music.'</>;
  }

  if (!res.response) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
    <ConfigContext.Provider value={{config, configDispatch}}>
      <Nav />
      <SongFrequencies data={res.response} />
    </ConfigContext.Provider>
    </>
  );
}

export default App;
