import React from 'react';

const ConfigContext = React.createContext();

let initialConfig = {
  prevTimeStart: localStorage.getItem('wt-prevTimeStart') || null,
  timeStart: localStorage.getItem('wt-timeStart') || new Date(),
  timeEnd: localStorage.getItem('wt-timeEnd') || new Date(),
  unixTimeStart: null,
  unixTimeEnd: null,
  username: localStorage.getItem('wt-username') || '',
  genre: localStorage.getItem('wt-genre') || '',
  triggerStateUpdate: false,
  appState: 'home',
  configState: 1,
};

const stringToDate = possibleString => {
  if (typeof possibleString === 'string') {
    return new Date(possibleString);
  } else {
    return possibleString;
  }
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
  if (!state.timeStart || !state.timeEnd) {
    return state;
  }
  state.timeEnd = stringToDate(state.timeEnd);
  state.timeStart = stringToDate(state.timeStart);
  state.prevTimeStart = stringToDate(state.prevTimeStart);
  state.unixTimeStart = Math.round(state.timeStart.getTime() / 1000);
  state.unixTimeEnd = Math.round(state.timeEnd.getTime() / 1000);

  switch (configAction.type) {
    case 'USERNAME':
      localStorage.setItem('wt-username', configAction.username);
      return {
        ...state,
        username: configAction.username,
      };
    case 'PREV_TIME_START':
      let unixPrevTimeStart = null;
      if (configAction.prevTimeStart !== null) {
        unixPrevTimeStart = Math.round(stringToDate(configAction.prevTimeStart.getTime()) / 1000);
      }
      localStorage.setItem('wt-prevTimeStart', configAction.prevTimeStart);
      return {
        ...state,
        prevTimeStart: configAction.prevTimeStart,
        unixPrevTimeStart: unixPrevTimeStart,
      };
    case 'TIME_START':
      let unixTimeStart = Math.round(stringToDate(configAction.timeStart).getTime() / 1000);
      localStorage.setItem('wt-timeStart', configAction.timeStart);
      return {
        ...state,
        timeStart: configAction.timeStart,
        unixTimeStart: unixTimeStart,
      };
    case 'TIME_END':
      let newEnd = transformTimeEnd(stringToDate(configAction.timeEnd));
      let unixTimeEnd = Math.round(newEnd.getTime() / 1000);
      localStorage.setItem('wt-timeEnd', configAction.timeEnd);
      return {
        ...state,
        timeEnd: newEnd,
        unixTimeEnd: unixTimeEnd,
      };
    case 'GENRE':
      localStorage.setItem('wt-genre', configAction.genre);
      return {
        ...state,
        genre: configAction.genre,
      };
    case 'GENRE2':
      let genre2 = configAction.genre2;
      if (genre2 === null || genre2 === 'null') {
        genre2 = null;
      }
      localStorage.setItem('wt-genre2', genre2);
      return {
        ...state,
        genre2: genre2,
      };
    case 'APP_STATE':
      return {
        ...state,
        appState: configAction.appState,
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
