import React from 'react';
import './Loading.scss';

const Loading = () => {
  console.log('in loading')
  return (
    <>
      <h1 className="loading">
        Loading
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </h1>
    </>
  );
}

export default Loading;
