import React, {useContext} from 'react';
import {ConfigContext} from '../../context/ConfigContext';
import Graph from './Graph';
import {getDatesBetween} from '../../functions/dateMappers';

const SongsByDate = () => {
  const {config} = useContext(ConfigContext);

  let dataKey = 'date';
  let datesBetween = getDatesBetween(new Date(config.timeStart), new Date(config.timeEnd));

  return (
    <div className="chart-container">
      <h1 className="chart-heading">
        Song Listens
        <br /> <span className="per">&mdash;by&mdash;</span> <br />
        Date
      </h1>
      <Graph dataKey={dataKey} dataKeyValues={datesBetween} />
    </div>
  );
};

export default SongsByDate;
