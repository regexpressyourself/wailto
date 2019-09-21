import React, {useContext} from 'react';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import SongItem from './SongItem.js';
import './charts.scss';
import {accessibleTime} from '../../functions/dateMappers';

const FullSongHistory = () => {
  const {songHistory} = useContext(SongHistoryContext);

  let songHistoryElements = songHistory.songHistory
    .map((song) => {
      let date = accessibleTime(song.date);
      return (
        <SongItem
          key={song.id + song.date}
          image={song.image}
          album={song.album}
          artist={song.artist}
          name={song.name}
          genres={[song.genre1, song.genre2, song.genre3, song.genre4]}
          date={date}
        />
      );
    })
    .reverse();

  return (
    <>
      <h1 className="chart-heading">Every Song In History</h1>
      {songHistoryElements}
    </>
  );
}

export default FullSongHistory;
