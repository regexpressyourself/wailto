import React, {useState, useEffect} from 'react';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

function Nav(props) {
  let [startTime, setStartTime] = useState(null);
  let [endTime, setEndTime] = useState(null);

  useEffect(() => {
    console.log(startTime);
  }, [startTime]);

  return (
    <>
    <h2>From:</h2>
    <DayPicker
      selectedDays={startTime}
      onDayClick={e => { setStartTime(e) }}
    />
    <h2>To:</h2>
    <DayPicker
      selectedDays={endTime}
      onDayClick={e => { setEndTime(e) }}
    />
    </>
  );
}

export default Nav;
