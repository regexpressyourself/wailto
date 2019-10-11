import React, {useContext, useState, useEffect} from 'react';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import SongItem from './SongItem.js';
import './charts.scss';
import {accessibleTime} from '../../functions/dateMappers';
import LazyLoad from 'react-lazyload';

const FullSongHistory = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);
  let [songHistoryElements, setSongHistoryElements] = useState(null);

  useEffect(() => {
    setSongHistoryElements(
      songHistory.songHistory
        .map(song => {
          let date = accessibleTime(song.date);
          let genres = [song.genre1, song.genre2, song.genre3, song.genre4];
          if (config.genre && config.genre !== 'any genre') {
            if (!genres.includes(config.genre)) {
              if (config.genre2 && config.genre2 !== 'any genre') {
                if (!genres.includes(config.genre2)) {
                  return null;
                }
              } else {
                return null;
              }
            }
          }

          return (
            <LazyLoad key={song.id + song.date} height={100}>
              <SongItem
                image={song.image}
                album={song.album}
                artist={song.artist}
                name={song.name}
                genres={genres}
                date={date}
              />
            </LazyLoad>
          );
        })
        .reverse(),
    );
  }, [config.genre, config.genre2, config.timeStart, config.timeEnd, songHistory.songHistory]);

  return (
    <div className="chart-container chart-container--full-history">
      <h1 className="chart-heading">Every Song In History</h1>
      {songHistoryElements}
    </div>
  );
};

export default FullSongHistory;
