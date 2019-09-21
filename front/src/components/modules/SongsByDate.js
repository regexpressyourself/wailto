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
import {getDatesBetween, bucketSongTimes} from '../../functions/dateMappers';

const SongsByDate = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [dateDataRC, setDateDataRC] = useState(null);
  let end = new Date(config.timeEnd);
  let start = new Date(config.timeStart);
  let datesBetween = getDatesBetween(start, end);
  let dateMap = bucketSongTimes(
    'date',
    datesBetween.length,
    songHistory.songHistory,
    config.genre,
  );

  useEffect(() => {
    let tempDateDataRC = [];
    for (let i = 0; i < datesBetween.length; i++) {
      tempDateDataRC.push({
        name: datesBetween[i],
        'Song Count': dateMap[datesBetween[i]]
          ? dateMap[datesBetween[i]].length
          : 0,
      });
    }
    setDateDataRC(tempDateDataRC);
  }, []);

  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Date
        </h1>
        <ResponsiveContainer>
          <AreaChart data={dateDataRC}>
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

export default SongsByDate;
