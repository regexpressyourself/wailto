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
  let [title1, setTitle1] = useState(null);
  let [title2, setTitle2] = useState(null);

  useEffect(() => {
    let primaryKey = getGenreKey(config.genre, config.genre2);
    let secondaryKey = getGenre2Key(config.genre, config.genre2);
    setTitle1(primaryKey);
    setTitle2(secondaryKey);

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
      let timeStartLess1String = accessibleJsTime(config.timeStart, true).dateAsString;
      let timeEndString = accessibleJsTime(config.timeEnd).dateAsString;
      setTitle1(`${timeStartString} - ${timeEndString}`);
      setTitle2(`${prevTimeStartString} - ${timeStartLess1String}`);

      primaryKey = 'song count';
      secondaryKey = 'song count';

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

      let secondDataName = dataName;
      if (secondaryDataKeyValues && secondaryKey != null) {
        secondDataName = secondaryDataKeyValues[i];
      }
      //newDayObject[secondaryKey] = secondaryData[dataName] ? secondaryData[dataName].length : 0;

      secondNewDayObject['name'] = secondDataName;
      secondNewDayObject[secondaryKey] = secondaryData[secondDataName]
        ? secondaryData[secondDataName].length
        : 0;

      rcData.push(newDayObject);

      if (secondNewDayObject && secondNewDayObject.name) {
        secondaryRcData.push(secondNewDayObject);
      }
    }

    setChartElement(
      <>
        <h2>{title1}</h2>
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
          <>
            <h2>{title2}</h2>
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
          </>
        ) : null}
      </>,
    );
  }, [
    title1,
    title2,
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
