import React, {useContext} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {ConfigContext} from '../../context/ConfigContext';

const formatDate = date => {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const Dates = () => {
  const {config, configDispatch} = useContext(ConfigContext);

  return (
    <>
      <div className="nav__date-pickers nav__date-pickers--dates">
        <div className="input-wrapper input-wrapper--start-date">
          <label className="nav__heading">Start date:</label>
          <DayPickerInput
            style={{width: '100%'}}
            dayPickerProps={{
              selectedDays: config.timeStart,
              disabledDays: day =>
                day > config.timeEnd || day < new Date().setDate(new Date().getDate() - 62),
            }}
            value={formatDate(config.timeStart)}
            placeholder="YYYY-M-D"
            onDayChange={e => {
              if (e > config.timeEnd) {
                return config.timeEnd;
              }
              if (e < new Date().setDate(new Date().getDate() - 62)) {
                return new Date().setDate(new Date().getDate() - 62);
              }
              if (e) {
                configDispatch({type: 'TIME_START', timeStart: e});
              }
            }}
          />
        </div>
        <div className="input-wrapper input-wrapper--end-date">
          <label className="nav__heading">End date:</label>
          <DayPickerInput
            style={{width: '100%'}}
            dayPickerProps={{
              selectedDays: config.timeEnd,
              disabledDays: day => day > new Date() || day < config.timeStart,
            }}
            value={formatDate(config.timeEnd)}
            placeholder="YYYY-M-D"
            onDayChange={e => {
              if (e) {
                configDispatch({type: 'TIME_END', timeEnd: e});
              }
            }}
          />
        </div>
        {/*<div className="input-wrapper input-wrapper--checkbox">
          <input id="prev-time-checkbox" name="prev-time-checkbox" type="checkbox" />
          <label htmlFor="prev-time-checkbox">&nbsp;Compare to previous period?</label>
        </div>
        */}
      </div>
    </>
  );
};
export default Dates;
