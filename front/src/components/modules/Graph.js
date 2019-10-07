import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {accessibleJsTime, bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const Graph = ({dataKey, dataKeyValues, secondaryDataKeyValues}) => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [chartElement, setChartElement] = useState();

  useEffect(() => {
    let primaryKey = getGenreKey(config.genre, config.genre2);
    let secondaryKey = getGenre2Key(config.genre, config.genre2);

    let primaryData = bucketSongTimes(
      dataKey,
      dataKeyValues,
      songHistory.songHistory,
      config.genre,
    );

    let secondaryData = {};
    if (secondaryKey) {
      secondaryData = bucketSongTimes(
        dataKey,
        dataKeyValues,
        songHistory.songHistory,
        config.genre2,
      );
    } else if (config.prevTimeStart && songHistory.prevSongHistory) {
      let prevTimeStartString = accessibleJsTime(config.prevTimeStart).dateAsString;
      let timeStartString = accessibleJsTime(config.timeStart).dateAsString;
      let timeEndString = accessibleJsTime(config.timeEnd).dateAsString;
      primaryKey = `${timeStartString} - ${timeEndString}`;
      secondaryKey = `${prevTimeStartString} - ${timeStartString}`;

      secondaryData = bucketSongTimes(
        dataKey,
        dataKeyValues,
        songHistory.prevSongHistory,
        config.genre,
      );
    }

    let rcData = [];
    let secondaryRcData = [];
    for (let i = 0; i < dataKeyValues.length; i++) {
      let newDayObject = {};
      let secondNewDayObject = {};

      let dataName = dataKeyValues[i];
      newDayObject['name'] = dataName;
      newDayObject[primaryKey] = primaryData[dataName] ? primaryData[dataName].length : 0;

      if (secondaryDataKeyValues && secondaryKey != null) {
        let secondDataName = secondaryDataKeyValues[i];
        secondNewDayObject['name'] = secondDataName;
        secondNewDayObject[secondaryKey] = secondaryData[secondDataName]
          ? secondaryData[secondDataName].length
          : 0;
      } else {
        newDayObject[secondaryKey] = secondaryData[dataName] ? secondaryData[dataName].length : 0;
      }

      rcData.push(newDayObject);

      if (secondNewDayObject && secondNewDayObject.name) {
        secondaryRcData.push(secondNewDayObject);
      }
    }

    setChartElement(
      <>
        <ResponsiveContainer>
          <AreaChart data={rcData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {primaryKey ? (
              <Area type="monotone" dataKey={primaryKey} stroke="#fd8b7b" fill="#e2598b" />
            ) : null}
            {secondaryKey && secondaryRcData.length === 0 ? (
              <Area type="monotone" dataKey={secondaryKey} stroke="#7f4782" fill="#aa5c9f" />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
        {secondaryRcData.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={secondaryRcData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {secondaryKey ? (
                <Area type="monotone" dataKey={secondaryKey} stroke="#7f4782" fill="#aa5c9f" />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </>,
    );
  }, [
    secondaryDataKeyValues,
    config.genre,
    config.genre2,
    dataKey,
    dataKeyValues,
    songHistory.songHistory,
    songHistory.prevSongHistory,
    config.timeStart,
    config.timeEnd,
    config.prevTimeStart,
  ]);

  return <>{chartElement}</>;
};

export default Graph;
