import {useState, useEffect} from 'react';
import {days, months, hourToAmpm, accessibleTime} from '../components/dateMappers';

const useDateTime = unixTime => {
  const [dateTime, setDateTime] = useState(null);
  useEffect(() => {
    if (!unixTime) {
      return;
    }
    const months_arr = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let date = new Date(unixTime * 1000);
    let year = date.getFullYear();
    let month = months_arr[date.getMonth()];
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = '0' + date.getMinutes();
    let seconds = '0' + date.getSeconds();
    setDateTime(
      month +
        '-' +
        day +
        '-' +
        year +
        ' ' +
        hours +
        ':' +
        minutes.substr(-2) +
        ':' +
        seconds.substr(-2),
    );
  }, [unixTime]);
  return dateTime;
};

export {useDateTime};
