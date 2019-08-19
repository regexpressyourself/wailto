import React from 'react';

const HistoryContext = React.createContext();


function historyReducer(state, historyAction) {
  return {history: historyAction.history};
}

export {HistoryContext, historyReducer};

