import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {days, bucketSongTimes} from '../../functions/dateMappers';

const SongsByDow = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [dayDataRC, setDayDataRC] = useState(null);

  useEffect(() => {
    let dayMap = bucketSongTimes('dow', 7, songHistory.songHistory, config.genre, config.genre2);
    let tempDayDataRC = [];
    for (let i = 0; i <= 6; i++) {
      let newDayObject = {
        name: `${days()[i]}s`,
      };
      newDayObject[config.genre] = dayMap.genre[i] ? dayMap.genre[i].length : 0;
      newDayObject[config.genre2] = dayMap.genre2[i] ? dayMap.genre2[i].length : 0;

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
            <Area type="monotone" dataKey={config.genre} stroke="#7f4782" fill="#aa5c9f" />
            <Area type="monotone" dataKey={config.genre2} stroke="#fd8b7b" fill="#e2598b" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByDow;
