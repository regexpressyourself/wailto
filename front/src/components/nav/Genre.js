import React, {useState, useEffect, useContext} from 'react';
import Select from 'react-select';
import {ConfigContext} from '../../context/ConfigContext';
import {GENRELIST} from '../../GENRELIST';
import './Genre.scss';

const Genre = () => {
  const {config, configDispatch} = useContext(ConfigContext);
  let [showGenre, setShowGenre] = useState(false);
  let [genreDisplay, setGenreDisplay] = useState('none');
  let [genreBtnDisplay, setGenreBtnDisplay] = useState('none');
  let [showGenre2, setShowGenre2] = useState(false);
  let [genreDisplay2, setGenreDisplay2] = useState('none');
  let [genreBtnDisplay2, setGenreBtnDisplay2] = useState('none');

  let genreSelectionOptions = GENRELIST.map(genre => {
    return {
      value: genre,
      label: genre,
    };
  });
  genreSelectionOptions.unshift({value: 'any genre', label: 'any genre'});

  useEffect(() => {
    if (config.genre) {
      if (config.genre === 'any genre' && (config.genre2 && config.genre2 !== 'any genre')) {
        setShowGenre(true);
      } else if (config.genre && config.genre !== 'any genre') {
        setShowGenre(true);
      } else {
        setShowGenre(false);
      }
    } else {
      setShowGenre(false);
    }
    setShowGenre2(config.genre && config.genre2 && config.genre2 !== 'any genre');
  }, [config.genre, config.genre2]);

  useEffect(() => {
    if (!showGenre && !showGenre2) {
      setGenreDisplay('none');
      setGenreDisplay2('none');
      setGenreBtnDisplay('block');
      setGenreBtnDisplay2('none');
    }
    if (showGenre) {
      setGenreDisplay('block');
      setGenreDisplay2('none');
      setGenreBtnDisplay('none');
      setGenreBtnDisplay2('block');
    }
    if (showGenre && showGenre2) {
      setGenreDisplay('block');
      setGenreDisplay2('block');
      setGenreBtnDisplay('none');
      setGenreBtnDisplay2('none');
    }
  }, [showGenre, showGenre2]);

  return (
    <div className="nav__date-pickers">
      <div className="input-wrapper input-wrapper--start-date">
        <span
          className="btn genre-toggle genre-toggle--1"
          style={{display: genreBtnDisplay}}
          onClick={e => {
            setShowGenre(true);
          }}>
          Filter Genre?
        </span>
        <label style={{display: genreDisplay}} className="nav__heading">
          Genre:
        </label>
        <div style={{display: genreDisplay}}>
          <Select
            value={{
              value: config.genre,
              label: config.genre,
            }}
            onChange={e => {
              configDispatch({type: 'GENRE', genre: e.value});
            }}
            options={genreSelectionOptions}
          />
        </div>
      </div>
      <div className="input-wrapper input-wrapper--end-date">
        <span
          className="genre-toggle genre-toggle--2"
          style={{display: genreBtnDisplay2}}
          onClick={e => {
            setShowGenre2(true);
          }}>
          Compare Genre?
        </span>
        <label style={{display: genreDisplay2}} className="nav__heading">
          2<sup>nd</sup> Genre:
        </label>
        <div style={{display: genreDisplay2}}>
          <Select
            value={{
              value: config.genre2,
              label: config.genre2,
            }}
            onChange={e => {
              if (e.value === 'any genre') {
                setShowGenre2(false);
                configDispatch({type: 'GENRE2', genre2: 'any genre'});
              } else {
                configDispatch({type: 'GENRE2', genre2: e.value});
              }
            }}
            options={genreSelectionOptions}
          />
        </div>
      </div>
    </div>
  );
};
export default Genre;
