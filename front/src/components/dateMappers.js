const days = () => {
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
};
const months = () => {
  return [
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
};

const ampm = hour => {
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

const accessibleTime = unixTime => {
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

export {days, months, ampm, accessibleTime};
