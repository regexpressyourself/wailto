import React, {useContext} from 'react';
import {ConfigContext} from '../../context/ConfigContext';
import Graph from './Graph';
import {getDatesBetween} from '../../functions/dateMappers';

const SongsByDate = () => {
  const {config} = useContext(ConfigContext);

  let dataKey = 'date';
  let datesBetween = getDatesBetween(new Date(config.timeStart), new Date(config.timeEnd));
  let prevDatesBetween = null;
  if (config.prevTimeStart) {
    prevDatesBetween = getDatesBetween(new Date(config.prevTimeStart), new Date(config.timeStart));
  }

  return (
    <div className="chart-container">
      <h1 className="chart-heading">
        Song Listens
        <br /> <span className="per">&mdash;by&mdash;</span> <br />
        Date
      </h1>
      <Graph
        dataKey={dataKey}
        dataKeyValues={datesBetween}
        secondaryDataKeyValues={prevDatesBetween}
      />
    </div>
  );
};

export default SongsByDate;
