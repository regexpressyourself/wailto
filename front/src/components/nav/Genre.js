import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { ConfigContext } from "../../context/ConfigContext";
import { GENRELIST } from "../../GENRELIST";
import { isGenre1, isGenre2 } from "../../functions/genres";
import "./Genre.scss";

const Genre = () => {
  const { config, configDispatch } = useContext(ConfigContext);
  let [showGenre, setShowGenre] = useState(false);
  let [genreDisplay, setGenreDisplay] = useState("none");
  let [genreBtnDisplay, setGenreBtnDisplay] = useState("none");
  let [showGenre2, setShowGenre2] = useState(false);
  let [genreDisplay2, setGenreDisplay2] = useState("none");
  let [genreBtnDisplay2, setGenreBtnDisplay2] = useState("none");
  let [abbreviated, setAbbreviated] = useState(false);

  let genreSelectionOptions = GENRELIST.map((genre) => {
    return {
      value: genre,
      label: genre,
    };
  });
  genreSelectionOptions.unshift({ value: "any genre", label: "any genre" });

  useEffect(() => {
    setAbbreviated(config.abbreviated);
  }, [config.abbreviated]);

  useEffect(() => {
    isGenre1(config.genre, config.genre2)
      ? setShowGenre(true)
      : setShowGenre(false);
    isGenre2(config.genre, config.genre2)
      ? setShowGenre2(true)
      : setShowGenre2(false);
  }, [config.genre, config.genre2]);

  useEffect(() => {
    if (!showGenre && !showGenre2) {
      setGenreDisplay("none");
      setGenreDisplay2("none");
      setGenreBtnDisplay("block");
      setGenreBtnDisplay2("none");
    }
    if (showGenre) {
      setGenreDisplay("block");
      setGenreDisplay2("none");
      setGenreBtnDisplay("none");
      setGenreBtnDisplay2("block");
    }
    if (showGenre && showGenre2) {
      setGenreDisplay("block");
      setGenreDisplay2("block");
      setGenreBtnDisplay("none");
      setGenreBtnDisplay2("none");
    }
  }, [showGenre, showGenre2]);

  return (
    <div className={abbreviated ? "muted" : null}>
      <div className="nav__date-pickers">
        <div className="input-wrapper input-wrapper--start-date">
          <span
            className="btn genre-toggle genre-toggle--1"
            style={{ display: genreBtnDisplay }}
            onClick={(e) => {
              setShowGenre(true);
            }}
          >
            Filter Genre?
          </span>
          <label style={{ display: genreDisplay }} className="nav__heading">
            Genre:
          </label>
          <div style={{ display: genreDisplay }}>
            <Select
              value={{
                value: config.genre,
                label: config.genre,
              }}
              className="genre-select"
              onChange={(e) => {
                configDispatch({ type: "GENRE", genre: e.value });
              }}
              options={genreSelectionOptions}
            />
          </div>
        </div>
        <div className="input-wrapper input-wrapper--end-date">
          <span
            className="genre-toggle genre-toggle--2"
            style={{ display: genreBtnDisplay2 }}
            onClick={(e) => {
              setShowGenre2(true);
            }}
          >
            Compare Genre?
          </span>
          <label style={{ display: genreDisplay2 }} className="nav__heading">
            2<sup>nd</sup> Genre:
          </label>
          <div style={{ display: genreDisplay2 }}>
            <Select
              value={{
                value: config.genre2,
                label: config.genre2,
              }}
              onChange={(e) => {
                if (e.value === "any genre") {
                  setShowGenre2(false);
                  configDispatch({ type: "GENRE2", genre2: "any genre" });
                } else {
                  configDispatch({ type: "GENRE2", genre2: e.value });
                }
              }}
              className="genre-select"
              options={genreSelectionOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Genre;
