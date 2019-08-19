import React, {useContext} from 'react';
import './SongFrequencies.scss';
import {HistoryContext} from '../context/HistoryContext';
import {ConfigContext} from '../context/ConfigContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {days, months, ampm, accessibleTime} from './dateMappers';

function bucketSongTimes(bucketKey, bucketMaxSize, songList) {
  /*
   * The "map" holds an array with a definition of:
   * [{ timeSlot: [Song1, Song2, ...] }, ... ]
   * where timeSlot is the bucketed property's value (day of week,
   * time of day, etc.), and Song1, Song2, etc. are the song objects
   * from LastFM.
   */
  let map = new Array(bucketMaxSize);

  for (let song of songList) {
    let date = song.date;
    let accessibleDate = accessibleTime(date);
    let key = accessibleDate[bucketKey];

    if (map[key]) {
      map[key].push(song);
    } else {
      map[key] = [song];
    }
  }
  return map;
}

function SongFrequencies(props) {
  const {history} = useContext(HistoryContext);
  const {config} = useContext(ConfigContext);

  let hourDataRC = [];
  let dayDataRC = [];
  let dateDataRC = [];

  let dayMap = bucketSongTimes('dow', 7, history.history);
  let hourMap = bucketSongTimes('hour', 24, history.history);

  let end = new Date(config.timeEnd);
  let start = new Date(config.timeStart);

  let datesBetween = [];
  while (start < end) {
    let year = start.getFullYear();
    let month = months()[start.getMonth()];
    let day = start.getDate();
    let date = `${month} ${day}, ${year}`;
    datesBetween.push(date);
    start.setDate(start.getDate() + 1);
  }

  let dateMap = bucketSongTimes('date', datesBetween.length, history.history);

  for (let i = 0; i < datesBetween.length; i++) {
    dateDataRC.push({
      name: datesBetween[i],
      'Song Count': dateMap[datesBetween[i]]
        ? dateMap[datesBetween[i]].length
        : 0,
    });
  }

  for (let i = 0; i <= 23; i++) {
    hourDataRC.push({
      name: ampm(i),
      'Song Count': hourMap[i] ? hourMap[i].length : 0,
    });
  }

  for (let i = 0; i <= 6; i++) {
    dayDataRC.push({
      name: days()[i],
      'Song Count': dayMap[i] ? dayMap[i].length : 0,
    });
  }

  return (
    <>
      <div className="chart-container">
        <h2>Frequency of music by date</h2>
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

      <div className="chart-container">
        <h2>Frequency of music by hour</h2>
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

      <div className="chart-container">
        <h2>Frequency of music by day</h2>
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

export default SongFrequencies;
