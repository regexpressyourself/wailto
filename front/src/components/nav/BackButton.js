import React from "react";
import { withRouter } from "react-router-dom";
import { ChevronLeft } from "react-feather";

const BackButton = ({ history }) => {
  return (
    <button
      className="nav__back-btn"
      onClick={(e) => {
        history.goBack();
      }}
    >
      <ChevronLeft />
    </button>
  );
};
export default withRouter(BackButton);
