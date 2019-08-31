import React, {useContext} from 'react';
import {HistoryContext} from '../../context/HistoryContext';
import SongItem from './SongItem.js';
import './charts.scss';
import {accessibleTime} from '../dateMappers';

function FullHistory(props) {
  const {history} = useContext(HistoryContext);

  let historyElements = history.history
    .map(song => {
      let date = accessibleTime(song.date);
      return (
        <SongItem
          key={song.id + song.date}
          image={song.image}
          album={song.album}
          artist={song.artist}
          name={song.name}
          date={date}
        />
      );
    })
    .reverse();

  return (
    <>
      <h1 className="chart-heading">Every Song We Have</h1>
      {historyElements}
    </>
  );
}

export default FullHistory;
