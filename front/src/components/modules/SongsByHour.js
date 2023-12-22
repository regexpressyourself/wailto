import React from "react";
import Graph from "./Graph";
import { hourToAmpm } from "../../functions/dateMappers";

const SongsByHour = () => {
  let dataKey = "hourName";
  let hourNames = [];
  for (let i = 0; i < 24; i++) {
    hourNames.push(hourToAmpm(i));
  }

  return (
    <div className="chart-container">
      <h1 className="chart-heading">
        Songs
        <br /> <span className="per">&mdash;by&mdash;</span> <br />
        Hour of Day
      </h1>
      <Graph dataKey={dataKey} dataKeyValues={hourNames} />
    </div>
  );
};
export default SongsByHour;
