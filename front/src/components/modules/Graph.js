import React, {useContext, useCallback, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const Graph = ({dataKey, dataKeyValues}) => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [chartElement, setChartElement] = useState();

  useEffect(() => {
    const basicKey = 'song count';
    const genreKey = getGenreKey(config.genre, config.genre2);
    const genre2Key = getGenre2Key(config.genre, config.genre2);

    const basicData = bucketSongTimes(dataKey, dataKeyValues, songHistory.songHistory, null);
    const genreData = bucketSongTimes(
      dataKey,
      dataKeyValues,
      songHistory.songHistory,
      config.genre,
    );
    const genre2Data = bucketSongTimes(
      dataKey,
      dataKeyValues,
      songHistory.songHistory,
      config.genre2,
    );

    let rcData = [];
    for (let i = 0; i < dataKeyValues.length; i++) {
      let newDayObject = {};
      newDayObject['name'] = dataKeyValues[i];
      newDayObject[basicKey] = basicData[i] ? basicData[i].length : 0;
      newDayObject[genreKey] = genreData[i] ? genreData[i].length : 0;
      newDayObject[genre2Key] = genre2Data && genre2Data[i] ? genre2Data[i].length : 0;

      rcData.push(newDayObject);
    }

    setChartElement(
      <ResponsiveContainer>
        <AreaChart data={rcData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {basicKey ? (
            <Area type="monotone" dataKey={basicKey} stroke="#fd8b7b" fill="#e2598b" />
          ) : null}
          {genreKey ? (
            <Area type="monotone" dataKey={genreKey} stroke="#7f4782" fill="#aa5c9f" />
          ) : null}
          {genre2Key ? (
            <Area type="monotone" dataKey={genre2Key} stroke="#fd8b7b" fill="#e2598b" />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>,
    );
  }, [config.genre, config.genre2, dataKey, dataKeyValues, songHistory.songHistory]);

  return <>{chartElement}</>;
};

export default Graph;
