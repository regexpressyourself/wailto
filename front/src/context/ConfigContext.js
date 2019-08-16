import React from 'react';

const ConfigContext = React.createContext();

let initialConfig = {timeStart: null, timeEnd: null};

function configReducer(state, configAction) {
  switch (configAction.type) {
    case 'TIME_START':
      return {...state, timeStart: configAction.timeStart};
    case 'TIME_END':
      return {...state, timeEnd: configAction.timeEnd};
    default:
      return initialConfig;
  }
}

export {ConfigContext, configReducer};

