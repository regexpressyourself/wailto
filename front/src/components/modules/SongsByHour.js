import React, {useContext, useState, useEffect} from 'react';
import Graph from './Graph';
import {hourToAmpm} from '../../functions/dateMappers';

const SongsByHour = () => {
  const dataKey = 'hour';
  let hourNames = [];
  for (let i = 0; i < 24; i++) {
    hourNames.push(hourToAmpm(i));
  }

  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Hour of Day
        </h1>
        <Graph dataKey={dataKey} dataKeyValues={hourNames} />
      </div>
    </>
  );
};

export default SongsByHour;
