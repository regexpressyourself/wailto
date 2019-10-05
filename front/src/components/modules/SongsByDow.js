import React, {useContext} from 'react';

import Graph from './Graph';
import {SongHistoryContext} from '../../context/SongHistoryContext';
import {ConfigContext} from '../../context/ConfigContext';
import {days} from '../../functions/dateMappers';

const SongsByDow = () => {
  const {songHistory} = useContext(SongHistoryContext);
  const {config} = useContext(ConfigContext);

  const dataKey = 'dow';
  let dowNames = days();

  console.log('dowNames');
  console.log(dowNames);
  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Day of Week
        </h1>
        <Graph
          dataKey={dataKey}
          dataKeyValues={dowNames}
          config={config}
          songHistory={songHistory}
        />
      </div>
    </>
  );
};

export default SongsByDow;
