import React, {useState, useEffect, useContext} from 'react';
import {ConfigContext} from '../context/ConfigContext';
import {accessibleJsTime} from '../functions/dateMappers';
import {isGenre1, isGenre2} from '../functions/genres';

const UserInfo = () => {
  const {config} = useContext(ConfigContext);
  let [genreInfo, setGenreInfo] = useState(null);
  let [prevDateDisplay, setPrevDateDisplay] = useState(false);
  let [prevDateText, setPrevDateText] = useState(false);

  useEffect(() => {
    let isGenre1Eval = isGenre1(config.genre, config.genre2);
    let isGenre2Eval = isGenre2(config.genre, config.genre2);

    if (isGenre1Eval && isGenre2Eval) {
      setGenreInfo(
        <div>
          <p className="user-info__more-info">
            <span className="genre">{config.genre}</span>
            &nbsp; &amp; &nbsp;
            <span className="genre2">{config.genre2}</span>
          </p>
        </div>,
      );
    } else if (isGenre1Eval) {
      setGenreInfo(
        <div>
          <p className="user-info__more-info">{config.genre}</p>
        </div>,
      );
    } else {
      setGenreInfo(null);
    }
  }, [config.genre, config.genre2]);

  useEffect(() => {
    if (config.prevTimeStart != null && !isNaN(config.prevTimeStart)) {
      setPrevDateDisplay(true);
      setPrevDateText(accessibleJsTime(config.prevTimeStart).date);
    } else {
      setPrevDateDisplay(false);
    }
  }, [config.prevTimeStart, config.timeStart]);

  if (!config.appState) return null;
  return (
    <section className="user-info">
      <p className="user-info__username">{config.username}</p>
      <div>
        <p className="user-info__more-info user-info__dates">
          <span>{accessibleJsTime(config.timeStart).date}</span>
          &nbsp; &mdash; &nbsp;
          <span>{accessibleJsTime(config.timeEnd).date}</span>
        </p>
        {!prevDateDisplay ? null : (
          <p className="user-info__more-info user-info__dates">
            <span>{prevDateText}</span>
            &nbsp; &mdash; &nbsp;
            <span>{(accessibleJsTime(config.timeStart, true).date)}</span>
          </p>
        )}
      </div>
      {genreInfo}
    </section>
  );
};
export default UserInfo;
