import React, {useReducer, useState, useEffect} from 'react';
import './Loading.scss';

function Loading() {
  let loadingAnimation = React.createRef();
  let [innerAnimation, setInnerAnimation] = useState(null);
  useEffect(() => {
    document.querySelector('.loading-animation').style.display = 'flex';
    console.log(document.querySelector('.loading-animation').style.display);
    window.staggersAnimation.play();
  }, []);

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
