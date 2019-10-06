import React from 'react';
import {days} from '../../functions/dateMappers';
import Graph from './Graph';

const SongsByDow = () => {
  let dataKey = 'dowName';

  return (
    <div className="chart-container">
      <h1 className="chart-heading">
        Song Listens
        <br /> <span className="per">&mdash;by&mdash;</span> <br />
        Day of Week
      </h1>
      <Graph dataKey={dataKey} dataKeyValues={days()} />
    </div>
  );
};

export default SongsByDow;
