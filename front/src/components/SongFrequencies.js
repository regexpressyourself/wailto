import React from 'react';
import {LineChart} from 'react-chartkick';
import 'chart.js';
import {days, months} from './dateMappers';

const getAmPmHour = hour => {
  let meridiem = 'am';

  if (hour >= 12) {
    hour = hour - 12;
    meridiem = 'pm';
  }
  if (hour === 0) {
    hour = 12;
  }
  return hour + meridiem;
};
const getDateTime = unixTime => {
  let date = new Date(unixTime * 1000);
  let year = date.getFullYear();
  let month = months()[date.getMonth()];
  let day = date.getDate();
  let dow = date.getDay();
  let hour = date.getHours();
  let minutes = '0' + date.getMinutes();
  let seconds = '0' + date.getSeconds();
  return {
    month: month,
    day: day,
    dow: dow,
    year: year,
    hour: hour,
    minutes: minutes.substr(-2),
    seconds: seconds.substr(-2),
  };
};

function SongFrequencies(props) {
  let hourMap = Array(24);
  let dayMap = Array(7);
  let hourData = {};
  let dayData = {};

  for (let song of props.data) {
    let date = song.date;
    let accessibleDate = getDateTime(date);
    let hour = accessibleDate.hour;
    let dow = accessibleDate.dow;

    if (hourMap[hour]) {
      hourMap[hour].push(accessibleDate);
    } else {
      hourMap[hour] = [accessibleDate];
    }

    if (dayMap[dow]) {
      dayMap[dow].push(accessibleDate);
    } else {
      dayMap[dow] = [accessibleDate];
    }
    hourData[hour] = hourMap[hour].length;
    dayData[dow] = dayMap[dow].length;
  }

  for (let i = 0; i <= 23; i++) {
    if (!hourData[i]) {
      hourData[i] = 0;
    }
    hourData[getAmPmHour(i)] = hourData[i];
    delete hourData[i];
  }

  for (let i = 0; i <= 6; i++) {
    if (!dayData[i]) {
      dayData[i] = 0;
    }
    dayData[days()[i]] = dayData[i];
    delete dayData[i];
  }

  return (
    <>
      <LineChart data={hourData} />
      <LineChart data={dayData} />
    </>
  );
}

export default SongFrequencies;
