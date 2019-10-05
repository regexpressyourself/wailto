import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const Graph = ({dataKey, dataKeyValues, config, songHistory}) => {

  let [rcData, setRCData] = useState(null);
  let [chartData, setChartData] = useState({genre1: null, genre2: null});

  useEffect(() => {
    let map = {};
    let basicKey = 'song count';
    let genreKey = getGenreKey(config.genre, config.genre2);
    let genre2Key = getGenre2Key(config.genre, config.genre2);

    map[basicKey] = bucketSongTimes(dataKey, dataKeyValues, songHistory.songHistory, null);
    map[genreKey] = bucketSongTimes(dataKey, dataKeyValues, songHistory.songHistory, config.genre);
    map[genre2Key] = bucketSongTimes(
      dataKey,
      dataKeyValues,
      songHistory.songHistory,
      config.genre2,
    );
    let tempRCData = [];

    for (let i = 0; i < dataKeyValues.length; i++) {
      let newDayObject = {
        name: dataKeyValues[i],
      };
      newDayObject[basicKey] = map[basicKey][i] ? map[basicKey][i].length : 0;
      newDayObject[genreKey] = map[genreKey][i] ? map[genreKey][i].length : 0;
      newDayObject[genre2Key] = map[genre2Key] && map[genre2Key][i] ? map[genre2Key][i].length : 0;
      tempRCData.push(newDayObject);
    }

    setRCData(tempRCData);

    setChartData({
      basic: <Area type="monotone" dataKey={basicKey} stroke="#fd8b7b" fill="#e2598b" />,
      genre1: <Area type="monotone" dataKey={genreKey} stroke="#7f4782" fill="#aa5c9f" />,
      genre2: <Area type="monotone" dataKey={genre2Key} stroke="#fd8b7b" fill="#e2598b" />,
    });
  }, [dataKey, dataKeyValues, songHistory.songHistory, config.genre, config.genre2]);

  return (
    <>
      <ResponsiveContainer>
        <AreaChart data={rcData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {chartData.basic}
          {chartData.genre1}
          {chartData.genre2}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default Graph;
