import React from 'react';

const SongHistoryContext = React.createContext();


const songHistoryReducer = (state, songHistoryAction) => {
  return {songHistory: songHistoryAction.songHistory};
}

export {SongHistoryContext, songHistoryReducer};

