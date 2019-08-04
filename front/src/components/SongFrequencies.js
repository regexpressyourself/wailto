import React from 'react';
import './SongFrequencies.scss';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {days, ampm, accessibleTime} from './dateMappers';

function bucketSongTimes(bucketKey, bucketMaxSize, songList) {
  /*
   * The "map" holds an array with a definition of:
   * [{ timeSlot: [Song1, Song2, ...] }, ... ]
   * where timeSlot is the bucketed property's value (day of week,
   * time of day, etc.), and Song1, Song2, etc. are the song objects
   * from LastFM.
   */
  let map = Array(bucketMaxSize);

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
  let hourDataRC = [];
  let dayDataRC = [];

  let dayMap = bucketSongTimes('dow', 7, props.data);
  let hourMap = bucketSongTimes('hour', 24, props.data);

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
      <h2>Frequency of music by hour</h2>
      <ResponsiveContainer>
        <AreaChart data={hourDataRC} >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="Song Count" stroke="#7f4782" fill="#aa5c9f" />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="chart-container">
      <h2>Frequency of music by day</h2>
      <ResponsiveContainer>
        <AreaChart data={dayDataRC} >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="Song Count" stroke="#7f4782" fill="#aa5c9f" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    </>
  );
}

export default SongFrequencies;
