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
    let hourMap = bucketSongTimes('hour', 24, songHistory.songHistory, config.genre);
    let tempHourDataRC = [];
    for (let i = 0; i <= 23; i++) {
      tempHourDataRC.push({
        name: hourToAmpm(i),
        count: hourMap[i] ? hourMap[i].length : 0,
      });
    }
    setHourDataRC(tempHourDataRC);
  }, [songHistory.songHistory, config.genre]);

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
            <Area type="monotone" dataKey="count" stroke="#7f4782" fill="#aa5c9f" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByHour;
