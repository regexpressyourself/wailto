import React from 'react';
import Song from './Song';


function SongList(props) {
  let songData = [];

  for (let song of props.data) {
    songData.push(<Song data={song} />);
  }

  return (
    <>
    {songData}
    </>
  );
}

export default SongList;
