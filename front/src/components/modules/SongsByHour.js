import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {hourToAmpm, bucketSongTimes} from '../../functions/dateMappers';

const getInitialKey = (genre, genre2) => {
  if (genre) {
    if (genre === 'any genre' && !genre2) {
      return 'Song Count';
    } else {
      return genre;
    }
  } else {
    return 'Song Count';
  }
};
const SongsByHour = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [hourDataRC, setHourDataRC] = useState(null);
  let [initialKey, setInitialKey] = useState(getInitialKey(config.genre, config.genre2));
  let [secondaryKey, setSecondaryKey] = useState(
    config.genre2 && !(config.genre2 === 'any genre') ? config.genre2 : null,
  );

  useEffect(() => {
    let map = {};
    let tempInitialKey = getInitialKey(config.genre, config.genre2);
    let tempSecondaryKey = config.genre2 && config.genre2 !== 'any genre' ? config.genre2 : null;
    setInitialKey(tempInitialKey);
    setSecondaryKey(tempSecondaryKey);

    map[tempInitialKey] = bucketSongTimes('hour', 24, songHistory.songHistory, config.genre);
    if (config.genre2) {
      map[tempSecondaryKey] = bucketSongTimes('hour', 24, songHistory.songHistory, config.genre2);
    }
    let tempHourDataRC = [];
    for (let i = 0; i <= 23; i++) {
      let newHourObject = {
        name: hourToAmpm(i),
      };

      newHourObject[tempInitialKey] = map[tempInitialKey][i] ? map[tempInitialKey][i].length : 0;
      newHourObject[tempSecondaryKey] =
        map[tempSecondaryKey] && map[tempSecondaryKey][i] ? map[tempSecondaryKey][i].length : 0;

      tempHourDataRC.push(newHourObject);
    }
    setHourDataRC(tempHourDataRC);
  }, [songHistory.songHistory, config.genre, config.genre2]);

  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Hour of Day
        </h1>
        <ResponsiveContainer>
          <AreaChart data={hourDataRC}>
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

export default SongsByHour;
