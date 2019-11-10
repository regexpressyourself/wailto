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
import {accessibleJsTime, bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const Graph = ({
  dataKey,
  dataKeyValues,
  secondaryDataKeyValues,
  twoGraphsEnabled = false,
}) => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  let [chartElement, setChartElement] = useState();
  let [title2, setTitle2] = useState(null);
  let [primaryData, setPrimaryData] = useState(null);
  let [secondaryData, setSecondaryData] = useState(null);
  let [primaryKey, setPrimaryKey] = useState(null);
  let [secondaryKey, setSecondaryKey] = useState(null);
  let [primaryChartData, setPrimaryChartData] = useState(null);
  let [secondaryChartData, setSecondaryChartData] = useState(null);

  useEffect(() => {
    if (twoGraphsEnabled) {
      setPrimaryKey('song count');
    } else if (config.prevTimeStart && songHistory.prevSongHistory) {
      setPrimaryKey(
        `${accessibleJsTime(config.timeStart).dateAsString} - ${
          accessibleJsTime(config.timeEnd).dateAsString
        }`,
      );
    } else {
      setPrimaryKey(getGenreKey(config.genre, config.genre2));
    }

    setPrimaryData(
      bucketSongTimes(
        dataKey,
        dataKeyValues,
        songHistory.songHistory,
        config.genre,
      ),
    );
  }, [config, dataKey, dataKeyValues, songHistory, twoGraphsEnabled]);

  useEffect(() => {
    let isSecondGenre = getGenre2Key(config.genre, config.genre2);
    let isPrevTimeSet = config.prevTimeStart && songHistory.prevSongHistory;

    if (twoGraphsEnabled) {
      setSecondaryKey('song count');
    } else if (isSecondGenre) {
      setSecondaryKey(getGenre2Key(config.genre, config.genre2));
    } else if (isPrevTimeSet) {
      setSecondaryKey(
        `${accessibleJsTime(config.timeStart, true).dateAsString} - ${
          accessibleJsTime(config.prevTimeStart).dateAsString
        }`,
      );
    }

    if (isSecondGenre) {
      setSecondaryData(
        bucketSongTimes(
          dataKey,
          dataKeyValues,
          songHistory.songHistory,
          config.genre2,
        ),
      );
    } else if (isPrevTimeSet) {
      setSecondaryData(
        bucketSongTimes(
          dataKey,
          dataKeyValues,
          songHistory.prevSongHistory,
          config.genre,
        ),
      );
    }

    if (secondaryKey) {
      setTitle2(secondaryKey);
    }
  }, [
    config,
    dataKey,
    dataKeyValues,
    songHistory,
    twoGraphsEnabled,
    primaryData,
    secondaryKey,
  ]);

  useEffect(() => {
    if (!primaryData) return;
    let rcData = [];
    let secondaryRcData = [];

    for (let i = 0; i < dataKeyValues.length; i++) {
      let newDayObject = {};
      let secondNewDayObject = {};

      let dataName = dataKeyValues[i];
      newDayObject['name'] = dataName;
      newDayObject[primaryKey] = primaryData[dataName]
        ? primaryData[dataName].length
        : 0;
      if (secondaryData) {
        if (twoGraphsEnabled) {
          let secondDataName = dataName;
          if (secondaryDataKeyValues && secondaryKey != null) {
            secondDataName = secondaryDataKeyValues[i];
          }

          secondNewDayObject['name'] = secondDataName;
          secondNewDayObject[secondaryKey] = secondaryData[secondDataName]
            ? secondaryData[secondDataName].length
            : 0;
        } else {
          // TODO set customizable single-vs-double chart view
          newDayObject[secondaryKey] = secondaryData[dataName]
            ? secondaryData[dataName].length
            : 0;
        }
        if (secondNewDayObject && secondNewDayObject.name && secondaryKey) {
          secondaryRcData.push(secondNewDayObject);
        }
      }
      rcData.push(newDayObject);
    }
    setPrimaryChartData(rcData);
    setSecondaryChartData(secondaryRcData);
  }, [
    primaryData,
    secondaryData,
    primaryKey,
    secondaryKey,
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
    twoGraphsEnabled,
  ]);

  useEffect(() => {
    if (!primaryChartData) {
      setChartElement(null);
      return;
    }
    setChartElement(
      <>
        <h2>{title2 ? primaryKey : null}</h2>
        <ResponsiveContainer>
          <AreaChart data={primaryChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {primaryKey ? (
              <Area
                type="monotone"
                dataKey={primaryKey}
                stroke="#fd8b7b"
                fill="#e2598b"
              />
            ) : null}
            {secondaryKey && secondaryChartData.length === 0 ? (
              <Area
                type="monotone"
                dataKey={secondaryKey}
                stroke="#7f4782"
                fill="#aa5c9f"
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
        {twoGraphsEnabled && secondaryChartData ? (
          <>
            <h2>{title2}</h2>
            <ResponsiveContainer>
              <AreaChart data={secondaryChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {secondaryKey ? (
                  <Area
                    type="monotone"
                    dataKey={secondaryKey}
                    stroke="#7f4782"
                    fill="#aa5c9f"
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : null}
      </>,
    );
  }, [
    primaryChartData,
    secondaryChartData,
    primaryKey,
    secondaryKey,
    title2,
    twoGraphsEnabled,
  ]);

  return <>{chartElement}</>;
};

export default Graph;
