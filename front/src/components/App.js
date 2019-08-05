import React, {useReducer} from 'react';
import SongFrequencies from './SongFrequencies';
import Nav from './Nav';
import { ConfigContext, ConfigProvider } from 'ConfigContext';
import './App.css';

//import {useFetch} from '../hooks/fetch';
import songs from './songs'; // UNCOMMENT TO USE FAKE DATA

function App() {
  let initialConfig = {timeStart: '', timeEnd: ''};
  const [config, configDispatch] = useReducer((config, configAction) => {
    switch(configAction.type) {
      case 'TIME_START':
        return { timeStart: configAction.timeStart}
      case 'TIME_END':
        return { timeEnd: configAction.timeEnd}
      default:
        return config;
    }
  }, initialConfig);

  const res = {response: songs()}; // UNCOMMENT TO USE FAKE DATA
  //const res = useFetch(
  //`http://localhost:3009/history/?username=zookeeprr&to=`,
  //{},
  //);

  if (res.error) {
    return <>'Oops! Something went wront getting your music.'</>;
  }

  if (!res.response) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
    <ConfigProvider value={{config, configDispatch}}>
      <Nav />
      <SongFrequencies data={res.response} />
    </ConfigProvider>
    </>
  );
}

export default App;
