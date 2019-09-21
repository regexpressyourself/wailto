import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {days, bucketSongTimes} from '../../functions/dateMappers';

const SongsByDow = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [dayDataRC, setDayDataRC] = useState(null);

  let dayMap = bucketSongTimes('dow', 7, songHistory.songHistory, config.genre);

  useEffect(() => {
    let tempDayDataRC = [];
    for (let i = 0; i <= 6; i++) {
      tempDayDataRC.push({
        name: `${days()[i]}s`,
        'Song Count': dayMap[i] ? dayMap[i].length : 0,
      });
    }
    setDayDataRC(tempDayDataRC);
  }, []);

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
            <Area
              type="monotone"
              dataKey="Song Count"
              stroke="#7f4782"
              fill="#aa5c9f"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default SongsByDow;
