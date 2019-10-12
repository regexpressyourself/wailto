import React, {useContext, useRef, useState, useEffect} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {isGenre2} from '../../functions/genres';
import {ConfigContext} from '../../context/ConfigContext';
import {formIsValid} from './navControls';

const getPrevTime = (timeStart, timeEnd) => {
  let distance = Math.abs(timeEnd - timeStart);
  let daysDistance = Math.floor(distance / (1000 * 60 * 60 * 24 + 1)) + 2;
  if (distance === 0) {
    daysDistance = 1;
  }
  let prevTime = new Date(timeStart);
  prevTime.setDate(prevTime.getDate() - daysDistance);
  return prevTime;
};

const formatDate = (date) => {
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
  let [prevDateDisplay, setPrevDateDisplay] = useState(null);
  let prevTimeCheckbox = useRef(null);

  useEffect(() => {
    let prevTime = getPrevTime(new Date(config.timeStart), new Date(config.timeEnd));
    configDispatch({type: 'PREV_TIME_START', prevTimeStart: prevTime});
    configDispatch({
      type: 'TRIGGER_STATE_UPDATE',
      triggerStateUpdate: true,
    });
  }, [configDispatch, config.timeStart, config.timeEnd]);

  useEffect(() => {
    if (isGenre2(config.genre, config.genre2)) {
      setPrevDateDisplay(false);
      configDispatch({type: 'PREV_TIME_START', prevTimeStart: null});
      if (prevTimeCheckbox && prevTimeCheckbox.current) {
        prevTimeCheckbox.current.checked = false;
      }
    } else {
      setPrevDateDisplay(true);
    }
  }, [
    config.genre,
    //config.timeStart,
    config.timeEnd,
    //config.prevTimeStart,
    config.genre2,
    configDispatch,
  ]);

  return (
    <>
      <div className="nav__date-pickers nav__date-pickers--dates">
        <div className="input-wrapper input-wrapper--start-date">
          <label className="nav__heading">Start date:</label>
          <DayPickerInput
            style={{width: '100%'}}
            dayPickerProps={{
              selectedDays: config.timeStart,
              disabledDays: (day) =>
                day > config.timeEnd || day < new Date().setDate(new Date().getDate() - 62),
            }}
            value={formatDate(config.timeStart)}
            placeholder="YYYY-M-D"
            onDayChange={(e) => {
              if (formIsValid({...config, timeStart: e})) {
                configDispatch({type: 'TIME_START', timeStart: new Date(e)});
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
              disabledDays: (day) => day > new Date() || day < config.timeStart,
            }}
            value={formatDate(config.timeEnd)}
            placeholder="YYYY-M-D"
            onDayChange={(e) => {
              if (formIsValid({...config, timeEnd: e})) {
                configDispatch({type: 'TIME_END', timeEnd: new Date(e)});
              }
            }}
          />
        </div>

        {!prevDateDisplay ? null : (
          <div className="input-wrapper input-wrapper--checkbox input-wrapper--prev-date ">
            <input
              ref={prevTimeCheckbox}
              checked={config.prevTimeStart != null && !isNaN(config.prevTimeStart)}
              onChange={(e) => {
                if (e.target.checked) {
                  let prevTime = getPrevTime(new Date(config.timeStart), new Date(config.timeEnd));
                  configDispatch({type: 'PREV_TIME_START', prevTimeStart: prevTime});
                  configDispatch({
                    type: 'TRIGGER_STATE_UPDATE',
                    triggerStateUpdate: true,
                  });
                } else {
                  configDispatch({type: 'PREV_TIME_START', prevTimeStart: null});
                }
              }}
              id="prev-time-checkbox"
              name="prev-time-checkbox"
              type="checkbox"
            />
            <label htmlFor="prev-time-checkbox">&nbsp;Compare to previous period?</label>
          </div>
        )}
      </div>
    </>
  );
};
export default Dates;
