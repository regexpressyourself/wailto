import React from 'react';
import LazyLoad from 'react-lazyload';
import './SongItem.scss';

function SongItem(props) {
  let genres = [];
  for (let i = 0; i < props.genres.length; i++) {
    if (!props.genres[i]) {
      continue;
    }
    if (i !== props.genres.length - 1) {
      genres.push(props.genres[i] + ', ');
    } else {
      genres.push(props.genres[i]);
    }
  }

  let genreSection = null;
  if (genres.length) {
    genreSection = (
      <>
        <hr />
        <p className="song-item__genres">{genres}</p>
      </>
    );
  }
  return (
    <div className="song-item">
      <div className="song-item__info">
        <LazyLoad>
          <img className="song-item__img" alt="album cover" src={props.image} />
        </LazyLoad>
        <div>
          <p className="song-item__info__title">{props.name}</p>
          <p className="song-item__info__content">
            <span className="song-item__info__content__artist">
              {props.artist}
            </span>
            <br />
            &mdash; {props.album}
          </p>
        </div>
      </div>
      <div className="song-item__right">
        <p className="song-item__date">
          {props.date.dowName}
          &nbsp;
          {props.date.date}
          &nbsp;
          {props.date.time}
        </p>
        {genreSection}
      </div>
    </div>
  );
}

export default SongItem;
