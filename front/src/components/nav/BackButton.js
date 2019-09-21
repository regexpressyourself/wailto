import React from 'react';
import {withRouter} from 'react-router-dom';
import {ChevronLeft} from 'react-feather';

function BackButton(props) {
  return (
    <button
      className="nav__back-btn"
      onClick={e => {
        props.history.goBack();
      }}>
      <ChevronLeft />
    </button>
  );
}
export default withRouter(BackButton);
