import React from 'react';
import './SongItem.scss';

function SongItem(props) {
  return (
    <div className="song-item">
      <div className="song-item__info">
        <img className="song-item__img" alt="album cover" src={props.image} />
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
      <p className="song-item__date">
        {props.date.dowName}
        &nbsp;
        {props.date.date}
        &nbsp;
        {props.date.time}
      </p>
    </div>
  );
}

export default SongItem;
