import React, {useContext} from 'react';
import {HistoryContext} from '../../context/HistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import SongItem from './SongItem.js';
import './charts.scss';
import {accessibleTime} from '../dateMappers';

function FullHistory(props) {
  const {history} = useContext(HistoryContext);
  const {config} = useContext(ConfigContext);

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
      <h1 className="chart-heading">Every Song In History</h1>
      <h2 className="chart-subheading">{`(well, in ${config.username}'s history)`}</h2>
      {historyElements}
    </>
  );
}

export default FullHistory;
