import React from 'react';
import SongFrequencies from './SongFrequencies';
import './App.css';
//import {useFetch} from '../hooks/fetch';
import songs from './songs'; // UNCOMMENT TO USE FAKE DATA

function App() {
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
      <SongFrequencies data={res.response} />
    </>
  );
}

export default App;
