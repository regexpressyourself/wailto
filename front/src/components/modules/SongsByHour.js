import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {HistoryContext} from '../../context/HistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {hourToAmpm, bucketSongTimes} from '../../functions/dateMappers';

function SongsByHour(props) {
  const {history} = useContext(HistoryContext);
  const {config} = useContext(ConfigContext);

  let [hourDataRC, setHourDataRC] = useState(null);
  let hourMap = bucketSongTimes('hour', 24, history.history, config.genre);

  useEffect(() => {
    let tempHourDataRC = [];
    for (let i = 0; i <= 23; i++) {
      tempHourDataRC.push({
        name: hourToAmpm(i),
        'Song Count': hourMap[i] ? hourMap[i].length : 0,
      });
    }
    setHourDataRC(tempHourDataRC);
  }, []);

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

export default SongsByHour;
