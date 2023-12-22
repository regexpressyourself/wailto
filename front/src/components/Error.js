import React from "react";
import "./Home.scss";
import "./Error.scss";
import { Link } from "react-router-dom";
import { LineChart, ResponsiveContainer, Line } from "recharts";

const Error = ({ errorMessage }) => {
  return (
    <div className="error-page-wrapper">
      <section className="home__header home__header--error">
        <p className="css-logo css-logo--error">
          <span className="css-logo__wail">Oops!</span>
        </p>
        <h1>Somethine went wrong!</h1>
        <p className="server-message">
          Our servers are saying it's something to do with:
        </p>
        <p className="server-message server-message--code">
          <code>{errorMessage}</code>
        </p>

        <div className="header__btn-container">
          <Link className="btn-link btn-link--1" to="/app">
            <button className="btn">Go Back To Safety</button>
          </Link>

          <div
            className="btn-link btn-link--2"
            onClick={(e) => {
              window.location.href = "https://smessina.com";
            }}
          >
            <button className="btn">Speak To The Dev</button>
          </div>
        </div>

        <ResponsiveContainer>
          <LineChart
            data={[
              {
                "": 90,
              },
              {
                "": 50,
              },
              {
                "": 66,
              },
              {
                "": 79,
              },
              {
                "": 50,
              },
              {
                "": 40,
              },
              {
                "": 0,
              },
            ]}
          >
            }>
            <Line
              type="monotone"
              dot={{ stroke: "#aa5c9f", strokeWidth: 4, r: 10 }}
              dataKey=""
              stroke="#aa5c9f"
              strokeWidth={10}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Error;
