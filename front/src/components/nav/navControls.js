const disableButton = disabled => {
  if (disabled) {
    document
      .querySelector('.nav__username')
      .classList.add('nav__username--invalid');
    document
      .querySelector('.nav__heading--username')
      .classList.add('atn--font-color');
    document
      .querySelector('.username-input')
      .classList.add('atn--border-color');
    setTimeout(() => {
      document
        .querySelector('.nav__heading--username')
        .classList.remove('atn--font-color');
      document
        .querySelector('.username-input')
        .classList.remove('atn--border-color');
    }, 1000);
    return;
  } else {
    if (
      document
        .querySelector('.nav__username')
        .classList.contains('nav__username--invalid')
    ) {
      document
        .querySelector('.nav__username')
        .classList.remove('nav__username--invalid');
    }
  }
};

const expandNav = expanded => {
  if (expanded) {
    document.querySelector('.nav').classList.remove('nav--collapsed');
    document.querySelector('.nav').classList.add('nav--uncollapsed');
    if (document.querySelector('.recharts-wrapper')) {
      document.querySelector('.recharts-wrapper').style.zIndex = '-1';
    }
  } else {
    if (document.querySelector('.recharts-wrapper')) {
      document.querySelector('.recharts-wrapper').style.zIndex = '1';
    }
    if (document.querySelector('.nav').classList.contains('nav--uncollapsed')) {
      document.querySelector('.nav').classList.remove('nav--uncollapsed');
      document.querySelector('.nav').classList.add('nav--collapsed');
    }
  }
};

export {expandNav, disableButton};
