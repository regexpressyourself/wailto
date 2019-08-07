import React, {useReducer} from 'react';
import SongFrequencies from './SongFrequencies';
import Nav from './Nav';
import { ConfigContext, configReducer} from './ConfigContext';
import './App.css';

//import {useFetch} from '../hooks/fetch';
import songs from './songs'; // UNCOMMENT TO USE FAKE DATA

function App() {

let initialConfig = {timeStart: '10', timeEnd: '10'};
  const [config, configDispatch] = useReducer(configReducer, initialConfig)

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
    <ConfigContext.Provider value={{config, configDispatch}}>
      <Nav />
      <SongFrequencies data={res.response} />
    </ConfigContext.Provider>
    </>
  );
}

export default App;
