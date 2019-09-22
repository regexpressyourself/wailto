import React from 'react';

const ConfigContext = React.createContext();

let initialConfig = {
  timeStart: localStorage.getItem('wt-timeStart') || new Date(),
  timeEnd: localStorage.getItem('wt-timeEnd') || new Date(),
  unixTimeStart: null,
  unixTimeEnd: null,
  username: localStorage.getItem('wt-username') || '',
  genre: localStorage.getItem('wt-genre') || '',
  triggerStateUpdate: false,
  appState: 'home',
};

const transformTimeEnd = timeEnd => {
  // sets the end time to 11:59:59 on selected date
  let newEnd = new Date(timeEnd.getTime());
  newEnd.setDate(newEnd.getDate());
  newEnd.setHours(23);
  newEnd.setMinutes(59);
  newEnd.setSeconds(59);
  return newEnd;
};

const configReducer = (state, configAction) => {
  if (typeof state.timeEnd === 'string') {
    state.timeEnd = new Date(state.timeEnd);
  }
  if (typeof state.timeStart === 'string') {
    state.timeStart = new Date(state.timeStart);
  }
  state.timeEnd = transformTimeEnd(state.timeEnd);
  state.unixTimeStart = Math.round(state.timeStart.getTime() / 1000);
  state.unixTimeEnd = Math.round(state.timeEnd.getTime() / 1000);

  switch (configAction.type) {
    case 'USERNAME':
      localStorage.setItem('wt-username', configAction.username);
      return {
        ...state,
        username: configAction.username,
      };
    case 'TIME_START':
      let unixTimeStart = Math.round(configAction.timeStart.getTime() / 1000);
      localStorage.setItem('wt-timeStart', configAction.timeStart);
      return {
        ...state,
        timeStart: configAction.timeStart,
        unixTimeStart: unixTimeStart,
      };
    case 'TIME_END':
      let newEnd = transformTimeEnd(configAction.timeEnd);
      let unixTimeEnd = Math.round(newEnd.getTime() / 1000);
      localStorage.setItem('wt-timeEnd', configAction.timeEnd);
      return {
        ...state,
        timeEnd: newEnd,
        unixTimeEnd: unixTimeEnd,
      };
    case 'APP_STATE':
      return {
        ...state,
        appState: configAction.appState,
      };
    case 'GENRE':
      localStorage.setItem('wt-genre', configAction.genre);
      return {
        ...state,
        genre: configAction.genre,
      };
    case 'TRIGGER_STATE_UPDATE':
      return {
        ...state,
        triggerStateUpdate: configAction.triggerStateUpdate,
      };
    default:
      return initialConfig;
  }
};

export {ConfigContext, configReducer};
