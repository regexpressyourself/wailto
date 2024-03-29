const getDateRange = (start, end) => {
  let daysBetween = [];
  let newStart = new Date(start.getTime());
  while (newStart < end) {
    let newUnixFrom = Math.round(newStart.getTime() / 1000);
    daysBetween.push(newUnixFrom);
    newStart.setDate(newStart.getDate() + 1);
  }
  return daysBetween;
};

const resetDate = (time, isEnd = false) => {
  let jsTime = new Date(time * 1000);
  jsTime.setDate(jsTime.getDate());
  if (isEnd) {
    jsTime.setHours(23);
    jsTime.setMinutes(59);
    jsTime.setSeconds(59);
  } else {
    jsTime.setHours(0);
    jsTime.setMinutes(0);
    jsTime.setSeconds(0);
  }
  jsTime.setMilliseconds(0);
  let unixTime = Math.round(jsTime.getTime() / 1000);
  return { jsTime: jsTime, unixTime: unixTime };
};

exports.getDateRange = getDateRange;
exports.resetDate = resetDate;
