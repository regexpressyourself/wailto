import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {hourToAmpm, bucketSongTimes} from '../../functions/dateMappers';

const SongsByHour = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [hourDataRC, setHourDataRC] = useState(null);

  useEffect(() => {
    let hourMap = bucketSongTimes('hour', 24, songHistory.songHistory, config.genre, config.genre2);
    let tempHourDataRC = [];
    for (let i = 0; i <= 23; i++) {
      let newHourObject = {
        name: hourToAmpm(i),
      };
      newHourObject[config.genre] = hourMap.genre[i] ? hourMap.genre[i].length : 0;
      newHourObject[config.genre2] = hourMap.genre2[i] ? hourMap.genre2[i].length : 0;
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
            <Area type="monotone" dataKey={config.genre} stroke="#7f4782" fill="#aa5c9f" />
            <Area type="monotone" dataKey={config.genre2} stroke="#fd8b7b" fill="#e2598b" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByHour;
