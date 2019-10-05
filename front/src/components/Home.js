import React, {useEffect} from 'react';
import './Home.scss';
import {Link} from 'react-router-dom';
import Footer from './partials/Footer';
import {X} from 'react-feather';
import {LineChart, ResponsiveContainer, Line} from 'recharts';

const Home = () => {
  const inlineLogo = <span className="logo-font">WAILto</span>;

  useEffect(() => {
    setTimeout(() => {
      if (localStorage.getItem('wt-username') === null) {
        document.querySelector('.btn-link--demo').classList.add('entry');
      }
    }, 10000);
  }, []);

  return (
    <>
      <section className="home__header">
        <p className="css-logo">
          <span className="css-logo__wail">WAIL</span>
          <span className="css-logo__to">to</span>
        </p>
        <h1>What Am I Listening To?</h1>
        <div className="header__btn-container">
          <Link className="btn-link btn-link--1" to="/app">
            <button className="btn">Get Started</button>
          </Link>
          <div
            className="btn-link btn-link--2"
            onClick={e => {
              document.querySelector('#get-started').scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}>
            <button className="btn">Learn More</button>
          </div>
        </div>

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
      <main className="home">
        <div className="header__btn-container">
          <div className="btn-link btn-link--demo">
            <span
              id="exit-btn"
              onClick={e => {
                document.querySelector('.btn-link--demo').classList.remove('entry');
                localStorage.setItem('wt-username', '');
              }}
              className="exit-btn">
              <X />
            </span>
            <Link to="/zookeeprr">
              <button className="btn btn--demo-cta">
                TRY {inlineLogo}
                <br />
                <span className="sub-button">(spoiler: it's my account)</span>
              </button>
            </Link>
          </div>
        </div>
        <section className="home__body">
          <h2>
            What Is <span className="logo-font">{inlineLogo}</span>?
          </h2>
          <p>
            <span className="body__p-header">{inlineLogo}</span> (or{' '}
            <strong>
              <em>What Am I Listening To</em>
            </strong>
            ) is a way to analyze your music listening history.
            <br />
            <br />
            Learn about your music listening trends, daily breakdowns, and history.
          </p>
          <br />
          <div className="header__btn-container">
            <Link className="btn-link btn-link--1" to="/app">
              <button className="btn">Check It Out</button>
            </Link>
          </div>
          <br />
          <h2 id="get-started">Get Started.</h2>
          <p>
            <span className="body__p-header">
              <span className="logo-font">1. SIGN UP</span> with Last.fm.
            </span>{' '}
            <br />
            <a href="https://www.last.fm/join" rel="noopener noreferrer" target="_blank">
              (You can do that here)
            </a>
          </p>
          <p>
            Now, I totally understand if you don't need another service in your life. Feel free to
            check out <Link to="/zookeeprr">my account's dashboard</Link> if you just want to check
            out {inlineLogo}
          </p>
          <p className="home__body__123">
            <span className="body__p-header">
              <span className="logo-font">2. CONNECT</span> your music player to Last.fm.{' '}
            </span>
            <br />
            (They support a ton of players.{' '}
            <a
              href="https://www.last.fm/about/trackmymusic"
              rel="noopener noreferrer"
              target="_blank">
              Find yours here.
            </a>
            ) This will enable{' '}
            <strong>
              <em>scrobbling</em>
            </strong>{' '}
            with Last.fm.
          </p>
          <p>
            Scrobbling allows {inlineLogo} to access your history for analysis. According to
            Last.fm:
          </p>
          <blockquote>
            Scrobbling is when Last.fm tracks the music you listen to and automatically adds it to
            your music profile.
          </blockquote>

          <p className="home__body__123">
            <span className="body__p-header">
              <span className="logo-font">3. Listen</span> to some music!
            </span>
          </p>
          <p>
            {inlineLogo} needs at least a day of history to really get interesting. In the meantime,
            feel free to check out <Link to="/zookeeprr">my account's dashboard</Link>.
          </p>
          <br />
          <br />
          <h2>What Have You Been Listening To?</h2>
          <p className="home__body__123">
            <span className="body__p-header">
              <span className="logo-font">Ready</span> to see what your music listening looks like?
            </span>
          </p>
          <div className="header__btn-container">
            <Link className="btn-link btn-link--1" to="/app">
              <button className="btn">Find Out Now</button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
