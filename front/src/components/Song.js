import React from 'react';
import {useDateTime} from '../hooks/datetime.js';
import './Song.css';

function Song(props) {
  const data = props.data;
  const dateTime = useDateTime(data ? data.date : null);

  return (
    <>
    <hr />
      <h1>{data.name}</h1>
      <p>
        {data.artist} : {data.album}
      </p>
      <p>Played on: {dateTime}</p>
      <img src={data['image']} alt="" />
    </>
  );
}

export default Song;
