import React, {useReducer, useState, useEffect} from 'react';
import './Loading.scss';

function Loading() {
  return (
    <>
    <h1 className="loading">Loading
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </h1>
    </>
  );
}

export default Loading;
