const inputAttention = (disabled, input) => {
  let inputWrap;
  if (input === "username") {
    inputWrap = document.querySelector(".nav__username");
  } else if (input === "dates") {
    inputWrap = document.querySelector(".nav__date-pickers");
  } else {
    return;
  }

  if (disabled) {
    inputWrap.classList.add("atn");
    inputWrap.classList.add("atn--anim");

    setTimeout(() => {
      inputWrap.classList.remove("atn--anim");
    }, 1500);

    return;
  } else {
    inputWrap.classList.remove("atn");
    inputWrap.classList.remove("atn--anim");
  }
};

const expandNav = (expanded) => {
  let nav = document.querySelector(".nav");
  if (expanded) {
    nav.classList.remove("nav--collapsed");
    nav.classList.add("nav--uncollapsed");
  } else {
    if (nav.classList.contains("nav--uncollapsed")) {
      nav.classList.remove("nav--uncollapsed");
      nav.classList.add("nav--collapsed");
    }
  }
};

const formIsValid = ({ username, timeStart, timeEnd }) => {
  let isValid = true;

  // check username
  if (!username) {
    inputAttention(true, "username");
    isValid = false;
  } else {
    inputAttention(false, "username");
  }

  // check dates
  //if (timeStart > timeEnd || typeof timeStart === 'string' || typeof timeEnd === 'string') {
  if (!timeStart || !timeEnd || new Date(timeStart) > new Date(timeEnd)) {
    inputAttention(true, "dates");
    isValid = false;
  } else {
    inputAttention(false, "dates");
  }

  return isValid;
};
export { expandNav, inputAttention, formIsValid };
