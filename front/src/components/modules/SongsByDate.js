import React, {useContext, useState, useEffect} from 'react';
import Graph from './Graph';
import {ConfigContext} from '../../context/ConfigContext';
import {getDatesBetween} from '../../functions/dateMappers';

const SongsByDate = () => {
  const dataKey = 'date';
  const {config} = useContext(ConfigContext);
  //let [datesBetween, setDatesBetween] = useState(
  //getDatesBetween(new Date(config.timeStart), new Date(config.timeEnd)),
  //);
  let datesBetween = getDatesBetween(new Date(config.timeStart), new Date(config.timeEnd));

  //useEffect(() => {
  //setDatesBetween(getDatesBetween(new Date(config.timeStart), new Date(config.timeEnd)));
  //}, [config.timeEnd, config.timeStart]);

  console.log('datesBetween');
  console.log(datesBetween);
  return (
    <>
      <div className="chart-container">
        <h1 className="chart-heading">
          Song Listens
          <br /> <span className="per">&mdash;by&mdash;</span> <br />
          Date
        </h1>
        <Graph dataKey={dataKey} dataKeyValues={datesBetween} />
      </div>
    </>
  );
};

export default SongsByDate;
