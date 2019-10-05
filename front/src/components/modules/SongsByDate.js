import React, {useContext, useState, useEffect} from 'react';
import './charts.scss';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip} from 'recharts';
import {getDatesBetween, bucketSongTimes} from '../../functions/dateMappers';
import {getGenreKey, getGenre2Key} from '../../functions/genres';

const SongsByDate = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);
  let [dateDataRC, setDateDataRC] = useState(null);
  let [initialKey, setInitialKey] = useState(getGenreKey(config.genre, config.genre2));
  let [secondaryKey, setSecondaryKey] = useState(getGenre2Key(config.genre, config.genre2));
  let [timeEnd, setTimeEnd] = useState(new Date(config.timeEnd));
  let [timeStart, setTimeStart] = useState(new Date(config.timeStart));

  useEffect(() => {
    setTimeEnd(new Date(config.timeEnd));
    setTimeStart(new Date(config.timeStart));
  }, [config.timeEnd, config.timeStart]);

  useEffect(() => {
    let datesBetween = getDatesBetween(timeStart, timeEnd);
    let map = {};
    let tempInitialKey = getGenreKey(config.genre, config.genre2);
    let tempSecondaryKey = getGenre2Key(config.genre, config.genre2);
    setInitialKey(tempInitialKey);
    setSecondaryKey(tempSecondaryKey);

    map[tempInitialKey] = bucketSongTimes(
      'date',
      datesBetween.length,
      songHistory.songHistory,
      config.genre,
    );
    map[tempSecondaryKey] = bucketSongTimes(
      'date',
      datesBetween.length,
      songHistory.songHistory,
      config.genre2,
    );

    let tempDateDataRC = [];
    for (let i = 0; i < datesBetween.length; i++) {
      let newDateObject = {
        name: datesBetween[i],
      };

      newDateObject[tempInitialKey] = map[tempInitialKey][datesBetween[i]]
        ? map[tempInitialKey][datesBetween[i]].length
        : 0;

      newDateObject[tempSecondaryKey] = map[tempSecondaryKey][datesBetween[i]]
        ? map[tempSecondaryKey][datesBetween[i]].length
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
            <Area type="monotone" dataKey={initialKey} stroke="#7f4782" fill="#aa5c9f" />
            {secondaryKey ? (
              <Area type="monotone" dataKey={secondaryKey} stroke="#fd8b7b" fill="#e2598b" />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SongsByDate;
