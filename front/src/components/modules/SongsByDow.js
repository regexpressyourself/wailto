import React, {useContext} from 'react';
import './charts.scss';
import {HistoryContext} from '../../context/HistoryContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {days, bucketSongTimes} from '../dateMappers';

function SongsByDow(props) {
  const {history} = useContext(HistoryContext);

  let dayDataRC = [];

  let dayMap = bucketSongTimes('dow', 7, history.history);

  for (let i = 0; i <= 6; i++) {
    dayDataRC.push({
      name: `${days()[i]}s`,
      'Song Count': dayMap[i] ? dayMap[i].length : 0,
    });
  }

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
