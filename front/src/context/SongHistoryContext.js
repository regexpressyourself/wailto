import React from 'react';

const SongHistoryContext = React.createContext();

const songHistoryReducer = (state, songHistoryAction) => {
  switch (songHistoryAction.type) {
    case 'SONG_HISTORY':
      return {
        ...state,
        songHistory: songHistoryAction.songHistory,
      };
    case 'PREV_SONG_HISTORY':
      return {
        ...state,
        prevSongHistory: songHistoryAction.prevSongHistory,
      };
    default:
      return {songHistory: null, prevSongHistory: null};
  }
};

export {SongHistoryContext, songHistoryReducer};
