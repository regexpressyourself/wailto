import React, {useContext} from 'react';
import DayPicker from 'react-day-picker';
import {ConfigContext} from '../context/ConfigContext';
import 'react-day-picker/lib/style.css';

function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  return (
    <>
      <h2>From:</h2>
      <DayPicker
        selectedDays={config.timeStart}
        onDayClick={e => {
          configDispatch({type: 'TIME_START', timeStart: e});
        }}
      />
      <h2>To:</h2>
      <DayPicker
        selectedDays={config.timeEnd}
        onDayClick={e => {
          configDispatch({type: 'TIME_END', timeEnd: e});
        }}
      />
    </>
  );
}

export default Nav;
