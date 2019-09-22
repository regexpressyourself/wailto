import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {getDatesBetween, bucketSongTimes} from '../../functions/dateMappers';

const SongsByDate = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [dateDataRC, setDateDataRC] = useState(null);

  useEffect(() => {
    let end = new Date(config.timeEnd);
    let start = new Date(config.timeStart);
    let datesBetween = getDatesBetween(start, end);
    let dateMap = bucketSongTimes(
      'date',
      datesBetween.length,
      songHistory.songHistory,
      config.genre,
      config.genre2,
    );

    let tempDateDataRC = [];
    for (let i = 0; i < datesBetween.length; i++) {
      let newDateObject = {
        name: datesBetween[i],
      };
      newDateObject[config.genre] = dateMap.genre[datesBetween[i]]
        ? dateMap.genre[datesBetween[i]].length
        : 0;
      newDateObject[config.genre2] = dateMap.genre2[datesBetween[i]]
        ? dateMap.genre2[datesBetween[i]].length
        : 0;

      tempDateDataRC.push(newDateObject);
    }
    setDateDataRC(tempDateDataRC);
  }, [songHistory.songHistory, config.genre, config.genre2]);

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
            <Area type="monotone" dataKey={config.genre} stroke="#7f4782" fill="#aa5c9f" />
            <Area type="monotone" dataKey={config.genre2} stroke="#fd8b7b" fill="#e2598b" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByDate;
