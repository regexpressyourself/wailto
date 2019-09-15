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
import {hourToAmpm, bucketSongTimes} from '../../functions/dateMappers';

function SongsByHour(props) {
  const {history} = useContext(HistoryContext);

  let hourDataRC = [];
  let hourMap = bucketSongTimes('hour', 24, history.history);

  for (let i = 0; i <= 23; i++) {
    hourDataRC.push({
      name: hourToAmpm(i),
      'Song Count': hourMap[i] ? hourMap[i].length : 0,
    });
  }

  let subheadMessages = [
    <>Hey, there's that 2am jam session</>,
    <>Let's play "Guess the Commute Time"</>,
  ];

  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Hour of Day
        </h1>
        <h2 className="chart-subheading">
          {subheadMessages[Math.floor(Math.random() * subheadMessages.length)]}
        </h2>
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
