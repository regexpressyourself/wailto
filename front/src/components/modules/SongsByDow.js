import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {days, bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const SongsByDow = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [dayDataRC, setDayDataRC] = useState(null);

  let [initialKey, setInitialKey] = useState(getGenreKey(config.genre, config.genre2));
  let [secondaryKey, setSecondaryKey] = useState(getGenre2Key(config.genre, config.genre2));

  useEffect(() => {
    let map = {};
    let tempInitialKey = getGenreKey(config.genre, config.genre2);
    let tempSecondaryKey = getGenre2Key(config.genre, config.genre2);
    setInitialKey(tempInitialKey);
    setSecondaryKey(tempSecondaryKey);

    map[tempInitialKey] = bucketSongTimes('dow', 7, songHistory.songHistory, config.genre);

    if (config.genre2) {
      map[tempSecondaryKey] = bucketSongTimes('dow', 7, songHistory.songHistory, config.genre2);
    }

    let tempDayDataRC = [];
    for (let i = 0; i <= 6; i++) {
      let newDayObject = {
        name: `${days()[i]}s`,
      };

      newDayObject[tempInitialKey] = map[tempInitialKey][i] ? map[tempInitialKey][i].length : 0;

      newDayObject[tempSecondaryKey] =
        map[tempSecondaryKey] && map[tempSecondaryKey][i] ? map[tempSecondaryKey][i].length : 0;

      tempDayDataRC.push(newDayObject);
    }
    setDayDataRC(tempDayDataRC);
  }, [songHistory.songHistory, config.genre, config.genre2]);

  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Day of Week
        </h1>
        <ResponsiveContainer>
          <AreaChart data={dayDataRC}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={initialKey} stroke="#7f4782" fill="#aa5c9f" />
            {secondaryKey ? (
              <Area type="monotone" dataKey={secondaryKey} stroke="#fd8b7b" fill="#e2598b" />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByDow;
