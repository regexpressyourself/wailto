import React from "react";
import LazyLoad from "react-lazyload";
import "./SongItem.scss";

const SongItem = ({ genres, image, name, artist, album, date }) => {
  let genresString = [];
  for (let i = 0; i < genres.length; i++) {
    if (!genres[i]) {
      continue;
    }
    if (i !== genres.length - 1) {
      genresString.push(genres[i] + ", ");
    } else {
      genresString.push(genres[i]);
    }
  }

  let genreSection = null;
  if (genres.length) {
    genreSection = (
      <>
        <hr />
        <p className="song-item__genres">{genresString}</p>
      </>
    );
  }
  return (
    <div className="song-item">
      <div className="song-item__info">
        <LazyLoad>
          <img className="song-item__img" alt="album cover" src={image} />
        </LazyLoad>
        <div>
          <p className="song-item__info__title">{name}</p>
          <p className="song-item__info__content">
            <span className="song-item__info__content__artist">{artist}</span>
            <br />
            &mdash; {album}
          </p>
        </div>
      </div>
      <div className="song-item__right">
        <p className="song-item__date">
          {date.dowName}&nbsp;{date.date}&nbsp;{date.time}
        </p>
        {genreSection}
      </div>
    </div>
  );
};

export default SongItem;
