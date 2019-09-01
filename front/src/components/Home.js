import React from 'react';
import logo from '../assets/wailto-logo.png';
import './Home.scss';
import {Link} from 'react-router-dom';
import {LineChart, ResponsiveContainer, Line} from 'recharts';

function Home() {
  const inlineLogo = <span className="logo-font">WAILto</span>;
  return (
    <>
      <section className="home__header">
        <p className="css-logo">
          <span className="css-logo__wail">WAIL</span>
          <span className="css-logo__to">to</span>
        </p>
        <h1>What Am I Listening To?</h1>

        <ResponsiveContainer>
          <LineChart
            data={[
              {
                '': 0,
              },
              {
                '': 50,
              },
              {
                '': 35,
              },
              {
                '': 66,
              },
              {
                '': 90,
              },
              {
                '': 60,
              },
              {
                '': 84,
              },
            ]}>
            }>
            <Line
              type="monotone"
              dot={{stroke: '#aa5c9f', strokeWidth: 4, r: 10}}
              dataKey=""
              stroke="#aa5c9f"
              strokeWidth={10}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <main class="home">
        <section className="home__body">
          <h2>
            What Is <span className="logo-font">{inlineLogo}</span>?
          </h2>
          <p>
            <span className="body__p-header">{inlineLogo}</span> (or{' '}
            <strong>
              <em>What Am I Listening To</em>
            </strong>
            ) is a way to analyze your Last.FM music listening (known as{' '}
            <strong>
              <em>scrobbling</em>
            </strong>
            ) history.
            <br />
            <br />
            Learn about your music listening trends, daily breakdowns, and
            history.
          </p>
          <br />
          <h2>Get Started.</h2>
          <p>
            <span className="body__p-header">
              <span className="logo-font">1. SIGN UP</span> with Last.FM.
            </span> <a href="https://www.last.fm/join" target="_blank">
              (You can do that here)
            </a>
          </p>
          <p>
            Now, I totally understand if you don't need another service in your life. Feel free to check out <Link to="">my account's dashboard</Link> if you just want to check out {inlineLogo}
          </p>
          <p>
            <span className="body__p-header">
              <span className="logo-font">1. CONNECT</span> your favorite music
              <span className="logo-font"></span> your favorite music
              application to Last.FM.
              <a href="https://www.last.fm/about/trackmymusic" target="_blank">
                Seriously.
              </a>
            </span>
          </p>
        </section>
      </main>
    </>
  );
}

export default Home;
