import React, {useContext, useState, useEffect} from 'react';
import PieGraph from './PieGraph';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';

const ArtistPie = () => {
  const {config, configDispatch} = useContext(ConfigContext);
  const {songHistory} = useContext(SongHistoryContext);
  let [pieData, setPieData] = useState(null);

  useEffect(() => {
    let allGenreData = {};
    songHistory.songHistory.forEach((song) => {
      if (song.genre1)
        allGenreData[song.genre1] = allGenreData[song.genre1] ? allGenreData[song.genre1] + 1 : 1;
      //if (song.genre2)
      //allGenreData[song.genre2] = allGenreData[song.genre2] ? allGenreData[song.genre2] + 1 : 1;
      //if (song.genre3)
      //allGenreData[song.genre3] = allGenreData[song.genre3] ? allGenreData[song.genre3] + 1 : 1;
      //if (song.genre4)
      //allGenreData[song.genre4] = allGenreData[song.genre4] ? allGenreData[song.genre4] + 1 : 1;
      return;
    });

    let tempPieData = [];
    for (let genre in allGenreData) {
      tempPieData.push({name: genre, value: allGenreData[genre]});
    }
    tempPieData = tempPieData.sort(function(a, b) {
      return b.value - a.value;
    });
    setPieData(tempPieData);
  }, [songHistory.songHistory]);

  return (
    <div className="chart-container">
      <h1 className="chart-heading">Genre Distribution</h1>
      <PieGraph data={pieData} />
    </div>
  );
};

export default ArtistPie;
