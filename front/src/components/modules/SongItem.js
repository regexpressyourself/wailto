import React from 'react';
import './SongItem.scss';

function SongItem(props) {
  return (
    <div className="song-item">
      <img className="song-item__img" alt="album cover" src={props.image} />
      <div className="song-item__info">
        <p className="song-item__info__title">{props.name}</p>
        <br />
        <p className="song-item__info__content">
          {props.artist}&mdash;{props.album}
        </p>
      </div>
      <p className="song-item__date">
        {props.date.dowName}
        <br />
        {props.date.date}
        <br />
        {props.date.time}
      </p>
    </div>
  );
}

export default SongItem;
